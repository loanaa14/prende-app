"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

import SocioShell from "@/components/socio/SocioShell";
import { createClient } from "@/lib/supabase/client";

import {
  ChefHat,
  ExternalLink,
  FileText,
  Gavel,
  HeartPulse,
  Music4,
  PlayCircle,
  Sprout,
  Star,
} from "lucide-react";

const categoryConfig: any = {
  recetas: {
    title: "Recetas",
    icon: ChefHat,
  },

  musica: {
    title: "Música",
    icon: Music4,
  },

  cultivo: {
    title: "Cultivo",
    icon: Sprout,
  },

  "marco-legal": {
    title: "Marco legal",
    icon: Gavel,
  },

  salud: {
    title: "Salud y bienestar",
    icon: HeartPulse,
  },
};

export default function BibliotecaCategoriaPage({
  params,
}: any) {
  const { categoria } = use(params);

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
        .eq(
          "category_slug",
          categoria
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

  const category =
    categoryConfig[categoria];

  const Icon =
    category?.icon || FileText;

  if (loading) {
    return (
      <SocioShell>
        <div style={loadingBox}>
          Cargando contenido...
        </div>
      </SocioShell>
    );
  }

  return (
    <SocioShell>
      <main style={page}>
        <header style={header}>
          <div style={heroIcon}>
            <Icon size={30} />
          </div>

          <div>
            <h1 style={title}>
              {category?.title ||
                "Biblioteca"}
            </h1>

            <p style={subtitle}>
              Contenido compartido
              por el club.
            </p>
          </div>
        </header>

        <section style={grid}>
          {items.map((item) => (
            <article
              key={item.id}
              style={
                item.is_featured
                  ? featuredCard
                  : card
              }
            >
              {item.cover_url && (
                <div
                  style={{
                    ...image,
                    backgroundImage: `url(${item.cover_url})`,
                  }}
                />
              )}

              <div style={content}>
                <div style={badges}>
                  <div style={typeBadge}>
                    {item.content_type ||
                      "Contenido"}
                  </div>

                  {item.is_featured && (
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
                  )}
                </div>

                <h2 style={itemTitle}>
                  {item.title}
                </h2>

                <p
                  style={
                    itemDescription
                  }
                >
                  {
                    item.description
                  }
                </p>

                <div style={actions}>
                  {item.url && (
                    <Link
                      href={item.url}
                      target="_blank"
                      style={
                        primaryButton
                      }
                    >
                      <ExternalLink
                        size={16}
                      />
                      Abrir link
                    </Link>
                  )}

                  {item.video_url && (
                    <Link
                      href={
                        item.video_url
                      }
                      target="_blank"
                      style={
                        secondaryButton
                      }
                    >
                      <PlayCircle
                        size={16}
                      />
                      Ver video
                    </Link>
                  )}

                  {item.file_url && (
                    <Link
                      href={
                        item.file_url
                      }
                      target="_blank"
                      style={
                        secondaryButton
                      }
                    >
                      <FileText
                        size={16}
                      />
                      Abrir archivo
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}

          {!items.length && (
            <div style={emptyBox}>
              Todavía no hay
              contenido en esta
              categoría.
            </div>
          )}
        </section>
      </main>
    </SocioShell>
  );
}

const page: React.CSSProperties = {
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  marginBottom: 30,
};

const heroIcon: React.CSSProperties =
  {
    width: 72,
    height: 72,
    borderRadius: 24,
    background:
      "linear-gradient(135deg, rgba(139,224,0,0.22), rgba(139,224,0,0.08))",
    border:
      "1px solid rgba(139,224,0,0.18)",
    color: "#8BE000",
    display: "grid",
    placeItems: "center",
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

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: 20,
};

const card: React.CSSProperties = {
  background: "#101010",
  border:
    "1px solid rgba(255,255,255,0.06)",
  borderRadius: 28,
  overflow: "hidden",
};

const featuredCard: React.CSSProperties =
  {
    ...card,
    border:
      "1px solid rgba(139,224,0,0.18)",
  };

const image: React.CSSProperties = {
  height: 220,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const content: React.CSSProperties = {
  padding: 22,
};

const badges: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const typeBadge: React.CSSProperties =
  {
    background:
      "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 800,
  };

const featuredBadge: React.CSSProperties =
  {
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

const itemTitle: React.CSSProperties =
  {
    margin: "18px 0 0",
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: 950,
  };

const itemDescription: React.CSSProperties =
  {
    margin: "12px 0 0",
    color: "#B8B8B8",
    lineHeight: 1.6,
  };

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 22,
};

const primaryButton: React.CSSProperties =
  {
    height: 46,
    borderRadius: 16,
    padding: "0 18px",
    background: "#8BE000",
    color: "#050505",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  };

const secondaryButton: React.CSSProperties =
  {
    height: 46,
    borderRadius: 16,
    padding: "0 18px",
    background: "#0A0A0A",
    border:
      "1px solid rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  };

const emptyBox: React.CSSProperties =
  {
    gridColumn: "1 / -1",
    background: "#101010",
    borderRadius: 26,
    padding: 34,
    color: "#8B8B8B",
    textAlign: "center",
  };

const loadingBox: React.CSSProperties =
  {
    background: "#101010",
    borderRadius: 22,
    padding: 24,
    color: "#FFFFFF",
  };