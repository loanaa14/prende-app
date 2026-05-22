"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import SocioShell from "@/components/socio/SocioShell";

import { createClient } from "@/lib/supabase/client";

import {
  ArrowRight,
  BookOpen,
  ChefHat,
  FileText,
  Gavel,
  HeartPulse,
  Music4,
  Sparkles,
  Sprout,
  Star,
} from "lucide-react";

const categories = [
  {
    slug: "recetas",
    title: "Recetas",
    icon: ChefHat,
    description:
      "Ideas, recetas y combinaciones creativas.",
  },

  {
    slug: "musica",
    title: "Música",
    icon: Music4,
    description:
      "Playlists, sesiones y música recomendada.",
  },

  {
    slug: "cultivo",
    title: "Cultivo",
    icon: Sprout,
    description:
      "Tips, guías y consejos de cultivo.",
  },

  {
    slug: "marco-legal",
    title: "Marco legal",
    icon: Gavel,
    description:
      "Información legal y normativa.",
  },

  {
    slug: "salud",
    title: "Salud y bienestar",
    icon: HeartPulse,
    description:
      "Contenido de salud, reducción de riesgos y bienestar.",
  },
];

export default function BibliotecaPage() {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(true);

  const [items, setItems] =
    useState<any[]>([]);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

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

    const { data } =
      await supabase
        .from("club_library")
        .select("*")
        .eq(
          "club_id",
          membership.club_id
        )
        .eq("is_published", true)
        .order("is_pinned", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

    setItems(data || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <SocioShell>
        <div style={loadingBox}>
          Cargando biblioteca...
        </div>
      </SocioShell>
    );
  }

  const featured =
    items.filter(
      (item) => item.is_featured
    );

  const latest =
    items.slice(0, 4);

  return (
    <SocioShell>
      <main style={page}>
        <header style={hero}>
          <div style={heroContent}>
            <div style={heroBadge}>
              <Sparkles size={14} />
              Biblioteca premium
            </div>

            <h1 style={title}>
              Biblioteca
            </h1>

            <p style={subtitle}>
              Explorá contenido
              exclusivo compartido
              por tu club.
            </p>
          </div>

          <div style={heroIcon}>
            <BookOpen size={34} />
          </div>
        </header>

        {!!featured.length && (
          <section style={section}>
            <div style={sectionHeader}>
              <h2 style={sectionTitle}>
                Destacados
              </h2>
            </div>

            <div style={featuredGrid}>
              {featured.map((item) => (
                <Link
                  key={item.id}
                  href={`/socio/biblioteca/${item.category_slug}`}
                  style={featuredCard}
                >
                  {item.cover_url && (
                    <div
                      style={{
                        ...featuredImage,
                        backgroundImage: `url(${item.cover_url})`,
                      }}
                    />
                  )}

                  <div
                    style={
                      featuredContent
                    }
                  >
                    <div
                      style={
                        featuredBadge
                      }
                    >
                      <Star
                        size={12}
                      />
                      Destacado
                    </div>

                    <h3
                      style={
                        featuredTitle
                      }
                    >
                      {item.title}
                    </h3>

                    <p
                      style={
                        featuredDescription
                      }
                    >
                      {
                        item.description
                      }
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section style={section}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>
              Categorías
            </h2>
          </div>

          <div style={categoriesGrid}>
            {categories.map(
              (category) => {
                const Icon =
                  category.icon;

                const count =
                  items.filter(
                    (item) =>
                      item.category_slug ===
                      category.slug
                  ).length;

                const preview =
                  items.find(
                    (item) =>
                      item.category_slug ===
                      category.slug
                  );

                return (
                  <Link
                    key={
                      category.slug
                    }
                    href={`/socio/biblioteca/${category.slug}`}
                    style={
                      categoryCard
                    }
                  >
                    {preview
                      ?.cover_url && (
                      <div
                        style={{
                          ...categoryImage,
                          backgroundImage: `url(${preview.cover_url})`,
                        }}
                      />
                    )}

                    <div
                      style={
                        categoryBody
                      }
                    >
                      <div
                        style={
                          categoryIcon
                        }
                      >
                        <Icon
                          size={22}
                        />
                      </div>

                      <div>
                        <h3
                          style={
                            categoryTitle
                          }
                        >
                          {
                            category.title
                          }
                        </h3>

                        <p
                          style={
                            categoryDescription
                          }
                        >
                          {
                            category.description
                          }
                        </p>
                      </div>

                      <div
                        style={
                          categoryFooter
                        }
                      >
                        <span
                          style={
                            categoryCount
                          }
                        >
                          {count}{" "}
                          contenido
                          {count !==
                          1
                            ? "s"
                            : ""}
                        </span>

                        <ArrowRight
                          size={18}
                        />
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </section>

        {!!latest.length && (
          <section style={section}>
            <div style={sectionHeader}>
              <h2 style={sectionTitle}>
                Últimos agregados
              </h2>
            </div>

            <div style={latestGrid}>
              {latest.map((item) => (
                <Link
                  key={item.id}
                  href={`/socio/biblioteca/${item.category_slug}`}
                  style={latestCard}
                >
                  {item.cover_url && (
                    <div
                      style={{
                        ...latestImage,
                        backgroundImage: `url(${item.cover_url})`,
                      }}
                    />
                  )}

                  <div
                    style={latestBody}
                  >
                    <div
                      style={
                        latestType
                      }
                    >
                      {item.content_type ||
                        "Contenido"}
                    </div>

                    <h3
                      style={
                        latestTitle
                      }
                    >
                      {item.title}
                    </h3>

                    <p
                      style={
                        latestDescription
                      }
                    >
                      {
                        item.description
                      }
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </SocioShell>
  );
}

const page: React.CSSProperties = {
  width: "100%",
  maxWidth: 1250,
  margin: "0 auto",
};

const hero: React.CSSProperties = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: 30,
  marginBottom: 36,
};

const heroContent: React.CSSProperties =
  {
    maxWidth: 620,
  };

const heroBadge: React.CSSProperties =
  {
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
    borderRadius: 999,
    padding: "8px 14px",
    fontWeight: 900,
    fontSize: 12,
    marginBottom: 18,
  };

const title: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: 56,
  fontWeight: 950,
  lineHeight: 1,
};

const subtitle: React.CSSProperties = {
  margin: "18px 0 0",
  color: "#9B9B9B",
  fontSize: 18,
  lineHeight: 1.6,
};

const heroIcon: React.CSSProperties = {
  width: 110,
  height: 110,
  borderRadius: 30,
  background:
    "linear-gradient(135deg, rgba(139,224,0,0.22), rgba(139,224,0,0.08))",
  border:
    "1px solid rgba(139,224,0,0.18)",
  color: "#8BE000",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
};

const section: React.CSSProperties = {
  marginBottom: 42,
};

const sectionHeader: React.CSSProperties =
  {
    marginBottom: 18,
  };

const sectionTitle: React.CSSProperties =
  {
    margin: 0,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: 950,
  };

const featuredGrid: React.CSSProperties =
  {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: 20,
  };

const featuredCard: React.CSSProperties =
  {
    background: "#101010",
    border:
      "1px solid rgba(139,224,0,0.18)",
    borderRadius: 30,
    overflow: "hidden",
    textDecoration: "none",
  };

const featuredImage: React.CSSProperties =
  {
    height: 260,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

const featuredContent: React.CSSProperties =
  {
    padding: 24,
  };

const featuredBadge: React.CSSProperties =
  {
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 900,
  };

const featuredTitle: React.CSSProperties =
  {
    margin: "18px 0 0",
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: 950,
  };

const featuredDescription: React.CSSProperties =
  {
    margin: "12px 0 0",
    color: "#B8B8B8",
    lineHeight: 1.6,
  };

const categoriesGrid: React.CSSProperties =
  {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: 20,
  };

const categoryCard: React.CSSProperties =
  {
    background: "#101010",
    border:
      "1px solid rgba(255,255,255,0.06)",
    borderRadius: 28,
    overflow: "hidden",
    textDecoration: "none",
  };

const categoryImage: React.CSSProperties =
  {
    height: 180,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

const categoryBody: React.CSSProperties =
  {
    padding: 22,
  };

const categoryIcon: React.CSSProperties =
  {
    width: 52,
    height: 52,
    borderRadius: 18,
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
    display: "grid",
    placeItems: "center",
    marginBottom: 18,
  };

const categoryTitle: React.CSSProperties =
  {
    margin: 0,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: 950,
  };

const categoryDescription: React.CSSProperties =
  {
    margin: "10px 0 0",
    color: "#B8B8B8",
    lineHeight: 1.6,
  };

const categoryFooter: React.CSSProperties =
  {
    marginTop: 20,
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    color: "#8BE000",
  };

const categoryCount: React.CSSProperties =
  {
    fontWeight: 900,
  };

const latestGrid: React.CSSProperties =
  {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: 20,
  };

const latestCard: React.CSSProperties =
  {
    background: "#101010",
    border:
      "1px solid rgba(255,255,255,0.06)",
    borderRadius: 24,
    overflow: "hidden",
    textDecoration: "none",
  };

const latestImage: React.CSSProperties =
  {
    height: 180,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

const latestBody: React.CSSProperties =
  {
    padding: 18,
  };

const latestType: React.CSSProperties =
  {
    width: "fit-content",
    background:
      "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 11,
    fontWeight: 800,
  };

const latestTitle: React.CSSProperties =
  {
    margin: "16px 0 0",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: 900,
  };

const latestDescription: React.CSSProperties =
  {
    margin: "10px 0 0",
    color: "#B8B8B8",
    lineHeight: 1.5,
    fontSize: 14,
  };

const loadingBox: React.CSSProperties =
  {
    background: "#101010",
    borderRadius: 22,
    padding: 24,
    color: "#FFFFFF",
  };