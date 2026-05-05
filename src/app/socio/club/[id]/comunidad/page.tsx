"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SocioShell from "@/components/socio/SocioShell";
import { Heart, MessageCircle, Send, Users } from "lucide-react";

export default function ComunidadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clubId } = use(params);
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  function formatDate(date: string) {
    return new Date(date).toLocaleString("es-UY", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDisplayName(profile: any, fallback?: string) {
    return profile?.username || fallback || "socio";
  }

  function getInitial(name: string) {
    return String(name || "S").charAt(0).toUpperCase();
  }

  function Avatar({ profile, fallback }: { profile: any; fallback?: string }) {
    const name = getDisplayName(profile, fallback);

    return (
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#12372A",
          color: "white",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          getInitial(name)
        )}
      </div>
    );
  }

  async function loadData() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;
    setUser(currentUser ?? null);

    const { data: clubData } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .maybeSingle();

    setClub(clubData);

    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .eq("club_id", clubId)
      .order("created_at", { ascending: false });

    const postIds = postsData?.map((p) => p.id) ?? [];
    const postUserIds = postsData?.map((p) => p.user_id) ?? [];

    const { data: likesData } = postIds.length
      ? await supabase
          .from("community_post_likes")
          .select("*")
          .in("post_id", postIds)
      : { data: [] };

    const { data: commentsData } = postIds.length
      ? await supabase
          .from("community_comments")
          .select("*")
          .in("post_id", postIds)
          .order("created_at", { ascending: true })
      : { data: [] };

    const commentUserIds = commentsData?.map((c) => c.user_id) ?? [];
    const allUserIds = Array.from(new Set([...postUserIds, ...commentUserIds]));

    const { data: profilesData } = allUserIds.length
      ? await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", allUserIds)
      : { data: [] };

    const merged =
      postsData?.map((post) => ({
        ...post,
        profile: profilesData?.find((p) => p.id === post.user_id),
        likes: likesData?.filter((l) => l.post_id === post.id) ?? [],
        comments:
          commentsData
            ?.filter((c) => c.post_id === post.id)
            .map((c) => ({
              ...c,
              profile: profilesData?.find((p) => p.id === c.user_id),
            })) ?? [],
      })) ?? [];

    setPosts(merged);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [clubId]);

  async function createPost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user || !content.trim()) return;

    await supabase.from("community_posts").insert({
      club_id: clubId,
      user_id: user.id,
      content: content.trim(),
    });

    setContent("");
    await loadData();
  }

  async function toggleLike(post: any) {
    if (!user) return;

    const existingLike = post.likes.find((l: any) => l.user_id === user.id);

    if (existingLike) {
      await supabase
        .from("community_post_likes")
        .delete()
        .eq("id", existingLike.id);
    } else {
      await supabase.from("community_post_likes").insert({
        post_id: post.id,
        user_id: user.id,
      });
    }

    await loadData();
  }

  async function createComment(
    e: React.FormEvent<HTMLFormElement>,
    postId: string
  ) {
    e.preventDefault();

    if (!user) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const comment = String(formData.get("comment") || "").trim();

    if (!comment) return;

    await supabase.from("community_comments").insert({
      post_id: postId,
      user_id: user.id,
      content: comment,
    });

    form.reset();
    await loadData();
  }

  if (loading) {
    return (
      <SocioShell clubId={clubId}>
        <p>Cargando comunidad...</p>
      </SocioShell>
    );
  }

  return (
    <SocioShell clubId={clubId}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <section
          style={{
            background: "white",
            border: "1px solid #E5E1DA",
            borderRadius: 32,
            padding: 28,
            marginBottom: 20,
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 18,
                background: "#76A889",
                color: "white",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Users size={24} />
            </div>

            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                Comunidad privada
              </p>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>
                {club?.name ?? "Club"}
              </h1>
            </div>
          </div>

          <p style={{ marginTop: 14, color: "#6B7280", lineHeight: 1.5 }}>
            Publicaciones internas, comentarios y participación privada entre
            socios registrados del club.
          </p>
        </section>

        <form
          onSubmit={createPost}
          style={{
            background: "white",
            border: "1px solid #E5E1DA",
            borderRadius: 26,
            padding: 22,
            marginBottom: 22,
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          }}
        >
          <label style={{ display: "block", fontWeight: 800, marginBottom: 10 }}>
            Compartir con la comunidad
          </label>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribí una publicación interna..."
            style={{
              width: "100%",
              minHeight: 110,
              borderRadius: 18,
              padding: 14,
              border: "1px solid #E5E1DA",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              fontSize: 15,
              boxSizing: "border-box",
              background: "#FBF9F6",
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: 12,
              width: "100%",
              background: "#76A889",
              color: "white",
              padding: 13,
              borderRadius: 16,
              border: 0,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Publicar
          </button>
        </form>

        <div style={{ display: "grid", gap: 18 }}>
          {posts.length === 0 && (
            <div
              style={{
                background: "white",
                border: "1px solid #E5E1DA",
                borderRadius: 24,
                padding: 24,
                color: "#6B7280",
                textAlign: "center",
              }}
            >
              Todavía no hay publicaciones. Sé la primera persona en compartir
              algo dentro de la comunidad.
            </div>
          )}

          {posts.map((post) => {
            const postName = getDisplayName(post.profile, user?.email);
            const liked = post.likes.some(
              (l: any) => l.user_id === user?.id
            );

            return (
              <article
                key={post.id}
                style={{
                  background: "white",
                  borderRadius: 28,
                  padding: 22,
                  border: "1px solid #E5E1DA",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar profile={post.profile} fallback={user?.email} />

                  <div>
                    <p style={{ margin: 0, fontWeight: 800 }}>
                      @{postName}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    marginTop: 16,
                    marginBottom: 0,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    color: "#172033",
                  }}
                >
                  {post.content}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 18,
                  }}
                >
                  <button
                    onClick={() => toggleLike(post)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "7px 12px",
                      borderRadius: 999,
                      border: "1px solid #E5E1DA",
                      background: liked ? "#FEE2E2" : "#FBF9F6",
                      color: liked ? "#B91C1C" : "#172033",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    <Heart size={16} fill={liked ? "#B91C1C" : "none"} />
                    {post.likes.length}
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "7px 12px",
                      borderRadius: 999,
                      border: "1px solid #E5E1DA",
                      background: "#FBF9F6",
                      color: "#172033",
                      fontWeight: 700,
                    }}
                  >
                    <MessageCircle size={16} />
                    {post.comments.length}
                  </div>
                </div>

                {post.comments.length > 0 && (
                  <div style={{ marginTop: 16, display: "grid", gap: 9 }}>
                    {post.comments.map((comment: any) => {
                      const commentName = getDisplayName(
                        comment.profile,
                        comment.user_id === user?.id ? user?.email : "socio"
                      );

                      return (
                        <div
                          key={comment.id}
                          style={{
                            background: "#FBF9F6",
                            border: "1px solid #E5E1DA",
                            borderRadius: 16,
                            padding: "10px 12px",
                            display: "flex",
                            gap: 10,
                          }}
                        >
                          <Avatar profile={comment.profile} fallback={commentName} />

                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#172033",
                              }}
                            >
                              @{commentName}
                            </p>
                            <p
                              style={{
                                margin: "4px 0 0",
                                fontSize: 14,
                                color: "#374151",
                                lineHeight: 1.4,
                              }}
                            >
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <form
                  onSubmit={(e) => createComment(e, post.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 16,
                  }}
                >
                  <input
                    name="comment"
                    placeholder="Escribir comentario..."
                    style={{
                      flex: 1,
                      padding: "11px 14px",
                      borderRadius: 999,
                      border: "1px solid #E5E1DA",
                      outline: "none",
                      background: "#FBF9F6",
                      fontSize: 14,
                    }}
                  />

                  <button
                    type="submit"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "#12372A",
                      color: "white",
                      border: 0,
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      </div>
    </SocioShell>
  );
}