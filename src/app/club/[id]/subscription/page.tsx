import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { getClubSubscription } from "@/lib/getClubSubscription";

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subscription = await getClubSubscription(id);

  return (
    <main className="prende-page">
      <div className="prende-container">
        <Link href={`/club/${id}/admin`} className="prende-back">
          <ArrowLeft size={16} />
          Volver al panel administrativo
        </Link>

        <section className="prende-hero">
          <div className="prende-icon-box">
            <CreditCard size={22} />
          </div>

          <h1 className="prende-title">Estado del plan</h1>

          <p className="prende-subtitle">
            Control comercial del club: plan activo, estado de suscripción y
            acceso a funciones premium.
          </p>
        </section>

        <section className="prende-section prende-card">
          <span className="prende-pill">
            {subscription.isActive ? "Plan activo" : "Sin plan activo"}
          </span>

          <h2 className="prende-section-title mt-4">
            {subscription.plan
              ? `Plan ${subscription.plan}`
              : "El club todavía no tiene plan activo"}
          </h2>

          <p className="prende-card-text">
            {subscription.isActive
              ? "Este club tiene acceso habilitado según su plan."
              : "Para desbloquear funciones comerciales y premium, activá un plan."}
          </p>

          <div className="mt-6 flex gap-3">
            <Link href={`/club/${id}/billing`} className="prende-btn">
              Ver planes
            </Link>

            <Link href={`/club/${id}/admin`} className="prende-btn-secondary">
              Volver
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}