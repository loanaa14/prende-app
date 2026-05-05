import Link from "next/link";

export default function PlanGate({
  clubId,
  title = "Función disponible con plan activo",
  text = "Para usar esta sección, el club necesita tener un plan activo.",
}: {
  clubId: string;
  title?: string;
  text?: string;
}) {
  return (
    <main className="prende-page">
      <div className="prende-container">
        <div className="prende-card">
          <span className="prende-pill">Plan requerido</span>

          <h1 className="prende-title">{title}</h1>

          <p className="prende-subtitle">{text}</p>

          <div className="mt-6 flex gap-3">
            <Link href={`/club/${clubId}/billing`} className="prende-btn">
              Ver planes
            </Link>

            <Link href={`/club/${clubId}/admin`} className="prende-btn-secondary">
              Volver al panel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}