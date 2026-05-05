import Link from "next/link";
import { ArrowLeft, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClubSettings, upsertClubSettings } from "./actions";
import { getClubSubscription } from "@/lib/getClubSubscription";

export default async function ClubSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const settings = await getClubSettings(id);
  const subscription = await getClubSubscription(id);

  const { data: club } = await supabase
    .from("clubs")
    .select("name")
    .eq("id", id)
    .single();

  const displayName = settings?.display_name || club?.name || "Nombre del club";
  const logoUrl = settings?.logo_url || "";
  const primaryColor = settings?.primary_color || "#76A889";
  const secondaryColor = settings?.secondary_color || "#1E293B";

  if (!subscription.isPersonalizado) {
  return (
    <main className="prende-page">
      <div className="prende-container">
        <div className="prende-card">
          <span className="prende-pill">Plan Personalizado</span>

          <h1 className="prende-title">Personalización avanzada</h1>

          <p className="prende-subtitle">
            Logo, colores e identidad visual avanzada están disponibles para el
            Plan Personalizado.
          </p>

          <div className="mt-6 flex gap-3">
            <a href={`/club/${id}/billing`} className="prende-btn">
              Activar plan
            </a>

            <a href={`/club/${id}/admin`} className="prende-btn-secondary">
              Volver al panel
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

  return (
    <main className="prende-page">
      <div className="prende-container">
        <Link href={`/club/${id}/admin`} className="prende-back">
          <ArrowLeft size={16} />
          Volver al panel administrativo
        </Link>

        <section
          className="prende-hero"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}22, #ffffff)`,
          }}
        >
          <div
            className="prende-icon-box"
            style={{ backgroundColor: `${primaryColor}22` }}
          >
            <Palette size={22} color={primaryColor} />
          </div>

          <h1 className="prende-title">Configuración visual</h1>

          <p className="prende-subtitle">
            Personalizá la identidad privada del club: nombre visible, logo y
            colores. La configuración es dinámica y no afecta a otros clubes.
          </p>
        </section>

        <div className="prende-section prende-grid-2">
          <section className="prende-card">
            <h2 className="prende-section-title">Branding del club</h2>

            <p className="prende-card-text">
              Esta sección es especialmente útil para el Plan Personalizado.
            </p>

            <form action={upsertClubSettings} className="mt-6 space-y-4">
              <input type="hidden" name="club_id" value={id} />

              <div>
                <label className="prende-label">Nombre visible</label>
                <input
                  name="display_name"
                  defaultValue={displayName}
                  placeholder="Ej: Club Marimba"
                  className="prende-input"
                />
              </div>

              <div>
                <label className="prende-label">Logo URL</label>
                <input
                  name="logo_url"
                  defaultValue={logoUrl}
                  placeholder="https://..."
                  className="prende-input"
                />
                <p className="prende-help">
                  Por ahora usá una URL pública de imagen. Más adelante
                  conectamos Supabase Storage.
                </p>
              </div>

              <div className="prende-grid-2">
                <div>
                  <label className="prende-label">Color principal</label>
                  <input
                    name="primary_color"
                    type="color"
                    defaultValue={primaryColor}
                    className="h-12 w-full rounded-xl border"
                  />
                </div>

                <div>
                  <label className="prende-label">Color secundario</label>
                  <input
                    name="secondary_color"
                    type="color"
                    defaultValue={secondaryColor}
                    className="h-12 w-full rounded-xl border"
                  />
                </div>
              </div>

              <button className="prende-btn">Guardar configuración</button>
            </form>
          </section>

          <section className="prende-card">
            <h2 className="prende-section-title">Vista previa</h2>

            <div
              className="mt-6 rounded-3xl border p-6"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}18, #ffffff)`,
              }}
            >
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo del club"
                    className="h-14 w-14 rounded-2xl object-cover border"
                  />
                ) : (
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3
                    className="text-xl font-extrabold"
                    style={{ color: secondaryColor }}
                  >
                    {displayName}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Panel privado del club
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Socios
                </span>

                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: `${primaryColor}22`,
                    color: secondaryColor,
                  }}
                >
                  Cuotas
                </span>

                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    backgroundColor: `${primaryColor}22`,
                    color: secondaryColor,
                  }}
                >
                  Registros internos
                </span>
              </div>
            </div>

            <div className="prende-alert mt-6">
              Esta configuración es privada del club. No crea tienda, no expone
              contenido público y no habilita venta.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}