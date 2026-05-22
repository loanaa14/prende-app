"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      setErrorMessage("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .select("club_id, role, status")
      .eq("user_id", data.user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) {
      setErrorMessage("Tu usuario no tiene un club activo asignado.");
      setLoading(false);
      return;
    }

    if (membership.role === "admin") {
      router.push(`/club/${membership.club_id}`);
      router.refresh();
      return;
    }

    router.push("/socio");
    router.refresh();
  };

  return (
    <main style={page}>
      <section style={card}>
        <p style={brand}>Prendé</p>

        <h1 style={title}>Ingresar</h1>

        <p style={subtitle}>Acceso privado para clubes y socios.</p>

        <form onSubmit={handleLogin} style={form}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            placeholder="Correo electrónico"
          />

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            placeholder="Contraseña"
          />

          {errorMessage && <div style={errorBox}>{errorMessage}</div>}

          <button disabled={loading} style={button}>
            {loading ? "Ingresando..." : "Entrar"}
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
  maxWidth: 430,
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
  fontSize: 38,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#9B9B9B",
  lineHeight: 1.6,
};

const form: React.CSSProperties = {
  marginTop: 28,
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
  fontWeight: 700,
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