import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import InternalHeader from "@/components/InternalHeader";
import { getClubTheme } from "@/lib/supabase/getClubTheme";

export default async function ClubPage({ params }: any) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("club_id", params.id)
    .eq("user_id", user.id)
    .single();

  const theme = await getClubTheme(params.id);

  return (
    <>
      <InternalHeader userEmail={user.email || ""} />

      <main className="prende-page">
        <div className="prende-container space-y-8">
          <div>
            <h1 className="prende-title">
              {theme.name || club?.name || "Club"}
            </h1>

            <p className="prende-subtitle">
              Panel interno del club. Acceso privado para socios registrados.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span className="prende-pill">
                Rol: {membership?.role || "socio"}
              </span>

              <span className="prende-pill">
                Estado: {membership?.status || "active"}
              </span>
            </div>
          </div>

          <div className="prende-grid-2">
            <Link
              href={`/club/${params.id}/inventory`}
              className="prende-card prende-card-hover"
            >
              <p className="prende-card-title">Disponibilidad interna</p>
              <p className="prende-card-text">
                Inventario, movimientos, historial y alertas internas.
              </p>
            </Link>

            <Link
              href={`/club/${params.id}/fees`}
              className="prende-card prende-card-hover"
            >
              <p className="prende-card-title">Cuotas sociales</p>
              <p className="prende-card-text">
                Estado de cuenta, cuotas pendientes y pagos internos.
              </p>
            </Link>

            <Link
              href={`/club/${params.id}/settings`}
              className="prende-card prende-card-hover"
            >
              <p className="prende-card-title">
                Configuración del club
              </p>
              <p className="prende-card-text">
                Nombre visible, logo y colores del club.
              </p>
            </Link>

            <Link
              href={`/club/${params.id}/members`}
              className="prende-card prende-card-hover"
            >
              <p className="prende-card-title">
                Socios e invitaciones
              </p>
              <p className="prende-card-text">
                Gestión de miembros, roles e invitaciones privadas.
              </p>
            </Link>

            <Link
              href={`/club/${params.id}/bulk-invitations`}
              className="prende-card prende-card-hover"
            >
              <p className="prende-card-title">
                Apertura del club
              </p>
              <p className="prende-card-text">
                Invitaciones masivas y gestión de cupos disponibles.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}