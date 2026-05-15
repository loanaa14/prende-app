Reemplazá COMPLETO `src/app/socio/page.tsx` por esto:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  User,
  LogOut,
  Lock,
  Bell,
} from "lucide-react";

export default function SocioHomePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  async function loadData() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const currentUser = session?.user;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    setUser(currentUser);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    setProfile(profileData);

    const { data: membershipData } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", currentUser.id)
      .eq("status", "active")
      .maybeSingle();

    setMembership(membershipData);

    if (!membershipData?.club_id) {
      setLoading(false);
      return;
    }

    const { data: clubData } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", membershipData.club_id)
      .maybeSingle();

    setClub(clubData);

    const { data: paymentData } = await supabase
      .from("member_payments")
      .select("*")
      .eq("club_id", membershipData.club_id)
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    setPayments(paymentData || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function formatDate(date?: string) {
    if (!date) return "-";

    return new Date(date + "T00:00:00").toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const paidPayments = payments.filter((p) => p.status === "paid");

  const pendingPayments = payments.filter(
    (p) => p.status === "pending"
  );

  const nextPayment = pendingPayments[0];

  const overduePayments = pendingPayments.filter(
    (p) => p.due_date < new Date().toISOString().slice(0, 10)
  );

  if (loading) {
    return (
      <main style={loadingPage}>
        <div style={loadingCard}>Cargando espacio privado...</div>
      </main>
    );
  }

  if (!membership?.club_id) {
    return (
      <main style={loadingPage}>
        <div style={loadingCard}>
          No perteneces a ningún club activo.
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>Prendé</div>

          <div style={profileCard}>
            <div style={avatar}>
              {(profile?.full_name || user?.email || "S")
                .slice(0, 1)
                .toUpperCase()}
            </div>

            <div>
              <p style={profileName}>
                {profile?.full_name || "Socio"}
              </p>

              <p style={profileEmail}>{user?.email}</p>
            </div>
          </div>

          <nav style={nav}>
            <div style={navActive}>
              <CreditCard size={16} />
              Mi espacio
            </div>

            <div style={navItem}>
              <Bell size={16} />
              Comunidad
            </div>

            <div
              style={navItem}
              onClick={() => router.push("/change-password")}
            >
              <Lock size={16} />
              Cambiar contraseña
            </div>
          </nav>
        </div>

        <button onClick={logout} style={logoutButton}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </aside>

      <section style={content}>
        <header style={header}>
          <div>
            <h1 style={title}>Hola 👋</h1>

            <p style={subtitle}>
              Bienvenido al espacio privado de {club?.name || "tu club"}.
            </p>
          </div>
        </header>

        <section style={kpiGrid}>
          <div style={kpiCard}>
            <div style={kpiIcon}>
              <CheckCircle2 size={22} />
            </div>

            <div>
              <p style={kpiLabel}>Pagadas</p>
              <p style={kpiValue}>{paidPayments.length}</p>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={kpiIcon}>
              <AlertCircle size={22} />
            </div>

            <div>
              <p style={kpiLabel}>Pendientes</p>
              <p style={kpiValue}>{pendingPayments.length}</p>
            </div>
          </div>

          <div style={kpiCard}>
            <div style={kpiIcon}>
              <Calendar size={22} />
            </div>

            <div>
              <p style={kpiLabel}>Próximo vencimiento</p>
              <p style={kpiSmallValue}>
                {nextPayment
                  ? formatDate(nextPayment.due_date)
                  : "Sin cuotas"}
              </p>
            </div>
          </div>
        </section>

        {overduePayments.length > 0 && (
          <div style={warningBox}>
            Tenés cuotas vencidas pendientes.
          </div>
        )}

        <section style={mainCard}>
          <div style={cardHeader}>
            <h2 style={cardTitle}>Historial de cuotas</h2>
          </div>

          <div style={paymentList}>
            {payments.map((payment) => {
              const isPaid = payment.status === "paid";

              const isOverdue =
                payment.status === "pending" &&
                payment.due_date <
                  new Date().toISOString().slice(0, 10);

              return (
                <div key={payment.id} style={paymentRow}>
                  <div>
                    <p style={paymentConcept}>
                      {payment.concept}
                    </p>

                    <p style={paymentDate}>
                      Vence {formatDate(payment.due_date)}
                    </p>
                  </div>

                  <div style={paymentRight}>
                    <p style={paymentAmount}>
                      ${Number(payment.amount).toLocaleString("es-UY")}
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
                      {isPaid
                        ? "Pagada"
                        : isOverdue
                        ? "Vencida"
                        : "Pendiente"}
                    </span>
                  </div>
                </div>
              );
            })}

            {!payments.length && (
              <div style={emptyBox}>
                Todavía no hay cuotas registradas.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  color: "#FFFFFF",
  display: "grid",
  gridTemplateColumns: "240px 1fr",
};

const loadingPage: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const loadingCard: React.CSSProperties = {
  backgroundColor: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 24,
  color: "#FFFFFF",
};

const sidebar: React.CSSProperties = {
  backgroundColor: "#070707",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  padding: 24,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const brand: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 950,
  marginBottom: 28,
};

const profileCard: React.CSSProperties = {
  backgroundColor: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 16,
  display: "flex",
  gap: 12,
  alignItems: "center",
  marginBottom: 24,
};

const avatar: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  backgroundColor: "rgba(139,224,0,0.12)",
  display: "grid",
  placeItems: "center",
  color: "#8BE000",
  fontWeight: 950,
};

const profileName: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const profileEmail: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#8B8B8B",
  fontSize: 12,
};

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const navItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 14px",
  borderRadius: 14,
  color: "#B8B8B8",
  fontWeight: 800,
  cursor: "pointer",
};

const navActive: React.CSSProperties = {
  ...navItem,
  backgroundColor: "rgba(139,224,0,0.12)",
  color: "#8BE000",
};

const logoutButton: React.CSSProperties = {
  backgroundColor: "#151515",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#FFFFFF",
  borderRadius: 14,
  padding: "12px 14px",
  display: "flex",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
  fontWeight: 900,
};

const content: React.CSSProperties = {
  padding: 28,
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.12), transparent 30%), #050505",
};

const header: React.CSSProperties = {
  marginBottom: 24,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 36,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#9B9B9B",
};

const kpiGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
  marginBottom: 18,
};

const kpiCard: React.CSSProperties = {
  backgroundColor: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 20,
  display: "flex",
  gap: 14,
  alignItems: "center",
};

const kpiIcon: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  backgroundColor: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
};

const kpiLabel: React.CSSProperties = {
  margin: 0,
  color: "#9B9B9B",
  fontSize: 13,
};

const kpiValue: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 28,
  fontWeight: 950,
};

const kpiSmallValue: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 18,
  fontWeight: 950,
};

const warningBox: React.CSSProperties = {
  backgroundColor: "rgba(255,107,107,0.10)",
  border: "1px solid rgba(255,107,107,0.22)",
  color: "#FF6B6B",
  borderRadius: 16,
  padding: 14,
  marginBottom: 18,
  fontWeight: 900,
};

const mainCard: React.CSSProperties = {
  backgroundColor: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 24,
};

const cardHeader: React.CSSProperties = {
  marginBottom: 18,
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 950,
};

const paymentList: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const paymentRow: React.CSSProperties = {
  backgroundColor: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 18,
  padding: 16,
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 16,
  alignItems: "center",
};

const paymentConcept: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const paymentDate: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
};

const paymentRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const paymentAmount: React.CSSProperties = {
  margin: 0,
  fontWeight: 950,
};

const paidBadge: React.CSSProperties = {
  backgroundColor: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  border: "1px solid rgba(139,224,0,0.22)",
  borderRadius: 999,
  padding: "7px 10px",
  fontWeight: 900,
  fontSize: 12,
};

const pendingBadge: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.06)",
  color: "#D8D8D8",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 999,
  padding: "7px 10px",
  fontWeight: 900,
  fontSize: 12,
};

const overdueBadge: React.CSSProperties = {
  backgroundColor: "rgba(255,107,107,0.10)",
  color: "#FF6B6B",
  border: "1px solid rgba(255,107,107,0.22)",
  borderRadius: 999,
  padding: "7px 10px",
  fontWeight: 900,
  fontSize: 12,
};

const emptyBox: React.CSSProperties = {
  backgroundColor: "#0B0B0B",
  borderRadius: 18,
  padding: 24,
  textAlign: "center",
  color: "#8B8B8B",
};
