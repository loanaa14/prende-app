"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Users, Phone, UserRound } from "lucide-react";

export default function SignupClubPage() {
  const router = useRouter();

  const [clubName, setClubName] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [phone, setPhone] = useState("");
  const [membersCount, setMembersCount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const access = localStorage.getItem("prende_onboarding_access");

    if (!access) {
      router.push("/signup");
    }
  }, [router]);

  function handleContinue() {
    setError("");

    if (!clubName.trim()) {
      setError("Ingresá el nombre del club.");
      return;
    }

    if (!responsibleName.trim()) {
      setError("Ingresá el nombre de la persona responsable.");
      return;
    }

    if (!phone.trim()) {
      setError("Ingresá un teléfono de contacto.");
      return;
    }

    localStorage.setItem(
      "prende_onboarding_club",
      JSON.stringify({
        club_name: clubName,
        responsible_name: responsibleName,
        phone,
        members_count: membersCount,
        saved_at: new Date().toISOString(),
      })
    );

    router.push("/signup/payment");
  }

  return (
    <main style={mainStyle}>
      <section style={sectionStyle}>
        <Progress current={2} />

        <h1 style={titleStyle}>Contanos sobre tu club</h1>

       <p style={subtitleStyle}>
  Con esta información crearemos tu espacio inicial. Después podrás configurar
  todo lo necesario para administrar y organizar tu club desde Prendé.
</p>

        <div style={{ marginTop: 34, display: "grid", gap: 18 }}>
          <Input
            icon={<Building2 size={19} />}
            label="Nombre del club"
            placeholder="Ej: Club Marimba"
            value={clubName}
            onChange={(e: any) => setClubName(e.target.value)}
          />

          <Input
            icon={<UserRound size={19} />}
            label="Nombre responsable"
            placeholder="Nombre y apellido"
            value={responsibleName}
            onChange={(e: any) => setResponsibleName(e.target.value)}
          />

          <Input
            icon={<Phone size={19} />}
            label="Teléfono"
            placeholder="Ej: 099 123 456"
            value={phone}
            onChange={(e: any) => setPhone(e.target.value)}
          />

          <Input
            icon={<Users size={19} />}
            label="Cantidad de socios"
            placeholder="Ej: 45"
            type="number"
            value={membersCount}
            onChange={(e: any) => setMembersCount(e.target.value)}
          />

      <div style={optionalBox}>
  <p
    style={{
      margin: 0,
      color: "#FFFFFF",
      fontWeight: 800,
    }}
  >
    Logo del club
  </p>

  <p
    style={{
      margin: "6px 0 18px",
      color: "#8B8B8B",
      fontSize: 14,
    }}
  >
    Opcional. Ayuda a personalizar tu espacio.
  </p>

  <label
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px dashed rgba(139,224,0,0.28)",
      borderRadius: 18,
      padding: 24,
      cursor: "pointer",
      color: "#8BE000",
      fontWeight: 800,
      background: "rgba(139,224,0,0.04)",
    }}
  >
    Subir logo

    <input
      type="file"
      accept="image/*"
      style={{ display: "none" }}
    />
  </label>
</div>

          {error && <div style={errorStyle}>{error}</div>}

          <button onClick={handleContinue} style={buttonStyle}>
            Continuar al pago
          </button>

          <Link href="/signup" style={backLink}>
            ← Volver a crear acceso
          </Link>
        </div>
      </section>
    </main>
  );
}

function Progress({ current }: { current: number }) {
  const steps = ["Cuenta", "Club", "Pago", "Listo"];

  return (
    <div style={progressGrid}>
      {steps.map((step, index) => {
        const active = index + 1 === current;
        const done = index + 1 < current;

        return (
          <div key={step} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: active || done ? "#8BE000" : "#1F1F1F",
              }}
            />
            <span
              style={{
                color: active || done ? "#FFFFFF" : "#777",
                fontSize: 13,
                fontWeight: active || done ? 800 : 600,
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

function Input({ icon, label, ...props }: any) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label style={labelStyle}>{label}</label>

      <div style={{ position: "relative" }}>
        <span style={inputIcon}>{icon}</span>
        <input {...props} style={{ ...inputStyle, paddingLeft: 48 }} />
      </div>
    </div>
  );
}

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
  maxWidth: 650,
  background: "rgba(10,10,10,0.96)",
  border: "1px solid rgba(139,224,0,0.22)",
  borderRadius: 34,
  padding: 38,
  boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
};

const progressGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 12,
  marginBottom: 38,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: 42,
  fontWeight: 900,
  letterSpacing: "-1px",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 14,
  color: "#B8B8B8",
  fontSize: 18,
  lineHeight: 1.6,
};

const labelStyle: React.CSSProperties = {
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#111",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: "16px 18px",
  color: "#FFFFFF",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

const inputIcon: React.CSSProperties = {
  position: "absolute",
  left: 17,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#8BE000",
  display: "flex",
};

const optionalBox: React.CSSProperties = {
  background: "rgba(139,224,0,0.06)",
  border: "1px dashed rgba(139,224,0,0.24)",
  borderRadius: 18,
  padding: 18,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 8,
  background: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 18,
  padding: "18px 20px",
  fontWeight: 900,
  fontSize: 17,
  cursor: "pointer",
  boxShadow: "0 0 30px rgba(139,224,0,0.26)",
};

const backLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#8B8B8B",
  textAlign: "center",
  fontSize: 14,
};

const errorStyle: React.CSSProperties = {
  background: "rgba(255,90,90,0.12)",
  color: "#FF8A8A",
  border: "1px solid rgba(255,90,90,0.25)",
  borderRadius: 16,
  padding: 12,
  fontWeight: 700,
};