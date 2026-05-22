"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SocioShell from "@/components/socio/SocioShell";

import {
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";

export default function ComunidadSocioPage({ params }: any) {
  const { id: clubId } = use(params);

  const supabase = createClient();

  const [club, setClub] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  const [activeImageIndexes, setActiveImageIndexes] = useState<any>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) setCurrentUserId(user.id);

    const [clubRes, postsRes, commentsRes, reactionsRes] =
      await Promise.all([
        supabase
          .from("clubs")
          .select("*")
          .eq("id", clubId)
          .maybeSingle(),

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

        supabase
          .from("club_post_reactions")
          .select("*"),
      ]);

    setClub(clubRes.data);
    setPosts(postsRes.data || []);
    setComments(commentsRes.data || []);
    setReactions(reactionsRes.data || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function toggleLike(postId: string) {
    if (!currentUserId) return;

    const existing = reactions.find(
      (reaction) =>
        reaction.post_id === postId &&
        reaction.user_id === currentUserId &&
        reaction.reaction === "like"
    );

    if (existing) {
      await supabase
        .from("club_post_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase
        .from("club_post_reactions")
        .insert({
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

    const { error } = await supabase
      .from("club_post_comments")
      .insert({
        post_id: postId,
        user_id: currentUserId,
        content: value,
      });

    if (error) {
      alert(error.message);
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
      <SocioShell>
        <div style={loadingBox}>
          Cargando comunidad...
        </div>
      </SocioShell>
    );
  }

  const clubName = club?.name || "Club";

  return (
    <SocioShell>
      <div style={container}>
        <header style={header}>
          <h1 style={title}>Comunidad</h1>

          <p style={subtitle}>
            Publicaciones privadas del club.
          </p>
        </header>

        <section style={feed}>
          {posts.map((post) => {
            const postImages =
              post.image_urls?.length
                ? post.image_urls
                : post.image_url
                ? [post.image_url]
                : [];

            const postComments = comments.filter(
              (comment) => comment.post_id === post.id
            );

            const postLikes = reactions.filter(
              (reaction) =>
                reaction.post_id === post.id &&
                reaction.reaction === "like"
            );

            const likedByMe = postLikes.some(
              (reaction) =>
                reaction.user_id === currentUserId
            );

            const activeImage =
              activeImageIndexes[post.id] || 0;

            return (
              <article key={post.id} style={postCard}>
                <div style={postHeader}>
                  <div style={postUser}>
                    <div style={avatar}>
                      {clubName.slice(0, 1).toUpperCase()}
                    </div>

                    <div>
                      <p style={postAuthor}>
                        {clubName}
                      </p>

                      <p style={postDate}>
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={tag}>
                  {post.type || post.post_type || "aviso"}
                </div>

                <p style={postContent}>
                  {post.content}
                </p>

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
                          style={{
                            ...carouselButton,
                            left: 14,
                          }}
                          onClick={() =>
                            setActiveImageIndexes(
                              (prev: any) => ({
                                ...prev,
                                [post.id]:
                                  activeImage === 0
                                    ? postImages.length - 1
                                    : activeImage - 1,
                              })
                            )
                          }
                        >
                          ←
                        </button>

                        <button
                          style={{
                            ...carouselButton,
                            right: 14,
                          }}
                          onClick={() =>
                            setActiveImageIndexes(
                              (prev: any) => ({
                                ...prev,
                                [post.id]:
                                  activeImage >=
                                  postImages.length - 1
                                    ? 0
                                    : activeImage + 1,
                              })
                            )
                          }
                        >
                          →
                        </button>

                        <div style={carouselDots}>
                          {postImages.map(
                            (_: any, index: number) => (
                              <div
                                key={index}
                                style={{
                                  ...carouselDot,
                                  opacity:
                                    activeImage === index
                                      ? 1
                                      : 0.3,
                                }}
                              />
                            )
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div style={postFooter}>
                  <button
                    type="button"
                    onClick={() =>
                      toggleLike(post.id)
                    }
                    style={
                      likedByMe
                        ? reactionActive
                        : reaction
                    }
                  >
                    <Heart size={16} />
                    {postLikes.length}
                  </button>

                  <div style={reaction}>
                    <MessageCircle size={16} />
                    {postComments.length}
                  </div>
                </div>

                <div style={commentsBox}>
                  {postComments.map((comment) => (
                    <div
                      key={comment.id}
                      style={commentRow}
                    >
                      <div style={commentAvatar}>
                        {(
                          comment.profiles
                            ?.full_name || "S"
                        )
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>

                      <div style={commentBubble}>
                        <p style={commentAuthor}>
                          {comment.profiles
                            ?.full_name ||
                            comment.profiles?.email ||
                            "Socio"}
                        </p>

                        <p style={commentText}>
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div style={commentInputRow}>
                    <input
                      value={
                        commentInputs[post.id] || ""
                      }
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]:
                            e.target.value,
                        }))
                      }
                      placeholder="Escribir comentario..."
                      style={commentInput}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        addComment(post.id)
                      }
                      style={commentButton}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </SocioShell>
  );
}

const container: React.CSSProperties = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
};

const header: React.CSSProperties = {
  marginBottom: 28,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 46,
  fontWeight: 950,
  color: "#FFFFFF",
};

const subtitle: React.CSSProperties = {
  margin: "10px 0 0",
  color: "#9B9B9B",
};

const feed: React.CSSProperties = {
  display: "grid",
  gap: 24,
};

const postCard: React.CSSProperties = {
  background: "#101010",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 32,
  padding: 26,
};

const postHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const postUser: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
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
};

const postAuthor: React.CSSProperties = {
  margin: 0,
  fontWeight: 900,
  color: "#FFFFFF",
};

const postDate: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#8B8B8B",
  fontSize: 13,
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
  color: "#FFFFFF",
};

const commentText: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#D8D8D8",
};

const commentInputRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const commentInput: React.CSSProperties = {
  flex: 1,
  background: "#0B0B0B",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 999,
  color: "#FFFFFF",
  padding: "12px 16px",
  outline: "none",
};

const commentButton: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  border: "none",
  background: "#8BE000",
  color: "#050505",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const loadingBox: React.CSSProperties = {
  background: "#101010",
  borderRadius: 20,
  padding: 24,
  color: "#FFFFFF",
};