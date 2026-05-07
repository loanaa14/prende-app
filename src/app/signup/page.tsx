"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => {
    if (password.length < 6) return 20;
    if (password.length < 8) return 45;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 100;
    return 70;
  }, [password]);

  const strengthText = useMemo(() => {
    if (strength < 40) return "Débil";
    if (strength < 80) return "Media";
    return "Segura";
  }, [strength]);

  const validEmail = email.includes("@") && email.includes(".");
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  function handleContinue() {
    setError("");

    if (!validEmail) {
      setError("Ingresá un correo válido.");
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setError("La contraseña debe cumplir los requisitos mínimos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    localStorage.setItem(
      "prende_onboarding_access",
      JSON.stringify({
        email,
        password,
        started_at: new Date().toISOString(),
      })
    );

    router.push("/signup/club");
  }

  return (
    <main style={mainStyle}>
      <section style={sectionStyle}>
        <Progress current={1} />

        <h1 style={titleStyle}>Creá tu acceso</h1>
        <p style={subtitleStyle}>Empezá a gestionar tu club en minutos.</p>

        <div style={{ marginTop: 34, display: "grid", gap: 18 }}>
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="club@email.com"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />

          <PasswordInput
            label="Contraseña"
            value={password}
            onChange={setPassword}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
          />

          <div>
            <div style={strengthBg}>
              <div
                style={{
                  width: `${strength}%`,
                  height: "100%",
                  background:
                    strength < 40
                      ? "#FF5A5A"
                      : strength < 80
                      ? "#FFD23F"
                      : "#8BE000",
                  transition: "300ms",
                }}
              />
            </div>

            <p style={{ margin: 0, color: "#B8B8B8", fontSize: 14 }}>
              Seguridad:{" "}
              <span
                style={{
                  color:
                    strength < 40
                      ? "#FF5A5A"
                      : strength < 80
                      ? "#FFD23F"
                      : "#8BE000",
                  fontWeight: 700,
                }}
              >
                {strengthText}
              </span>
            </p>
          </div>

          <PasswordInput
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirmPassword}
            toggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
            <Requirement active={hasMinLength} text="Mínimo 8 caracteres" />
            <Requirement active={hasUppercase} text="Una mayúscula" />
            <Requirement active={hasNumber} text="Un número" />
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <button onClick={handleContinue} style={buttonStyle}>
            Continuar
          </button>

          <p style={helperText}>
            Luego podrás completar los datos de tu club y activar tu suscripción.
          </p>

          <Link href="/" style={backLink}>
            ← Volver
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

function Input({ label, ...props }: any) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label style={labelStyle}>{label}</label>
      <input {...props} style={inputStyle} />
    </div>
  );
}

function PasswordInput({ label, show, toggle, value, onChange }: any) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label style={labelStyle}>{label}</label>

      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, paddingRight: 54 }}
        />

        <button type="button" onClick={toggle} style={eyeButton}>
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

function Requirement({ text, active }: { text: string; active: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: active ? "#FFFFFF" : "#777",
        fontSize: 14,
      }}
    >
      <CheckCircle2 size={16} color={active ? "#8BE000" : "#444"} />
      {text}
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
  maxWidth: 620,
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

const eyeButton: React.CSSProperties = {
  position: "absolute",
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
  background: "transparent",
  border: "none",
  color: "#888",
  cursor: "pointer",
};

const strengthBg: React.CSSProperties = {
  width: "100%",
  height: 8,
  background: "#1A1A1A",
  borderRadius: 999,
  overflow: "hidden",
  marginBottom: 10,
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

const helperText: React.CSSProperties = {
  margin: 0,
  color: "#8B8B8B",
  fontSize: 14,
  textAlign: "center",
  lineHeight: 1.6,
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