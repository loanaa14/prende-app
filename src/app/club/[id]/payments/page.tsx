import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClubTheme } from "@/lib/supabase/getClubTheme";
import LogoutButton from "@/components/LogoutButton";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  CreditCard,
  Home,
  MessageCircle,
  Plus,
  Settings,
  Users,
  AlertCircle,
  CalendarDays,
  DollarSign,
  BookOpen,
} from "lucide-react";

export default async function PaymentsPage({ params, searchParams }: any) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  async function createPayment(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const userId = String(formData.get("user_id") || "");
    const amount = Number(formData.get("amount") || 0);
    const dueDate = String(formData.get("due_date") || "");
    const concept = String(formData.get("concept") || "Cuota mensual").trim();

    if (!userId || !amount || !dueDate) {
      redirect(`/club/${id}/payments?error=missing_data`);
    }

    const { error } = await supabase.from("member_payments").insert({
      club_id: id,
      user_id: userId,
      amount,
      due_date: dueDate,
      concept,
      status: "pending",
    });

    if (error) {
      console.error("CREATE PAYMENT ERROR:", error);
      redirect(`/club/${id}/payments?error=create_payment`);
    }
await supabase.from("notifications").insert({
  club_id: id,
  user_id: userId,
  title: "Nueva cuota registrada",
  message: `Se registró una cuota de $${amount}.`,
  type: "payment",
});
    revalidatePath(`/club/${id}/payments`);
    redirect(`/club/${id}/payments?success=payment_created`);
  }

  async function markAsPaid(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const paymentId = String(formData.get("payment_id") || "");

    if (!paymentId) {
      redirect(`/club/${id}/payments?error=missing_payment`);
    }

    const { error } = await supabase
      .from("member_payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        method: "manual",
      })
      .eq("id", paymentId)
      .eq("club_id", id);

    if (error) {
      console.error("MARK PAID ERROR:", error);
      redirect(`/club/${id}/payments?error=mark_paid`);
    }

    revalidatePath(`/club/${id}/payments`);
    redirect(`/club/${id}/payments?success=payment_paid`);
  }

  async function markAsPending(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const paymentId = String(formData.get("payment_id") || "");

    if (!paymentId) {
      redirect(`/club/${id}/payments?error=missing_payment`);
    }

    const { error } = await supabase
      .from("member_payments")
      .update({
        status: "pending",
        paid_at: null,
        method: null,
      })
      .eq("id", paymentId)
      .eq("club_id", id);

    if (error) {
      console.error("MARK PENDING ERROR:", error);
      redirect(`/club/${id}/payments?error=mark_pending`);
    }

    revalidatePath(`/club/${id}/payments`);
    redirect(`/club/${id}/payments?success=payment_pending`);
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single();

  const theme = await getClubTheme(id);
  const clubName = theme.name || club?.name || "Club";

  const { data: memberships } = await supabase
    .from("memberships")
    .select("user_id, role, status")
    .eq("club_id", id)
    .eq("status", "active");

  const memberIds = memberships?.map((m: any) => m.user_id) || [];

  const { data: profiles } = memberIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", memberIds)
    : { data: [] as any[] };

  const members =
    profiles?.map((profile: any) => {
      const membership = memberships?.find((m: any) => m.user_id === profile.id);

      return {
        ...profile,
        role: membership?.role || "socio",
        status: membership?.status || "active",
      };
    }) || [];

  const socios = members.filter((m: any) => m.role === "socio");

  const { data: payments } = await supabase
    .from("member_payments")
    .select("*")
    .eq("club_id", id)
    .order("created_at", { ascending: false });

  const today = new Date().toISOString().slice(0, 10);

  const paidPayments = payments?.filter((p: any) => p.status === "paid") || [];

  const pendingPayments =
    payments?.filter((p: any) => p.status === "pending" && p.due_date >= today) ||
    [];

  const overduePayments =
    payments?.filter((p: any) => p.status === "pending" && p.due_date < today) ||
    [];

  const totalPaid = paidPayments.reduce(
    (acc: number, p: any) => acc + Number(p.amount || 0),
    0
  );

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>Prendé</div>

          <nav style={nav}>
            <Nav href={`/club/${id}`} icon={<Home size={16} />} text="Panel" />
            <Nav href={`/club/${id}/members`} icon={<Users size={16} />} text="Socios" />
            <Nav href={`/club/${id}/payments`} icon={<CreditCard size={16} />} text="Pagos" active />
            <Nav href={`/club/${id}/inventory`} icon={<Boxes size={16} />} text="Inventario" />
             <Nav href={`/club/${id}/withdrawals`}icon={<Boxes size={16} />}text="Retiros"/>
            <Nav href={`/club/${id}/community`} icon={<MessageCircle size={16} />} text="Comunidad" />
            <Nav href={`/club/${id}/payments`} icon={<BarChart3 size={16} />} text="Reportes" />
            <Nav href={`/club/${id}/library`}icon={<BookOpen size={17} />}text="Biblioteca"/>
            <Nav href={`/club/${id}/settings`} icon={<Settings size={16} />} text="Ajustes" />
          </nav>
        </div>

        <div style={clubMini}>
          <div style={avatar}>{clubName.slice(0, 2).toUpperCase()}</div>

          <div>
            <p style={clubMiniTitle}>{clubName}</p>
            <p style={clubMiniText}>Administrador</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <section style={content}>
        <header style={header}>
          <div>
            <h1 style={title}>Pagos</h1>

            <p style={subtitle}>
              Cuotas, vencimientos e historial de socios.
            </p>
          </div>

          <details style={actionsDropdown}>
            <summary style={actionsSummary}>
              <Plus size={15} />
              Nueva cuota
            </summary>

            <form action={createPayment} style={quickForm}>
              <select name="user_id" required defaultValue="" style={input}>
                <option value="" disabled style={option}>
                  Seleccionar socio
                </option>

                {socios.map((member: any) => (
                  <option key={member.id} value={member.id} style={option}>
                    {member.full_name || member.email}
                  </option>
                ))}
              </select>

              <input
                name="concept"
                placeholder="Concepto"
                defaultValue="Cuota mensual"
                style={input}
              />

              <input
                name="amount"
                type="number"
                min="1"
                step="1"
                placeholder="Monto"
                required
                style={input}
              />

              <input
                name="due_date"
                type="date"
                required
                style={input}
              />

              <button type="submit" style={submitButton}>
                Crear cuota
              </button>
            </form>
          </details>
        </header>

        {query?.success && (
          <div style={successBox}>
            Acción realizada correctamente.
          </div>
        )}

        {query?.error && (
          <div style={errorBox}>
            No se pudo completar la acción.
          </div>
        )}

        <section style={kpiGrid}>
          <Kpi
            icon={<DollarSign size={22} />}
            title="Cobrado"
            value={`$${totalPaid.toLocaleString("es-UY")}`}
            sub="Total registrado"
          />

          <Kpi
            icon={<CalendarDays size={22} />}
            title="Pendientes"
            value={pendingPayments.length}
            sub="Cuotas por cobrar"
          />

          <Kpi
            icon={<AlertCircle size={22} />}
            title="Vencidas"
            value={overduePayments.length}
            sub="Requieren seguimiento"
          />

          <Kpi
            icon={<CheckCircle2 size={22} />}
            title="Al día"
            value={paidPayments.length}
            sub="Pagos confirmados"
          />
        </section>

        <section style={layout}>
          <div style={mainCard}>
            <div style={cardHeader}>
              <h2 style={cardTitle}>Cuotas registradas</h2>

              <span style={softPill}>
                {payments?.length || 0} movimientos
              </span>
            </div>

            <div style={paymentList}>
              {payments?.map((payment: any) => {
                const member = members.find(
                  (m: any) => m.id === payment.user_id
                );

                const isPaid = payment.status === "paid";

                const isOverdue =
                  payment.status === "pending" &&
                  payment.due_date < today;

                return (
                  <div key={payment.id} style={paymentRow}>
                    <div>
                      <p style={paymentName}>
                        {member?.full_name ||
                          member?.email ||
                          "Socio"}
                      </p>

                      <p style={paymentMeta}>
                        {payment.concept} · Vence{" "}
                        {formatDate(payment.due_date)}
                      </p>
                    </div>

                    <div style={paymentRight}>
                      <p style={amount}>
                        $
                        {Number(payment.amount).toLocaleString(
                          "es-UY"
                        )}
                      </p>

                      <span
                        style={
                          isPaid
                            ? statusPaid
                            : isOverdue
                            ? statusOverdue
                            : statusPending
                        }
                      >
                        {isPaid
                          ? "Pagada"
                          : isOverdue
                          ? "Vencida"
                          : "Pendiente"}
                      </span>

                      {!isPaid ? (
                        <form action={markAsPaid}>
                          <input
                            type="hidden"
                            name="payment_id"
                            value={payment.id}
                          />

                          <button
                            type="submit"
                            style={miniButton}
                          >
                            Marcar pagada
                          </button>
                        </form>
                      ) : (
                        <form action={markAsPending}>
                          <input
                            type="hidden"
                            name="payment_id"
                            value={payment.id}
                          />

                          <button
                            type="submit"
                            style={{
                              ...miniButton,
                              backgroundColor: "#2A2A2A",
                              color: "#FFFFFF",
                            }}
                          >
                            Volver a pendiente
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}

              {!payments?.length && (
                <div style={emptyBox}>
                  Todavía no hay cuotas registradas.
                </div>
              )}
            </div>
          </div>

          <aside style={sideColumn}>
            <div style={sideCard}>
              <h3 style={sideTitle}>Socios activos</h3>

              <div style={sideList}>
                {socios.slice(0, 7).map((member: any) => (
                  <div key={member.id} style={sideItem}>
                    <div>
                      <p style={sideItemTitle}>
                        {member.full_name || "Socio"}
                      </p>

                      <p style={sideItemText}>
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}

                {!socios.length && (
                  <p style={sideEmpty}>
                    Todavía no hay socios activos.
                  </p>
                )}
              </div>
            </div>

            <div style={sideCard}>
              <h3 style={sideTitle}>Resumen</h3>

              <div style={summaryList}>
                <p style={summaryItem}>
                  Pendientes: {pendingPayments.length}
                </p>

                <p style={summaryItem}>
                  Vencidas: {overduePayments.length}
                </p>

                <p style={summaryItem}>
                  Pagadas: {paidPayments.length}
                </p>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(date + "T00:00:00").toLocaleDateString(
    "es-UY",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
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

function Kpi({ icon, title, value, sub }: any) {
  return (
    <div style={kpiCard}>
      <div style={kpiIcon}>{icon}</div>

      <div>
        <p style={kpiTitle}>{title}</p>
        <p style={kpiValue}>{value}</p>
        <p style={kpiSub}>{sub}</p>
      </div>
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
  backgroundColor: "#070707",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  padding: 22,
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
  padding: "11px 13px",
  borderRadius: 13,
  fontWeight: 800,
  fontSize: 13,
};

const navActive: React.CSSProperties = {
  ...navItem,
  color: "#8BE000",
  backgroundColor: "rgba(139,224,0,0.12)",
};

const clubMini: React.CSSProperties = {
  display: "flex",
  gap: 11,
  alignItems: "center",
};

const avatar: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  backgroundColor: "#111",
  border: "1px solid rgba(139,224,0,0.28)",
  display: "grid",
  placeItems: "center",
  color: "#8BE000",
  fontWeight: 900,
  fontSize: 12,
};

const clubMiniTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 850,
  fontSize: 13,
};

const clubMiniText: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#8B8B8B",
  fontSize: 11,
};

const content: React.CSSProperties = {
  padding: 28,
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.12), transparent 30%), #050505",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 22,
  gap: 18,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#9B9B9B",
};

const actionsDropdown: React.CSSProperties = {
  position: "relative",
};

const actionsSummary: React.CSSProperties = {
  listStyle: "none",
  backgroundColor: "#8BE000",
  color: "#050505",
  borderRadius: 14,
  padding: "12px 16px",
  fontWeight: 950,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const quickForm: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 52,
  width: 360,
  zIndex: 50,
  backgroundColor: "#101010",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 22,
  padding: 18,
  display: "grid",
  gap: 12,
  boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
};

const input: React.CSSProperties = {
  backgroundColor: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  color: "#FFFFFF",
  padding: "13px",
  fontWeight: 800,
  outline: "none",
};

const option: React.CSSProperties = {
  backgroundColor: "#111",
  color: "#FFFFFF",
};

const submitButton: React.CSSProperties = {
  backgroundColor: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 14,
  padding: "13px",
  fontWeight: 950,
  cursor: "pointer",
};

const successBox: React.CSSProperties = {
  backgroundColor: "rgba(139,224,0,0.10)",
  border: "1px solid rgba(139,224,0,0.22)",
  color: "#8BE000",
  borderRadius: 14,
  padding: 12,
  marginBottom: 16,
  fontWeight: 850,
};

const errorBox: React.CSSProperties = {
  backgroundColor: "rgba(255,107,107,0.10)",
  border: "1px solid rgba(255,107,107,0.22)",
  color: "#FF6B6B",
  borderRadius: 14,
  padding: 12,
  marginBottom: 16,
  fontWeight: 850,
};

const kpiGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 15,
  marginBottom: 16,
};

const kpiCard: React.CSSProperties = {
  background: "linear-gradient(180deg, #151515, #101010)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 18,
  display: "flex",
  gap: 14,
  alignItems: "center",
  minHeight: 98,
};

const kpiIcon: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 15,
  backgroundColor: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  flex: "0 0 auto",
};

const kpiTitle: React.CSSProperties = {
  margin: 0,
  color: "#D8D8D8",
  fontSize: 13,
  fontWeight: 850,
};

const kpiValue: React.CSSProperties = {
  margin: "7px 0 0",
  color: "#FFFFFF",
  fontSize: 28,
  fontWeight: 950,
};

const kpiSub: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#8BE000",
  fontSize: 12,
  fontWeight: 850,
};

const layout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 320px",
  gap: 16,
};

const mainCard: React.CSSProperties = {
  backgroundColor: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 22,
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 950,
};

const softPill: React.CSSProperties = {
  backgroundColor: "#0B0B0B",
  color: "#8B8B8B",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 999,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 800,
};

const paymentList: React.CSSProperties = {
  display: "grid",
  gap: 10,
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

const paymentName: React.CSSProperties = {
  margin: 0,
  fontWeight: 950,
};

const paymentMeta: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
};

const paymentRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const amount: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 950,
};

const statusPaid: React.CSSProperties = {
  color: "#8BE000",
  backgroundColor: "rgba(139,224,0,0.12)",
  border: "1px solid rgba(139,224,0,0.22)",
  borderRadius: 999,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 900,
};

const statusPending: React.CSSProperties = {
  color: "#D8D8D8",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 999,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 900,
};

const statusOverdue: React.CSSProperties = {
  color: "#FF6B6B",
  backgroundColor: "rgba(255,107,107,0.10)",
  border: "1px solid rgba(255,107,107,0.22)",
  borderRadius: 999,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 900,
};

const miniButton: React.CSSProperties = {
  backgroundColor: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 12,
  padding: "9px 10px",
  fontSize: 12,
  fontWeight: 950,
  cursor: "pointer",
};

const emptyBox: React.CSSProperties = {
  backgroundColor: "#0B0B0B",
  borderRadius: 16,
  padding: 22,
  textAlign: "center",
  color: "#8B8B8B",
};

const sideColumn: React.CSSProperties = {
  display: "grid",
  gap: 16,
  alignSelf: "start",
};

const sideCard: React.CSSProperties = {
  backgroundColor: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 18,
};

const sideTitle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 17,
  fontWeight: 950,
};

const sideList: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const sideItem: React.CSSProperties = {
  backgroundColor: "#0B0B0B",
  borderRadius: 14,
  padding: 12,
};

const sideItemTitle: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const sideItemText: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#8B8B8B",
  fontSize: 12,
};

const sideEmpty: React.CSSProperties = {
  color: "#8B8B8B",
  margin: 0,
};

const summaryList: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const summaryItem: React.CSSProperties = {
  margin: 0,
  backgroundColor: "#0B0B0B",
  borderRadius: 14,
  padding: 12,
  color: "#D8D8D8",
};