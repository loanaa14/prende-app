import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="prende-page">
      <section className="prende-container flex min-h-screen items-center">
        <div className="w-full">
          <div className="prende-kicker">Gestión privada para clubes</div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight text-[#1E293B] sm:text-6xl">
                Prendé
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                Plataforma interna para organizar socios, accesos, cuotas,
                disponibilidad interna y comunicación privada del club.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                No es e-commerce, no permite venta pública y no promueve
                consumo. Está pensada como herramienta administrativa privada
                para clubes registrados.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="prende-btn"
                >
                  {user ? "Ir al dashboard" : "Ingresar"}
                </Link>

                <a href="#enfoque" className="prende-btn-secondary">
                  Ver enfoque
                </a>
              </div>
            </div>

            <div className="prende-card">
              <div className="prende-pill">Panel interno</div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-[#EEF5F0] p-5">
                  <p className="text-sm font-bold">Disponibilidad interna</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Registros privados, movimientos y trazabilidad básica.
                  </p>
                </div>

                <div className="rounded-2xl border p-5">
                  <p className="text-sm font-bold">Cuotas sociales</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Estado de cuenta, pendientes e historial interno.
                  </p>
                </div>

                <div className="rounded-2xl border p-5">
                  <p className="text-sm font-bold">Comunidad privada</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Comunicación cerrada entre club y socios.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div id="enfoque" className="mt-20 prende-grid-3">
            <div className="prende-card">
              <h2 className="prende-card-title">Acceso privado</h2>
              <p className="prende-card-text">
                Solo usuarios autenticados y miembros del club acceden al
                panel interno.
              </p>
            </div>

            <div className="prende-card">
              <h2 className="prende-card-title">Gestión simple</h2>
              <p className="prende-card-text">
                Socios, roles, invitaciones, cuotas y registros internos desde
                una experiencia clara.
              </p>
            </div>

            <div className="prende-card">
              <h2 className="prende-card-title">Sin venta pública</h2>
              <p className="prende-card-text">
                La plataforma no incluye marketplace, tienda, carrito ni
                checkout público.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}