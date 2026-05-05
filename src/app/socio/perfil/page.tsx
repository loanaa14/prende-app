"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SocioShell from "@/components/socio/SocioShell";
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";

export default function SocioHomePage() {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    setUser(currentUser);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("username, avatar_url")
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

    const { data: feeData } = await supabase
      .from("member_fees")
      .select("*")
      .eq("club_id", membershipData.club_id)
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    setFees(feeData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function formatDate(date?: string) {
    if (!date) return "Sin fecha";
    return new Date(date).toLocaleDateString("es-UY");
  }

  function getStatus(status?: string) {
    if (status === "activa" || status === "pagada") {
      return {
        label: "Activa",
        bg: "#ECFDF3",
        color: "#166534",
        icon: <CheckCircle size={18} />,
      };
    }

    if (status === "vencida") {
      return {
        label: "Vencida",
        bg: "#FEF2F2",
        color: "#991B1B",
        icon: <AlertCircle size={18} />,
      };
    }

    return {
      label: "Pendiente",
      bg: "#FFF7ED",
      color: "#9A3412",
      icon: <AlertCircle size={18} />,
    };
  }

  if (loading) {
    return (
      <SocioShell>
        <p>Cargando tu espacio privado...</p>
      </SocioShell>
    );
  }

  if (!membership?.club_id) {
    return (
      <SocioShell>
        <div
          style={{
            background: "white",
            border: "1px solid #E5E1DA",
            borderRadius: 28,
            padding: 28,
          }}
        >
          Todavía no perteneces a ningún club activo.
        </div>
      </SocioShell>
    );
  }

  const currentFee = fees[0];
  const status = getStatus(currentFee?.status);
  const username = profile?.username || user?.email || "socio";

  return (
    <SocioShell clubId={membership.club_id}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <section
          style={{
            background: "white",
            border: "1px solid #E5E1DA",
            borderRadius: 32,
            padding: 30,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#76A889",
                color: "white",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <User size={30} />
              )}
            </div>

            <div>
              <p style={{ margin: 0, color: "#6B7280", fontSize: 14 }}>
                Bienvenida a tu espacio privado
              </p>
              <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800 }}>
                Hola, @{username}
              </h1>
              <p style={{ margin: "6px 0 0", color: "#6B7280" }}>
                Club: {club?.name ?? "Club"}
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #E5E1DA",
            borderRadius: 32,
            padding: 30,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                background: "#76A889",
                color: "white",
                display: "grid",
                placeItems: "center",
              }}
            >
              <CreditCard size={26} />
            </div>

            <div>
              <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>
                Cuota social
              </p>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>
                Estado de cuenta
              </h2>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginTop: 24,
            }}
          >
            <div
              style={{
                background: "#FBF9F6",
                border: "1px solid #E5E1DA",
                borderRadius: 22,
                padding: 18,
              }}
            >
              <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>
                Estado actual
              </p>

              <div
                style={{
                  marginTop: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: status.bg,
                  color: status.color,
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontWeight: 800,
                }}
              >
                {status.icon}
                {status.label}
              </div>
            </div>

            <div
              style={{
                background: "#FBF9F6",
                border: "1px solid #E5E1DA",
                borderRadius: 22,
                padding: 18,
              }}
            >
              <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>
                Vencimiento
              </p>

              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 22,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Calendar size={20} />
                {formatDate(currentFee?.due_date)}
              </p>
            </div>

            <div
              style={{
                background: "#FBF9F6",
                border: "1px solid #E5E1DA",
                borderRadius: 22,
                padding: 18,
              }}
            >
              <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>
                Importe informado
              </p>

              <p style={{ margin: "10px 0 0", fontSize: 22, fontWeight: 800 }}>
                {currentFee?.amount ? `$${currentFee.amount} UYU` : "Sin importe"}
              </p>
            </div>
          </div>

          {(currentFee?.status === "pendiente" ||
            currentFee?.status === "vencida") && (
            <a
              href={`/api/create-preference?clubId=${membership.club_id}&type=member_fee`}
              style={{
                display: "block",
                marginTop: 22,
                width: "100%",
                background: "#76A889",
                color: "white",
                textAlign: "center",
                textDecoration: "none",
                borderRadius: 18,
                padding: 15,
                fontWeight: 800,
                boxSizing: "border-box",
              }}
            >
              Pagar cuota social
            </a>
          )}
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #E5E1DA",
            borderRadius: 32,
            padding: 30,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
            Historial de cuotas
          </h2>

          {fees.length === 0 ? (
            <p style={{ marginTop: 14, color: "#6B7280" }}>
              Todavía no hay registros de cuota social.
            </p>
          ) : (
            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              {fees.map((fee) => {
                const feeStatus = getStatus(fee.status);

                return (
                  <div
                    key={fee.id}
                    style={{
                      border: "1px solid #E5E1DA",
                      borderRadius: 18,
                      padding: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 800 }}>
                        Cuota social
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 13,
                          color: "#6B7280",
                        }}
                      >
                        Vencimiento: {formatDate(fee.due_date)}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontWeight: 800 }}>
                        {fee.amount ? `$${fee.amount} UYU` : "Sin importe"}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 6,
                          background: feeStatus.bg,
                          color: feeStatus.color,
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {feeStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </SocioShell>
  );
}