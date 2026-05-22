"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import LogoutButton from "@/components/LogoutButton";

import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Home,
  Leaf,
  LogOut,
  MessageCircle,
  User,
  Users,
} from "lucide-react";

export default function SocioShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const supabase = createClient();

  const [clubName, setClubName] =
    useState("Socio");

  const [clubId, setClubId] =
    useState("");

  const [menuOpen, setMenuOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: membership } =
        await supabase
          .from("memberships")
          .select(
            `
              club_id,
              clubs(name)
            `
          )
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

      if (membership?.club_id) {
        setClubId(
          membership.club_id
        );
      }

      const club = Array.isArray(
        membership?.clubs
      )
        ? membership?.clubs[0]
        : membership?.clubs;

      if (club?.name) {
        setClubName(club.name);
      }
    }

    loadData();

    function closeMenu(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      closeMenu
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeMenu
      );
    };
  }, []);

  const baseClubPath = clubId
    ? `/socio/club/${clubId}`
    : "/socio";

  const navItems = [
    {
      label: "Inicio",
      href: "/socio",
      icon: Home,
    },

    
 {
  label: "Comunidad",
  href: "/socio/comunidad",
  icon: Users,
},

    {
      label: "Biblioteca",
      href: "/socio/biblioteca",
      icon: BookOpen,
    },
{
  label: "Eventos",
  href: "/socio/eventos",
  icon: CalendarDays,
},
    {
      label: "Cuotas",
      href: "/socio/cuotas",
      icon: CreditCard,
    },

    {
      label: "Mensajes",
      href: `${baseClubPath}/mensajes`,
      icon: MessageCircle,
    },

    {
      label: "Perfil",
      href: "/socio/perfil",
      icon: User,
    },
  ];

  function isActive(href: string) {
    if (href === "/socio") {
      return pathname === "/socio";
    }

    return pathname.startsWith(href);
  }

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>
            <Leaf size={42} />

            <div>
              <p style={brandTop}>
                PRENDÉ
              </p>

              <p style={brandBottom}>
                SOCIO
              </p>
            </div>
          </div>

          <nav style={nav}>
            {navItems.map((item) => {
              const Icon = item.icon;

              const active = isActive(
                item.href
              );

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={
                    active
                      ? navActive
                      : navItem
                  }
                >
                  <Icon size={22} />

                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={membershipCard}>
          <div style={statusRow}>
            <div style={statusDot} />

            <span style={statusText}>
              Socio activo
            </span>
          </div>

          <p style={membershipLabel}>
            Membresía vigente
          </p>

          <p style={membershipDate}>
            Hasta el 21/06/2026
          </p>

          <div style={progressTrack}>
            <div style={progressFill} />
          </div>
        </div>
      </aside>

      <section style={content}>
        <header style={topbar}>
          <div />

          <div style={topbarRight}>
          <Link href="/socio/notificaciones" style={bellButton}>
  <Bell size={19} />

  <div style={notifBadge}>
    3
  </div>
</Link>

            <div
              ref={menuRef}
              style={{
                position: "relative",
              }}
            >
              <button
                style={profileButton}
                onClick={() =>
                  setMenuOpen(
                    !menuOpen
                  )
                }
              >
                <div style={avatar}>
                  {clubName
                    .slice(0, 1)
                    .toUpperCase()}
                </div>

                <span style={profileName}>
                  Socio
                </span>

                <ChevronDown
                  size={16}
                />
              </button>

              {menuOpen && (
                <div style={dropdown}>
                  <Link
                    href="/socio/perfil"
                    style={
                      dropdownItem
                    }
                  >
                    <User size={18} />
                    Mi perfil
                  </Link>

                  <div
                    style={{
                      padding:
                        "0 10px",
                    }}
                  >
                    <LogoutButton />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={childrenWrapper}>
          {children}
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.08), transparent 20%), #040404",
  display: "grid",
  gridTemplateColumns:
    "290px 1fr",
};

const sidebar: React.CSSProperties =
  {
    background:
      "linear-gradient(180deg, #060606 0%, #040404 100%)",
    borderRight:
      "1px solid rgba(255,255,255,0.06)",
    padding:
      "34px 24px 26px",
    display: "flex",
    flexDirection: "column",
    justifyContent:
      "space-between",
  };

const brand: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 16,
    color: "#8BE000",
  };

const brandTop: React.CSSProperties =
  {
    margin: 0,
    color: "#FFFFFF",
    fontWeight: 950,
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-1px",
  };

const brandBottom: React.CSSProperties =
  {
    margin: "2px 0 0",
    color: "#8BE000",
    fontWeight: 950,
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-1px",
  };

const nav: React.CSSProperties = {
  marginTop: 56,
  display: "grid",
  gap: 12,
};

const navItem: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "18px 18px",
    borderRadius: 20,
    textDecoration: "none",
    color: "#E2E2E2",
    fontWeight: 700,
    fontSize: 16,
    transition:
      "all 0.2s ease",
  };

const navActive: React.CSSProperties =
  {
    ...navItem,
    background:
      "linear-gradient(90deg, rgba(139,224,0,0.28), rgba(139,224,0,0.08))",
    border:
      "1px solid rgba(139,224,0,0.12)",
    color: "#8BE000",
  };

const membershipCard: React.CSSProperties =
  {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    border:
      "1px solid rgba(255,255,255,0.06)",
    borderRadius: 26,
    padding: 22,
  };

const statusRow: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

const statusDot: React.CSSProperties =
  {
    width: 12,
    height: 12,
    borderRadius: 999,
    background: "#8BE000",
  };

const statusText: React.CSSProperties =
  {
    color: "#FFFFFF",
    fontWeight: 800,
    fontSize: 18,
  };

const membershipLabel: React.CSSProperties =
  {
    margin: "26px 0 0",
    color: "#A7A7A7",
    fontSize: 15,
  };

const membershipDate: React.CSSProperties =
  {
    margin: "8px 0 0",
    color: "#8BE000",
    fontWeight: 900,
    fontSize: 18,
  };

const progressTrack: React.CSSProperties =
  {
    marginTop: 20,
    height: 7,
    borderRadius: 999,
    background:
      "rgba(255,255,255,0.08)",
    overflow: "hidden",
  };

const progressFill: React.CSSProperties =
  {
    width: "82%",
    height: "100%",
    background: "#8BE000",
  };

const content: React.CSSProperties =
  {
    display: "flex",
    flexDirection: "column",
  };

const topbar: React.CSSProperties =
  {
    height: 78,
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    padding: "0 34px",
  };

const topbarRight: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 18,
  };

const bellButton: React.CSSProperties =
  {
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "#080808",
    border:
      "1px solid rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    position: "relative",
    cursor: "pointer",
  };

const notifBadge: React.CSSProperties =
  {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 999,
    background: "#8BE000",
    color: "#050505",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 900,
  };

const profileButton: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "transparent",
    border: "none",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 16,
  };

const avatar: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 999,
  background:
    "linear-gradient(135deg, #8BE000, #6EB300)",
  color: "#050505",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
  fontSize: 18,
};

const profileName: React.CSSProperties =
  {
    fontWeight: 700,
    fontSize: 18,
  };

const dropdown: React.CSSProperties =
  {
    position: "absolute",
    top: 64,
    right: 0,
    width: 220,
    background:
      "linear-gradient(180deg, #0F0F0F, #0A0A0A)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 10,
    display: "grid",
    gap: 6,
    zIndex: 20,
    boxShadow:
      "0 20px 40px rgba(0,0,0,0.45)",
  };

const dropdownItem: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 14px",
    borderRadius: 16,
    color: "#FFFFFF",
    textDecoration: "none",
    fontWeight: 700,
    background: "transparent",
  };

const childrenWrapper: React.CSSProperties =
  {
    padding: 34,
  };