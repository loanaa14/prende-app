import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClub } from './actions'
import InternalHeader from '@/components/InternalHeader'
import Pricing from '@/components/Pricing'
import { getClubSubscription } from '@/lib/getClubSubscription'

type DashboardPageProps = {
  searchParams: Promise<{
    success?: string
    error?: string
  }>
}

type MembershipRow = {
  id: string
  club_id: string
  role: string
  status?: string | null
}

type ClubRow = {
  id: string
  name: string
  created_at?: string
}

type InvitationRow = {
  id: string
  club_id: string
  email: string
  role: string
  status: string
  clubs?: { name: string } | { name: string }[] | null
}

function getDashboardMessage(success?: string, error?: string) {
  if (success === 'invitation_accepted') {
    return { type: 'success' as const, text: 'Invitación aceptada correctamente.' }
  }

  if (error === 'club_limit_reached') {
    return { type: 'error' as const, text: 'Ya perteneces a un club.' }
  }

  if (error) {
    return { type: 'error' as const, text: 'Ocurrió un error.' }
  }

  return null
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { success, error } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userEmail = user.email?.toLowerCase() ?? ''

  const { data: memberships } = await supabase
    .from('memberships')
    .select('id, club_id, role, status')
    .eq('user_id', user.id)

  const membershipRows = (memberships ?? []) as MembershipRow[]
  const clubIds = membershipRows.map((m) => m.club_id)

  let clubs: ClubRow[] = []

  if (clubIds.length > 0) {
    const { data } = await supabase
      .from('clubs')
      .select('id, name, created_at')
      .in('id', clubIds)

    clubs = (data ?? []) as ClubRow[]
  }

  // 🔥 SUSCRIPCIÓN
  let subscription = null

  if (clubs.length > 0) {
    subscription = await getClubSubscription(clubs[0].id)
  }

  // 🔥 INVITACIONES
  const { data: invitationsData } = await supabase
    .from('invitations')
    .select(`
      id,
      club_id,
      email,
      role,
      status,
      clubs ( name )
    `)
    .eq('email', userEmail)
    .eq('status', 'pending')

  const invitations = (invitationsData ?? []) as InvitationRow[]

  const feedback = getDashboardMessage(success, error)
  const canCreateClub = membershipRows.length === 0

  return (
    <>
      <InternalHeader userEmail={userEmail} />

      <main className="min-h-screen bg-[#FBF9F6] p-8">
        <div className="mx-auto max-w-6xl">

          <h1 className="text-3xl font-bold text-[#1E293B]">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus clubes y accesos internos.
          </p>

          {/* 🔥 MENSAJES */}
          {feedback && (
            <div className="mt-6 rounded-xl border px-4 py-3 text-sm">
              {feedback.text}
            </div>
          )}

          {/* 🔥 ESTADO DEL PLAN */}
          {subscription && (
            <section className="mt-6 rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-[#1E293B]">
                Estado del plan
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {subscription.isActive
                  ? `Plan activo: ${subscription.plan}`
                  : "Sin plan activo"}
              </p>

              {!subscription.isActive && clubs[0] && (
                <div className="mt-4">
                  <Link
                    href={`/club/${clubs[0].id}/billing`}
                    className="rounded-lg bg-[#76A889] px-4 py-2 text-white"
                  >
                    Activar plan
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* 🔥 INVITACIONES */}
          {invitations.length > 0 && (
            <section className="mt-8 rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-semibold text-[#1E293B]">
                Invitaciones pendientes
              </h2>

              <div className="mt-4 space-y-3">
                {invitations.map((inv) => {
                  const clubName = Array.isArray(inv.clubs)
                    ? inv.clubs[0]?.name
                    : inv.clubs?.name

                  return (
                    <div key={inv.id} className="border p-4 rounded-xl">
                      <p className="font-semibold">{clubName}</p>

                      <form
                        action={`/invitations/${inv.id}/accept`}
                        method="post"
                      >
                        <button className="mt-2 bg-[#76A889] text-white px-4 py-2 rounded-lg">
                          Aceptar invitación
                        </button>
                      </form>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 🔥 CREAR CLUB */}
          {canCreateClub && (
            <section className="mt-8 rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-semibold text-[#1E293B]">
                Crear club
              </h2>

              <form action={createClub} className="mt-4 flex gap-2">
                <input
                  name="name"
                  placeholder="Nombre del club"
                  required
                  className="border px-4 py-2 rounded-lg"
                />

                <button className="bg-[#76A889] text-white px-4 py-2 rounded-lg">
                  Crear
                </button>
              </form>
            </section>
          )}

          {/* 🔥 CLUBES */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-[#1E293B]">
              Mis clubes
            </h2>

            {clubs.length === 0 ? (
              <div className="mt-4 border p-6 rounded-2xl">
                No perteneces a ningún club.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {clubs.map((club) => {
                  const membership = membershipRows.find(
                    (m) => m.club_id === club.id
                  )

                  return (
                    <div key={club.id} className="border p-6 rounded-2xl">
                      <h3 className="text-xl font-semibold">
                        {club.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Rol: {membership?.role}
                      </p>

                      <Link
                        href={`/club/${club.id}`}
                        className="mt-3 inline-block bg-[#76A889] text-white px-4 py-2 rounded-lg"
                      >
                        Entrar
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <Pricing />
        </div>
      </main>
    </>
  )
}