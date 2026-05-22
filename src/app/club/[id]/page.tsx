"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/LogoutButton";

import {
  CreditCard,
  Users,
  Boxes,
  Package,
  MessageCircle,
  Settings,
  Home,
  BarChart3,
  BookOpen,
} from "lucide-react";

export default function ClubDashboard({ params }: any) {
  const { id: clubId } = use(params);

  const supabase = createClient();

  const [club, setClub] = useState<any>(null);

  const [stats, setStats] = useState({
    socios: 0,
    cuotas: 0,
    retiros: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: clubData } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .maybeSingle();

    const { count: socios } = await supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("club_id", clubId)
      .eq("status", "active");

    const { count: cuotas } = await supabase
      .from("fees")
      .select("*", { count: "exact", head: true })
      .eq("club_id", clubId);

    const { count: retiros } = await supabase
      .from("member_withdrawals")
      .select("*", { count: "exact", head: true })
      .eq("club_id", clubId);

    setClub(clubData);

    setStats({
      socios: socios || 0,
      cuotas: cuotas || 0,
      retiros: retiros || 0,
    });
  }

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>Prendé</div>

          <nav style={nav}>
            <Nav
              href={`/club/${clubId}`}
              icon={<Home size={17} />}
              text="Panel"
              active
            />

            <Nav
              href={`/club/${clubId}/members`}
              icon={<Users size={17} />}
              text="Socios"
            />

            <Nav
              href={`/club/${clubId}/payments`}
              icon={<CreditCard size={17} />}
              text="Pagos"
            />

            <Nav
              href={`/club/${clubId}/inventory`}
              icon={<Boxes size={17} />}
              text="Inventario"
            />

            <Nav
              href={`/club/${clubId}/withdrawals`}
              icon={<Package size={17} />}
              text="Retiros"
            />

            <Nav
              href={`/club/${clubId}/community`}
              icon={<MessageCircle size={17} />}
              text="Comunidad"
            />
            <Nav
href={`/club/${clubId}/library`}
  icon={<BookOpen size={17} />}
  text="Biblioteca"
/>

            <Nav
              href={`/club/${clubId}/settings`}
              icon={<Settings size={17} />}
              text="Ajustes"
            />
          </nav>
        </div>

        <div style={bottomSection}>
          <div style={clubCard}>
            <div style={clubAvatar}>
              {club?.name?.slice(0, 1) || "C"}
            </div>

            <div>
              <p style={clubName}>{club?.name || "Club"}</p>
              <p style={clubRole}>Administrador</p>
            </div>
          </div>

          <LogoutButton />
        </div>
      </aside>

      <section style={content}>
        <div style={hero}>
          <div>
            <p style={eyebrow}>Panel administrativo</p>

            <h1 style={title}>
              Bienvenido a {club?.name || "tu club"}
            </h1>

            <p style={subtitle}>
              Gestioná socios, pagos, retiros y comunidad desde un solo lugar.
            </p>
          </div>
        </div>

        <section style={grid}>
          <Card
            title="Socios activos"
            value={stats.socios}
          />

          <Card
            title="Cuotas registradas"
            value={stats.cuotas}
          />

          <Card
            title="Retiros"
            value={stats.retiros}
          />
        </section>
      </section>
    </main>
  );
}

function Nav({ href, icon, text, active }: any) {
  return (
    <Link href={href} style={active ? navActive : navItem}>
      {icon}
      {text}
    </Link>
  );
}

function Card({ title, value }: any) {
  return (
    <div style={card}>
      <p style={cardLabel}>{title}</p>
      <h2 style={cardValue}>{value}</h2>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  display: "grid",
  gridTemplateColumns: "230px 1fr",
  color: "#FFFFFF",
};

const sidebar: React.CSSProperties = {
  background: "#070707",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  padding: 24,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const brand: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 950,
};

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 32,
};

const navItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: "#B8B8B8",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 14,
  fontWeight: 800,
};

const navActive: React.CSSProperties = {
  ...navItem,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
};

const bottomSection: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const clubCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const clubAvatar: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
};

const clubName: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const clubRole: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
};

const content: React.CSSProperties = {
  padding: 28,
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.10), transparent 30%), #050505",
};

const hero: React.CSSProperties = {
  marginBottom: 28,
};

const eyebrow: React.CSSProperties = {
  color: "#8BE000",
  fontWeight: 900,
  margin: 0,
};

const title: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 44,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "12px 0 0",
  color: "#9B9B9B",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 18,
};

const card: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 24,
};

const cardLabel: React.CSSProperties = {
  margin: 0,
  color: "#9B9B9B",
};

const cardValue: React.CSSProperties = {
  margin: "14px 0 0",
  fontSize: 42,
  fontWeight: 950,
};