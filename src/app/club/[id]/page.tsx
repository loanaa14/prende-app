import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getClubTheme } from "@/lib/supabase/getClubTheme";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  CreditCard,
  Home,
  MessageCircle,
  Settings,
  Users,
  UserPlus,
  Cannabis,
  DollarSign,
} from "lucide-react";

const activity = [
  ["Sheila creó una publicación", "Hace 5 min", "community"],
  ["Juan Pérez pagó cuota mensual", "Hace 18 min", "payment"],
  ["Stock bajo en Gorilla Glue", "Hace 27 min", "stock"],
  ["Nuevo socio aprobado", "Hace 1 h", "member"],
  ["Se registró retiro de 15g", "Hace 2 h", "stock"],
];

export default async function ClubPage({ params }: any) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single();

  const theme = await getClubTheme(id);
  const clubName = theme.name || club?.name || "Club";

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>Prendé</div>

          <nav style={nav}>
            <Nav href={`/club/${id}`} icon={<Home size={17} />} text="Panel" active />
            <Nav href={`/club/${id}/members`} icon={<Users size={17} />} text="Socios" />
            <Nav href={`/club/${id}/payments`} icon={<CreditCard size={17} />} text="Pagos" />
            <Nav href={`/club/${id}/inventory`} icon={<Boxes size={17} />} text="Inventario" />
            <Nav href={`/club/${id}/community`} icon={<MessageCircle size={17} />} text="Comunidad" />
            <Nav href={`/club/${id}/payments`} icon={<BarChart3 size={17} />} text="Reportes" />
            <Nav href={`/club/${id}/settings`} icon={<Settings size={17} />} text="Ajustes" />
          </nav>
        </div>

        <div style={clubMini}>
          <div style={avatar}>{clubName.slice(0, 2).toUpperCase()}</div>

          <div>
            <p style={clubMiniTitle}>{clubName}</p>
            <p style={clubMiniText}>Administrador</p>
          </div>
        </div>
      </aside>

      <section style={content}>
        <header style={header}>
          <h1 style={title}>Buenas noches, {clubName} 👋</h1>
          <p style={subtitle}>Resumen general — Mayo 2026</p>
        </header>

        <section style={kpiGrid}>
          <KpiCard
            icon={<Users size={26} />}
            title="Socios activos"
            value="32"
            sub="Socios activos al día"
          />

          <KpiCard
            icon={<DollarSign size={26} />}
            title="Ingresos del mes"
            value="$45.600"
          />

          <KpiCard
            icon={<Cannabis size={26} />}
            title="Stock disponible"
            value="1.240g"
            sub="12 genéticas activas"
          />
        </section>

        <section style={dashboardGrid}>
          <div style={largeCard}>
            <div style={cardHeader}>
              <h2 style={cardTitle}>Actividad reciente</h2>

              <Link href={`/club/${id}/payments`} style={cardLink}>
                Ver todo →
              </Link>
            </div>

            <div style={activityList}>
              {activity.map(([item, time, type]) => (
                <div key={item} style={activityItem}>
                  <div style={activityIcon}>
                    {type === "payment" ? (
                      <CreditCard size={16} color="#8BE000" />
                    ) : type === "member" ? (
                      <UserPlus size={16} color="#8BE000" />
                    ) : type === "community" ? (
                      <MessageCircle size={16} color="#8BE000" />
                    ) : (
                      <Boxes size={16} color="#8BE000" />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={activityText}>{item}</p>
                  </div>

                  <span style={activityTime}>{time}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={smallCard}>
            <div style={cardHeader}>
              <h2 style={cardTitle}>Próximos vencimientos</h2>

              <CalendarDays size={18} color="#8BE000" />
            </div>

            <div style={noticeBox}>
              <p style={noticeText}>5 cuotas vencen mañana</p>
              <p style={noticeText}>8 vencen esta semana</p>
            </div>

            <Link href={`/club/${id}/payments`} style={cardLink}>
              Ver pagos →
            </Link>
          </div>
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

function KpiCard({ icon, title, value, sub }: any) {
  return (
    <div style={kpiCard}>
      <div style={kpiTop}>
        <div style={kpiIcon}>{icon}</div>
        <p style={kpiTitle}>{title}</p>
      </div>

      <p style={kpiValue}>{value}</p>

      <div style={miniLine} />

      {sub && <p style={kpiSub}>{sub}</p>}
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  color: "#FFFFFF",
  display: "grid",
  gridTemplateColumns: "230px 1fr",
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
  fontSize: 22,
  fontWeight: 950,
  marginBottom: 30,
};

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const navItem: React.CSSProperties = {
  color: "#B8B8B8",
  textDecoration: "none",
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 14,
  fontWeight: 800,
  fontSize: 14,
};

const navActive: React.CSSProperties = {
  ...navItem,
  color: "#8BE000",
  background: "rgba(139,224,0,0.12)",
};

const clubMini: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const avatar: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 999,
  background: "#111",
  border: "1px solid rgba(139,224,0,0.28)",
  display: "grid",
  placeItems: "center",
  color: "#8BE000",
  fontWeight: 900,
};

const clubMiniTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 850,
};

const clubMiniText: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#8B8B8B",
  fontSize: 12,
};

const content: React.CSSProperties = {
  padding: 34,
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.11), transparent 32%), #050505",
};

const header: React.CSSProperties = {
  marginBottom: 28,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  fontWeight: 950,
  letterSpacing: "-0.8px",
};

const subtitle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#9B9B9B",
};

const kpiGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
  marginBottom: 16,
};

const kpiCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 22,
  minHeight: 155,
};

const kpiTop: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const kpiIcon: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
};

const kpiTitle: React.CSSProperties = {
  margin: 0,
  color: "#E8E8E8",
  fontSize: 15,
  fontWeight: 850,
};

const kpiValue: React.CSSProperties = {
  margin: "18px 0 0",
  fontSize: 38,
  fontWeight: 950,
};

const miniLine: React.CSSProperties = {
  width: 34,
  height: 3,
  background: "#8BE000",
  borderRadius: 999,
  marginTop: 12,
};

const kpiSub: React.CSSProperties = {
  margin: "12px 0 0",
  color: "#9B9B9B",
  fontSize: 14,
  fontWeight: 750,
};

const dashboardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.45fr 0.75fr",
  gap: 16,
};

const largeCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 24,
  minHeight: 300,
};

const smallCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 22,
  minHeight: 300,
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 950,
};

const activityList: React.CSSProperties = {
  display: "grid",
};

const activityItem: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const activityIcon: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "rgba(139,224,0,0.10)",
  display: "grid",
  placeItems: "center",
  flex: "0 0 auto",
};

const activityText: React.CSSProperties = {
  margin: 0,
  fontWeight: 800,
  color: "#E8E8E8",
};

const activityTime: React.CSSProperties = {
  color: "#8B8B8B",
  fontSize: 13,
};

const noticeBox: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginBottom: 18,
};

const noticeText: React.CSSProperties = {
  margin: 0,
  color: "#D8D8D8",
  background: "#0B0B0B",
  borderRadius: 14,
  padding: 12,
  lineHeight: 1.45,
};

const cardLink: React.CSSProperties = {
  color: "#8BE000",
  textDecoration: "none",
  fontWeight: 850,
  fontSize: 14,
};