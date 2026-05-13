import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClubTheme } from "@/lib/supabase/getClubTheme";

import {
  BarChart3,
  CreditCard,
  Home,
  MessageCircle,
  Settings,
  Users,
  Boxes,
  Plus,
  Heart,
  Calendar,
  Pin,
} from "lucide-react";

export default async function CommunityPage({
  params,
  searchParams,
}: any) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  async function createPost(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const content = String(formData.get("content") || "").trim();
    const type = String(formData.get("type") || "normal");

    if (!content) {
      redirect(`/club/${id}/community?error=empty`);
    }

    const { error } = await supabase.from("community_posts").insert({
      club_id: id,
      user_id: user.id,
      content,
      type,
    });

    if (error) {
      console.error(error);
      redirect(`/club/${id}/community?error=create`);
    }

    revalidatePath(`/club/${id}/community`);
    redirect(`/club/${id}/community?success=created`);
  }

  async function addReaction(postId: string) {
    "use server";

    const supabase = await createClient();

    await supabase.from("community_reactions").insert({
      post_id: postId,
      user_id: user.id,
      reaction: "like",
    });

    revalidatePath(`/club/${id}/community`);
  }

  const { data: posts } = await supabase
    .from("community_posts")
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .eq("club_id", id)
    .order("created_at", { ascending: false });

  const { data: reactions } = await supabase
    .from("community_reactions")
    .select("*");

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single();

  const theme = await getClubTheme(id);

  const clubName = theme.name || club?.name || "Club";

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>Prendé</div>

          <nav style={nav}>
            <Nav href={`/club/${id}`} icon={<Home size={16} />} text="Panel" />
            <Nav href={`/club/${id}/members`} icon={<Users size={16} />} text="Socios" />
            <Nav href={`/club/${id}/payments`} icon={<CreditCard size={16} />} text="Pagos" />
            <Nav href={`/club/${id}/inventory`} icon={<Boxes size={16} />} text="Inventario" />
            <Nav href={`/club/${id}/community`} icon={<MessageCircle size={16} />} text="Comunidad" active />
            <Nav href={`/club/${id}/payments`} icon={<BarChart3 size={16} />} text="Reportes" />
            <Nav href={`/club/${id}/settings`} icon={<Settings size={16} />} text="Ajustes" />
          </nav>
        </div>

        <div style={clubMini}>
          <div style={avatar}>
            {clubName.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <p style={clubMiniTitle}>{clubName}</p>
            <p style={clubMiniText}>Espacio privado</p>
          </div>
        </div>
      </aside>

      <section style={content}>
        <header style={header}>
          <div>
            <h1 style={title}>Comunidad</h1>

            <p style={subtitle}>
              Espacio interno del club
            </p>
          </div>

          <details style={createBox}>
            <summary style={createButton}>
              <Plus size={15} />
              Nueva publicación
            </summary>

            <form action={createPost} style={form}>
              <textarea
                name="content"
                required
                placeholder="Escribí algo para el club..."
                style={textarea}
              />

              <select
                name="type"
                defaultValue="normal"
                style={input}
              >
                <option value="normal" style={option}>
                  Publicación normal
                </option>

                <option value="important" style={option}>
                  Aviso importante
                </option>

                <option value="genetics" style={option}>
                  Nueva genética
                </option>

                <option value="event" style={option}>
                  Evento
                </option>

                <option value="reminder" style={option}>
                  Recordatorio
                </option>
              </select>

              <button type="submit" style={submitButton}>
                Publicar
              </button>
            </form>
          </details>
        </header>

        {query?.success === "created" && (
          <div style={successBox}>
            Publicación creada correctamente.
          </div>
        )}

        {query?.error && (
          <div style={errorBox}>
            No se pudo crear la publicación.
          </div>
        )}

        <section style={layout}>
          <div style={feed}>
            {posts?.map((post: any) => {
              const likes =
                reactions?.filter(
                  (r: any) => r.post_id === post.id
                ).length || 0;

              return (
                <article key={post.id} style={postCard}>
                  <div style={postHeader}>
                    <div style={userAvatar}>
                      {(
                        post?.profiles?.full_name ||
                        post?.profiles?.email ||
                        "U"
                      )
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p style={postUser}>
                        {post?.profiles?.full_name ||
                          post?.profiles?.email ||
                          "Miembro"}
                      </p>

                      <p style={postDate}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {post.type !== "normal" && (
                    <div style={badge}>
                      {getTypeLabel(post.type)}
                    </div>
                  )}

                  <p style={postContent}>{post.content}</p>

                  <div style={postActions}>
                    <form
                      action={async () => {
                        "use server";
                        await addReaction(post.id);
                      }}
                    >
                      <button type="submit" style={actionButton}>
                        <Heart size={15} />
                        {likes}
                      </button>
                    </form>

                    <button style={actionButton}>
                      <MessageCircle size={15} />
                      Comentarios
                    </button>
                  </div>
                </article>
              );
            })}

            {!posts?.length && (
              <div style={emptyBox}>
                Todavía no hay publicaciones en la comunidad.
              </div>
            )}
          </div>

          <aside style={rightSidebar}>
            <div style={sideCard}>
              <div style={sideTitleRow}>
                <Calendar size={16} color="#8BE000" />
                <p style={sideTitle}>Próximos eventos</p>
              </div>

              <div style={sideList}>
                <div style={sideItem}>
                  Reunión mensual
                </div>

                <div style={sideItem}>
                  Llegada de genética
                </div>

                <div style={sideItem}>
                  Apertura de cupos
                </div>
              </div>
            </div>

            <div style={sideCard}>
              <div style={sideTitleRow}>
                <Pin size={16} color="#8BE000" />
                <p style={sideTitle}>Destacados</p>
              </div>

              <div style={sideList}>
                <div style={sideItem}>
                  Nueva AK-47 disponible
                </div>

                <div style={sideItem}>
                  Cambio de horario
                </div>

                <div style={sideItem}>
                  Cuotas actualizadas
                </div>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function getTypeLabel(type: string) {
  switch (type) {
    case "important":
      return "Aviso importante";

    case "genetics":
      return "Nueva genética";

    case "event":
      return "Evento";

    case "reminder":
      return "Recordatorio";

    default:
      return "Publicación";
  }
}

function Nav({ href, icon, text, active }: any) {
  return (
    <Link href={href} style={active ? navActive : navItem}>
      {icon}
      {text}
    </Link>
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
  padding: 22,
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
  padding: "11px 13px",
  borderRadius: 13,
  fontWeight: 800,
  fontSize: 13,
};

const navActive: React.CSSProperties = {
  ...navItem,
  color: "#8BE000",
  background: "rgba(139,224,0,0.12)",
};

const clubMini: React.CSSProperties = {
  display: "flex",
  gap: 11,
  alignItems: "center",
};

const avatar: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "#111",
  border: "1px solid rgba(139,224,0,0.28)",
  display: "grid",
  placeItems: "center",
  color: "#8BE000",
  fontWeight: 900,
  fontSize: 12,
};

const clubMiniTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontWeight: 850,
  fontSize: 13,
};

const clubMiniText: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#8B8B8B",
  fontSize: 11,
};

const content: React.CSSProperties = {
  padding: 28,
  background:
    "radial-gradient(circle at top right, rgba(139,224,0,0.10), transparent 30%), #050505",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 24,
  gap: 20,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#8B8B8B",
};

const createBox: React.CSSProperties = {
  position: "relative",
};

const createButton: React.CSSProperties = {
  listStyle: "none",
  background: "#8BE000",
  color: "#050505",
  borderRadius: 14,
  padding: "12px 16px",
  fontWeight: 950,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const form: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 55,
  width: 360,
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 16,
  display: "grid",
  gap: 12,
  zIndex: 50,
};

const textarea: React.CSSProperties = {
  minHeight: 120,
  resize: "vertical",
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  color: "#FFFFFF",
  padding: 14,
  outline: "none",
};

const input: React.CSSProperties = {
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  color: "#FFFFFF",
  padding: 12,
  outline: "none",
};

const option: React.CSSProperties = {
  background: "#111",
  color: "#FFFFFF",
};

const submitButton: React.CSSProperties = {
  background: "#8BE000",
  color: "#050505",
  border: "none",
  borderRadius: 14,
  padding: 12,
  fontWeight: 950,
  cursor: "pointer",
};

const successBox: React.CSSProperties = {
  background: "rgba(139,224,0,0.10)",
  border: "1px solid rgba(139,224,0,0.22)",
  color: "#8BE000",
  borderRadius: 14,
  padding: 12,
  marginBottom: 16,
};

const errorBox: React.CSSProperties = {
  background: "rgba(255,107,107,0.10)",
  border: "1px solid rgba(255,107,107,0.22)",
  color: "#FF6B6B",
  borderRadius: 14,
  padding: 12,
  marginBottom: 16,
};

const layout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 300px",
  gap: 18,
};

const feed: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const postCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 20,
};

const postHeader: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const userAvatar: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  background: "rgba(139,224,0,0.14)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
};

const postUser: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const postDate: React.CSSProperties = {
  margin: "3px 0 0",
  color: "#8B8B8B",
  fontSize: 12,
};

const badge: React.CSSProperties = {
  marginTop: 16,
  display: "inline-flex",
  background: "rgba(139,224,0,0.12)",
  border: "1px solid rgba(139,224,0,0.22)",
  color: "#8BE000",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 900,
};

const postContent: React.CSSProperties = {
  margin: "16px 0",
  color: "#EAEAEA",
  lineHeight: 1.7,
};

const postActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const actionButton: React.CSSProperties = {
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#D8D8D8",
  borderRadius: 12,
  padding: "10px 14px",
  display: "flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
};

const emptyBox: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 30,
  color: "#8B8B8B",
  textAlign: "center",
};

const rightSidebar: React.CSSProperties = {
  display: "grid",
  gap: 16,
  alignSelf: "start",
};

const sideCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 18,
};

const sideTitleRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginBottom: 16,
};

const sideTitle: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const sideList: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const sideItem: React.CSSProperties = {
  background: "#0B0B0B",
  borderRadius: 12,
  padding: 12,
  color: "#D8D8D8",
};