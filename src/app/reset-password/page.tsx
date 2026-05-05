import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updatePassword } from './actions'

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

function getResetMessage(error?: string) {
  if (error === 'missing_password') {
    return 'Ingresa una nueva contraseña.'
  }

  if (error === 'weak_password') {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (error === 'update_failed') {
    return 'No se pudo actualizar la contraseña.'
  }

  if (error) {
    return 'Ocurrió un error. Intenta nuevamente.'
  }

  return null
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { error } = await searchParams
  const message = getResetMessage(error)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBF9F6] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white p-10 shadow-sm">
        <h1 className="text-center text-3xl font-bold text-[#1E293B]">
          Crear nueva contraseña
        </h1>

        <p className="mt-2 text-center text-sm text-gray-500">
          Ingresa una nueva contraseña para tu cuenta.
        </p>

        {message && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-4">
          <input
            name="password"
            type="password"
            required
            placeholder="Nueva contraseña"
            className="block w-full rounded-lg border px-4 py-3 text-[#1E293B]"
          />

          <button
            formAction={updatePassword}
            className="w-full rounded-lg bg-[#76A889] px-4 py-3 text-sm font-semibold text-white"
          >
            Guardar contraseña
          </button>
        </form>
      </div>
    </main>
  )
}