"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Users,
  BookOpen,
  MessageCircle,
  User,
  Leaf,
} from "lucide-react";

export default function SocioShell({
  children,
  clubId,
}: {
  children: React.ReactNode;
  clubId?: string;
}) {
  const pathname = usePathname();
  const supabase = createClient();

  const [resolvedClubId, setResolvedClubId] = useState<string | undefined>(
    clubId
  );

  useEffect(() => {
    async function loadClubId() {
      if (clubId) {
        setResolvedClubId(clubId);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) return;

      const { data: membership } = await supabase
        .from("memberships")
        .select("club_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (membership?.club_id) {
        setResolvedClubId(membership.club_id);
      }
    }

    loadClubId();
  }, [clubId]);

  const baseClubPath = resolvedClubId
    ? `/socio/club/${resolvedClubId}`
    : "/socio";

  const navItems = [
    { label: "Inicio", href: "/socio", icon: Home, match: "/socio" },
    {
      label: "Comunidad",
      href: resolvedClubId ? `${baseClubPath}/comunidad` : "/socio",
      icon: Users,
      match: resolvedClubId ? `${baseClubPath}/comunidad` : "/socio",
    },
    {
      label: "Biblioteca",
      href: resolvedClubId ? `${baseClubPath}/biblioteca` : "/socio",
      icon: BookOpen,
      match: resolvedClubId ? `${baseClubPath}/biblioteca` : "/socio",
    },
    {
      label: "Mensajes",
      href: resolvedClubId ? `${baseClubPath}/mensajes` : "/socio",
      icon: MessageCircle,
      match: resolvedClubId ? `${baseClubPath}/mensajes` : "/socio",
    },
    {
      label: "Perfil",
      href: "/socio/perfil",
      icon: User,
      match: "/socio/perfil",
    },
  ];

  function isActive(item: any) {
    if (item.label === "Inicio") return pathname === "/socio";
    return pathname === item.match || pathname.startsWith(`${item.match}/`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F8F4EC", color: "#172033" }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside
          style={{
            width: 260,
            background: "#12372A",
            color: "white",
            padding: 24,
            flexShrink: 0,
          }}
        >
          <Link
            href="/socio"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: 26,
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 40,
            }}
          >
            <Leaf size={28} />
            Prendé
          </Link>

          <nav style={{ display: "grid", gap: 10 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    color: active ? "#12372A" : "rgba(255,255,255,0.9)",
                    background: active ? "white" : "transparent",
                    textDecoration: "none",
                    padding: "12px 14px",
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section style={{ flex: 1 }}>
          <header
            style={{
              background: "white",
              borderBottom: "1px solid #E5E1DA",
              padding: "20px 40px",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
              Área privada
            </p>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
              Panel socio
            </h1>
          </header>

          <div style={{ padding: 40 }}>{children}</div>
        </section>
      </div>
    </main>
  );
}