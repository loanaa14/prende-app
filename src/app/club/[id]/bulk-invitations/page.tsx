import {
  createBulkInvitations,
  getInvitationStats,
  getInvitations,
  cancelInvitation,
} from "./actions";

export default async function BulkInvitationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stats = await getInvitationStats(id);
  const invitations = await getInvitations(id);

  return (
    <div className="p-6 max-w-4xl">
      <a href={`/club/${id}/admin`} className="text-sm text-green-700">
        ← Volver al panel administrativo
      </a>

      <h1 className="text-2xl font-bold mt-4">Invitaciones masivas</h1>

      <p className="text-sm text-gray-600 mt-1">
        Herramienta privada para invitar socios por email respetando el límite
        de cupos del club.
      </p>

      <div className="grid md:grid-cols-4 gap-3 mt-6">
        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-600">Socios activos</div>
          <div className="text-2xl font-bold">{stats.activeMembers}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-600">Invitaciones pendientes</div>
          <div className="text-2xl font-bold">{stats.pendingInvitations}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-600">Máximo permitido</div>
          <div className="text-2xl font-bold">{stats.maxMembers}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-600">Cupos disponibles</div>
          <div className="text-2xl font-bold">{stats.availableSlots}</div>
        </div>
      </div>

      <form
        action={createBulkInvitations}
        className="border rounded-xl p-4 mt-6 space-y-4"
      >
        <input type="hidden" name="club_id" value={id} />

        <div>
          <label className="block text-sm font-medium">Emails</label>
          <textarea
            name="emails"
            rows={8}
            placeholder={`socio1@email.com\nsocio2@email.com\nsocio3@email.com`}
            className="w-full border rounded p-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Podés pegar emails separados por salto de línea, coma, punto y coma
            o espacio.
          </p>
        </div>

        <button
          disabled={stats.availableSlots <= 0}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Crear invitaciones
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">
          Invitaciones pendientes
        </h2>

        {invitations.length === 0 ? (
          <p className="text-sm text-gray-500">No hay invitaciones.</p>
        ) : (
          <div className="space-y-2">
            {invitations.map((inv: any) => (
              <div
                key={inv.id}
                className="border rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{inv.email}</div>
                  <div className="text-xs text-gray-500">
                    Estado: {inv.status}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(inv.created_at).toLocaleString()}
                  </div>
                </div>

                <form action={cancelInvitation}>
                  <input type="hidden" name="id" value={inv.id} />
                  <input type="hidden" name="club_id" value={id} />

                  <button className="text-red-600 text-sm">Cancelar</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats.availableSlots <= 0 && (
        <div className="border border-red-300 bg-red-50 rounded-xl p-4 mt-4 text-red-700 text-sm">
          El club alcanzó el máximo de cupos disponibles. No se pueden crear
          nuevas invitaciones.
        </div>
      )}
    </div>
  );
}