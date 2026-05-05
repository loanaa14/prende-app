import {
  createProduct,
  deleteProduct,
  getProducts,
  registerMovement,
  getMovements,
} from "./actions";
import Link from "next/link";
import { Boxes, ArrowLeft, AlertTriangle, History } from "lucide-react";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getProducts(id);
  const movements = await getMovements(id);

  const lowStockProducts = products.filter(
    (product: any) =>
      Number(product.stock || 0) <= Number(product.low_stock_threshold || 5)
  );

  return (
    <main className="prende-page">
      <div className="prende-container">
        <Link href={`/club/${id}/admin`} className="prende-back">
          <ArrowLeft size={16} />
          Volver al panel administrativo
        </Link>

        <section className="prende-hero">
          <div className="prende-icon-box">
            <Boxes size={22} />
          </div>

          <h1 className="prende-title">Disponibilidad interna</h1>

          <p className="prende-subtitle">
            Registro privado del club para controlar ítems internos,
            cantidades referenciales, estados, movimientos y trazabilidad
            básica. No es tienda, no incluye checkout ni venta pública.
          </p>
        </section>

        {lowStockProducts.length > 0 && (
          <section className="prende-section prende-alert">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} />
              <div>
                <h2 className="font-bold">Alertas de cantidad baja</h2>
                <div className="mt-2 space-y-1">
                  {lowStockProducts.map((product: any) => (
                    <p key={product.id}>
                      {product.name}: cantidad actual {product.stock}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="prende-section prende-card">
          <h2 className="prende-section-title">Agregar registro interno</h2>
          <p className="prende-card-text">
            Usá nombres internos y notas administrativas. Evitá lenguaje de
            venta, precios públicos o checkout.
          </p>

          <form action={createProduct} className="mt-6 space-y-4">
            <input type="hidden" name="club_id" value={id} />

            <div>
              <label className="prende-label">Ítem interno</label>
              <input
                name="name"
                required
                placeholder="Ej: Registro interno 01"
                className="prende-input"
              />
            </div>

            <div className="prende-grid-4">
              <div>
                <label className="prende-label">Cantidad referencial</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="prende-input"
                />
              </div>

              <div>
                <label className="prende-label">Alerta desde cantidad</label>
                <input
                  name="low_stock_threshold"
                  type="number"
                  min="0"
                  defaultValue="5"
                  className="prende-input"
                />
              </div>

              <div>
                <label className="prende-label">Estado</label>
                <select name="status" className="prende-select">
                  <option value="disponible">Disponible</option>
                  <option value="no disponible">No disponible</option>
                  <option value="en revisión">En revisión</option>
                </select>
              </div>

              <div>
                <label className="prende-label">Categoría</label>
                <input
                  name="category"
                  placeholder="Semillas, plantas, insumos"
                  className="prende-input"
                />
              </div>
            </div>

            <div>
              <label className="prende-label">Notas internas</label>
              <textarea
                name="notes"
                placeholder="Observaciones privadas del club"
                className="prende-textarea"
                rows={3}
              />
            </div>

            <button className="prende-btn">Agregar registro</button>
          </form>
        </section>

        <section className="prende-section">
          <h2 className="prende-section-title">Registros internos</h2>

          {products.length === 0 ? (
            <div className="prende-empty mt-4">
              Todavía no hay registros internos.
            </div>
          ) : (
            <div className="mt-4 prende-grid">
              {products.map((product: any) => {
                const isLowStock =
                  Number(product.stock || 0) <=
                  Number(product.low_stock_threshold || 5);

                return (
                  <div
                    key={product.id}
                    className={`prende-card ${
                      isLowStock ? "border-red-300 bg-red-50" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-extrabold">
                            {product.name}
                          </h3>

                          <span className="prende-pill">
                            {product.status || "en revisión"}
                          </span>

                          {isLowStock && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              Requiere revisión
                            </span>
                          )}
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                          <p>Cantidad: {product.stock}</p>
                          <p>Alerta: {product.low_stock_threshold || 5}</p>
                          <p>Categoría: {product.category || "Sin categoría"}</p>
                        </div>

                        {product.notes && (
                          <p className="mt-3 text-sm text-gray-700">
                            {product.notes}
                          </p>
                        )}

                        <form
                          action={registerMovement}
                          className="mt-5 rounded-2xl border bg-[#FBF9F6] p-4"
                        >
                          <input type="hidden" name="club_id" value={id} />
                          <input
                            type="hidden"
                            name="product_id"
                            value={product.id}
                          />

                          <p className="text-sm font-bold">
                            Registrar movimiento interno
                          </p>

                          <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
                            <input
                              name="quantity"
                              type="number"
                              min="1"
                              placeholder="Cantidad"
                              className="prende-input"
                            />

                            <input
                              name="notes"
                              placeholder="Nota interna"
                              className="prende-input"
                            />

                            <button className="prende-btn">
                              Registrar salida
                            </button>
                          </div>
                        </form>
                      </div>

                      <form action={deleteProduct}>
                        <input type="hidden" name="club_id" value={id} />
                        <input
                          type="hidden"
                          name="product_id"
                          value={product.id}
                        />
                        <button className="prende-btn-danger">Eliminar</button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="prende-section">
          <div className="flex items-center gap-2">
            <History size={20} />
            <h2 className="prende-section-title">Historial de movimientos</h2>
          </div>

          {movements.length === 0 ? (
            <div className="prende-empty mt-4">
              No hay movimientos registrados.
            </div>
          ) : (
            <div className="mt-4 prende-grid">
              {movements.map((m: any) => (
                <div key={m.id} className="prende-card">
                  <p className="font-bold">
                    {m.products?.name || "Registro interno"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="prende-pill">Tipo: {m.type}</span>
                    <span className="prende-pill">
                      Cantidad: {m.quantity}
                    </span>
                  </div>

                  {m.notes && (
                    <p className="mt-3 text-sm text-gray-700">
                      Nota: {m.notes}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}