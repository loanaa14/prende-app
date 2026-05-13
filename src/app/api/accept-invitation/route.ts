import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const body = await req.json();

    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();
    const fullName = String(body.fullName || "").trim();

    if (!email || !code || !fullName) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("status", "pending")
      .maybeSingle();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: "Código inválido" },
        { status: 400 }
      );
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "La invitación expiró" },
        { status: 400 }
      );
    }

    const tempPassword =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2);

    const { data: existingProfile } = await supabase
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
        console.error("CREATE USER ERROR:", createUserError);

        return NextResponse.json(
          { error: "No se pudo crear el usuario" },
          { status: 500 }
        );
      }

      userId = createdUser.user.id;

      await supabase.from("profiles").upsert({
        id: userId,
        email,
        full_name: fullName,
      });
    }

    const { data: existingMembership } = await supabase
      .from("memberships")
      .select("id")
      .eq("club_id", invitation.club_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingMembership) {
      const { error: membershipError } = await supabase
        .from("memberships")
        .insert({
          club_id: invitation.club_id,
          user_id: userId,
          role: invitation.role || "socio",
          status: "active",
        });

      if (membershipError) {
        console.error("MEMBERSHIP ERROR:", membershipError);

        return NextResponse.json(
          { error: "No se pudo crear el acceso" },
          { status: 500 }
        );
      }
    }

    await supabase
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    return NextResponse.json({
      success: true,
      redirectTo: "/login",
      tempPassword,
    });
  } catch (error) {
    console.error("ACCEPT INVITATION ERROR:", error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}