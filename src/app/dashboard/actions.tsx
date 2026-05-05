'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createClub(formData: FormData) {
  const supabase = await createClient()

  const name = String(formData.get('name') ?? '').trim()

  if (!name) {
    redirect('/dashboard?error=missing_club_name')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existingMemberships, error: existingMembershipsError } =
    await supabase
      .from('memberships')
      .select('id, club_id, role')
      .eq('user_id', user.id)

  if (existingMembershipsError) {
    redirect('/dashboard?error=club_check_failed')
  }

  if (existingMemberships && existingMemberships.length > 0) {
    redirect('/dashboard?error=club_limit_reached')
  }

  const { data: club, error: clubError } = await supabase
  .from('clubs')
  .insert({
    name,
    owner_id: user.id,
    created_by: user.id,
  })
  .select('id')
  .single()

  if (clubError || !club) {
  console.error("CREATE CLUB ERROR:", clubError)
  redirect('/dashboard?error=create_club_failed')
}

  const { error: membershipError } = await supabase.from('memberships').insert({
  club_id: club.id,
  user_id: user.id,
  role: 'admin',
})

  if (membershipError) {
    redirect('/dashboard?error=create_admin_membership_failed')
  }

  revalidatePath('/dashboard')
  redirect(`/club/${club.id}?success=club_created`)
}