import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getClubTheme } from "@/lib/supabase/getClubTheme";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Home,
  MessageCircle,
  Settings,
  Users,
  Clock,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

const payments = [
  {
    name: "Juan Pérez",
    concept: "Cuota mensual",
    amount: "$1.200",
    status: "pagada",
    date: "08/05/2026",
  },
  {
    name: "María Gómez",
    concept: "Cuota mensual",
    amount: "$1.200",
    status: "pendiente",
    date: "10/05/2026",
  },
  {
    name: "Lucas Silva",
    concept: "Cuota mensual",
    amount: "$1.200",
    status: "vencida",
    date: "03/05/2026",
  },
];

export default async function PaymentsPage({ params }: any) {
  const { id } = await params;
  const supabase = await createClient();

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
            <Nav href={`/club/${id}`} icon={<Home size={17} />} text="Panel" />
            <Nav href={`/club/${id}/members`} icon={<Users size={17} />} text="Socios" />
            <Nav href={`/club/${id}/payments`} icon={<CreditCard size={17} />} text="Pagos" active />
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
          <div>
            <h1 style={title}>Pagos</h1>
            <p style={subtitle}>Cuotas, vencimientos e ingresos del club.</p>
          </div>

          <button style={primaryButton}>Registrar pago</button>
        </header>

        <section style={kpiGrid}>
          <KpiCard
            icon={<DollarSign size={25} />}
            title="Ingresos del mes"
            value="$45.600"
            sub="Total cobrado"
          />

          <KpiCard
            icon={<CheckCircle2 size={25} />}
            title="Cuotas pagas"
            value="32"
            sub="Socios al día"
          />

          <KpiCard
            icon={<Clock size={25} />}
            title="Pendientes"
            value="8"
            sub="Cuotas por cobrar"
          />

          <KpiCard
            icon={<AlertTriangle size={25} />}
            title="Vencidas"
            value="5"
            sub="Requieren atención"
          />
        </section>

        <section style={mainGrid}>
          <div style={cardLarge}>
            <div style={cardHeader}>
              <h2 style={cardTitle}>Movimientos recientes</h2>
              <span style={softPill}>Mayo 2026</span>
            </div>

            <div style={paymentList}>
              {payments.map((payment) => (
                <div key={`${payment.name}-${payment.status}`} style={paymentRow}>
                  <div>
                    <p style={paymentName}>{payment.name}</p>
                    <p style={paymentConcept}>{payment.concept}</p>
                  </div>

                  <div>
                    <p style={label}>Fecha</p>
                    <p style={value}>{payment.date}</p>
                  </div>

                  <div>
                    <p style={label}>Importe</p>
                    <p style={amount}>{payment.amount}</p>
                  </div>

                  <Status status={payment.status} />
                </div>
              ))}
            </div>
          </div>

          <div style={rightColumn}>
            <div style={smallCard}>
              <div style={cardHeader}>
                <h2 style={cardTitle}>Próximos vencimientos</h2>
                <CalendarDays size={18} color="#8BE000" />
              </div>

              <div style={noticeBox}>
                <p style={noticeText}>5 cuotas vencen mañana</p>
                <p style={noticeText}>8 vencen esta semana</p>
                <p style={noticeText}>3 socios tienen cuotas vencidas</p>
              </div>
            </div>

            <div style={smallCard}>
              <h2 style={cardTitle}>Acciones rápidas</h2>

              <div style={actions}>
                <button style={actionButton}>Generar cuotas</button>
                <button style={actionButtonDark}>Enviar recordatorio</button>
                <button style={actionButtonDark}>Exportar pagos</button>
              </div>
            </div>
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
      <p style={kpiSub}>{sub}</p>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const style =
    status === "pagada"
      ? statusPaid
      : status === "pendiente"
      ? statusPending
      : statusExpired;

  return <span style={style}>{status}</span>;
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 26,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 38,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#9B9B9B",
};

const primaryButton: React.CSSProperties = {
  background: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 16,
  padding: "14px 18px",
  fontWeight: 950,
  cursor: "pointer",
};

const kpiGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 16,
  marginBottom: 16,
};

const kpiCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 22,
  minHeight: 145,
};

const kpiTop: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const kpiIcon: React.CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 16,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
};

const kpiTitle: React.CSSProperties = {
  margin: 0,
  color: "#E8E8E8",
  fontSize: 14,
  fontWeight: 850,
};

const kpiValue: React.CSSProperties = {
  margin: "18px 0 0",
  fontSize: 34,
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
  fontSize: 13,
  fontWeight: 750,
};

const mainGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.45fr 0.75fr",
  gap: 16,
};

const cardLarge: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 24,
};

const smallCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 22,
};

const rightColumn: React.CSSProperties = {
  display: "grid",
  gap: 16,
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

const softPill: React.CSSProperties = {
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "#8B8B8B",
  borderRadius: 999,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 800,
};

const paymentList: React.CSSProperties = {
  display: "grid",
};

const paymentRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 0.8fr 0.7fr 0.7fr",
  gap: 16,
  alignItems: "center",
  padding: "16px 0",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const paymentName: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const paymentConcept: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
};

const label: React.CSSProperties = {
  margin: 0,
  color: "#777",
  fontSize: 12,
  fontWeight: 850,
};

const value: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#D8D8D8",
  fontSize: 14,
  fontWeight: 750,
};

const amount: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: 900,
};

const statusPaid: React.CSSProperties = {
  color: "#8BE000",
  background: "rgba(139,224,0,0.10)",
  border: "1px solid rgba(139,224,0,0.22)",
  borderRadius: 999,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 900,
  width: "fit-content",
};

const statusPending: React.CSSProperties = {
  ...statusPaid,
  color: "#FFD166",
  background: "rgba(255,209,102,0.10)",
  border: "1px solid rgba(255,209,102,0.22)",
};

const statusExpired: React.CSSProperties = {
  ...statusPaid,
  color: "#FF6B6B",
  background: "rgba(255,107,107,0.10)",
  border: "1px solid rgba(255,107,107,0.22)",
};

const noticeBox: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const noticeText: React.CSSProperties = {
  margin: 0,
  color: "#D8D8D8",
  background: "#0B0B0B",
  borderRadius: 14,
  padding: 12,
};

const actions: React.CSSProperties = {
  marginTop: 18,
  display: "grid",
  gap: 10,
};

const actionButton: React.CSSProperties = {
  background: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 14,
  padding: "12px",
  fontWeight: 950,
  cursor: "pointer",
};

const actionButtonDark: React.CSSProperties = {
  background: "#0B0B0B",
  color: "#FFFFFF",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "12px",
  fontWeight: 900,
  cursor: "pointer",
};