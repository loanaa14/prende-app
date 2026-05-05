"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getClubSettings(clubId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("club_settings")
    .select("*")
    .eq("club_id", clubId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function upsertClubSettings(formData: FormData) {
  const supabase = await createClient();

  const clubId = String(formData.get("club_id"));
  const displayName = String(formData.get("display_name") || "").trim();
  const logoUrl = String(formData.get("logo_url") || "").trim();
  const primaryColor = String(formData.get("primary_color") || "#76A889");
  const secondaryColor = String(formData.get("secondary_color") || "#1E293B");

  if (!clubId) return;

  const { error } = await supabase.from("club_settings").upsert(
    {
      club_id: clubId,
      display_name: displayName,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "club_id" }
  );

  if (error) {
    console.error(error);
    throw new Error("No se pudo guardar la configuración visual.");
  }

  revalidatePath(`/club/${clubId}`);
  revalidatePath(`/club/${clubId}/admin`);
  revalidatePath(`/club/${clubId}/settings`);
}