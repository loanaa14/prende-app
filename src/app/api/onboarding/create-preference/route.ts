import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createMercadoPagoPreference(preferenceBody: any) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Falta configurar MERCADO_PAGO_ACCESS_TOKEN");
  }

  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("MERCADO PAGO ERROR:", data);
    throw new Error(data?.message || "No se pudo crear preferencia");
  }

  return data;
}

function makeUsername(email: string) {
  return email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 20);
}

export async function POST(request: Request) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const body = await request.json();

    const access = body.access;
    const club = body.club;

    if (!access?.email || !access?.password) {
      return NextResponse.json(
        { error: "Faltan datos de acceso" },
        { status: 400 }
      );
    }

    if (!club?.club_name || !club?.responsible_name || !club?.phone) {
      return NextResponse.json(
        { error: "Faltan datos del club" },
        { status: 400 }
      );
    }

    const email = String(access.email).trim().toLowerCase();
    const password = String(access.password);
    const username = makeUsername(email);

    const { data: createdUser, error: userError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: "club_admin",
          username,
          full_name: club.responsible_name,
          responsible_name: club.responsible_name,
        },
      });

    if (userError || !createdUser.user) {
      console.error("CREATE USER ERROR:", userError);

      return NextResponse.json(
        {
          error:
            userError?.message ||
            "No se pudo crear el usuario. Probá con otro correo.",
        },
        { status: 400 }
      );
    }

    const userId = createdUser.user.id;

  const { data: newClub, error: clubError } = await supabaseAdmin
  .from("clubs")
  .insert({
    name: club.club_name,
    owner_id: userId,
  })
  .select("id")
  .single();

    if (clubError || !newClub) {
      console.error("CLUB CREATE ERROR:", clubError);

      await supabaseAdmin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: "No se pudo crear el club" },
        { status: 500 }
      );
    }

    const clubId = newClub.id;

    const { error: membershipError } = await supabaseAdmin
      .from("memberships")
      .insert({
        club_id: clubId,
        user_id: userId,
        role: "admin",
        status: "active",
      });

    if (membershipError) {
      console.error("MEMBERSHIP CREATE ERROR:", membershipError);

      await supabaseAdmin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: "No se pudo crear la membresía admin" },
        { status: 500 }
      );
    }

    const { data: subscription, error: subscriptionError } =
      await supabaseAdmin
        .from("subscriptions")
        .insert({
          club_id: clubId,
          plan: "personalizado",
          status: "pending",
        })
        .select("id")
        .single();

    if (subscriptionError || !subscription) {
      console.error("SUBSCRIPTION CREATE ERROR:", subscriptionError);

      return NextResponse.json(
        { error: "No se pudo crear la suscripción" },
        { status: 500 }
      );
    }

    const preferenceBody = {
      items: [
        {
          id: "prende-personalizado",
          title: "Prendé - Activación mensual",
          quantity: 1,
          unit_price: 1500,
          currency_id: "UYU",
        },
      ],
      metadata: {
        type: "onboarding_subscription",
        club_id: clubId,
        user_id: userId,
        subscription_id: subscription.id,
        plan: "personalizado",
      },
      external_reference: subscription.id,
      back_urls: {
        success: `${appUrl}/signup/success?clubId=${clubId}`,
        failure: `${appUrl}/signup/payment?error=payment_failed`,
        pending: `${appUrl}/signup/payment?success=payment_pending`,
      },
      notification_url: `${appUrl}/api/mercadopago/webhook`,
    };

    const mpData = await createMercadoPagoPreference(preferenceBody);

    await supabaseAdmin
      .from("subscriptions")
      .update({
        mercado_pago_preference_id: mpData.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    return NextResponse.json({
      init_point: mpData.init_point || mpData.sandbox_init_point,
    });
  } catch (error: any) {
    console.error("ONBOARDING MP ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Error iniciando activación" },
      { status: 500 }
    );
  }
}