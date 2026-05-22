"use client";

import { use, useEffect, useRef, useState } from "react";

import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

import LogoutButton from "@/components/LogoutButton";

import {
  Calendar,
  CalendarDays,
  Clock,
  CreditCard,
  Home,
  ImagePlus,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Settings,
  Trash2,
  Upload,
  Users,
  Boxes,
  BookOpen,
} from "lucide-react";

export default function EventsPage({
  params,
}: any) {
  const { id: clubId } = use(params);

  const supabase = createClient();

  const coverInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [club, setClub] = useState<any>(null);

  const [events, setEvents] = useState<
    any[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  async function loadData() {
    const [clubRes, eventsRes] =
      await Promise.all([
        supabase
          .from("clubs")
          .select("*")
          .eq("id", clubId)
          .maybeSingle(),

        supabase
          .from("club_events")
          .select("*")
          .eq("club_id", clubId)
          .order("start_date", {
            ascending: true,
          }),
      ]);

    setClub(clubRes.data);

    setEvents(eventsRes.data || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function uploadImage(
    file: File
  ) {
    const fileName = `${clubId}/${Date.now()}-${
      file.name
    }`;

    const { error } = await supabase.storage
      .from("library")
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("library")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function createEvent() {
    if (
      !title.trim() ||
      !startDate
    ) {
      alert(
        "Completá el título y fecha."
      );

      return;
    }

    setSaving(true);

    try {
      let coverUrl = "";

      if (coverImage) {
        coverUrl =
          await uploadImage(
            coverImage
          );
      }

      const { error } =
        await supabase
          .from("club_events")
          .insert({
            club_id: clubId,

            title:
              title.trim(),

            description:
              description.trim(),

            location:
              location.trim(),

            start_date:
              startDate,

            end_date:
              endDate || null,

            cover_url:
              coverUrl || null,
          });

      if (error) {
        alert(error.message);

        setSaving(false);

        return;
      }
      const { data: members } = await supabase
  .from("memberships")
  .select("user_id")
  .eq("club_id", clubId)
  .eq("role", "socio")
  .eq("status", "active");

if (members?.length) {
  await supabase.from("notifications").insert(
    members.map((member) => ({
      club_id: clubId,
      user_id: member.user_id,
      title: "Nuevo evento",
      message: title.trim(),
      type: "event",
    }))
  );
}

      setTitle("");
      setDescription("");
      setLocation("");
      setStartDate("");
      setEndDate("");

      setCoverImage(null);

      await loadData();

      setSaving(false);
    } catch (err: any) {
      alert(err.message);

      setSaving(false);
    }
  }

  async function deleteEvent(
    id: string
  ) {
    if (
      !confirm(
        "¿Eliminar evento?"
      )
    )
      return;

    await supabase
      .from("club_events")
      .delete()
      .eq("id", id);

    await loadData();
  }

  if (loading) {
    return (
      <main style={loadingPage}>
        <div style={loadingCard}>
          Cargando eventos...
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
              icon={<Home size={17} />}
              text="Panel"
            />

            <Nav
              href={`/club/${clubId}/members`}
              icon={<Users size={17} />}
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
              icon={<Boxes size={17} />}
              text="Inventario"
            />

            <Nav
              href={`/club/${clubId}/withdrawals`}
              icon={<Package size={17} />}
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
            />

            <Nav
              href={`/club/${clubId}/events`}
              icon={
                <CalendarDays size={17} />
              }
              text="Eventos"
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
        <header style={hero}>
          <div style={heroIcon}>
            <Calendar size={28} />
          </div>

          <div>
            <h1 style={heroTitle}>
              Eventos
            </h1>

            <p style={heroText}>
              Organizá eventos,
              encuentros y actividades
              para socios.
            </p>
          </div>
        </header>

        <section style={createCard}>
          <div style={topCreate}>
            <div>
              <h2 style={sectionTitle}>
                Crear evento
              </h2>

              <p style={sectionText}>
                Publicá próximos
                encuentros del club.
              </p>
            </div>

            <button
              onClick={
                createEvent
              }
              disabled={saving}
              style={
                publishButton
              }
            >
              <Plus size={16} />

              {saving
                ? "Guardando..."
                : "Publicar"}
            </button>
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
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
              placeholder="Ubicación"
              style={input}
            />
          </div>

          <textarea
            value={
              description
            }
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
              type="datetime-local"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              style={input}
            />

            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              style={input}
            />
          </div>

          <div style={uploadRow}>
            <button
              type="button"
              style={
                uploadButton
              }
              onClick={() =>
                coverInputRef.current?.click()
              }
            >
              <ImagePlus size={17} />

              {coverImage
                ? coverImage.name
                : "Imagen portada"}
            </button>

            <input
              ref={
                coverInputRef
              }
              type="file"
              accept="image/*"
              style={{
                display:
                  "none",
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

        <section style={eventsGrid}>
          {events.map((event) => (
            <article
              key={event.id}
              style={eventCard}
            >
              {event.cover_url && (
                <div
                  style={{
                    ...eventImage,
                    backgroundImage: `url(${event.cover_url})`,
                  }}
                />
              )}

              <div
                style={
                  eventContent
                }
              >
                <h2
                  style={eventTitle}
                >
                  {event.title}
                </h2>

                <p
                  style={
                    eventDescription
                  }
                >
                  {event.description ||
                    "Sin descripción"}
                </p>

                <div
                  style={
                    eventMeta
                  }
                >
                  <div
                    style={
                      metaItem
                    }
                  >
                    <Clock
                      size={
                        14
                      }
                    />

                    {formatDate(
                      event.start_date
                    )}
                  </div>

                  {event.location && (
                    <div
                      style={
                        metaItem
                      }
                    >
                      <MapPin
                        size={
                          14
                        }
                      />

                      {
                        event.location
                      }
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    deleteEvent(
                      event.id
                    )
                  }
                  style={
                    deleteButton
                  }
                >
                  <Trash2
                    size={15}
                  />
                  Eliminar
                </button>
              </div>
            </article>
          ))}

          {!events.length && (
            <div style={emptyBox}>
              No hay eventos
              publicados.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleString("es-UY");
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
          ? navActive
          : navItem
      }
    >
      {icon}
      {text}
    </Link>
  );
}

const page: React.CSSProperties =
  {
    minHeight: "100vh",
    background: "#050505",
    color: "#FFFFFF",
    display: "grid",
    gridTemplateColumns:
      "230px 1fr",
  };

const sidebar: React.CSSProperties =
  {
    background: "#070707",
    borderRight:
      "1px solid rgba(255,255,255,0.08)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    justifyContent:
      "space-between",
  };

const brand: React.CSSProperties =
  {
    fontSize: 24,
    fontWeight: 950,
  };

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 32,
};

const navItem: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: "#B8B8B8",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 800,
  };

const navActive: React.CSSProperties =
  {
    ...navItem,
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
  };

const bottomSection: React.CSSProperties =
  {
    display: "grid",
    gap: 14,
  };

const clubMini: React.CSSProperties =
  {
    display: "flex",
    gap: 12,
    alignItems: "center",
  };

const clubAvatar: React.CSSProperties =
  {
    width: 42,
    height: 42,
    borderRadius: 999,
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
  };

const clubMiniTitle: React.CSSProperties =
  {
    margin: 0,
    fontWeight: 900,
  };

const clubMiniText: React.CSSProperties =
  {
    margin: "4px 0 0",
    color: "#8B8B8B",
    fontSize: 13,
  };

const content: React.CSSProperties =
  {
    padding: "28px 36px",
  };

const hero: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 18,
    marginBottom: 28,
  };

const heroIcon: React.CSSProperties =
  {
    width: 70,
    height: 70,
    borderRadius: 22,
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
    display: "grid",
    placeItems: "center",
  };

const heroTitle: React.CSSProperties =
  {
    margin: 0,
    fontSize: 48,
    fontWeight: 950,
  };

const heroText: React.CSSProperties =
  {
    margin: "8px 0 0",
    color: "#8B8B8B",
  };

const createCard: React.CSSProperties =
  {
    background: "#101010",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: 28,
    padding: 24,
    marginBottom: 28,
  };

const topCreate: React.CSSProperties =
  {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  };

const sectionTitle: React.CSSProperties =
  {
    margin: 0,
    fontSize: 26,
    fontWeight: 950,
  };

const sectionText: React.CSSProperties =
  {
    margin: "8px 0 0",
    color: "#8B8B8B",
  };

const publishButton: React.CSSProperties =
  {
    height: 46,
    borderRadius: 16,
    border: "none",
    background: "#8BE000",
    color: "#050505",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 20px",
    fontWeight: 950,
    cursor: "pointer",
  };

const inputsGrid: React.CSSProperties =
  {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 14,
    marginBottom: 14,
  };

const input: React.CSSProperties =
  {
    height: 54,
    borderRadius: 16,
    border:
      "1px solid rgba(255,255,255,0.08)",
    background: "#0B0B0B",
    color: "#FFFFFF",
    padding: "0 18px",
    outline: "none",
  };

const textarea: React.CSSProperties =
  {
    width: "100%",
    minHeight: 120,
    borderRadius: 18,
    border:
      "1px solid rgba(255,255,255,0.08)",
    background: "#0B0B0B",
    color: "#FFFFFF",
    padding: 18,
    outline: "none",
    resize: "vertical",
    marginBottom: 14,
  };

const uploadRow: React.CSSProperties =
  {
    display: "flex",
    gap: 12,
  };

const uploadButton: React.CSSProperties =
  {
    height: 48,
    borderRadius: 16,
    border:
      "1px dashed rgba(255,255,255,0.18)",
    background: "#0B0B0B",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 18px",
    cursor: "pointer",
    fontWeight: 850,
  };

const eventsGrid: React.CSSProperties =
  {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: 20,
  };

const eventCard: React.CSSProperties =
  {
    background: "#101010",
    border:
      "1px solid rgba(255,255,255,0.08)",
    borderRadius: 26,
    overflow: "hidden",
  };

const eventImage: React.CSSProperties =
  {
    height: 180,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

const eventContent: React.CSSProperties =
  {
    padding: 18,
  };

const eventTitle: React.CSSProperties =
  {
    margin: 0,
    fontSize: 24,
    fontWeight: 950,
  };

const eventDescription: React.CSSProperties =
  {
    margin: "10px 0 0",
    color: "#B8B8B8",
    lineHeight: 1.5,
  };

const eventMeta: React.CSSProperties =
  {
    display: "grid",
    gap: 8,
    marginTop: 16,
  };

const metaItem: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#8BE000",
    fontSize: 13,
    fontWeight: 700,
  };

const deleteButton: React.CSSProperties =
  {
    marginTop: 18,
    height: 42,
    borderRadius: 14,
    border:
      "1px solid rgba(255,255,255,0.06)",
    background: "#151515",
    color: "#FF6B6B",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 16px",
    cursor: "pointer",
    fontWeight: 850,
  };

const emptyBox: React.CSSProperties =
  {
    gridColumn: "1 / -1",
    background: "#101010",
    borderRadius: 24,
    padding: 30,
    textAlign: "center",
    color: "#8B8B8B",
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
    borderRadius: 20,
    padding: 24,
  };