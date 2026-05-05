import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`/login?next=/invitations/${id}/accept`);
  }

  const { data: invitation, error: invitationError } = await supabase
    .from("invitations")
    .select("id, club_id, email, role, status")
    .eq("id", id)
    .single();

  if (invitationError || !invitation) {
    redirect("/dashboard?error=invitation_not_found");
  }

  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    redirect("/dashboard?error=invitation_email_mismatch");
  }

  if (invitation.status !== "pending") {
    redirect("/dashboard?error=invitation_not_pending");
  }

  const { data: existingMembership } = await supabase
    .from("memberships")
    .select("id")
    .eq("club_id", invitation.club_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingMembership) {
    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({
        club_id: invitation.club_id,
        user_id: user.id,
        role: invitation.role || "socio",
      });

    if (membershipError) {
      console.error("ACCEPT INVITATION MEMBERSHIP ERROR:", membershipError);
      redirect("/dashboard?error=membership_create_failed");
    }
  }

  const { error: updateError } = await supabase
    .from("invitations")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error("ACCEPT INVITATION UPDATE ERROR:", updateError);
    redirect("/dashboard?error=invitation_update_failed");
  }

  redirect(`/club/${invitation.club_id}?success=invitation_accepted`);
}