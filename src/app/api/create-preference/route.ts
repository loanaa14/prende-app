import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLANS = {
  esencial: {
    title: "Prendé - Plan Esencial",
    price: 800,
  },
  personalizado: {
    title: "Prendé - Plan Personalizado",
    price: 1300,
  },
};

async function createMercadoPagoPreference(preferenceBody: any) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token || token === "TU_ACCESS_TOKEN") {
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

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "No se pudo crear preferencia de Mercado Pago"
    );
  }

  return data;
}

/**
 * GET = pago de cuota social desde panel socio
 * /api/create-preference?clubId=xxx&type=member_fee
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const url = new URL(request.url);
  const clubId = url.searchParams.get("clubId");
  const type = url.searchParams.get("type");

  if (!clubId || type !== "member_fee") {
    return NextResponse.redirect(`${appUrl}/socio`);
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    return NextResponse.redirect(`${appUrl}/socio`);
  }

  const { data: fee } = await supabase
    .from("member_fees")
    .select("*")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .in("status", ["pendiente", "vencida"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!fee) {
    return NextResponse.redirect(`${appUrl}/socio?success=no_pending_fee`);
  }

  const amount = Number(fee.amount || 0);

  if (!amount || amount <= 0) {
    return NextResponse.redirect(`${appUrl}/socio?error=invalid_fee_amount`);
  }

  const preferenceBody = {
    items: [
      {
        id: fee.id,
        title: "Prendé - Cuota social",
        quantity: 1,
        unit_price: amount,
        currency_id: "UYU",
      },
    ],
    metadata: {
      type: "member_fee",
      fee_id: fee.id,
      club_id: clubId,
      user_id: user.id,
    },
    external_reference: fee.id,
    back_urls: {
      success: `${appUrl}/socio?success=fee_payment_started`,
      failure: `${appUrl}/socio?error=fee_payment_failed`,
      pending: `${appUrl}/socio?success=fee_payment_pending`,
    },
    notification_url: `${appUrl}/api/mercadopago/webhook`,
  };

  try {
    const mpData = await createMercadoPagoPreference(preferenceBody);

    await supabase
      .from("member_fees")
      .update({
        mercado_pago_preference_id: mpData.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fee.id);

    return NextResponse.redirect(mpData.init_point || mpData.sandbox_init_point);
  } catch (error: any) {
    console.error("MEMBER FEE PREFERENCE ERROR:", error);
    return NextResponse.redirect(`${appUrl}/socio?error=payment_error`);
  }
}

/**
 * POST = planes SaaS del club/admin
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const clubId = String(body.club_id || "");
  const plan = String(body.plan || "esencial") as keyof typeof PLANS;

  if (!clubId || !PLANS[plan]) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({
      club_id: clubId,
      plan,
      status: "pending",
    })
    .select("id")
    .single();

  if (subscriptionError || !subscription) {
    return NextResponse.json(
      { error: subscriptionError?.message || "No se pudo crear suscripción" },
      { status: 500 }
    );
  }

  const preferenceBody = {
    items: [
      {
        id: plan,
        title: PLANS[plan].title,
        quantity: 1,
        unit_price: PLANS[plan].price,
        currency_id: "UYU",
      },
    ],
    metadata: {
      type: "subscription",
      club_id: clubId,
      subscription_id: subscription.id,
      plan,
    },
    external_reference: subscription.id,
    back_urls: {
      success: `${appUrl}/dashboard?success=payment_started`,
      failure: `${appUrl}/dashboard?error=payment_failed`,
      pending: `${appUrl}/dashboard?success=payment_pending`,
    },
    notification_url: `${appUrl}/api/mercadopago/webhook`,
  };

  try {
    const mpData = await createMercadoPagoPreference(preferenceBody);

    await supabase
      .from("subscriptions")
      .update({
        mercado_pago_preference_id: mpData.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    return NextResponse.json({
      preference_id: mpData.id,
      init_point: mpData.init_point,
      sandbox_init_point: mpData.sandbox_init_point,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}