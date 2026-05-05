"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SocioShell from "@/components/socio/SocioShell";

export default function SocioPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function redirectToClub() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: membership } = await supabase
        .from("memberships")
        .select("club_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (membership?.club_id) {
        router.push(`/socio/club/${membership.club_id}`);
        return;
      }

      setLoading(false);
    }

    redirectToClub();
  }, []);

  if (loading) {
    return (
      <SocioShell>
        <p>Cargando tu espacio privado...</p>
      </SocioShell>
    );
  }

  return (
    <SocioShell>
      <div
        style={{
          background: "white",
          border: "1px solid #E5E1DA",
          borderRadius: 28,
          padding: 28,
        }}
      >
        Todavía no perteneces a ningún club activo.
      </div>
    </SocioShell>
  );
}