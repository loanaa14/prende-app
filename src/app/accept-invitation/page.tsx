"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcceptInvitationPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const res = await fetch("/api/accept-invitation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code, fullName }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "No se pudo aceptar la invitación");
      setLoading(false);
      return;
    }

    router.push(data.redirectTo);
  }

  return (
    <main style={page}>
      <section style={card}>
        <p style={brand}>Prendé</p>

        <h1 style={title}>Aceptar invitación</h1>

        <p style={subtitle}>
          Ingresá tu correo y el código que te compartió el club.
        </p>

        <form onSubmit={handleSubmit} style={form}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={input}
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            required
          />

          <input
            type="text"
            placeholder="Código de invitación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={input}
            required
          />

          {error && <div style={errorBox}>{error}</div>}

          <button type="submit" disabled={loading} style={button}>
            {loading ? "Verificando..." : "Entrar al club"}
          </button>
        </form>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.12), transparent 30%), #050505",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 440,
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 30,
};

const brand: React.CSSProperties = {
  margin: 0,
  color: "#8BE000",
  fontWeight: 950,
};

const title: React.CSSProperties = {
  margin: "14px 0 0",
  color: "#FFFFFF",
  fontSize: 34,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#9B9B9B",
  lineHeight: 1.6,
};

const form: React.CSSProperties = {
  marginTop: 26,
  display: "grid",
  gap: 14,
};

const input: React.CSSProperties = {
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
  color: "#FFFFFF",
  outline: "none",
  fontWeight: 800,
};

const button: React.CSSProperties = {
  background: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 16,
  padding: 16,
  fontWeight: 950,
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  background: "rgba(255,107,107,0.10)",
  border: "1px solid rgba(255,107,107,0.22)",
  color: "#FF6B6B",
  borderRadius: 14,
  padding: 12,
};