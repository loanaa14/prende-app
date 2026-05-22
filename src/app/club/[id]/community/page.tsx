"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/LogoutButton";
import {
  Boxes,
  Calendar,
  CreditCard,
  Heart,
  Home,
  ImagePlus,
  MessageCircle,
  Package,
  Pin,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Users,
  X,
  BookOpen,
} from "lucide-react";

export default function CommunityPage({ params }: any) {
  const { id: clubId } = use(params);
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentUserId, setCurrentUserId] = useState("");
  const [club, setClub] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("aviso");

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [activeImageIndexes, setActiveImageIndexes] = useState<any>({});
  const [likes, setLikes] = useState<any[]>([]);
const [postComments, setPostComments] = useState<any[]>([]);
const [commentInputs, setCommentInputs] = useState<any>({});

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) setCurrentUserId(user.id);

    const [clubRes, postsRes, commentsRes, reactionsRes] = await Promise.all([
      supabase.from("clubs").select("*").eq("id", clubId).maybeSingle(),

      supabase
        .from("club_posts")
        .select("*")
        .eq("club_id", clubId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false }),

      supabase
        .from("club_post_comments")
        .select(
          `
          *,
          profiles (
            full_name,
            email,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: true }),

      supabase.from("club_post_reactions").select("*"),
    ]);

    setClub(clubRes.data);
    setPosts(postsRes.data || []);
   const [likesRes, postCommentsRes] = await Promise.all([
  supabase.from("post_likes").select("*"),
  supabase
    .from("post_comments")
    .select(`
      *,
      profiles(full_name, avatar_url)
    `)
    .order("created_at", { ascending: true }),
]);

setLikes(likesRes.data || []);
setPostComments(postCommentsRes.data || []);
    setReactions(reactionsRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
  loadData();

  const channel = supabase
    .channel(`club-community-${clubId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "club_posts",
      },
      () => {
        loadData();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "post_likes",
      },
      () => {
        loadData();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "post_comments",
      },
      () => {
        loadData();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  function handleImages(e: any) {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    const total = [...images, ...files].slice(0, 4);
    setImages(total);
    setImagePreviews(total.map((file) => URL.createObjectURL(file)));
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  }

  async function createPost() {
    if (!content.trim()) {
      alert("Escribí algo para publicar.");
      return;
    }

    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let uploadedImages: string[] = [];

    for (const file of images) {
      const fileName = `${clubId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("community")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        alert(uploadError.message);
        setCreating(false);
        return;
      }

      const { data } = supabase.storage.from("community").getPublicUrl(fileName);
      if (data?.publicUrl) uploadedImages.push(data.publicUrl);
    }

    const { error } = await supabase.from("club_posts").insert({
      club_id: clubId,
      author_id: user?.id || null,
      title: content.trim().slice(0, 70),
      content: content.trim(),
      type: postType,
      post_type: postType,
      image_url: uploadedImages[0] || null,
      image_urls: uploadedImages,
      is_pinned: false,
    });

    if (error) {
      alert(error.message || "No se pudo crear la publicación.");
      setCreating(false);
      return;
    }
    const { data: members } = await supabase
  .from("memberships")
  .select("user_id, role")
  .eq("club_id", clubId)
  .eq("status", "active")
  .neq("user_id", user?.id);

if (members?.length) {
  await supabase.from("notifications").insert(
    members.map((member) => ({
      club_id: clubId,
      user_id: member.user_id,
      title: "Nueva publicación",
      message: content.trim().slice(0, 120),
      type: "community",
    }))
  );
}

    setContent("");
    setPostType("aviso");
    setImages([]);
    setImagePreviews([]);

    await loadData();
    setCreating(false);
  }

  async function deletePost(id: string) {
    if (!confirm("¿Eliminar publicación?")) return;

    await supabase
      .from("club_posts")
      .delete()
      .eq("id", id)
      .eq("club_id", clubId);

    await loadData();
  }
async function toggleLike(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const existingLike = likes.find(
    (like) => like.post_id === postId && like.user_id === user.id
  );

  if (existingLike) {
    await supabase.from("post_likes").delete().eq("id", existingLike.id);

    setLikes((prev) => prev.filter((like) => like.id !== existingLike.id));

    return;
  }

  const { data } = await supabase
    .from("post_likes")
    .insert({
      post_id: postId,
      user_id: user.id,
    })
    .select()
    .single();

  if (data) {
    setLikes((prev) => [...prev, data]);
  }
}
async function createComment(postId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const content =
    commentInputs[postId]?.trim();

  if (!content) return;

  const { data } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select(`
      *,
      profiles(full_name, avatar_url)
    `)
    .single();

  if (data) {
    setPostComments((prev) => [
      ...prev,
      data,
    ]);

    setCommentInputs((prev: any) => ({
      ...prev,
      [postId]: "",
    }));
  }
}
  async function togglePinned(post: any) {
    await supabase
      .from("club_posts")
      .update({ is_pinned: !post.is_pinned })
      .eq("id", post.id)
      .eq("club_id", clubId);

    await loadData();
  }

  async function toggleLike(postId: string) {
    if (!currentUserId) return;

    const existing = reactions.find(
      (reaction) =>
        reaction.post_id === postId &&
        reaction.user_id === currentUserId &&
        reaction.reaction === "like"
    );

    if (existing) {
      await supabase.from("club_post_reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("club_post_reactions").insert({
        post_id: postId,
        user_id: currentUserId,
        reaction: "like",
      });
    }

    await loadData();
  }

  async function addComment(postId: string) {
    const value = commentInputs[postId]?.trim();

    if (!value || !currentUserId) return;

    const { error } = await supabase.from("club_post_comments").insert({
      post_id: postId,
      user_id: currentUserId,
      content: value,
    });

    if (error) {
      alert(error.message || "No se pudo comentar.");
      return;
    }

    setCommentInputs((prev) => ({
      ...prev,
      [postId]: "",
    }));

    await loadData();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main style={loadingPage}>
        <div style={loadingCard}>Cargando comunidad...</div>
      </main>
    );
  }

  const clubName = club?.name || "Club";

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>Prendé</div>

          <nav style={nav}>
            <Nav href={`/club/${clubId}`} icon={<Home size={17} />} text="Panel" />
            <Nav href={`/club/${clubId}/members`} icon={<Users size={17} />} text="Socios" />
            <Nav href={`/club/${clubId}/payments`} icon={<CreditCard size={17} />} text="Pagos" />
            <Nav href={`/club/${clubId}/inventory`} icon={<Boxes size={17} />} text="Inventario" />
            <Nav href={`/club/${clubId}/withdrawals`} icon={<Package size={17} />} text="Retiros" />
            <Nav href={`/club/${clubId}/community`} icon={<MessageCircle size={17} />} text="Comunidad" active />
<Nav href={`/club/${clubId}/library`} icon={<BookOpen size={17} />} text="Biblioteca" />
            <Nav href={`/club/${clubId}/settings`} icon={<Settings size={17} />} text="Ajustes" />
          </nav>
        </div>

        <div style={bottomSection}>
          <div style={clubMini}>
            <div style={clubAvatar}>{clubName.slice(0, 2).toUpperCase()}</div>

            <div>
              <p style={clubMiniTitle}>{clubName}</p>
              <p style={clubMiniText}>Administrador</p>
            </div>
          </div>

          <LogoutButton />
        </div>
      </aside>

      <section style={contentLayout}>
        <header style={header}>
          <h1 style={titleStyle}>Comunidad</h1>
          <p style={subtitle}>Publicaciones privadas visibles para todos los socios.</p>
        </header>

        <section style={createCard}>
          <div style={createTop}>
            <div style={avatar}>{clubName.slice(0, 1).toUpperCase()}</div>

            <textarea
              placeholder="¿Qué querés compartir con tu club?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={createInput}
            />
          </div>

          <div style={typeSection}>
            <p style={typeLabel}>Tipo de publicación</p>

            <div style={actionsRow}>
              <button
                type="button"
                style={postType === "aviso" ? actionButtonActive : actionButton}
                onClick={() => setPostType("aviso")}
              >
                <MessageCircle size={16} />
                Aviso
              </button>

              <button
                type="button"
                style={postType === "genetica" ? actionButtonActive : actionButton}
                onClick={() => setPostType("genetica")}
              >
                <Sparkles size={16} />
                Genética
              </button>

              <button
                type="button"
                style={postType === "evento" ? actionButtonActive : actionButton}
                onClick={() => setPostType("evento")}
              >
                <Calendar size={16} />
                Evento
              </button>
            </div>
          </div>

          <div style={imageSection}>
            <p style={typeLabel}>Agregar imágenes opcional</p>

            <button
              type="button"
              style={imageButton}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus size={18} />
              Agregar imágenes
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImages}
            />

            {!!imagePreviews.length && (
              <div style={previewGrid}>
                {imagePreviews.map((image, index) => (
                  <div key={index} style={previewImageBox}>
                    <img src={image} alt="preview" style={previewImage} />

                    <button
                      type="button"
                      style={removeImageButton}
                      onClick={() => removeImage(index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={publishRow}>
            <button
              type="button"
              style={publishButton}
              onClick={createPost}
              disabled={creating}
            >
              {creating ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </section>

        <section style={feed}>
          {posts.map((post) => {
            const postImages = post.image_urls?.length
              ? post.image_urls
              : post.image_url
              ? [post.image_url]
              : [];

            const postComments = comments.filter(
              (comment) => comment.post_id === post.id
            );

            const activeImage = activeImageIndexes[post.id] || 0;
            const postLikes = likes.filter((like) => like.post_id === post.id);

const likedByUser = postLikes.some(
  (like) => like.user_id === currentUserId
);

const commentsCount = postComments.filter(
  (comment) => comment.post_id === post.id
).length;
const currentComments = postComments.filter(
  (comment) => comment.post_id === post.id
);

            return (
              <article key={post.id} style={postCard}>
                <div style={postHeader}>
                  <div style={postUser}>
                    <div style={avatar}>{clubName.slice(0, 1).toUpperCase()}</div>

                    <div>
                      <p style={postAuthor}>{clubName}</p>
                      <p style={postDate}>{formatDate(post.created_at)}</p>
                    </div>
                  </div>

                  <div style={postHeaderActions}>
                    {post.is_pinned && (
                      <div style={pinBadge}>
                        <Pin size={12} />
                        Fijado
                      </div>
                    )}

                    <button style={iconButton} onClick={() => togglePinned(post)}>
                      <Pin size={15} />
                    </button>

                    <button style={iconButton} onClick={() => deletePost(post.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={tag}>{post.type || post.post_type || "aviso"}</div>

                <p style={postContent}>{post.content}</p>

                {!!postImages.length && (
                  <div style={carouselContainer}>
                    <img
                      src={postImages[activeImage]}
                      alt="post"
                      style={postImage}
                    />

                    {postImages.length > 1 && (
                      <>
                        <button
                          style={{ ...carouselButton, left: 14 }}
                          onClick={() =>
                            setActiveImageIndexes((prev: any) => ({
                              ...prev,
                              [post.id]:
                                activeImage === 0
                                  ? postImages.length - 1
                                  : activeImage - 1,
                            }))
                          }
                        >
                          ←
                        </button>

                        <button
                          style={{ ...carouselButton, right: 14 }}
                          onClick={() =>
                            setActiveImageIndexes((prev: any) => ({
                              ...prev,
                              [post.id]:
                                activeImage >= postImages.length - 1
                                  ? 0
                                  : activeImage + 1,
                            }))
                          }
                        >
                          →
                        </button>

                        <div style={carouselDots}>
                          {postImages.map((_: any, index: number) => (
                            <div
                              key={index}
                              style={{
                                ...carouselDot,
                                opacity: activeImage === index ? 1 : 0.3,
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div style={postFooter}>
  <button
    type="button"
    onClick={() => toggleLike(post.id)}
    style={likedByUser ? reactionActive : reaction}
  >
    <Heart
      size={16}
      fill={likedByUser ? "#8BE000" : "transparent"}
      color={likedByUser ? "#8BE000" : "#FFFFFF"}
    />

    {postLikes.length}
  </button>

  <div style={reaction}>
    <MessageCircle size={16} />
    {commentsCount}
  </div>
</div>

                <div style={commentsBox}>
                  {currentComments.map((comment) => (
                    <div key={comment.id} style={commentRow}>
                      <div style={commentAvatar}>
                        {(comment.profiles?.full_name || "S")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
<div style={commentInputRow}>
  <input
    value={commentInputs[post.id] || ""}
    onChange={(e) =>
      setCommentInputs((prev: any) => ({
        ...prev,
        [post.id]: e.target.value,
      }))
    }
    placeholder="Escribí un comentario..."
    style={commentInput}
  />

  <button
    type="button"
    onClick={() => createComment(post.id)}
    style={commentButton}
  >
    Enviar
  </button>
</div>
                      <div style={commentBubble}>
                        <p style={commentAuthor}>
                          {comment.profiles?.full_name ||
                            comment.profiles?.email ||
                            "Socio"}
                        </p>

                        <p style={commentText}>{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <div style={commentInputRow}>
                    <input
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder="Escribir comentario..."
                      style={commentInput}
                    />

                    <button
                      type="button"
                      onClick={() => addComment(post.id)}
                      style={commentButton}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {!posts.length && <div style={emptyState}>Todavía no hay publicaciones.</div>}
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

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  display: "grid",
  gridTemplateColumns: "230px 1fr",
  color: "#FFFFFF",
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
  fontSize: 24,
  fontWeight: 950,
};

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 32,
};

const navItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: "#B8B8B8",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 14,
  fontWeight: 800,
};

const navActive: React.CSSProperties = {
  ...navItem,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
};

const bottomSection: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const clubMini: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const clubAvatar: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 999,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
};

const clubMiniTitle: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const clubMiniText: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
};

const contentLayout: React.CSSProperties = {
  padding: "28px 36px",
  width: "100%",
  maxWidth: 1400,
};

const header: React.CSSProperties = {
  marginBottom: 22,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 52,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#9B9B9B",
};

const createCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 30,
  padding: 24,
  marginBottom: 26,
};

const createTop: React.CSSProperties = {
  display: "flex",
  gap: 16,
};

const avatar: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 999,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
  flexShrink: 0,
};

const createInput: React.CSSProperties = {
  flex: 1,
  minHeight: 110,
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 18,
  color: "#FFFFFF",
  resize: "none",
  outline: "none",
  fontSize: 16,
  lineHeight: 1.6,
};

const typeSection: React.CSSProperties = {
  marginTop: 22,
  paddingTop: 22,
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const typeLabel: React.CSSProperties = {
  margin: "0 0 12px",
  color: "#D8D8D8",
  fontWeight: 850,
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
};

const actionButton: React.CSSProperties = {
  height: 48,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "#111111",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "0 20px",
  cursor: "pointer",
  fontWeight: 850,
};

const actionButtonActive: React.CSSProperties = {
  ...actionButton,
  background: "rgba(139,224,0,0.14)",
  border: "1px solid rgba(139,224,0,0.45)",
  color: "#8BE000",
};

const imageSection: React.CSSProperties = {
  marginTop: 22,
};

const imageButton: React.CSSProperties = {
  height: 48,
  borderRadius: 16,
  border: "1px dashed rgba(255,255,255,0.18)",
  background: "#0B0B0B",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "0 20px",
  cursor: "pointer",
  fontWeight: 850,
};

const previewGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(110px, 140px))",
  gap: 12,
  marginTop: 16,
};

const previewImageBox: React.CSSProperties = {
  position: "relative",
  borderRadius: 18,
  overflow: "hidden",
  aspectRatio: "1 / 1",
};

const previewImage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const removeImageButton: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  width: 30,
  height: 30,
  borderRadius: 999,
  border: "none",
  background: "rgba(0,0,0,0.75)",
  color: "#FFFFFF",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const publishRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 22,
};

const publishButton: React.CSSProperties = {
  height: 50,
  borderRadius: 18,
  border: "none",
  background: "#8BE000",
  color: "#050505",
  padding: "0 34px",
  fontWeight: 950,
  cursor: "pointer",
  fontSize: 15,
};

const feed: React.CSSProperties = {
  display: "grid",
  gap: 26,
  width: "100%",
};

const postCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 32,
  padding: 26,
  width: "100%",
};

const postHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const postUser: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const postAuthor: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
};

const postDate: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
};

const postHeaderActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const iconButton: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#0B0B0B",
  color: "#FFFFFF",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const pinBadge: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontWeight: 900,
  fontSize: 12,
};

const tag: React.CSSProperties = {
  marginTop: 18,
  display: "inline-flex",
  padding: "8px 14px",
  borderRadius: 999,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  fontWeight: 900,
  fontSize: 12,
  textTransform: "capitalize",
};

const postContent: React.CSSProperties = {
  margin: "18px 0 0",
  color: "#F0F0F0",
  lineHeight: 1.8,
  fontSize: 17,
  whiteSpace: "pre-wrap",
};

const carouselContainer: React.CSSProperties = {
  position: "relative",
  marginTop: 20,
  borderRadius: 24,
  overflow: "hidden",
  background: "#0B0B0B",
  maxWidth: 720,
};

const postImage: React.CSSProperties = {
  width: "100%",
  maxHeight: 520,
  objectFit: "cover",
  display: "block",
  borderRadius: 22,
};

const carouselButton: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 42,
  height: 42,
  borderRadius: 999,
  border: "none",
  background: "rgba(0,0,0,0.65)",
  color: "#FFFFFF",
  cursor: "pointer",
  fontWeight: 900,
  zIndex: 5,
};

const carouselDots: React.CSSProperties = {
  position: "absolute",
  bottom: 14,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 8,
};

const carouselDot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  background: "#FFFFFF",
};

const postFooter: React.CSSProperties = {
  display: "flex",
  gap: 20,
  marginTop: 20,
};

const reaction: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#B8B8B8",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const reactionActive: React.CSSProperties = {
  ...reaction,
  color: "#8BE000",
  fontWeight: 900,
};

const commentsBox: React.CSSProperties = {
  marginTop: 20,
  display: "grid",
  gap: 12,
};

const commentRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const commentAvatar: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "rgba(139,224,0,0.12)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  flexShrink: 0,
};

const commentBubble: React.CSSProperties = {
  background: "#0B0B0B",
  borderRadius: 18,
  padding: "10px 12px",
  width: "100%",
};

const commentAuthor: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
  fontSize: 13,
};

const commentText: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#D8D8D8",
};

const commentInputRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 14,
};

const commentInput: React.CSSProperties = {
  flex: 1,
  height: 42,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "#0A0A0A",
  color: "#FFFFFF",
  padding: "0 14px",
  outline: "none",
};


const commentButton: React.CSSProperties = {
  height: 42,
  padding: "0 18px",
  borderRadius: 14,
  border: "none",
  background: "#8BE000",
  color: "#050505",
  fontWeight: 900,
  cursor: "pointer",
};

const emptyState: React.CSSProperties = {
  background: "#101010",
  borderRadius: 28,
  padding: 40,
  textAlign: "center",
  color: "#8B8B8B",
};

const loadingPage: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  display: "grid",
  placeItems: "center",
};

const loadingCard: React.CSSProperties = {
  background: "#101010",
  borderRadius: 20,
  padding: 24,
};


