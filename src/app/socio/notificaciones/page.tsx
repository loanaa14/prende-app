"use client";

import { useEffect, useState } from "react";

import SocioShell from "@/components/socio/SocioShell";

import { createClient } from "@/lib/supabase/client";

import {
  Bell,
  CalendarDays,
  CheckCheck,
  CreditCard,
  MessageCircle,
} from "lucide-react";

export default function NotificationsPage() {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(true);

  const [notifications, setNotifications] =
    useState<any[]>([]);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    setNotifications(data || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new,
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function markAllAsRead() {
    const unread = notifications.filter(
      (n) => !n.is_read
    );

    if (!unread.length) return;

    await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .in(
        "id",
        unread.map((n) => n.id)
      );

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
      }))
    );
  }

  if (loading) {
    return (
      <SocioShell>
        <div style={loadingBox}>
          Cargando notificaciones...
        </div>
      </SocioShell>
    );
  }

  return (
    <SocioShell>
      <main style={page}>
        <header style={header}>
          <div style={titleRow}>
            <div style={heroIcon}>
              <Bell size={26} />
            </div>

            <div>
              <h1 style={title}>
                Notificaciones
              </h1>

              <p style={subtitle}>
                Avisos importantes y
                actividad reciente.
              </p>
            </div>
          </div>

          <button
            onClick={
              markAllAsRead
            }
            style={readButton}
          >
            <CheckCheck
              size={16}
            />
            Marcar todas
          </button>
        </header>

        <section style={list}>
          {notifications.map(
            (notification) => (
              <article
                key={
                  notification.id
                }
                style={
                  notification.is_read
                    ? cardRead
                    : card
                }
              >
                <div
                  style={
                    iconWrapper
                  }
                >
                  {getIcon(
                    notification.type
                  )}
                </div>

                <div style={body}>
                  <div
                    style={
                      topRow
                    }
                  >
                    <h2
                      style={
                        notificationTitle
                      }
                    >
                      {
                        notification.title
                      }
                    </h2>

                    {!notification.is_read && (
                      <div
                        style={
                          unreadDot
                        }
                      />
                    )}
                  </div>

                  <p
                    style={
                      notificationMessage
                    }
                  >
                    {
                      notification.message
                    }
                  </p>

                  <p
                    style={
                      notificationDate
                    }
                  >
                    {formatDate(
                      notification.created_at
                    )}
                  </p>
                </div>
              </article>
            )
          )}

          {!notifications.length && (
            <div style={emptyBox}>
              No tenés
              notificaciones todavía.
            </div>
          )}
        </section>
      </main>
    </SocioShell>
  );
}

function getIcon(
  type: string
) {
  switch (type) {
    case "payment":
      return (
        <CreditCard
          size={20}
        />
      );

    case "event":
      return (
        <CalendarDays
          size={20}
        />
      );

    case "community":
      return (
        <MessageCircle
          size={20}
        />
      );

    default:
      return (
        <Bell size={20} />
      );
  }
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
  maxWidth: 1150,
  margin: "0 auto",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom: 28,
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
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

const readButton: React.CSSProperties = {
  height: 48,
  borderRadius: 16,
  border:
    "1px solid rgba(255,255,255,0.08)",
  background: "#101010",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "0 18px",
  cursor: "pointer",
  fontWeight: 800,
};

const list: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const card: React.CSSProperties = {
  background: "#101010",
  border:
    "1px solid rgba(139,224,0,0.16)",
  borderRadius: 26,
  padding: 20,
  display: "flex",
  gap: 18,
};

const cardRead: React.CSSProperties = {
  ...card,
  opacity: 0.72,
  border:
    "1px solid rgba(255,255,255,0.06)",
};

const iconWrapper: React.CSSProperties =
  {
    width: 52,
    height: 52,
    borderRadius: 18,
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  };

const body: React.CSSProperties = {
  flex: 1,
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
};

const notificationTitle: React.CSSProperties =
  {
    margin: 0,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: 900,
  };

const unreadDot: React.CSSProperties =
  {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#8BE000",
  };

const notificationMessage: React.CSSProperties =
  {
    margin: "10px 0 0",
    color: "#B8B8B8",
    lineHeight: 1.5,
  };

const notificationDate: React.CSSProperties =
  {
    margin: "14px 0 0",
    color: "#8B8B8B",
    fontSize: 13,
  };

const emptyBox: React.CSSProperties =
  {
    background: "#101010",
    borderRadius: 24,
    padding: 28,
    textAlign: "center",
    color: "#8B8B8B",
  };

const loadingBox: React.CSSProperties =
  {
    background: "#101010",
    borderRadius: 22,
    padding: 24,
    color: "#FFFFFF",
  };