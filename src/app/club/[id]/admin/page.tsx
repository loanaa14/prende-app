import Link from "next/link";
import {
  Boxes,
  CreditCard,
  Palette,
  Users,
  UserPlus,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import InternalHeader from "@/components/InternalHeader";
import { getClubTheme } from "@/lib/supabase/getClubTheme";

export default async function ClubAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: club } = await supabase
    .from("clubs")
    .select("name")
    .eq("id", id)
    .single();

  const theme = await getClubTheme(id);

  const cards = [
    {
      title: "Disponibilidad interna",
      text: "Registros privados, movimientos, historial y alertas internas.",
      href: `/club/${id}/inventory`,
      icon: Boxes,
      tag: "Inventario legal",
    },
    {
      title: "Cuotas sociales",
      text: "Estado de cuenta, cuotas pendientes y pagos internos.",
      href: `/club/${id}/fees`,
      icon: CreditCard,
      tag: "Estado de cuenta",
    },
    {
      title: "Invitaciones masivas",
      text: "Cargar emails, controlar socios activos y cupos disponibles.",
      href: `/club/${id}/bulk-invitations`,
      icon: UserPlus,
      tag: "Apertura del club",
    },
    {
      title: "Configuración visual",
      text: "Nombre visible, logo, colores y estilo dinámico por club.",
      href: `/club/${id}/settings`,
      icon: Palette,
      tag: "Personalización",
    },
    {
      title: "Socios e invitaciones",
      text: "Miembros, roles, invitaciones pendientes y accesos internos.",
      href: `/club/${id}`,
      icon: Users,
      tag: "Socios",
    },
    {
      title: "Planes y pagos",
      text: "Activar plan, registrar pagos y gestionar acceso comercial del club.",
      href: `/club/${id}/billing`,
      icon: CreditCard,
      tag: "Suscripción",
    },
    {
      title: "Estado del plan",
      text: "Ver plan activo, estado de suscripción y acceso premium del club.",
      href: `/club/${id}/subscription`,
      icon: CreditCard,
      tag: "Comercial",
    },
  ];

  return (
    <>
      <InternalHeader userEmail={user?.email || ""} />

      <main className="prende-page">
        <div className="prende-container">
          <Link href={`/club/${id}`} className="prende-back">
            <ArrowLeft size={16} />
            Volver al club
          </Link>

          <section
            className="prende-hero"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}22, #ffffff)`,
            }}
          >
            <div>
              <span className="prende-kicker">Administración privada</span>

              <h1 className="prende-title">
                {theme.name || club?.name || "Panel administrativo"}
              </h1>

              <p className="prende-subtitle">
                Herramientas internas para gestionar socios, cuotas, registros,
                comunicación y configuración del club sin venta pública.
              </p>
            </div>
          </section>

          <section className="prende-section prende-grid-2">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="prende-card prende-card-hover prende-feature-card"
                >
                  <div
                    className="prende-icon-box"
                    style={{ backgroundColor: `${theme.primary}22` }}
                  >
                    <Icon size={22} color={theme.primary} />
                  </div>

                  <div className="mt-5">
                    <span className="prende-pill">{card.tag}</span>

                    <h2 className="prende-card-title mt-4">{card.title}</h2>

                    <p className="prende-card-text">{card.text}</p>
                  </div>
                </Link>
              );
            })}

            <div className="prende-card prende-feature-card opacity-75">
              <div className="prende-icon-box">
                <MessageSquare size={22} />
              </div>

              <div className="mt-5">
                <span className="prende-pill">Próximo módulo</span>

                <h2 className="prende-card-title mt-4">Comunidad privada</h2>

                <p className="prende-card-text">
                  Avisos, publicaciones fijadas, destacados y comunicación
                  interna del club.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}