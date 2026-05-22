import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getClubTheme } from "@/lib/supabase/getClubTheme";
import {
  BarChart3,
  Boxes,
  CreditCard,
  Home,
  MessageCircle,
  Search,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";

export default async function MembersPage({ params }: any) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single();

  const theme = await getClubTheme(id);
  const clubName = theme.name || club?.name || "Club";

  const { data: members } = await supabase
    .from("memberships")
    .select(
      `
      id,
      role,
      status,
      created_at,
      profiles (
        email,
        full_name,
        username,
        avatar_url
      )
    `
    )
    .eq("club_id", id)
    .order("created_at", { ascending: false });

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>Prendé</div>

          <nav style={nav}>
            <Nav href={`/club/${id}`} icon={<Home size={17} />} text="Panel" />
            <Nav href={`/club/${id}/members`} icon={<Users size={17} />} text="Socios" active />
            <Nav href={`/club/${id}/payments`} icon={<CreditCard size={17} />} text="Pagos" />
            <Nav href={`/club/${id}/inventory`} icon={<Boxes size={17} />} text="Inventario" />
            <Nav href={`/club/${id}/withdrawals`}icon={<Boxes size={16} />}text="Retiros"/>
            <Nav href={`/club/${id}/community`} icon={<MessageCircle size={17} />} text="Comunidad" />
            <Nav href={`/club/${id}/payments`} icon={<BarChart3 size={17} />} text="Reportes" />
            <Nav href={`/club/${id}/settings`} icon={<Settings size={17} />} text="Ajustes" />
          </nav>
        </div>

        <div style={clubMini}>
          <div style={avatar}>{clubName.slice(0, 2).toUpperCase()}</div>
          <div>
            <p style={clubMiniTitle}>{clubName}</p>
            <p style={clubMiniText}>Administrador</p>
          </div>
        </div>
      </aside>

      <section style={content}>
        <header style={header}>
          <h1 style={title}>Socios</h1>

          <Link href={`/club/${id}/new-member`} style={primaryButton}>
            <UserPlus size={17} />
            Agregar socio
          </Link>
        </header>

        <section style={tools}>
          <div style={searchBox}>
            <Search size={17} color="#8B8B8B" />
            <input type="text" placeholder="Buscar socio..." style={searchInput} />
          </div>

          <div style={filters}>
            <button type="button" style={filterActive}>Todos</button>
            <button type="button" style={filter}>Al día</button>
            <button type="button" style={filter}>Pendientes</button>
            <button type="button" style={filter}>Suspendidos</button>
          </div>
        </section>

        <section style={list}>
          {members?.map((member: any) => {
            const profile = Array.isArray(member.profiles)
              ? member.profiles[0]
              : member.profiles;

            const name =
              profile?.full_name || profile?.username || "Socio sin nombre";

            const email = profile?.email || "Sin email";

            return (
              <details key={member.id} style={memberCard}>
                <summary style={summary}>
                  <div style={person}>
                    <div style={photo}>{name.slice(0, 2).toUpperCase()}</div>

                    <div>
                      <p style={memberName}>{name}</p>
                      <p style={memberMeta}>{email}</p>
                    </div>
                  </div>

                  <div>
                    <p style={label}>Ingreso</p>
                    <p style={value}>
                      {new Date(member.created_at).toLocaleDateString("es-UY")}
                    </p>
                  </div>

                  <div>
                    <p style={label}>Cuota</p>
                    <span style={member.status === "active" ? statusPaid : statusPending}>
                      {member.status === "active" ? "Al día" : "Pendiente"}
                    </span>
                  </div>

                  <div>
                    <p style={label}>Genética de preferencia</p>
                    <p style={value}>Opcional</p>
                  </div>

                  <span style={profileButton}>Ver más</span>
                </summary>

                <div style={detailPanel}>
                  <div style={detailGrid}>
                    <div style={detailBox}>
                      <p style={detailTitle}>Información básica</p>
                      <Info label="Nombre" value={name} />
                      <Info label="Email" value={email} />
                      <Info label="Teléfono" value="Sin cargar" />
                      <Info
                        label="Fecha de ingreso"
                        value={new Date(member.created_at).toLocaleDateString("es-UY")}
                      />
                      <Info label="Genética de preferencia" value="Sin asignar" />
                    </div>

                    <div style={detailBox}>
                      <p style={detailTitle}>Notas internas</p>
                      <p style={noteText}>
                        Sin notas internas todavía. Podrás agregar observaciones importantes del socio.
                      </p>
                    </div>

                    <div style={detailBox}>
                      <p style={detailTitle}>Últimos movimientos</p>
                      <p style={movement}>Pagó cuota mensual</p>
                      <p style={movement}>Se aprobó ingreso</p>
                      <p style={movement}>Sin retiros registrados</p>
                    </div>

                    <div style={detailBox}>
                      <p style={detailTitle}>Acciones rápidas</p>

                      <div style={actions}>
                        <Link href={`/club/${id}/payments`} style={actionButton}>
                          Registrar pago
                        </Link>

                        <Link href={`/club/${id}/invite-member`} style={actionButtonDark}>
                          Editar datos
                        </Link>

                        <button type="button" style={actionButtonDark}>
                          Suspender
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            );
          })}

          {!members?.length && (
            <div style={empty}>
              <p style={emptyTitle}>Todavía no hay socios registrados</p>
              <p style={emptyText}>
                Agregá el primer socio para comenzar a gestionar el club.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Nav({ href, icon, text, active }: any) {
  return (
    <Link href={href} style={active ? navActive : navItem}>
      {icon}
      {text}
    </Link>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: 12 }}>
      <p style={labelStyle}>{label}</p>
      <p style={infoValue}>{value}</p>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  color: "#FFFFFF",
  display: "grid",
  gridTemplateColumns: "230px 1fr",
};

const sidebar: React.CSSProperties = {
  background: "#070707",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  padding: 24,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const brand: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 950,
  marginBottom: 30,
};

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const navItem: React.CSSProperties = {
  color: "#B8B8B8",
  textDecoration: "none",
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 14,
  fontWeight: 800,
  fontSize: 14,
};

const navActive: React.CSSProperties = {
  ...navItem,
  color: "#8BE000",
  background: "rgba(139,224,0,0.12)",
};

const clubMini: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const avatar: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 999,
  background: "#111",
  border: "1px solid rgba(139,224,0,0.28)",
  display: "grid",
  placeItems: "center",
  color: "#8BE000",
  fontWeight: 900,
};

const clubMiniTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 850,
};

const clubMiniText: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#8B8B8B",
  fontSize: 12,
};

const content: React.CSSProperties = {
  padding: 34,
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.11), transparent 32%), #050505",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginBottom: 26,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 38,
  fontWeight: 950,
  letterSpacing: "-0.8px",
};

const primaryButton: React.CSSProperties = {
  background: "#8BE000",
  color: "#050505",
  textDecoration: "none",
  borderRadius: 16,
  padding: "14px 18px",
  fontWeight: 950,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const tools: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 16,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  marginBottom: 16,
};

const searchBox: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  padding: "0 14px",
  minWidth: 260,
  height: 46,
};

const searchInput: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: 700,
};

const filters: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const filter: React.CSSProperties = {
  color: "#B8B8B8",
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 999,
  padding: "9px 12px",
  fontSize: 13,
  fontWeight: 850,
  cursor: "pointer",
};

const filterActive: React.CSSProperties = {
  ...filter,
  color: "#8BE000",
  background: "rgba(139,224,0,0.10)",
  border: "1px solid rgba(139,224,0,0.22)",
};

const list: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const memberCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 18,
};

const summary: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.5fr 0.8fr 0.7fr 1fr auto",
  gap: 18,
  alignItems: "center",
  cursor: "pointer",
  listStyle: "none",
};

const person: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const photo: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  background: "rgba(139,224,0,0.12)",
  border: "1px solid rgba(139,224,0,0.24)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
};

const memberName: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const memberMeta: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
};

const label: React.CSSProperties = {
  margin: 0,
  color: "#777",
  fontSize: 12,
  fontWeight: 850,
};

const value: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#D8D8D8",
  fontSize: 14,
  fontWeight: 750,
};

const statusPaid: React.CSSProperties = {
  display: "inline-flex",
  marginTop: 6,
  color: "#8BE000",
  background: "rgba(139,224,0,0.10)",
  border: "1px solid rgba(139,224,0,0.22)",
  borderRadius: 999,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 900,
};

const statusPending: React.CSSProperties = {
  ...statusPaid,
  color: "#FFD166",
  background: "rgba(255,209,102,0.10)",
  border: "1px solid rgba(255,209,102,0.22)",
};

const profileButton: React.CSSProperties = {
  color: "#8BE000",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 14,
};

const detailPanel: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 18,
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const detailGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 14,
};

const detailBox: React.CSSProperties = {
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 18,
  padding: 16,
};

const detailTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: 950,
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  color: "#777",
  fontSize: 12,
  fontWeight: 850,
};

const infoValue: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#D8D8D8",
  fontSize: 14,
  fontWeight: 750,
};

const noteText: React.CSSProperties = {
  margin: "12px 0 0",
  color: "#9B9B9B",
  lineHeight: 1.5,
  fontSize: 14,
};

const movement: React.CSSProperties = {
  margin: "12px 0 0",
  color: "#D8D8D8",
  fontSize: 14,
  fontWeight: 750,
};

const actions: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 14,
};

const actionButton: React.CSSProperties = {
  background: "#8BE000",
  color: "#050505",
  textDecoration: "none",
  border: "none",
  borderRadius: 14,
  padding: "12px",
  fontWeight: 950,
  textAlign: "center",
};

const actionButtonDark: React.CSSProperties = {
  background: "#101010",
  color: "#FFFFFF",
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "12px",
  fontWeight: 900,
  textAlign: "center",
  cursor: "pointer",
};

const empty: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 34,
  textAlign: "center",
};

const emptyTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 950,
};

const emptyText: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#9B9B9B",
};