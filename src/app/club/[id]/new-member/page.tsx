import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

export default async function InviteMemberPage({ params }: any) {
  const { id } = await params;

  return (
    <>
      <style>{`
        .placeholder::placeholder {
          color: rgba(255,255,255,0.35);
        }
      `}</style>

      <main style={page}>
        <section style={card}>
          <Link href={`/club/${id}/members`} style={backLink}>
            <ArrowLeft size={17} />
            Volver a socios
          </Link>

          <div style={iconBox}>
            <UserPlus size={30} color="#8BE000" />
          </div>

          <h1 style={title}>Agregar socio</h1>

          <p style={subtitle}>
            Invitá a una persona para que pueda acceder al espacio privado del club.
          </p>

          <form
            method="POST"
            action={`/club/${id}/invite-member`}
            style={form}
          >
            <label style={label}>Correo electrónico</label>

            <div style={inputBox}>
              <Mail size={17} color="#8B8B8B" />

              <input
                name="email"
                type="email"
                required
                placeholder="socio@email.com"
                autoComplete="off"
                spellCheck={false}
                className="placeholder"
                style={emailInput}
              />
            </div>

            <label style={label}>Rol</label>

            <div style={inputBox}>
              <ShieldCheck size={17} color="#8B8B8B" />

              <select name="role" defaultValue="socio" style={selectInput}>
                <option
                  value="socio"
                  style={{ backgroundColor: "#111", color: "#fff" }}
                >
                  Socio
                </option>

                <option
                  value="admin"
                  style={{ backgroundColor: "#111", color: "#fff" }}
                >
                  Administrador
                </option>
              </select>
            </div>

            <button type="submit" style={button}>
              Enviar invitación
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.11), transparent 32%), #050505",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  backgroundColor: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 28,
  padding: 30,
};

const backLink: React.CSSProperties = {
  color: "#8BE000",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 850,
  marginBottom: 24,
};

const iconBox: React.CSSProperties = {
  width: 62,
  height: 62,
  borderRadius: 20,
  backgroundColor: "rgba(139,224,0,0.12)",
  display: "grid",
  placeItems: "center",
  marginBottom: 18,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 38,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "12px 0 0",
  color: "#9B9B9B",
  lineHeight: 1.6,
};

const form: React.CSSProperties = {
  marginTop: 28,
  display: "grid",
  gap: 14,
};

const label: React.CSSProperties = {
  color: "#FFFFFF",
  fontWeight: 850,
  fontSize: 14,
};

const inputBox: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  backgroundColor: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: "0 14px",
  height: 50,
};

const input: React.CSSProperties = {
  width: "100%",
  backgroundColor: "transparent",
  border: "none",
  outline: "none",
  boxShadow: "none",
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: 700,
  appearance: "none",
  WebkitAppearance: "none",
};

const emailInput: React.CSSProperties = {
  ...input,
  WebkitTextFillColor: "#FFFFFF",
  caretColor: "#8BE000",
  color: "#FFFFFF",
};

const selectInput: React.CSSProperties = {
  ...input,
  cursor: "pointer",
};

const button: React.CSSProperties = {
  marginTop: 10,
  backgroundColor: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 16,
  padding: "16px 18px",
  fontWeight: 950,
  fontSize: 16,
  cursor: "pointer",
};