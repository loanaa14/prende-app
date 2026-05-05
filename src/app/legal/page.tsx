export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#FBF9F6] p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-bold text-[#1E293B]">
          Términos y condiciones
        </h1>

        <section>
          <h2 className="text-xl font-semibold">Uso de la plataforma</h2>
          <p className="mt-2 text-gray-600">
            Prendé es una plataforma de gestión privada para clubes. No permite
            la venta pública de productos ni la promoción abierta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Responsabilidad</h2>
          <p className="mt-2 text-gray-600">
            Cada club es responsable del uso que haga de la plataforma y del
            cumplimiento de la normativa vigente en su país.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Privacidad</h2>
          <p className="mt-2 text-gray-600">
            Los datos ingresados son privados y solo accesibles dentro del club.
            No se comparten públicamente.
          </p>
        </section>
      </div>
    </main>
  )
}