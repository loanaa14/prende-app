import Image from "next/image";
import Link from "next/link";
import { CreditCard, ShieldCheck, Users } from "lucide-react";
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(139,224,0,0.18), transparent 34%), #050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 920,
          background: "rgba(10,10,10,0.96)",
          border: "1px solid rgba(139,224,0,0.22)",
          borderRadius: 34,
          padding: "clamp(26px, 4vw, 44px)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
          animation: "fadeUp 650ms ease both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Image
            src="/logo.png"
            alt="Prendé"
            width={74}
            height={74}
            priority
            style={{
              borderRadius: 18,
              boxShadow: "0 0 24px rgba(139,224,0,0.24)",
            }}
          />

          <div>
            <p style={{ margin: 0, color: "#8BE000", fontWeight: 900, fontSize: 18 }}>
              Prendé
            </p>
            <p style={{ margin: "4px 0 0", color: "#A8A8A8", fontSize: 14 }}>
              SaaS para clubes
            </p>
          </div>
        </div>

        <div style={{ marginTop: 34, maxWidth: 720 }}>
          <h1
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: "clamp(38px, 6vw, 58px)",
              lineHeight: 1.04,
              fontWeight: 950,
              letterSpacing: "-1.8px",
            }}
          >
            Todo tu club en una sola plataforma
          </h1>

          <p
            style={{
              marginTop: 18,
              color: "#CFCFCF",
              fontSize: "clamp(17px, 2vw, 21px)",
              lineHeight: 1.55,
              maxWidth: 620,
            }}
          >
            Pagos, gestión y
          comunidad en una experiencia privada, simple y moderna.
          </p>
        </div>

        <div
          style={{
            marginTop: 30,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 12,
          }}
        >
          <Card icon={<ShieldCheck size={21} />} title="Gestión inteligente" />
          <Card icon={<CreditCard size={21} />} title="Pagos simples" />
          <Card icon={<Users size={21} />} title="Comunidad privada" />
        </div>

        <div
          style={{
            marginTop: 34,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
              width: "100%",
            }}
          >
            <Link href="/signup" style={primaryButton}>
              Empezá ya por $1500/mes
            </Link>

            <Link href="/login?role=club" style={secondaryButton}>
              Ya tengo cuenta
            </Link>
          </div>

          <Link href="/login?role=socio" style={socioButton}>
            Soy socio → Ingresar
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        a {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        a:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          main {
            align-items: flex-start !important;
            padding-top: 18px !important;
          }

          .cta-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function Card({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div
      style={{
        background: "rgba(18,18,18,0.96)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 20,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "#FFFFFF",
        fontWeight: 850,
        fontSize: 15,
      }}
    >
      <div style={{ color: "#8BE000", display: "flex" }}>{icon}</div>
      {title}
    </div>
  );
}

const baseButton: React.CSSProperties = {
  textDecoration: "none",
  textAlign: "center",
  padding: "17px 20px",
  borderRadius: 18,
  fontWeight: 950,
  fontSize: 16,
  minHeight: 58,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
};

const primaryButton: React.CSSProperties = {
  ...baseButton,
  background: "#8BE000",
  color: "#050505",
  boxShadow: "0 0 30px rgba(139,224,0,0.26)",
};

const secondaryButton: React.CSSProperties = {
  ...baseButton,
  background: "rgba(255,255,255,0.045)",
  color: "#FFFFFF",
  border: "1px solid rgba(255,255,255,0.13)",
};

const socioButton: React.CSSProperties = {
  textDecoration: "none",
  alignSelf: "center",
  color: "#FFFFFF",
  fontWeight: 750,
  fontSize: 14,
  opacity: 0.82,
};