"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import SocioShell from "@/components/socio/SocioShell";

import {
  CalendarDays,
  Clock,
  MapPin,
} from "lucide-react";

export default function SocioEventosPage() {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(true);

  const [events, setEvents] =
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
        .from("club_events")
        .select("*")
        .eq(
          "club_id",
          membership.club_id
        )
        .order("start_date", {
          ascending: true,
        });

    setEvents(data || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <SocioShell>
        <div style={loadingBox}>
          Cargando eventos...
        </div>
      </SocioShell>
    );
  }

  return (
    <SocioShell>
      <main style={page}>
        <header style={header}>
          <div style={heroIcon}>
            <CalendarDays size={26} />
          </div>

          <div>
            <h1 style={title}>
              Eventos
            </h1>

            <p style={subtitle}>
              Próximos encuentros y
              actividades del club.
            </p>
          </div>
        </header>

        <section style={grid}>
          {events.map((event) => (
            <article
              key={event.id}
              style={card}
            >
              {event.cover_url && (
                <div
                  style={{
                    ...image,
                    backgroundImage: `
                      linear-gradient(
                        to bottom,
                        rgba(0,0,0,0.12),
                        rgba(0,0,0,0.58)
                      ),
                      url(${event.cover_url})
                    `,
                  }}
                />
              )}

              <div style={body}>
                <h2 style={eventTitle}>
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

                <div style={meta}>
                  <div style={metaItem}>
                    <Clock size={14} />

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
                        size={14}
                      />

                      {
                        event.location
                      }
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}

          {!events.length && (
            <div style={emptyBox}>
              No hay eventos
              publicados todavía.
            </div>
          )}
        </section>
      </main>
    </SocioShell>
  );
}

function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleString("es-UY");
}

const page: React.CSSProperties = {
  width: "100%",
  maxWidth: 1280,
  margin: "0 auto",
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 28,
};

const heroIcon: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 22,
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
  margin: "6px 0 0",
  color: "#9B9B9B",
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
  borderRadius: 26,
  overflow: "hidden",
};

const image: React.CSSProperties = {
  height: 190,
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const body: React.CSSProperties = {
  padding: 18,
};

const eventTitle: React.CSSProperties = {
  margin: 0,
  color: "#FFFFFF",
  fontSize: 24,
  fontWeight: 950,
};

const eventDescription: React.CSSProperties =
  {
    margin: "10px 0 0",
    color: "#B9B9B9",
    lineHeight: 1.5,
    fontSize: 14,
  };

const meta: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 18,
};

const metaItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#8BE000",
  fontWeight: 700,
  fontSize: 13,
};

const emptyBox: React.CSSProperties = {
  gridColumn: "1 / -1",
  background: "#101010",
  borderRadius: 24,
  padding: 30,
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