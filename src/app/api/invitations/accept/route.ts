import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "API invitations accept funcionando",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();
    const fullName = String(body.fullName || "").trim();

    if (!email || !code || !fullName) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const { data: invitation, error: invitationError } = await adminClient
      .from("invitations")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("status", "pending")
      .maybeSingle();

    if (invitationError || !invitation) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "La invitación expiró" },
        { status: 400 }
      );
    }

    const tempPassword =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2) +
      "A1!";

    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    let userId = existingProfile?.id;

    if (!userId) {
      const { data: createdUser, error: createUserError } =
        await adminClient.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
          },
        });

      if (createUserError || !createdUser.user) {
        return NextResponse.json(
          { error: createUserError?.message || "No se pudo crear el usuario" },
          { status: 500 }
        );
      }

      userId = createdUser.user.id;

      await adminClient.from("profiles").upsert({
        id: userId,
        email,
        full_name: fullName,
      });
    } else {
      await adminClient.from("profiles").upsert({
        id: userId,
        email,
        full_name: fullName,
      });
    }

    const { data: existingMembership } = await adminClient
      .from("memberships")
      .select("id")
      .eq("club_id", invitation.club_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingMembership) {
      const { error: membershipError } = await adminClient
        .from("memberships")
        .insert({
          club_id: invitation.club_id,
          user_id: userId,
          role: invitation.role || "socio",
          status: "active",
        });

      if (membershipError) {
        return NextResponse.json(
          { error: membershipError.message || "No se pudo crear el acceso" },
          { status: 500 }
        );
      }
    }

    await adminClient
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    return NextResponse.json({
      success: true,
      email,
      tempPassword,
      clubId: invitation.club_id,
      redirectTo: `/change-password?clubId=${invitation.club_id}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error interno" },
      { status: 500 }
    );
  }
}