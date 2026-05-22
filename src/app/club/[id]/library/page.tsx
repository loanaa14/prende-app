"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/LogoutButton";

import {
  BookOpen,
  Boxes,
  ChefHat,
  CreditCard,
  Gavel,
  HeartPulse,
  Home,
  ImagePlus,
  MessageCircle,
  Music4,
  Package,
  Plus,
  Settings,
  Sprout,
  Star,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

const categories = [
  {
    slug: "recetas",
    title: "Recetas",
    icon: ChefHat,
  },

  {
    slug: "musica",
    title: "Música",
    icon: Music4,
  },

  {
    slug: "cultivo",
    title: "Cultivo",
    icon: Sprout,
  },

  {
    slug: "marco-legal",
    title: "Marco legal",
    icon: Gavel,
  },

  {
    slug: "salud",
    title: "Salud y bienestar",
    icon: HeartPulse,
  },
];

export default function AdminLibraryPage({
  params,
}: any) {
  const { id: clubId } = use(params);

  const supabase = createClient();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const coverInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [club, setClub] =
    useState<any>(null);

  const [items, setItems] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [category, setCategory] =
    useState("recetas");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [contentType, setContentType] =
    useState("Contenido");

  const [url, setUrl] =
    useState("");

  const [videoUrl, setVideoUrl] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  const [isFeatured, setIsFeatured] =
    useState(false);

  const [isPinned, setIsPinned] =
    useState(false);

  async function loadData() {
    const [
      clubRes,
      libraryRes,
    ] = await Promise.all([
      supabase
        .from("clubs")
        .select("*")
        .eq("id", clubId)
        .maybeSingle(),

      supabase
        .from("club_library")
        .select("*")
        .eq("club_id", clubId)
        .order("is_pinned", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        }),
    ]);

    setClub(clubRes.data);

    setItems(
      libraryRes.data || []
    );

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function uploadFile(
    bucket: string,
    selectedFile: File
  ) {
    const fileName = `${clubId}/${Date.now()}-${
      selectedFile.name
    }`;

    const { error } =
      await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile, {
          upsert: true,
        });

    if (error) {
      throw error;
    }

    const { data } =
      supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function createItem() {
    if (!title.trim()) {
      alert("Agregá un título.");
      return;
    }

    setSaving(true);

    try {
      let fileUrl = "";
      let coverUrl = "";

      if (file) {
        fileUrl =
          await uploadFile(
            "library",
            file
          );
      }

      if (coverImage) {
        coverUrl =
          await uploadFile(
            "library",
            coverImage
          );
      }

      const selectedCategory =
        categories.find(
          (c) =>
            c.slug === category
        );

      const { error } =
        await supabase
          .from("club_library")
          .insert({
            club_id: clubId,

            title: title.trim(),

            description:
              description.trim(),

            category_slug:
              category,

            type:
              selectedCategory?.title ||
              category,

            content_type:
              contentType.trim() ||
              "Contenido",

            url:
              url.trim() || null,

            video_url:
              videoUrl.trim() ||
              null,

            file_url:
              fileUrl || null,

            cover_url:
              coverUrl || null,

            is_featured:
              isFeatured,

            is_pinned:
              isPinned,

            is_published: true,
          });

      if (error) {
        alert(error.message);

        setSaving(false);

        return;
      }

      setTitle("");
      setDescription("");
      setContentType("Contenido");
      setUrl("");
      setVideoUrl("");
      setFile(null);
      setCoverImage(null);
      setIsFeatured(false);
      setIsPinned(false);

      await loadData();

      setSaving(false);
    } catch (err: any) {
      alert(err.message);

      setSaving(false);
    }
  }

  async function deleteItem(
    id: string
  ) {
    if (
      !confirm(
        "¿Eliminar contenido?"
      )
    )
      return;

    await supabase
      .from("club_library")
      .delete()
      .eq("id", id);

    await loadData();
  }

  async function togglePublished(
    item: any
  ) {
    await supabase
      .from("club_library")
      .update({
        is_published:
          !item.is_published,
      })
      .eq("id", item.id);

    await loadData();
  }

  if (loading) {
    return (
      <main style={loadingPage}>
        <div style={loadingCard}>
          Cargando biblioteca...
        </div>
      </main>
    );
  }

  const clubName =
    club?.name || "Club";

  return (
    <main style={page}>
      <aside style={sidebar}>
        <div>
          <div style={brand}>
            Prendé
          </div>

          <nav style={nav}>
            <Nav
              href={`/club/${clubId}`}
              icon={
                <Home size={17} />
              }
              text="Panel"
            />

            <Nav
              href={`/club/${clubId}/members`}
              icon={
                <Users size={17} />
              }
              text="Socios"
            />

            <Nav
              href={`/club/${clubId}/payments`}
              icon={
                <CreditCard size={17} />
              }
              text="Pagos"
            />

            <Nav
              href={`/club/${clubId}/inventory`}
              icon={
                <Boxes size={17} />
              }
              text="Inventario"
            />

            <Nav
              href={`/club/${clubId}/withdrawals`}
              icon={
                <Package size={17} />
              }
              text="Retiros"
            />

            <Nav
              href={`/club/${clubId}/community`}
              icon={
                <MessageCircle size={17} />
              }
              text="Comunidad"
            />

            <Nav
              href={`/club/${clubId}/library`}
              icon={
                <BookOpen size={17} />
              }
              text="Biblioteca"
              active
            />

            <Nav
              href={`/club/${clubId}/settings`}
              icon={
                <Settings size={17} />
              }
              text="Ajustes"
            />
          </nav>
        </div>

        <div style={bottomSection}>
          <div style={clubMini}>
            <div style={clubAvatar}>
              {clubName
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <p style={clubMiniTitle}>
                {clubName}
              </p>

              <p style={clubMiniText}>
                Administrador
              </p>
            </div>
          </div>

          <LogoutButton />
        </div>
      </aside>

      <section style={content}>
        <header style={header}>
          <div style={heroIcon}>
            <BookOpen size={30} />
          </div>

          <div>
            <h1 style={titleStyle}>
              Biblioteca
            </h1>

            <p style={subtitle}>
              Cargá contenido para
              que los socios lo vean
              por categorías.
            </p>
          </div>
        </header>

        <section style={createCard}>
          <div style={topCreate}>
            <div>
              <h2 style={sectionTitle}>
                Nuevo contenido
              </h2>

              <p style={sectionText}>
                Subí archivos,
                imágenes, videos o
                links externos.
              </p>
            </div>

            <button
              onClick={createItem}
              disabled={saving}
              style={publishButton}
            >
              <Plus size={16} />

              {saving
                ? "Guardando..."
                : "Publicar"}
            </button>
          </div>

          <div style={categoriesGrid}>
            {categories.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <button
                    key={
                      item.slug
                    }
                    type="button"
                    onClick={() =>
                      setCategory(
                        item.slug
                      )
                    }
                    style={
                      category ===
                      item.slug
                        ? categoryActive
                        : categoryButton
                    }
                  >
                    <Icon
                      size={18}
                    />

                    {item.title}
                  </button>
                );
              }
            )}
          </div>

          <div style={inputsGrid}>
            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Título"
              style={input}
            />

            <input
              value={
                contentType
              }
              onChange={(e) =>
                setContentType(
                  e.target.value
                )
              }
              placeholder="Tipo: Guía, playlist, PDF..."
              style={input}
            />
          </div>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Descripción..."
            style={textarea}
          />

          <div style={inputsGrid}>
            <input
              value={url}
              onChange={(e) =>
                setUrl(
                  e.target.value
                )
              }
              placeholder="Link externo opcional"
              style={input}
            />

            <input
              value={videoUrl}
              onChange={(e) =>
                setVideoUrl(
                  e.target.value
                )
              }
              placeholder="Link video opcional"
              style={input}
            />
          </div>

          <div style={uploadRow}>
            <button
              type="button"
              style={uploadButton}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <Upload size={17} />

              {file
                ? file.name
                : "Subir archivo"}
            </button>

            <button
              type="button"
              style={uploadButton}
              onClick={() =>
                coverInputRef.current?.click()
              }
            >
              <ImagePlus
                size={17}
              />

              {coverImage
                ? coverImage.name
                : "Imagen portada"}
            </button>

            <label style={checkLabel}>
              <input
                type="checkbox"
                checked={
                  isFeatured
                }
                onChange={(e) =>
                  setIsFeatured(
                    e.target
                      .checked
                  )
                }
              />

              Destacado
            </label>

            <label style={checkLabel}>
              <input
                type="checkbox"
                checked={
                  isPinned
                }
                onChange={(e) =>
                  setIsPinned(
                    e.target
                      .checked
                  )
                }
              />

              Fijado
            </label>

            <input
              ref={fileInputRef}
              type="file"
              style={{
                display: "none",
              }}
              onChange={(e) =>
                setFile(
                  e.target
                    .files?.[0] ||
                    null
                )
              }
            />

            <input
              ref={
                coverInputRef
              }
              type="file"
              accept="image/*"
              style={{
                display: "none",
              }}
              onChange={(e) =>
                setCoverImage(
                  e.target
                    .files?.[0] ||
                    null
                )
              }
            />
          </div>
        </section>
      </section>
    </main>
  );
}

function Nav({
  href,
  icon,
  text,
  active,
}: any) {
  return (
    <Link
      href={href}
      style={
        active
          ? navItemActive
          : navItem
      }
    >
      {icon}
      {text}
    </Link>
  );
}

const page: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  background: "#050505",
};

const sidebar: React.CSSProperties =
  {
    width: 270,
    background: "#0B0B0B",
    borderRight:
      "1px solid rgba(255,255,255,0.06)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    justifyContent:
      "space-between",
  };

const brand: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: 28,
  fontWeight: 950,
  marginBottom: 34,
};

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const navItem: React.CSSProperties = {
  height: 52,
  borderRadius: 18,
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "0 18px",
  color: "#B8B8B8",
  textDecoration: "none",
  fontWeight: 700,
};

const navItemActive: React.CSSProperties =
  {
    ...navItem,
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
  };

const bottomSection: React.CSSProperties =
  {
    display: "grid",
    gap: 16,
  };

const clubMini: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 12,
  };

const clubAvatar: React.CSSProperties =
  {
    width: 48,
    height: 48,
    borderRadius: 16,
    background:
      "linear-gradient(135deg, #8BE000, #5DA100)",
    color: "#050505",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
  };

const clubMiniTitle: React.CSSProperties =
  {
    margin: 0,
    color: "#FFFFFF",
    fontWeight: 900,
  };

const clubMiniText: React.CSSProperties =
  {
    margin: "4px 0 0",
    color: "#8B8B8B",
    fontSize: 13,
  };

const content: React.CSSProperties = {
  flex: 1,
  padding: 34,
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  marginBottom: 28,
};

const heroIcon: React.CSSProperties =
  {
    width: 74,
    height: 74,
    borderRadius: 24,
    background:
      "linear-gradient(135deg, rgba(139,224,0,0.22), rgba(139,224,0,0.08))",
    border:
      "1px solid rgba(139,224,0,0.18)",
    color: "#8BE000",
    display: "grid",
    placeItems: "center",
  };

const titleStyle: React.CSSProperties =
  {
    margin: 0,
    color: "#FFFFFF",
    fontSize: 44,
    fontWeight: 950,
  };

const subtitle: React.CSSProperties =
  {
    margin: "8px 0 0",
    color: "#8B8B8B",
  };

const createCard: React.CSSProperties =
  {
    background: "#101010",
    border:
      "1px solid rgba(255,255,255,0.06)",
    borderRadius: 30,
    padding: 26,
  };

const topCreate: React.CSSProperties =
  {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
  };

const sectionTitle: React.CSSProperties =
  {
    margin: 0,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: 950,
  };

const sectionText: React.CSSProperties =
  {
    margin: "8px 0 0",
    color: "#8B8B8B",
  };

const publishButton: React.CSSProperties =
  {
    height: 50,
    padding: "0 22px",
    borderRadius: 18,
    border: "none",
    background: "#8BE000",
    color: "#050505",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 950,
    cursor: "pointer",
  };

const categoriesGrid: React.CSSProperties =
  {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 22,
  };

const categoryButton: React.CSSProperties =
  {
    height: 58,
    borderRadius: 18,
    border:
      "1px solid rgba(255,255,255,0.06)",
    background: "#0A0A0A",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    cursor: "pointer",
    fontWeight: 800,
  };

const categoryActive: React.CSSProperties =
  {
    ...categoryButton,
    background:
      "rgba(139,224,0,0.12)",
    border:
      "1px solid rgba(139,224,0,0.18)",
    color: "#8BE000",
  };

const inputsGrid: React.CSSProperties =
  {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 14,
    marginBottom: 14,
  };

const input: React.CSSProperties = {
  height: 56,
  borderRadius: 18,
  border:
    "1px solid rgba(255,255,255,0.06)",
  background: "#0A0A0A",
  color: "#FFFFFF",
  padding: "0 18px",
  outline: "none",
};

const textarea: React.CSSProperties =
  {
    width: "100%",
    minHeight: 130,
    borderRadius: 20,
    border:
      "1px solid rgba(255,255,255,0.06)",
    background: "#0A0A0A",
    color: "#FFFFFF",
    padding: 18,
    outline: "none",
    resize: "vertical",
    marginBottom: 14,
  };

const uploadRow: React.CSSProperties =
  {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    alignItems: "center",
  };

const uploadButton: React.CSSProperties =
  {
    height: 50,
    padding: "0 18px",
    borderRadius: 16,
    border:
      "1px solid rgba(255,255,255,0.06)",
    background: "#0A0A0A",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    fontWeight: 700,
  };

const checkLabel: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#B8B8B8",
    fontWeight: 700,
  };

const loadingPage: React.CSSProperties =
  {
    minHeight: "100vh",
    background: "#050505",
    display: "grid",
    placeItems: "center",
  };

const loadingCard: React.CSSProperties =
  {
    background: "#101010",
    borderRadius: 24,
    padding: 28,
    color: "#FFFFFF",
  };