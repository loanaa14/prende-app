"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SocioShell from "@/components/socio/SocioShell";
import { AlertCircle, CheckCircle2, CreditCard, Clock } from "lucide-react";

export default function SocioCuotasPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("club_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!membership?.club_id) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("member_payments")
      .select("*")
      .eq("club_id", membership.club_id)
      .eq("user_id", user.id)
      .order("due_date", { ascending: false });

    setPayments(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const paid = payments.filter((p) => p.status === "paid");
  const pending = payments.filter((p) => p.status === "pending");
  const overdue = payments.filter(
    (p) => p.status === "pending" && p.due_date && p.due_date < today
  );

  const totalPaid = paid.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalPending = pending.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  if (loading) {
    return (
      <SocioShell>
        <div style={loadingBox}>Cargando cuotas...</div>
      </SocioShell>
    );
  }

  return (
    <SocioShell>
      <main style={page}>
        <header style={header}>
          <div style={heroIcon}>
            <CreditCard size={34} />
          </div>

          <div>
            <h1 style={title}>Mis cuotas</h1>
            <p style={subtitle}>Estado de pagos, vencimientos e historial.</p>
          </div>
        </header>

        <section style={statsGrid}>
          <StatCard
            icon={<CheckCircle2 size={24} />}
            title="Pagadas"
            value={paid.length}
            text={`$${totalPaid.toLocaleString("es-UY")}`}
          />

          <StatCard
            icon={<Clock size={24} />}
            title="Pendientes"
            value={pending.length}
            text={`$${totalPending.toLocaleString("es-UY")}`}
          />

          <StatCard
            icon={<AlertCircle size={24} />}
            title="Vencidas"
            value={overdue.length}
            text="Revisar estado"
          />
        </section>

        <section style={card}>
          <h2 style={sectionTitle}>Historial</h2>

          <div style={list}>
            {payments.map((payment) => {
              const isPaid = payment.status === "paid";
              const isOverdue =
                payment.status === "pending" &&
                payment.due_date &&
                payment.due_date < today;

              return (
                <div key={payment.id} style={row}>
                  <div>
                    <p style={rowTitle}>
                      {payment.concept || "Cuota mensual"}
                    </p>

                    <p style={rowText}>
                      Vence: {formatDate(payment.due_date)}
                    </p>
                  </div>

                  <div style={rightSide}>
                    <p style={amount}>
                      ${Number(payment.amount || 0).toLocaleString("es-UY")}
                    </p>

                    <span
                      style={
                        isPaid
                          ? paidBadge
                          : isOverdue
                          ? overdueBadge
                          : pendingBadge
                      }
                    >
                      {isPaid ? "Pagada" : isOverdue ? "Vencida" : "Pendiente"}
                    </span>
                  </div>
                </div>
              );
            })}

            {!payments.length && (
              <div style={emptyBox}>Todavía no tenés cuotas registradas.</div>
            )}
          </div>
        </section>
      </main>
    </SocioShell>
  );
}

function StatCard({ icon, title, value, text }: any) {
  return (
    <div style={statCard}>
      <div style={statIcon}>{icon}</div>

      <div>
        <p style={statTitle}>{title}</p>
        <h2 style={statValue}>{value}</h2>
        <p style={statText}>{text}</p>
      </div>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-UY");
}

const page: React.CSSProperties = {
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  marginBottom: 30,
};

const heroIcon: React.CSSProperties = {
  width: 78,
  height: 78,
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(139,224,0,0.28), rgba(139,224,0,0.08))",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  border: "1px solid rgba(139,224,0,0.18)",
};

const title: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: 54,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#9B9B9B",
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
  marginBottom: 24,
};

const statCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 22,
  display: "flex",
  gap: 14,
  alignItems: "center",
};

const statIcon: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 18,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
};

const statTitle: React.CSSProperties = {
  margin: 0,
  color: "#9B9B9B",
  fontWeight: 800,
};

const statValue: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#FFFFFF",
  fontSize: 34,
  fontWeight: 950,
};

const statText: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#8BE000",
  fontSize: 13,
  fontWeight: 800,
};

const card: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 30,
  padding: 24,
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 18px",
  color: "#FFFFFF",
  fontSize: 26,
  fontWeight: 950,
};

const list: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const row: React.CSSProperties = {
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 20,
  padding: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 18,
};

const rowTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 900,
};

const rowText: React.CSSProperties = {
  margin: "7px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
};

const rightSide: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const amount: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 950,
};

const paidBadge: React.CSSProperties = {
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 900,
  fontSize: 12,
};

const pendingBadge: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  color: "#FFFFFF",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 900,
  fontSize: 12,
};

const overdueBadge: React.CSSProperties = {
  background: "rgba(255,107,107,0.12)",
  color: "#FF6B6B",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 900,
  fontSize: 12,
};

const emptyBox: React.CSSProperties = {
  background: "#0B0B0B",
  borderRadius: 20,
  padding: 24,
  color: "#8B8B8B",
  textAlign: "center",
};

const loadingBox: React.CSSProperties = {
  background: "#101010",
  borderRadius: 20,
  padding: 24,
  color: "#FFFFFF",
};