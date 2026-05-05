import {
  createFee,
  markFeeAsPaid,
  getFees,
} from "./actions";
import Link from "next/link";
import { ArrowLeft, CreditCard, AlertCircle, CheckCircle } from "lucide-react";

export default async function FeesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fees = await getFees(id);

  const pending = fees.filter((f: any) => f.status === "pending");
  const paid = fees.filter((f: any) => f.status === "paid");

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

          <h1 className="prende-title">Cuotas sociales</h1>

          <p className="prende-subtitle">
            Registro interno de cuotas del club. Permite gestionar estado de cuenta,
            vencimientos y pagos de socios de forma privada.
          </p>
        </section>

        {pending.length > 0 && (
          <section className="prende-alert">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <strong>
                Hay {pending.length} cuota(s) pendiente(s) de regularización.
              </strong>
            </div>
          </section>
        )}

        <section className="prende-card mt-6">
          <h2 className="prende-section-title">Registrar cuota</h2>

          <form action={createFee} className="mt-5 space-y-4">
            <input type="hidden" name="club_id" value={id} />

            <div>
              <label className="prende-label">Socio</label>
              <input
                name="member_name"
                placeholder="Nombre del socio"
                required
                className="prende-input"
              />
            </div>

            <div className="prende-grid-3">
              <div>
                <label className="prende-label">Monto UYU</label>
                <input
                  name="amount"
                  type="number"
                  required
                  className="prende-input"
                />
              </div>

              <div>
                <label className="prende-label">Vencimiento</label>
                <input
                  name="due_date"
                  type="date"
                  className="prende-input"
                />
              </div>

              <div>
                <label className="prende-label">Notas</label>
                <input
                  name="notes"
                  placeholder="Ej: cuota abril"
                  className="prende-input"
                />
              </div>
            </div>

            <button className="prende-btn">Registrar cuota</button>
          </form>
        </section>

        <section className="prende-section">
          <h2 className="prende-section-title">Estado de cuenta</h2>

          {fees.length === 0 ? (
            <div className="prende-empty mt-4">
              No hay cuotas registradas.
            </div>
          ) : (
            <div className="mt-4 prende-grid">
              {fees.map((fee: any) => (
                <div key={fee.id} className="prende-card">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-lg">{fee.member_name}</p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="prende-pill">
                          ${fee.amount} UYU
                        </span>

                        <span
                          className={`prende-pill ${
                            fee.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {fee.status}
                        </span>
                      </div>

                      {fee.notes && (
                        <p className="mt-2 text-sm text-gray-600">
                          {fee.notes}
                        </p>
                      )}

                      {fee.due_date && (
                        <p className="text-xs text-gray-400 mt-2">
                          Vence:{" "}
                          {new Date(fee.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {fee.status === "pending" && (
                      <form action={markFeeAsPaid}>
                        <input type="hidden" name="id" value={fee.id} />
                        <input type="hidden" name="club_id" value={id} />

                        <button className="prende-btn-secondary flex items-center gap-2">
                          <CheckCircle size={16} />
                          Marcar como pagada
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}