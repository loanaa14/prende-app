import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import PlanCheckoutButton from "@/components/PlanCheckoutButton";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

          <h1 className="prende-title">Planes y pagos</h1>

          <p className="prende-subtitle">
            Activá el plan del club para acceder a funciones comerciales,
            personalización avanzada y soporte interno.
          </p>
        </section>

        <section className="prende-section prende-grid-2">
          <PlanCard
            clubId={id}
            plan="esencial"
            title="Plan Esencial"
            price="$800 UYU / mes"
            text="Para clubes que quieren autogestionar socios, cuotas, invitaciones y registros internos."
          />

          <PlanCard
            clubId={id}
            plan="personalizado"
            title="Plan Personalizado"
            price="$1300 UYU / mes"
            text="Incluye personalización visual, carga de contenido y soporte directo."
          />
        </section>
      </div>
    </main>
  );
}

function PlanCard({
  clubId,
  plan,
  title,
  price,
  text,
}: {
  clubId: string;
  plan: "esencial" | "personalizado";
  title: string;
  price: string;
  text: string;
}) {
  return (
    <div className="prende-card">
      <span className="prende-pill">{plan}</span>

      <h2 className="prende-card-title mt-4">{title}</h2>

      <p className="mt-3 text-3xl font-extrabold">{price}</p>

      <p className="prende-card-text">{text}</p>

      <div className="mt-6">
        <PlanCheckoutButton clubId={clubId} plan={plan} />
      </div>

      <p className="prende-help">
        El pago se procesa mediante Mercado Pago Checkout Pro.
      </p>
    </div>
  );
}