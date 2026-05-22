"use client";

import { useEffect, useState } from "react";
import SocioShell from "@/components/socio/SocioShell";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  CreditCard,
  Package,
  Flame,
  CalendarDays,
} from "lucide-react";

export default function SocioPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const { data: membership } = await supabase
      .from("memberships")
      .select("club_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership?.club_id) {
      setProfile(profileData);
      setLoading(false);
      return;
    }

    const [paymentsRes, withdrawalsRes, eventsRes] = await Promise.all([
      supabase
        .from("member_payments")
        .select("*")
        .eq("club_id", membership.club_id)
        .eq("user_id", user.id)
        .order("due_date", { ascending: false }),

      supabase
        .from("withdrawals")
        .select("*")
        .eq("club_id", membership.club_id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),

      supabase
        .from("club_events")
        .select("*")
        .eq("club_id", membership.club_id)
        .order("start_date", { ascending: true })
        .limit(3),
    ]);

    setProfile(profileData);
    setPayments(paymentsRes.data || []);
    setWithdrawals(withdrawalsRes.data || []);
    setEvents(eventsRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const pendingPayments = payments.filter((p) => p.status === "pending");
  const paidPayments = payments.filter((p) => p.status === "paid");

  const totalWithdrawn = withdrawals.reduce(
    (acc, item) => acc + Number(item.quantity || item.amount || 0),
    0
  );

  if (loading) {
    return (
      <SocioShell>
        <div style={loadingBox}>Cargando tu panel...</div>
      </SocioShell>
    );
  }

  return (
    <SocioShell>
      <main style={page}>
        <header style={header}>
          <div>
            <h1 style={title}>Hola, {profile?.full_name || "socio"} 👋</h1>
            <p style={subtitle}>Bienvenido a tu espacio privado.</p>
          </div>
        </header>

        <section style={grid}>
          <div style={mainCard}>
            <p style={eyebrow}>Estado de cuota</p>

            <div style={statusRow}>
              <div>
                <h2 style={mainTitle}>
                  {pendingPayments.length ? "Tenés cuotas pendientes" : "Estás al día"}
                </h2>

                <p style={mainText}>
                  {pendingPayments.length
                    ? `Tenés ${pendingPayments.length} cuota(s) pendiente(s).`
                    : "No tenés cuotas pendientes registradas en este momento."}
                </p>
              </div>

              <div style={bigIcon}>
                <CheckCircle2 size={30} />
              </div>
            </div>
          </div>

          <div style={sideStats}>
            <Stat
              icon={<Package size={18} />}
              title="Total retirado"
              value={`${totalWithdrawn}g`}
            />

            <Stat
              icon={<Flame size={18} />}
              title="Genética más retirada"
              value="Sin datos"
            />

            <Stat
              icon={<CreditCard size={18} />}
              title="Cuotas pagadas"
              value={paidPayments.length}
            />
          </div>
        </section>

        <section style={bottomGrid}>
          <div style={panelCard}>
            <div style={panelHeader}>
              <h2 style={panelTitle}>Últimos retiros</h2>
            </div>

            <div style={list}>
              {withdrawals.map((item) => (
                <div key={item.id} style={row}>
                  <span>{item.genetic || item.product_name || "Retiro"}</span>
                  <strong>{item.quantity || item.amount || 0}g</strong>
                </div>
              ))}

              {!withdrawals.length && (
                <div style={empty}>Todavía no hay retiros registrados.</div>
              )}
            </div>
          </div>

          <div style={panelCard}>
            <div style={panelHeader}>
              <h2 style={panelTitle}>Próximos eventos</h2>
            </div>

            <div style={list}>
              {events.map((event) => (
                <div key={event.id} style={row}>
                  <span>{event.title}</span>
                  <strong>{formatDate(event.start_date)}</strong>
                </div>
              ))}

              {!events.length && (
                <div style={empty}>No hay eventos publicados.</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </SocioShell>
  );
}

function Stat({ icon, title, value }: any) {
  return (
    <div style={statCard}>
      <div style={statIcon}>{icon}</div>
      <div>
        <p style={statTitle}>{title}</p>
        <h3 style={statValue}>{value}</h3>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-UY");
}

const page: React.CSSProperties = {
  width: "100%",
  maxWidth: 1250,
  margin: "0 auto",
};

const header: React.CSSProperties = {
  marginBottom: 28,
};

const title: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: 42,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#9B9B9B",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.7fr 0.9fr",
  gap: 20,
};

const mainCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 30,
  padding: 26,
  minHeight: 230,
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  color: "#8BE000",
  fontWeight: 900,
  fontSize: 13,
};

const statusRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "center",
  marginTop: 18,
};

const mainTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: 34,
  fontWeight: 950,
};

const mainText: React.CSSProperties = {
  margin: "16px 0 0",
  color: "#B8B8B8",
};

const bigIcon: React.CSSProperties = {
  width: 68,
  height: 68,
  borderRadius: 22,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
};

const sideStats: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const statCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 24,
  padding: 18,
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const statIcon: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 16,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
};

const statTitle: React.CSSProperties = {
  margin: 0,
  color: "#9B9B9B",
  fontSize: 13,
};

const statValue: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#FFFFFF",
  fontSize: 20,
  fontWeight: 950,
};

const bottomGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginTop: 20,
};

const panelCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 28,
  padding: 22,
};

const panelHeader: React.CSSProperties = {
  marginBottom: 16,
};

const panelTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: 24,
  fontWeight: 950,
};

const list: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const row: React.CSSProperties = {
  background: "#0A0A0A",
  borderRadius: 16,
  padding: 14,
  color: "#FFFFFF",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const empty: React.CSSProperties = {
  background: "#0A0A0A",
  borderRadius: 16,
  padding: 18,
  color: "#8B8B8B",
  textAlign: "center",
};

const loadingBox: React.CSSProperties = {
  background: "#101010",
  borderRadius: 22,
  padding: 24,
  color: "#FFFFFF",
};