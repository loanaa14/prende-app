"use client";

import { use, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SocioShell from "@/components/socio/SocioShell";
import { MessageCircle, Send, User } from "lucide-react";

export default function MensajesSocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clubId } = use(params);
  const supabase = createClient();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  function formatTime(date: string) {
    return new Date(date).toLocaleString("es-UY", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadData() {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    setUser(currentUser);

    const { data: clubData } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .maybeSingle();

    setClub(clubData);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", currentUser.id)
      .maybeSingle();

    setProfile(profileData);

    const { data: messagesData } = await supabase
      .from("club_messages")
      .select("*")
      .eq("club_id", clubId)
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: true });

    setMessages(messagesData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [clubId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user || !content.trim()) return;

    setSending(true);

    const text = content.trim();

    const { error } = await supabase.from("club_messages").insert({
      club_id: clubId,
      user_id: user.id,
      sender_id: user.id,
      content: text,
      read_by_member: true,
      read_by_admin: false,
    });

    if (!error) {
      setContent("");
      await loadData();
    }

    setSending(false);
  }

  if (loading) {
    return (
      <SocioShell clubId={clubId}>
        <p>Cargando mensajes...</p>
      </SocioShell>
    );
  }

  const username = profile?.username || user?.email || "socio";

  return (
    <SocioShell clubId={clubId}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
                width: 52,
                height: 52,
                borderRadius: 18,
                background: "#76A889",
                color: "white",
                display: "grid",
                placeItems: "center",
              }}
            >
              <MessageCircle size={26} />
            </div>

            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                Mensajes privados
              </p>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>
                {club?.name ?? "Club"}
              </h1>
            </div>
          </div>

          <p style={{ marginTop: 14, color: "#6B7280", lineHeight: 1.5 }}>
            Canal privado para comunicarte con el club. Usalo para consultas
            administrativas, coordinación interna o seguimiento de solicitudes.
          </p>
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #E5E1DA",
            borderRadius: 32,
            overflow: "hidden",
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              padding: "18px 22px",
              borderBottom: "1px solid #E5E1DA",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#12372A",
                color: "white",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={username}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <User size={21} />
              )}
            </div>

            <div>
              <p style={{ margin: 0, fontWeight: 800 }}>@{username}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
                Conversación con el club
              </p>
            </div>
          </div>

          <div
            style={{
              minHeight: 360,
              maxHeight: 520,
              overflowY: "auto",
              padding: 22,
              background: "#FBF9F6",
              display: "grid",
              gap: 12,
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #E5E1DA",
                  borderRadius: 22,
                  padding: 20,
                  color: "#6B7280",
                  textAlign: "center",
                }}
              >
                Todavía no hay mensajes. Escribí una consulta para iniciar la
                conversación con el club.
              </div>
            )}

            {messages.map((message) => {
              const isMine = message.sender_id === user?.id;

              return (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "75%",
                      background: isMine ? "#76A889" : "white",
                      color: isMine ? "white" : "#172033",
                      border: isMine ? "1px solid #76A889" : "1px solid #E5E1DA",
                      borderRadius: isMine
                        ? "22px 22px 4px 22px"
                        : "22px 22px 22px 4px",
                      padding: "12px 14px",
                    }}
                  >
                    <p style={{ margin: 0, lineHeight: 1.45 }}>
                      {message.content}
                    </p>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: 11,
                        opacity: 0.75,
                        textAlign: "right",
                      }}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={sendMessage}
            style={{
              display: "flex",
              gap: 10,
              padding: 18,
              borderTop: "1px solid #E5E1DA",
              background: "white",
            }}
          >
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribir mensaje..."
              style={{
                flex: 1,
                padding: "13px 15px",
                borderRadius: 999,
                border: "1px solid #E5E1DA",
                background: "#FBF9F6",
                outline: "none",
                fontSize: 14,
              }}
            />

            <button
              type="submit"
              disabled={sending}
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                border: 0,
                background: "#12372A",
                color: "white",
                display: "grid",
                placeItems: "center",
                cursor: sending ? "not-allowed" : "pointer",
                flexShrink: 0,
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      </div>
    </SocioShell>
  );
}