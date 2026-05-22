import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ClubAdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, status, club_id")
    .eq("user_id", user.id)
    .eq("club_id", id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    redirect("/socio");
  }

  if (membership.role !== "admin") {
    redirect("/socio");
  }

  return <>{children}</>;
}