"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";

export default function SignupSuccessPage() {
  return (
    <Suspense fallback={<main style={mainStyle}>Cargando...</main>}>
      <SignupSuccessContent />
    </Suspense>
  );
}

function SignupSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const clubIdFromUrl = searchParams.get("clubId");

  async function goToClubPanel() {
    setLoading(true);

    try {
      const accessRaw = localStorage.getItem("prende_onboarding_access");

      if (!accessRaw) {
        router.push("/login?role=club");
        return;
      }

      const access = JSON.parse(accessRaw);

      await supabase.auth.signOut();

      const { error } = await supabase.auth.signInWithPassword({
        email: access.email,
        password: access.password,
      });

      if (error) {
        alert("No se pudo iniciar sesión. Probá ingresar manualmente.");
        router.push("/login?role=club");
        return;
      }

      if (clubIdFromUrl) {
        localStorage.removeItem("prende_onboarding_access");
        localStorage.removeItem("prende_onboarding_club");
        localStorage.removeItem("prende_onboarding_payment");

        router.push(`/club/${clubIdFromUrl}`);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?role=club");
        return;
      }

      const { data: membership } = await supabase
        .from("memberships")
        .select("club_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .limit(1)
        .maybeSingle();

      if (!membership?.club_id) {
        router.push("/dashboard");
        return;
      }

      localStorage.removeItem("prende_onboarding_access");
      localStorage.removeItem("prende_onboarding_club");
      localStorage.removeItem("prende_onboarding_payment");

      router.push(`/club/${membership.club_id}`);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al entrar al panel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={mainStyle}>
      <section style={sectionStyle}>
        <Progress current={4} />

        <div style={checkWrapper}>
          <CheckCircle2 size={58} color="#8BE000" />
        </div>

        <h1 style={titleStyle}>Tu club ya está listo</h1>

        <p style={subtitleStyle}>
          Ya podés comenzar a gestionar socios, pagos, inventario, cuotas y
          comunidad desde Prendé.
        </p>

        <button onClick={goToClubPanel} style={buttonStyle} disabled={loading}>
          {loading ? "Ingresando..." : "Ir al panel del club"}
        </button>

        <p style={helperText}>
          Si el pago queda pendiente, la activación puede demorar unos minutos.
        </p>
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
  textAlign: "center",
};

const progressGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 12,
  marginBottom: 42,
  textAlign: "left",
};

const checkWrapper: React.CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: 999,
  margin: "0 auto 26px",
  background: "rgba(139,224,0,0.10)",
  border: "1px solid rgba(139,224,0,0.28)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 0 34px rgba(139,224,0,0.18)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: "clamp(36px, 5vw, 50px)",
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: "-1.2px",
};

const subtitleStyle: React.CSSProperties = {
  margin: "18px auto 0",
  color: "#B8B8B8",
  fontSize: 17,
  lineHeight: 1.6,
  maxWidth: 430,
};

const buttonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "34px auto 0",
  width: "100%",
  maxWidth: 360,
  background: "#8BE000",
  color: "#050505",
  border: "none",
  cursor: "pointer",
  borderRadius: 18,
  padding: "18px 20px",
  fontWeight: 950,
  fontSize: 17,
  boxShadow: "0 0 30px rgba(139,224,0,0.26)",
};

const helperText: React.CSSProperties = {
  margin: "16px auto 0",
  color: "#8B8B8B",
  fontSize: 13,
  lineHeight: 1.5,
  maxWidth: 360,
};