'use client'

export default function Pricing() {
  const handlePay = async (plan: string) => {
    const res = await fetch('/api/create-preference', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'No se pudo iniciar el pago')
      return
    }

    window.location.href = `https://www.mercadopago.com.uy/checkout/v1/redirect?pref_id=${data.id}`
  }

  return (
    <section className="mt-10">
      <div>
        <h2 className="text-2xl font-bold text-[#1E293B]">
          Planes
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Elegí cómo querés gestionar el sistema interno de tu club.
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#1E293B]">
            Plan Esencial
          </h3>

          <p className="mt-2 text-3xl font-bold text-[#1E293B]">
            $800
          </p>
          <p className="text-sm text-gray-500">
            UYU / mes
          </p>

          <p className="mt-4 text-sm text-gray-600">
            Para clubes que quieren gestionar todo por su cuenta.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>✔ Gestión de socios</li>
            <li>✔ Invitaciones privadas</li>
            <li>✔ Roles de admin y socio</li>
            <li>✔ Panel autogestionado</li>
            <li>✔ Límite legal de socios según normativa vigente</li>
          </ul>

          <button
            onClick={() => handlePay('esencial')}
            className="mt-6 w-full rounded-lg bg-[#76A889] px-4 py-2 text-white"
          >
            Elegir Plan Esencial
          </button>
        </div>

        <div className="rounded-2xl border-2 border-[#76A889] bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#1E293B]">
            Plan Personalizado
          </h3>

          <p className="mt-2 text-3xl font-bold text-[#1E293B]">
            $1300
          </p>
          <p className="text-sm text-gray-500">
            UYU / mes
          </p>

          <p className="mt-4 text-sm text-gray-600">
            Para clubes que quieren que nosotras configuremos y mantengamos el contenido visual.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>✔ Todo lo del Plan Esencial</li>
            <li>✔ Carga de contenido por nosotras</li>
            <li>✔ Personalización visual del club</li>
            <li>✔ Logo, colores y estilo adaptados</li>
            <li>✔ Soporte directo para ajustes internos</li>
          </ul>

          <p className="mt-4 text-xs text-gray-500">
            * La personalización se realiza dentro del sistema, sin afectar a otros clubes.
          </p>

          <button
            onClick={() => handlePay('personalizado')}
            className="mt-6 w-full rounded-lg bg-[#1E293B] px-4 py-2 text-white"
          >
            Contratar Plan Personalizado
          </button>
        </div>
      </div>
    </section>
  )
}