import { createClient } from "@/lib/supabase/server";

export async function getClubSubscription(clubId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("club_id", clubId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("GET SUBSCRIPTION ERROR:", error);
  }

  const subscription = data?.[0] || null;

  return {
    isActive: !!subscription,
    plan: subscription?.plan || subscription?.plan_name || null,
    subscription,
    isPersonalizado:
      subscription?.plan === "personalizado" ||
      subscription?.plan_name === "personalizado",
    isEsencial:
      subscription?.plan === "esencial" ||
      subscription?.plan_name === "esencial",
  };
}