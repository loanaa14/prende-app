"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getInvitationStats(clubId: string) {
  const supabase = await createClient();

  const { count: activeMembers } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubId);

  const { count: pendingInvitations } = await supabase
    .from("invitations")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubId)
    .eq("status", "pending");

  const { data: club } = await supabase
    .from("clubs")
    .select("max_members")
    .eq("id", clubId)
    .single();

  const maxMembers = club?.max_members || 45;

  return {
    activeMembers: activeMembers || 0,
    pendingInvitations: pendingInvitations || 0,
    maxMembers,
    availableSlots:
      maxMembers - (activeMembers || 0) - (pendingInvitations || 0),
  };
}

export async function createBulkInvitations(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const clubId = String(formData.get("club_id"));
  const rawEmails = String(formData.get("emails") || "");

  const emails = rawEmails
    .split(/[\n,; ]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.includes("@"));

  const uniqueEmails = Array.from(new Set(emails));

  if (!clubId || uniqueEmails.length === 0) return;

  const stats = await getInvitationStats(clubId);

  if (stats.availableSlots <= 0) {
    throw new Error("No hay cupos disponibles para nuevas invitaciones.");
  }

  const emailsToInsert = uniqueEmails.slice(0, stats.availableSlots);

  const payload = emailsToInsert.map((email) => ({
    club_id: clubId,
    email,
    role: "socio",
    status: "pending",
    invited_by: user.id,
  }));

  const { error } = await supabase.from("invitations").insert(payload);

  if (error) {
    console.error("BULK INVITATIONS ERROR:", error);
    throw new Error(error.message || "No se pudieron crear las invitaciones.");
  }

  revalidatePath(`/club/${clubId}/bulk-invitations`);
}

export async function getInvitations(clubId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("invitations")
    .select("id, email, status, created_at")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function cancelInvitation(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id"));
  const clubId = String(formData.get("club_id"));

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("No se pudo cancelar la invitación");
  }

  revalidatePath(`/club/${clubId}/bulk-invitations`);
}