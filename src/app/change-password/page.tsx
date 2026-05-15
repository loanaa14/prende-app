"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChangePasswordPage() {
  const searchParams = useSearchParams();
  const clubId = searchParams.get("clubId");

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabaseClient.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message || "No se pudo cambiar la contraseña.");
      setLoading(false);
      return;
    }

    window.location.href = clubId ? `/club/${clubId}` : "/dashboard";
  }

  return (
    <main style={page}>
      <section style={card}>
        <p style={brand}>Prendé</p>

        <h1 style={title}>Creá tu contraseña</h1>

        <p style={subtitle}>
          Para proteger tu acceso, elegí una contraseña nueva antes de entrar al club.
        </p>

        <form onSubmit={handleSubmit} style={form}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            required
          />

          <input
            type="password"
            placeholder="Repetir contraseña"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            style={input}
            required
          />

          {error && <div style={errorBox}>{error}</div>}

          <button type="submit" disabled={loading} style={button}>
            {loading ? "Guardando..." : "Guardar y entrar"}
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
  backgroundColor: "#101010",
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
  backgroundColor: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 16,
  color: "#FFFFFF",
  outline: "none",
  fontWeight: 800,
};

const button: React.CSSProperties = {
  backgroundColor: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 16,
  padding: 16,
  fontWeight: 950,
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  backgroundColor: "rgba(255,107,107,0.10)",
  border: "1px solid rgba(255,107,107,0.22)",
  color: "#FF6B6B",
  borderRadius: 14,
  padding: 12,
};