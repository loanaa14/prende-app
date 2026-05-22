"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowDownCircle,
  Boxes,
  Calendar,
  Check,
  Search,
  Sparkles,
  User2,
} from "lucide-react";

export default function WithdrawalsPage({ params }: any) {
  const supabase = createClient();

  const clubId = params.id;

  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const [selectedMember, setSelectedMember] = useState("");
  const [genetic, setGenetic] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = useState("");

  async function loadData() {
    const { data: memberships } = await supabase
      .from("memberships")
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("club_id", clubId)
      .eq("status", "active");

    const { data: withdrawalsData } = await supabase
      .from("member_withdrawals")
      .select(`
        *,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("club_id", clubId)
      .order("withdrawn_at", { ascending: false });

    setMembers(memberships || []);
    setWithdrawals(withdrawalsData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createWithdrawal(e: any) {
    e.preventDefault();

    if (!selectedMember || !genetic || !quantity) {
      alert("Completá todos los campos.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("member_withdrawals").insert({
      club_id: clubId,
      user_id: selectedMember,
      genetic_name: genetic,
      quantity: Number(quantity),
      unit: "g",
      notes,
      withdrawn_at: new Date().toISOString(),
      created_by: user?.id || null,
    });

    if (error) {
      console.error(error);
      alert("No se pudo registrar el retiro.");
      return;
    }

    setSelectedMember("");
    setGenetic("");
    setQuantity("");
    setNotes("");

    await loadData();
  }

  const topGenetic = useMemo(() => {
    if (!withdrawals.length) return "Sin datos";

    const map: Record<string, number> = {};

    withdrawals.forEach((item) => {
      map[item.genetic_name] =
        (map[item.genetic_name] || 0) + Number(item.quantity || 0);
    });

    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

    return sorted[0]?.[0] || "Sin datos";
  }, [withdrawals]);

  const filteredWithdrawals = withdrawals.filter((w) => {
    const name = w.profiles?.full_name?.toLowerCase() || "";
    const email = w.profiles?.email?.toLowerCase() || "";
    const genetics = w.genetic_name?.toLowerCase() || "";

    return (
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      genetics.includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <main style={loadingPage}>
        <div style={loadingCard}>Cargando retiros...</div>
      </main>
    );
  }

  return (
    <main style={page}>
      <section style={content}>
        <header style={header}>
          <div>
            <p style={eyebrow}>Gestión de retiros</p>

            <h1 style={title}>Retiros de genética</h1>

            <p style={subtitle}>
              Registrá qué retiró cada socio y mantené historial interno.
            </p>
          </div>
        </header>

        <section style={topGrid}>
          <div style={formCard}>
            <div style={cardHeader}>
              <div style={iconBox}>
                <ArrowDownCircle size={22} />
              </div>

              <div>
                <h2 style={cardTitle}>Registrar retiro</h2>

                <p style={cardText}>Asociá genética y gramos al socio.</p>
              </div>
            </div>

            <form onSubmit={createWithdrawal} style={form}>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                style={input}
                required
              >
                <option value="">Seleccionar socio</option>

                {members
                  .filter((member) => member.role === "socio")
                  .map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.profiles?.full_name ||
                        member.profiles?.email ||
                        "Socio"}
                    </option>
                  ))}
              </select>

              <input
                value={genetic}
                onChange={(e) => setGenetic(e.target.value)}
                placeholder="Nombre genética"
                style={input}
                required
              />

              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Cantidad en gramos"
                type="number"
                min="0"
                step="0.01"
                style={input}
                required
              />

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas internas"
                style={textarea}
              />

              <button type="submit" style={submitButton}>
                Registrar retiro
              </button>
            </form>
          </div>

          <div style={statsColumn}>
            <div style={statCard}>
              <div style={statIcon}>
                <Boxes size={20} />
              </div>

              <div>
                <p style={statLabel}>Total retiros</p>

                <h3 style={statValue}>{withdrawals.length}</h3>
              </div>
            </div>

            <div style={statCard}>
              <div style={statIcon}>
                <Sparkles size={20} />
              </div>

              <div>
                <p style={statLabel}>Genética top</p>

                <h3 style={statValueSmall}>{topGenetic}</h3>
              </div>
            </div>

            <div style={statCard}>
              <div style={statIcon}>
                <Calendar size={20} />
              </div>

              <div>
                <p style={statLabel}>Hoy</p>

                <h3 style={statValueSmall}>
                  {new Date().toLocaleDateString("es-UY")}
                </h3>
              </div>
            </div>
          </div>
        </section>

        <section style={historyCard}>
          <div style={historyHeader}>
            <div>
              <h2 style={historyTitle}>Historial de retiros</h2>

              <p style={historyText}>Todo lo retirado por socios.</p>
            </div>

            <div style={searchBox}>
              <Search size={16} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                style={searchInput}
              />
            </div>
          </div>

          <div style={withdrawalsList}>
            {filteredWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} style={withdrawalItem}>
                <div style={userRow}>
                  {withdrawal.profiles?.avatar_url ? (
                    <img
                      src={withdrawal.profiles?.avatar_url}
                      alt="avatar"
                      style={avatar}
                    />
                  ) : (
                    <div style={fallback}>
                      <User2 size={16} />
                    </div>
                  )}

                  <div>
                    <p style={userName}>
                      {withdrawal.profiles?.full_name ||
                        withdrawal.profiles?.email ||
                        "Socio"}
                    </p>

                    <p style={withdrawalDate}>
                      {new Date(withdrawal.withdrawn_at).toLocaleDateString(
                        "es-UY"
                      )}
                    </p>
                  </div>
                </div>

                <div style={geneticBox}>
                  <p style={geneticLabel}>Genética</p>

                  <h3 style={geneticName}>{withdrawal.genetic_name}</h3>
                </div>

                <div style={gramsBox}>
                  <p style={gramsValue}>
                    {withdrawal.quantity}
                    {withdrawal.unit}
                  </p>

                  <div style={checkBox}>
                    <Check size={14} />
                  </div>
                </div>
              </div>
            ))}

            {!filteredWithdrawals.length && (
              <div style={emptyBox}>Todavía no hay retiros registrados.</div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.10), transparent 30%), #050505",
  color: "#FFFFFF",
  padding: 28,
};

const content: React.CSSProperties = {
  width: "100%",
};

const loadingPage: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const loadingCard: React.CSSProperties = {
  background: "#101010",
  padding: 24,
  borderRadius: 20,
};

const header: React.CSSProperties = {
  marginBottom: 28,
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  color: "#8BE000",
  fontWeight: 900,
  fontSize: 13,
};

const title: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 42,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#9B9B9B",
};

const topGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: 18,
  marginBottom: 24,
};

const formCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 22,
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  gap: 16,
  marginBottom: 24,
};

const iconBox: React.CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: 16,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
};

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 950,
};

const cardText: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#9B9B9B",
};

const form: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const input: React.CSSProperties = {
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "14px",
  color: "#FFFFFF",
  outline: "none",
};

const textarea: React.CSSProperties = {
  ...input,
  minHeight: 90,
  resize: "vertical",
};

const submitButton: React.CSSProperties = {
  background: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 14,
  padding: "14px",
  fontWeight: 950,
  cursor: "pointer",
};

const statsColumn: React.CSSProperties = {
  display: "grid",
  gap: 18,
};

const statCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 20,
  display: "flex",
  gap: 14,
  alignItems: "center",
};

const statIcon: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 14,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
};

const statLabel: React.CSSProperties = {
  margin: 0,
  color: "#9B9B9B",
  fontSize: 13,
};

const statValue: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 32,
  fontWeight: 950,
};

const statValueSmall: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 22,
  fontWeight: 950,
};

const historyCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 24,
};

const historyHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 22,
};

const historyTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 950,
};

const historyText: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#9B9B9B",
};

const searchBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "0 14px",
};

const searchInput: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#FFFFFF",
  outline: "none",
  height: 46,
};

const withdrawalsList: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const withdrawalItem: React.CSSProperties = {
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 20,
  padding: 18,
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  alignItems: "center",
  gap: 18,
};

const userRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const avatar: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 999,
  objectFit: "cover",
};

const fallback: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 999,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
};

const userName: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const withdrawalDate: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
};

const geneticBox: React.CSSProperties = {};

const geneticLabel: React.CSSProperties = {
  margin: 0,
  color: "#8BE000",
  fontSize: 12,
  fontWeight: 900,
};

const geneticName: React.CSSProperties = {
  margin: "7px 0 0",
  fontSize: 24,
  fontWeight: 950,
};

const gramsBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const gramsValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 950,
  margin: 0,
};

const checkBox: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
};

const emptyBox: React.CSSProperties = {
  background: "#0B0B0B",
  borderRadius: 20,
  padding: 28,
  textAlign: "center",
  color: "#9B9B9B",
};