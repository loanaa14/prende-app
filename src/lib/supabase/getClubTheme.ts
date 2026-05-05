import { createClient } from "@/lib/supabase/server";

export async function getClubTheme(clubId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("club_settings")
    .select("display_name, logo_url, primary_color, secondary_color")
    .eq("club_id", clubId)
    .maybeSingle();

  return {
    primary: data?.primary_color || "#76A889",
    secondary: data?.secondary_color || "#1E293B",
    logo: data?.logo_url || null,
    name: data?.display_name || null,
  };
}