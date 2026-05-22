"use client";

import { useEffect, useState } from "react";

import SocioShell from "@/components/socio/SocioShell";

import { createClient } from "@/lib/supabase/client";

import {
  Heart,
  ImageIcon,
  MessageCircle,
  Pin,
} from "lucide-react";

export default function SocioCommunityPage() {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(true);

  const [posts, setPosts] =
    useState<any[]>([]);

  const [likes, setLikes] =
    useState<any[]>([]);

  const [postComments, setPostComments] =
    useState<any[]>([]);

  const [commentInputs, setCommentInputs] =
    useState<any>({});

  const [currentUserId, setCurrentUserId] =
    useState("");

  const [activeImageIndexes, setActiveImageIndexes] =
    useState<any>({});

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data: membership } =
      await supabase
        .from("memberships")
        .select("club_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

    if (!membership?.club_id) {
      setLoading(false);
      return;
    }

    const [
      postsRes,
      likesRes,
      commentsRes,
    ] = await Promise.all([
      supabase
        .from("club_posts")
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq(
          "club_id",
          membership.club_id
        )
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("post_likes")
        .select("*"),

      supabase
        .from("post_comments")
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .order("created_at", {
          ascending: true,
        }),
    ]);

    setPosts(postsRes.data || []);

    setLikes(likesRes.data || []);

    setPostComments(
      commentsRes.data || []
    );

    setLoading(false);
  }

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("socio-community")
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

  async function toggleLike(
    postId: string
  ) {
    const existingLike =
      likes.find(
        (like) =>
          like.post_id ===
            postId &&
          like.user_id ===
            currentUserId
      );

    if (existingLike) {
      await supabase
        .from("post_likes")
        .delete()
        .eq(
          "id",
          existingLike.id
        );

      setLikes((prev) =>
        prev.filter(
          (like) =>
            like.id !==
            existingLike.id
        )
      );

      return;
    }

    const { data } =
      await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id:
            currentUserId,
        })
        .select()
        .single();

    if (data) {
      setLikes((prev) => [
        ...prev,
        data,
      ]);
    }
  }

  async function createComment(
    postId: string
  ) {
    const content =
      commentInputs[
        postId
      ]?.trim();

    if (!content) return;

    const { data } =
      await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id:
            currentUserId,
          content,
        })
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .single();

    if (data) {
      setPostComments(
        (prev) => [
          ...prev,
          data,
        ]
      );

      setCommentInputs(
        (prev: any) => ({
          ...prev,
          [postId]: "",
        })
      );
    }
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

  return (
    <SocioShell>
      <main style={page}>
        <header style={header}>
          <div>
            <h1 style={title}>
              Comunidad
            </h1>

            <p style={subtitle}>
              Publicaciones y
              novedades del club.
            </p>
          </div>
        </header>

        <section style={feed}>
          {posts.map((post) => {
            const images =
              post.image_urls
                ?.length
                ? post.image_urls
                : post.image_url
                ? [
                    post.image_url,
                  ]
                : [];

            const activeIndex =
              activeImageIndexes[
                post.id
              ] || 0;

            const postLikes =
              likes.filter(
                (like) =>
                  like.post_id ===
                  post.id
              );

            const likedByUser =
              postLikes.some(
                (like) =>
                  like.user_id ===
                  currentUserId
              );

            const currentComments =
              postComments.filter(
                (comment) =>
                  comment.post_id ===
                  post.id
              );

            return (
              <article
                key={post.id}
                style={postCard}
              >
                <div
                  style={
                    postHeader
                  }
                >
                  <div
                    style={
                      authorRow
                    }
                  >
                    <div
                      style={{
                        ...avatar,
                        backgroundImage:
                          post
                            ?.profiles
                            ?.avatar_url
                            ? `url(${post.profiles.avatar_url})`
                            : undefined,
                      }}
                    >
                      {!post
                        ?.profiles
                        ?.avatar_url &&
                        (
                          post
                            ?.profiles
                            ?.full_name ||
                          "C"
                        )
                          .slice(
                            0,
                            1
                          )
                          .toUpperCase()}
                    </div>

                    <div>
                      <p
                        style={
                          authorName
                        }
                      >
                        {post
                          ?.profiles
                          ?.full_name ||
                          "Club"}
                      </p>

                      <p
                        style={
                          postDate
                        }
                      >
                        {new Date(
                          post.created_at
                        ).toLocaleString(
                          "es-UY"
                        )}
                      </p>
                    </div>
                  </div>

                  {post.is_pinned && (
                    <div
                      style={
                        pinBadge
                      }
                    >
                      <Pin
                        size={13}
                      />
                      Fijado
                    </div>
                  )}
                </div>

                <div
                  style={
                    typeBadge
                  }
                >
                  {
                    post.post_type
                  }
                </div>

                <p style={content}>
                  {
                    post.content
                  }
                </p>

                {!!images.length && (
                  <div
                    style={
                      carousel
                    }
                  >
                    <div
                      style={{
                        ...carouselImage,
                        backgroundImage: `url(${images[activeIndex]})`,
                      }}
                    />

                    {images.length >
                      1 && (
                      <>
                        <button
                          type="button"
                          style={
                            leftArrow
                          }
                          onClick={() =>
                            setActiveImageIndexes(
                              (
                                prev: any
                              ) => ({
                                ...prev,
                                [post.id]:
                                  activeIndex ===
                                  0
                                    ? images.length -
                                      1
                                    : activeIndex -
                                      1,
                              })
                            )
                          }
                        >
                          ←
                        </button>

                        <button
                          type="button"
                          style={
                            rightArrow
                          }
                          onClick={() =>
                            setActiveImageIndexes(
                              (
                                prev: any
                              ) => ({
                                ...prev,
                                [post.id]:
                                  activeIndex ===
                                  images.length -
                                    1
                                    ? 0
                                    : activeIndex +
                                      1,
                              })
                            )
                          }
                        >
                          →
                        </button>
                      </>
                    )}

                    <div
                      style={
                        imageCounter
                      }
                    >
                      <ImageIcon
                        size={14}
                      />

                      {activeIndex +
                        1}
                      /
                      {
                        images.length
                      }
                    </div>
                  </div>
                )}

                <div
                  style={
                    postFooter
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleLike(
                        post.id
                      )
                    }
                    style={
                      likedByUser
                        ? reactionActive
                        : reaction
                    }
                  >
                    <Heart
                      size={16}
                      fill={
                        likedByUser
                          ? "#8BE000"
                          : "transparent"
                      }
                      color={
                        likedByUser
                          ? "#8BE000"
                          : "#FFFFFF"
                      }
                    />

                    {
                      postLikes.length
                    }
                  </button>

                  <div
                    style={
                      reaction
                    }
                  >
                    <MessageCircle
                      size={16}
                    />

                    {
                      currentComments.length
                    }
                  </div>
                </div>

                <div
                  style={
                    commentsBox
                  }
                >
                  {currentComments.map(
                    (
                      comment
                    ) => (
                      <div
                        key={
                          comment.id
                        }
                        style={
                          commentCard
                        }
                      >
                        <div
                          style={{
                            ...commentAvatar,
                            backgroundImage:
                              comment
                                ?.profiles
                                ?.avatar_url
                                ? `url(${comment.profiles.avatar_url})`
                                : undefined,
                          }}
                        >
                          {!comment
                            ?.profiles
                            ?.avatar_url &&
                            (
                              comment
                                ?.profiles
                                ?.full_name ||
                              "S"
                            )
                              .slice(
                                0,
                                1
                              )
                              .toUpperCase()}
                        </div>

                        <div>
                          <p
                            style={
                              commentAuthor
                            }
                          >
                            {comment
                              ?.profiles
                              ?.full_name ||
                              "Socio"}
                          </p>

                          <p
                            style={
                              commentContent
                            }
                          >
                            {
                              comment.content
                            }
                          </p>
                        </div>
                      </div>
                    )
                  )}

                  <div
                    style={
                      commentInputRow
                    }
                  >
                    <input
                      value={
                        commentInputs[
                          post.id
                        ] || ""
                      }
                      onChange={(
                        e
                      ) =>
                        setCommentInputs(
                          (
                            prev: any
                          ) => ({
                            ...prev,
                            [post.id]:
                              e
                                .target
                                .value,
                          })
                        )
                      }
                      placeholder="Escribí un comentario..."
                      style={
                        commentInput
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        createComment(
                          post.id
                        )
                      }
                      style={
                        commentButton
                      }
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </SocioShell>
  );
}

const page: React.CSSProperties = {
  width: "100%",
  maxWidth: 850,
  margin: "0 auto",
};

const header: React.CSSProperties = {
  marginBottom: 26,
};

const title: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: 42,
  fontWeight: 950,
};

const subtitle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#8B8B8B",
};

const feed: React.CSSProperties = {
  display: "grid",
  gap: 20,
};

const postCard: React.CSSProperties = {
  background: "#101010",
  border:
    "1px solid rgba(255,255,255,0.06)",
  borderRadius: 28,
  padding: 22,
};

const postHeader: React.CSSProperties =
  {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  };

const authorRow: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 12,
  };

const avatar: React.CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 999,
  background:
    "linear-gradient(135deg, #8BE000, #5FA500)",
  color: "#050505",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const authorName: React.CSSProperties =
  {
    margin: 0,
    color: "#FFFFFF",
    fontWeight: 900,
  };

const postDate: React.CSSProperties =
  {
    margin: "4px 0 0",
    color: "#8B8B8B",
    fontSize: 12,
  };

const pinBadge: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 900,
  };

const typeBadge: React.CSSProperties =
  {
    marginTop: 18,
    width: "fit-content",
    background:
      "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    borderRadius: 999,
    padding: "8px 14px",
    textTransform:
      "capitalize",
    fontSize: 12,
    fontWeight: 800,
  };

const content: React.CSSProperties = {
  margin: "18px 0 0",
  color: "#E5E5E5",
  lineHeight: 1.6,
};

const carousel: React.CSSProperties = {
  position: "relative",
  marginTop: 18,
};

const carouselImage: React.CSSProperties =
  {
    height: 420,
    borderRadius: 24,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

const leftArrow: React.CSSProperties =
  {
    position: "absolute",
    top: "50%",
    left: 14,
    transform:
      "translateY(-50%)",
    width: 42,
    height: 42,
    borderRadius: 999,
    border: "none",
    background:
      "rgba(0,0,0,0.45)",
    color: "#FFFFFF",
    cursor: "pointer",
  };

const rightArrow: React.CSSProperties =
  {
    ...leftArrow,
    left: "auto",
    right: 14,
  };

const imageCounter: React.CSSProperties =
  {
    position: "absolute",
    bottom: 14,
    right: 14,
    display: "flex",
    alignItems: "center",
    gap: 6,
    background:
      "rgba(0,0,0,0.55)",
    color: "#FFFFFF",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 800,
  };

const postFooter: React.CSSProperties =
  {
    display: "flex",
    gap: 14,
    marginTop: 18,
  };

const reaction: React.CSSProperties =
  {
    height: 42,
    borderRadius: 14,
    border:
      "1px solid rgba(255,255,255,0.06)",
    background: "#0A0A0A",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 16px",
    fontWeight: 800,
  };

const reactionActive: React.CSSProperties =
  {
    ...reaction,
    border:
      "1px solid rgba(139,224,0,0.18)",
    background:
      "rgba(139,224,0,0.08)",
    color: "#8BE000",
  };

const commentsBox: React.CSSProperties =
  {
    marginTop: 20,
    display: "grid",
    gap: 14,
  };

const commentCard: React.CSSProperties =
  {
    display: "flex",
    gap: 10,
  };

const commentAvatar: React.CSSProperties =
  {
    width: 36,
    height: 36,
    borderRadius: 999,
    background:
      "linear-gradient(135deg, #8BE000, #5FA500)",
    color: "#050505",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    fontSize: 13,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

const commentAuthor: React.CSSProperties =
  {
    margin: 0,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 800,
  };

const commentContent: React.CSSProperties =
  {
    margin: "4px 0 0",
    color: "#C5C5C5",
    fontSize: 14,
    lineHeight: 1.5,
  };

const commentInputRow: React.CSSProperties =
  {
    display: "flex",
    gap: 10,
    marginTop: 6,
  };

const commentInput: React.CSSProperties =
  {
    flex: 1,
    height: 42,
    borderRadius: 14,
    border:
      "1px solid rgba(255,255,255,0.06)",
    background: "#0A0A0A",
    color: "#FFFFFF",
    padding: "0 14px",
    outline: "none",
  };

const commentButton: React.CSSProperties =
  {
    height: 42,
    padding: "0 18px",
    borderRadius: 14,
    border: "none",
    background: "#8BE000",
    color: "#050505",
    fontWeight: 900,
    cursor: "pointer",
  };

const loadingBox: React.CSSProperties =
  {
    background: "#101010",
    borderRadius: 22,
    padding: 24,
    color: "#FFFFFF",
  };