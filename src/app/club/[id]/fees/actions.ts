"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getMembers(clubId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memberships")
    .select("id, role, user_id")
    .eq("club_id", clubId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function getFees(clubId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("member_fees")
    .select("*")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function createFee(formData: FormData) {
  const supabase = await createClient();

  const clubId = String(formData.get("club_id"));
  const memberId = String(formData.get("member_id"));
  const amount = Number(formData.get("amount") || 0);
  const dueDate = String(formData.get("due_date") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (!clubId || !memberId || amount <= 0) return;

  const { error } = await supabase.from("member_fees").insert({
    club_id: clubId,
    member_id: memberId,
    amount,
    due_date: dueDate || null,
    status: "pendiente",
    notes,
  });

  if (error) {
    console.error(error);
    throw new Error("No se pudo crear la cuota");
  }

  revalidatePath(`/club/${clubId}/fees`);
}

export async function markFeeAsPaid(formData: FormData) {
  const supabase = await createClient();

  const clubId = String(formData.get("club_id"));
  const feeId = String(formData.get("fee_id"));

  if (!clubId || !feeId) return;

  const { error } = await supabase
    .from("member_fees")
    .update({
      status: "pagada",
      paid_at: new Date().toISOString(),
    })
    .eq("id", feeId)
    .eq("club_id", clubId);

  if (error) {
    console.error(error);
    throw new Error("No se pudo marcar la cuota como pagada");
  }

  revalidatePath(`/club/${clubId}/fees`);
}