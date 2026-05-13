import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  const formData = await req.formData();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const role = String(formData.get("role") ?? "socio").trim();

  const backToMembers = (query: string) =>
    NextResponse.redirect(
      new URL(`/club/${id}/members?${query}`, req.url)
    );

  if (!email || !["socio", "admin"].includes(role)) {
    return backToMembers("error=invalid_invitation");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  const { data: currentMembership } = await supabase
    .from("memberships")
    .select("id, role")
    .eq("club_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!currentMembership || currentMembership.role !== "admin") {
    return backToMembers("error=not_admin");
  }

  const { data: existingInvitation } = await supabase
    .from("invitations")
    .select("id")
    .eq("club_id", id)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvitation) {
    return backToMembers("error=invitation_already_pending");
  }

  const code = generateCode();

  const expiresAt = new Date(
    Date.now() + 1000 * 60 * 60 * 24
  ).toISOString();

  const { error: inviteError } = await supabase
    .from("invitations")
    .insert({
      club_id: id,
      email,
      role,
      invited_by: user.id,
      status: "pending",
      code,
      expires_at: expiresAt,
    });

  if (inviteError) {
    console.error(inviteError);

    return backToMembers(
      "error=create_invitation_failed"
    );
  }

  console.log("INVITATION CODE:", code);

  return backToMembers(
    "success=invitation_created"
  );
}