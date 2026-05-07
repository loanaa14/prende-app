"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

export default function SignupPaymentPage() {
  const router = useRouter();

  const [clubName, setClubName] = useState("tu club");

  useEffect(() => {
    const access = localStorage.getItem(
      "prende_onboarding_access"
    );

    const club = localStorage.getItem(
      "prende_onboarding_club"
    );

    if (!access) {
      router.push("/signup");
      return;
    }

    if (!club) {
      router.push("/signup/club");
      return;
    }

    const parsedClub = JSON.parse(club);

    setClubName(
      parsedClub.club_name || "tu club"
    );
  }, [router]);

  function handleActivate() {
    localStorage.setItem(
      "prende_onboarding_payment",
      JSON.stringify({
        method: "mercadopago",
        plan: "Prendé",
        amount: 1500,
        currency: "UYU",
        saved_at: new Date().toISOString(),
      })
    );

    router.push("/signup/success");
  }

  return (
    <main style={mainStyle}>
      <section style={sectionStyle}>
        <Progress current={3} />

        <div style={gridStyle}>
          {/* LEFT */}
          <div>
            <p style={eyebrow}>
              Plan Prendé
            </p>

            <h1 style={titleStyle}>
              Activá tu club
            </h1>

            <p style={subtitleStyle}>
              Estás a un paso de comenzar a
              gestionar {clubName} desde una
              plataforma simple, privada y
              moderna.
            </p>

            <div style={benefitsGrid}>
              <Benefit
                icon={<Users size={18} />}
                text="Gestión de socios"
              />

              <Benefit
                icon={<CreditCard size={18} />}
                text="Pagos y cuotas"
              />

              <Benefit
                icon={<ShieldCheck size={18} />}
                text="Comunidad privada"
              />

              <Benefit
                icon={<CheckCircle2 size={18} />}
                text="Acceso administrador"
              />
            </div>

            <div style={priceBox}>
              <p style={priceLabel}>
                Suscripción mensual
              </p>

              <div style={priceRow}>
                <span style={priceValue}>
                  $1500
                </span>

                <span style={priceMonth}>
                  /mes
                </span>
              </div>

              <p style={cancelText}>
                Cancelá cuando quieras.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div style={paymentCard}>
            <div>
              <p style={paymentTitle}>
                Activación segura
              </p>

              <p style={paymentSubtitle}>
                Vas a continuar a Mercado
                Pago para activar tu club
                con tarjeta de crédito,
                débito o saldo disponible.
              </p>
            </div>

            <div style={paymentMethod}>
              <div style={paymentIcon}>
                <Wallet
                  size={20}
                  color="#8BE000"
                />
              </div>

              <div>
                <p style={methodTitle}>
                  Mercado Pago
                </p>

                <p style={methodSubtitle}>
                  Pago protegido y
                  confirmación automática
                  de tu suscripción.
                </p>
              </div>
            </div>

            <button
              onClick={handleActivate}
              style={buttonStyle}
            >
              Activar mi club
            </button>

            <Link
              href="/signup/club"
              style={backLink}
            >
              ← Volver a datos del club
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Progress({
  current,
}: {
  current: number;
}) {
  const steps = [
    "Cuenta",
    "Club",
    "Pago",
    "Listo",
  ];

  return (
    <div style={progressGrid}>
      {steps.map((step, index) => {
        const active =
          index + 1 === current;

        const done =
          index + 1 < current;

        return (
          <div
            key={step}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background:
                  active || done
                    ? "#8BE000"
                    : "#1F1F1F",
              }}
            />

            <span
              style={{
                color:
                  active || done
                    ? "#FFFFFF"
                    : "#777",
                fontSize: 13,
                fontWeight:
                  active || done
                    ? 800
                    : 600,
              }}
            >
              {done ? "✓ " : ""}
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Benefit({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div style={benefitRow}>
      <span style={benefitIcon}>
        {icon}
      </span>

      {text}
    </div>
  );
}

/* STYLES */

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(139,224,0,0.18), transparent 34%), #050505",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const sectionStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 980,
  background: "rgba(10,10,10,0.96)",
  border:
    "1px solid rgba(139,224,0,0.22)",
  borderRadius: 34,
  padding: 38,
  boxShadow:
    "0 24px 70px rgba(0,0,0,0.55)",
};

const progressGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 12,
  marginBottom: 42,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0,1.1fr) minmax(340px,0.9fr)",
  gap: 36,
  alignItems: "start",
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  color: "#8BE000",
  fontWeight: 900,
  fontSize: 13,
};

const titleStyle: React.CSSProperties = {
  margin: "12px 0 0",
  color: "#FFFFFF",
  fontSize: "clamp(38px, 4.5vw, 54px)",
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-1.5px",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 18,
  color: "#B8B8B8",
  fontSize: 17,
  lineHeight: 1.7,
  maxWidth: 560,
};

const benefitsGrid: React.CSSProperties = {
  marginTop: 30,
  display: "grid",
  gap: 16,
};

const benefitRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: "#E8E8E8",
  fontWeight: 800,
  fontSize: 15,
};

const benefitIcon: React.CSSProperties = {
  color: "#8BE000",
  display: "flex",
};

const priceBox: React.CSSProperties = {
  marginTop: 34,
  background: "#0F0F0F",
  border:
    "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 22,
};

const priceLabel: React.CSSProperties = {
  margin: 0,
  color: "#8B8B8B",
  fontSize: 13,
};

const priceRow: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  alignItems: "flex-end",
  gap: 6,
};

const priceValue: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: 48,
  lineHeight: 1,
  fontWeight: 950,
};

const priceMonth: React.CSSProperties = {
  color: "#B8B8B8",
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 6,
};

const cancelText: React.CSSProperties = {
  margin: "14px 0 0",
  color: "#8BE000",
  fontWeight: 800,
  fontSize: 14,
};

const paymentCard: React.CSSProperties = {
  background: "#0F0F0F",
  border:
    "1px solid rgba(255,255,255,0.08)",
  borderRadius: 26,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 22,
};

const paymentTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 900,
  fontSize: 22,
};

const paymentSubtitle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#A8A8A8",
  lineHeight: 1.7,
  fontSize: 15,
};

const paymentMethod: React.CSSProperties = {
  background:
    "rgba(139,224,0,0.10)",
  border:
    "1px solid rgba(139,224,0,0.35)",
  borderRadius: 22,
  padding: 18,
  display: "flex",
  gap: 14,
  alignItems: "flex-start",
};

const paymentIcon: React.CSSProperties = {
  marginTop: 2,
};

const methodTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 900,
  fontSize: 17,
};

const methodSubtitle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#B8B8B8",
  lineHeight: 1.6,
  fontSize: 13,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  background: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 18,
  padding: "18px 20px",
  fontWeight: 950,
  fontSize: 17,
  cursor: "pointer",
  boxShadow:
    "0 0 30px rgba(139,224,0,0.26)",
  marginTop: 2,
};

const backLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#8B8B8B",
  textAlign: "center",
  fontSize: 14,
  marginTop: -2,
};