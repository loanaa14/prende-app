"use client";

import { useEffect, useRef, useState } from "react";

import SocioShell from "@/components/socio/SocioShell";

import { createClient } from "@/lib/supabase/client";

import {
  Camera,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

export default function PerfilPage() {
  const supabase = createClient();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [profile, setProfile] =
    useState<any>(null);

  const [membership, setMembership] =
    useState<any>(null);

  const [avatarFile, setAvatarFile] =
    useState<File | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const [profileRes, membershipRes] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("memberships")
          .select(
            `
              *,
              clubs(name)
            `
          )
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle(),
      ]);

    setProfile(profileRes.data);

    setMembership(membershipRes.data);

    setFullName(
      profileRes.data?.full_name ||
        ""
    );

    setPhone(
      profileRes.data?.phone || ""
    );

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function uploadAvatar(
    file: File,
    userId: string
  ) {
    const fileName = `${userId}/${Date.now()}-${
      file.name
    }`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function saveProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setSaving(true);

    try {
      let avatarUrl =
        profile?.avatar_url || "";

      if (avatarFile) {
        avatarUrl =
          await uploadAvatar(
            avatarFile,
            user.id
          );
      }

      const { error } =
        await supabase
          .from("profiles")
          .update({
            full_name:
              fullName.trim(),

            phone:
              phone.trim(),

            avatar_url:
              avatarUrl || null,
          })
          .eq("id", user.id);

      if (error) {
        alert(error.message);

        setSaving(false);

        return;
      }

      await loadData();

      setSaving(false);

      alert(
        "Perfil actualizado."
      );
    } catch (err: any) {
      alert(err.message);

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SocioShell>
        <div style={loadingBox}>
          Cargando perfil...
        </div>
      </SocioShell>
    );
  }

  const club = Array.isArray(
    membership?.clubs
  )
    ? membership?.clubs[0]
    : membership?.clubs;

  return (
    <SocioShell>
      <main style={page}>
        <header style={header}>
          <div style={heroIcon}>
            <User size={26} />
          </div>

          <div>
            <h1 style={title}>
              Mi perfil
            </h1>

            <p style={subtitle}>
              Gestioná tu información
              personal y membresía.
            </p>
          </div>
        </header>

        <section style={grid}>
          <div style={leftColumn}>
            <div style={profileCard}>
              <div style={avatarSection}>
                <div
                  style={{
                    ...avatar,
                    backgroundImage:
                      profile?.avatar_url
                        ? `url(${profile.avatar_url})`
                        : undefined,
                  }}
                >
                  {!profile?.avatar_url &&
                    (
                      fullName ||
                      "S"
                    )
                      .slice(0, 1)
                      .toUpperCase()}
                </div>

                <button
                  style={
                    uploadButton
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <Camera
                    size={16}
                  />

                  Cambiar foto
                </button>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/*"
                  style={{
                    display:
                      "none",
                  }}
                  onChange={(e) =>
                    setAvatarFile(
                      e.target
                        .files?.[0] ||
                        null
                    )
                  }
                />
              </div>

              <div style={form}>
                <div style={field}>
                  <label
                    style={label}
                  >
                    Nombre
                  </label>

                  <div
                    style={
                      inputWrapper
                    }
                  >
                    <User
                      size={16}
                    />

                    <input
                      value={
                        fullName
                      }
                      onChange={(
                        e
                      ) =>
                        setFullName(
                          e
                            .target
                            .value
                        )
                      }
                      style={
                        input
                      }
                    />
                  </div>
                </div>

                <div style={field}>
                  <label
                    style={label}
                  >
                    Email
                  </label>

                  <div
                    style={
                      disabledInput
                    }
                  >
                    <Mail
                      size={16}
                    />

                    {
                      profile?.email
                    }
                  </div>
                </div>

                <div style={field}>
                  <label
                    style={label}
                  >
                    Teléfono
                  </label>

                  <div
                    style={
                      inputWrapper
                    }
                  >
                    <Phone
                      size={16}
                    />

                    <input
                      value={
                        phone
                      }
                      onChange={(
                        e
                      ) =>
                        setPhone(
                          e
                            .target
                            .value
                        )
                      }
                      style={
                        input
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={
                    saveProfile
                  }
                  disabled={
                    saving
                  }
                  style={
                    saveButton
                  }
                >
                  {saving
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>

          <div style={rightColumn}>
            <div style={membershipCard}>
              <div
                style={
                  membershipHeader
                }
              >
                <ShieldCheck
                  size={20}
                />

                Membresía
              </div>

              <div style={infoRow}>
                <span
                  style={
                    infoLabel
                  }
                >
                  Club
                </span>

                <span
                  style={
                    infoValue
                  }
                >
                  {club?.name ||
                    "-"}
                </span>
              </div>

              <div style={infoRow}>
                <span
                  style={
                    infoLabel
                  }
                >
                  Estado
                </span>

                <span
                  style={
                    activeBadge
                  }
                >
                  Activa
                </span>
              </div>

              <div style={infoRow}>
                <span
                  style={
                    infoLabel
                  }
                >
                  Rol
                </span>

                <span
                  style={
                    infoValue
                  }
                >
                  Socio
                </span>
              </div>
            </div>

            <div style={membershipCard}>
              <div
                style={
                  membershipHeader
                }
              >
                <CreditCard
                  size={20}
                />

                QR privado
              </div>

              <div style={qrBox}>
                QR próximamente
              </div>

              <p style={qrText}>
                Este código permitirá
                validar retiros y acceso
                rápido en el club.
              </p>
            </div>
          </div>
        </section>
      </main>
    </SocioShell>
  );
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
    "1.3fr 0.7fr",
  gap: 22,
};

const leftColumn: React.CSSProperties =
  {
    display: "grid",
  };

const rightColumn: React.CSSProperties =
  {
    display: "grid",
    gap: 20,
    alignContent: "start",
  };

const profileCard: React.CSSProperties =
  {
    background: "#101010",
    border:
      "1px solid rgba(255,255,255,0.06)",
    borderRadius: 30,
    padding: 26,
  };

const avatarSection: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 30,
  };

const avatar: React.CSSProperties = {
  width: 110,
  height: 110,
  borderRadius: 999,
  background:
    "linear-gradient(135deg, #8BE000, #5EA000)",
  color: "#050505",
  fontWeight: 950,
  fontSize: 34,
  display: "grid",
  placeItems: "center",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const uploadButton: React.CSSProperties =
  {
    height: 46,
    borderRadius: 16,
    border:
      "1px solid rgba(255,255,255,0.08)",
    background: "#0B0B0B",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 18px",
    cursor: "pointer",
    fontWeight: 700,
  };

const form: React.CSSProperties = {
  display: "grid",
  gap: 18,
};

const field: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const label: React.CSSProperties = {
  color: "#B8B8B8",
  fontSize: 14,
  fontWeight: 700,
};

const inputWrapper: React.CSSProperties =
  {
    height: 56,
    borderRadius: 18,
    background: "#0B0B0B",
    border:
      "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 18px",
    color: "#8BE000",
  };

const disabledInput: React.CSSProperties =
  {
    ...inputWrapper,
    color: "#FFFFFF",
  };

const input: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#FFFFFF",
  fontSize: 15,
};

const saveButton: React.CSSProperties =
  {
    marginTop: 10,
    height: 56,
    borderRadius: 18,
    border: "none",
    background: "#8BE000",
    color: "#050505",
    fontWeight: 950,
    fontSize: 15,
    cursor: "pointer",
  };

const membershipCard: React.CSSProperties =
  {
    background: "#101010",
    border:
      "1px solid rgba(255,255,255,0.06)",
    borderRadius: 28,
    padding: 24,
  };

const membershipHeader: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#FFFFFF",
    fontWeight: 900,
    marginBottom: 22,
  };

const infoRow: React.CSSProperties = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const infoLabel: React.CSSProperties =
  {
    color: "#8B8B8B",
  };

const infoValue: React.CSSProperties =
  {
    color: "#FFFFFF",
    fontWeight: 800,
  };

const activeBadge: React.CSSProperties =
  {
    background:
      "rgba(139,224,0,0.12)",
    color: "#8BE000",
    borderRadius: 999,
    padding: "8px 14px",
    fontWeight: 900,
    fontSize: 12,
  };

const qrBox: React.CSSProperties = {
  height: 220,
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(139,224,0,0.18), rgba(139,224,0,0.05))",
  border:
    "1px solid rgba(139,224,0,0.18)",
  display: "grid",
  placeItems: "center",
  color: "#8BE000",
  fontWeight: 950,
  fontSize: 24,
};

const qrText: React.CSSProperties = {
  margin: "16px 0 0",
  color: "#8B8B8B",
  lineHeight: 1.5,
};

const loadingBox: React.CSSProperties =
  {
    background: "#101010",
    borderRadius: 22,
    padding: 24,
    color: "#FFFFFF",
  };