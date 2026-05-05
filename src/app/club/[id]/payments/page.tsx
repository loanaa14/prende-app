"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Save, Plus } from "lucide-react";

export default function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clubId } = use(params);
  const supabase = createClient();

  const [club, setClub] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [monthlyAmount, setMonthlyAmount] = useState("500");
  const [inscriptionAmount, setInscriptionAmount] = useState("1500");

  async function loadData() {
    setLoading(true);

    const { data: clubData } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .maybeSingle();

    setClub(clubData);
    setMonthlyAmount(String(clubData?.monthly_fee_amount ?? 500));
    setInscriptionAmount(String(clubData?.inscription_fee_amount ?? 1500));

    const { data: membershipsData } = await supabase
      .from("memberships")
      .select("*")
      .eq("club_id", clubId)
      .eq("status", "active");

    const members = (membershipsData ?? []).filter(
      (m) => m.role !== "admin" && m.user_id
    );

    setMemberships(members);

    const userIds = members.map((m) => m.user_id).filter(Boolean);

    const { data: profilesData } = userIds.length
      ? await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", userIds)
      : { data: [] };

    setProfiles(profilesData ?? []);

    const { data: feesData } = await supabase
      .from("member_fees")
      .select("*")
      .eq("club_id", clubId)
      .not("user_id", "is", null)
      .order("created_at", { ascending: false });

    setFees(feesData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [clubId]);

  function getProfile(userId?: string) {
    if (!userId) return null;
    return profiles.find((p) => p.id === userId);
  }

  function getName(userId?: string) {
    if (!userId) return "Usuario";
    const profile = getProfile(userId);
    return profile?.username ? `@${profile.username}` : userId.slice(0, 8);
  }

  function getStatus(status?: string) {
    if (status === "pagada" || status === "activa") {
      return { label: "Pagada", bg: "#ECFDF3", color: "#166534" };
    }

    if (status === "vencida") {
      return { label: "Vencida", bg: "#FEF2F2", color: "#991B1B" };
    }

    return { label: "Pendiente", bg: "#FFF7ED", color: "#9A3412" };
  }

  function getFeeLabel(type?: string) {
    return type === "inscription" ? "Matrícula" : "Cuota mensual";
  }

  function formatDate(date?: string) {
    if (!date) return "Sin fecha";
    return new Date(date).toLocaleDateString("es-UY");
  }

  function addOneMonth(dateValue?: string) {
    const date = dateValue ? new Date(dateValue) : new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().slice(0, 10);
  }

  function getMemberMonthlyFees(userId: string) {
    return fees
      .filter((fee) => fee.user_id === userId && fee.type !== "inscription")
      .sort((a, b) => {
        const dateA = new Date(a.due_date || a.created_at).getTime();
        const dateB = new Date(b.due_date || b.created_at).getTime();
        return dateB - dateA;
      });
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const monthly = Number(monthlyAmount);
    const inscription = Number(inscriptionAmount);

    if (!monthly || monthly <= 0 || !inscription || inscription <= 0) {
      setMessage("Los importes deben ser mayores a 0.");
      return;
    }

    const { data, error } = await supabase
      .from("clubs")
      .update({
        monthly_fee_amount: monthly,
        inscription_fee_amount: inscription,
      })
      .eq("id", clubId)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      setMessage(
        error?.message ||
          "No se pudo guardar. Revisá que el usuario sea admin del club."
      );
      return;
    }

    setClub(data);
    setMonthlyAmount(String(data.monthly_fee_amount ?? monthly));
    setInscriptionAmount(String(data.inscription_fee_amount ?? inscription));
    setMessage("Configuración guardada correctamente.");
  }

  async function generatePendingFees() {
    setMessage("");

    for (const member of memberships) {
      if (!member.user_id) continue;

      const monthlyFees = getMemberMonthlyFees(member.user_id);

      const hasPendingMonthly = monthlyFees.some(
        (fee) => fee.status === "pendiente" || fee.status === "vencida"
      );

      if (hasPendingMonthly) continue;

      const lastMonthlyFee = monthlyFees[0];

      const dueDate = lastMonthlyFee
        ? addOneMonth(lastMonthlyFee.due_date || lastMonthlyFee.created_at)
        : addOneMonth(member.created_at || new Date().toISOString());

      await supabase.from("member_fees").insert({
        club_id: clubId,
        user_id: member.user_id,
        type: "monthly",
        status: "pendiente",
        amount: Number(monthlyAmount),
        due_date: dueDate,
      });
    }

    setMessage("Cuotas pendientes generadas correctamente.");
    await loadData();
  }

  async function createInscriptionFee(userId?: string) {
    if (!userId) return;

    setMessage("");

    const alreadyExists = fees.some(
      (fee) => fee.user_id === userId && fee.type === "inscription"
    );

    if (alreadyExists) {
      setMessage("Ese socio ya tiene matrícula registrada.");
      return;
    }

    await supabase.from("member_fees").insert({
      club_id: clubId,
      user_id: userId,
      type: "inscription",
      status: "pendiente",
      amount: Number(inscriptionAmount),
      due_date: new Date().toISOString().slice(0, 10),
    });

    setMessage("Matrícula creada correctamente.");
    await loadData();
  }

  async function markAsPaid(feeId: string) {
    await supabase
      .from("member_fees")
      .update({
        status: "pagada",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", feeId);

    await loadData();
  }

  async function markAsPending(feeId: string) {
    await supabase
      .from("member_fees")
      .update({
        status: "pendiente",
        paid_at: null,
        mercado_pago_payment_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", feeId);

    await loadData();
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Cargando pagos...</div>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#F8F4EC", padding: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <section style={cardStyle}>
          <p style={{ margin: 0, color: "#6B7280", fontSize: 14 }}>
            Administración de pagos
          </p>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800 }}>
            {club?.name ?? "Club"}
          </h1>
          <p style={{ color: "#6B7280" }}>
            Gestioná matrícula, cuotas mensuales por ciclo individual y pagos
            manuales.
          </p>
        </section>

        <form onSubmit={saveSettings} style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
            Configuración de cobros
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginTop: 18,
            }}
          >
            <div>
              <label style={{ fontWeight: 800 }}>Cuota mensual</label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontWeight: 800 }}>Matrícula</label>
              <input
                type="number"
                value={inscriptionAmount}
                onChange={(e) => setInscriptionAmount(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {message && (
            <div
              style={{
                marginTop: 16,
                background: message.includes("No") || message.includes("mayores")
                  ? "#FEF2F2"
                  : "#ECFDF3",
                color: message.includes("No") || message.includes("mayores")
                  ? "#991B1B"
                  : "#166534",
                padding: 12,
                borderRadius: 16,
                fontWeight: 800,
              }}
            >
              {message}
            </div>
          )}

          <button type="submit" style={primaryButton}>
            <Save size={18} />
            Guardar configuración
          </button>
        </form>

        <section style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
            Acciones
          </h2>

          <p style={{ color: "#6B7280" }}>
            Genera una cuota pendiente solo para socios que no tienen cuota
            mensual pendiente. Cada socio mantiene su propio ciclo.
          </p>

          <button onClick={generatePendingFees} style={primaryButton}>
            <Plus size={18} />
            Generar cuotas pendientes
          </button>
        </section>

        <section style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
            Socios activos
          </h2>

          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            {memberships.map((member) => {
              const memberFees = fees.filter(
                (fee) => fee.user_id === member.user_id
              );

              const hasInscription = memberFees.some(
                (fee) => fee.type === "inscription"
              );

              const pendingCount = memberFees.filter(
                (fee) => fee.status === "pendiente" || fee.status === "vencida"
              ).length;

              return (
                <div key={member.id} style={rowStyle}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={avatarStyle}>
                      <User size={18} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 800 }}>
                        {getName(member.user_id)}
                      </p>
                      <p style={{ margin: "4px 0 0", color: "#6B7280" }}>
                        Alta: {formatDate(member.created_at)} · Pendientes:{" "}
                        {pendingCount}
                      </p>
                    </div>
                  </div>

                  {!hasInscription && (
                    <button
                      onClick={() => createInscriptionFee(member.user_id)}
                      style={smallButton}
                    >
                      Crear matrícula
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
            Todos los pagos
          </h2>

          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            {fees.map((fee) => {
              const status = getStatus(fee.status);

              return (
                <div key={fee.id} style={rowStyle}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800 }}>
                      {getFeeLabel(fee.type)} · {getName(fee.user_id)}
                    </p>
                    <p style={{ margin: "4px 0 0", color: "#6B7280" }}>
                      Vence: {formatDate(fee.due_date)} · ${fee.amount} UYU
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span
                      style={{
                        background: status.bg,
                        color: status.color,
                        borderRadius: 999,
                        padding: "7px 11px",
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      {status.label}
                    </span>

                    {fee.status === "pagada" ? (
                      <button
                        onClick={() => markAsPending(fee.id)}
                        style={smallButton}
                      >
                        Marcar pendiente
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsPaid(fee.id)}
                        style={smallButton}
                      >
                        Marcar pagada
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #E5E1DA",
  borderRadius: 28,
  padding: 24,
  marginBottom: 24,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 8,
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid #E5E1DA",
  background: "#FBF9F6",
  boxSizing: "border-box",
};

const primaryButton: React.CSSProperties = {
  marginTop: 18,
  background: "#76A889",
  color: "white",
  border: 0,
  borderRadius: 16,
  padding: "13px 18px",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const smallButton: React.CSSProperties = {
  background: "#12372A",
  color: "white",
  border: 0,
  borderRadius: 14,
  padding: "9px 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const rowStyle: React.CSSProperties = {
  border: "1px solid #E5E1DA",
  borderRadius: 18,
  padding: 16,
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const avatarStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "#F8F4EC",
  color: "#12372A",
  display: "grid",
  placeItems: "center",
};