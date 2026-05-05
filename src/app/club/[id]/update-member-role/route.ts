import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const formData = await req.formData()
  const membershipId = String(formData.get('membership_id') ?? '').trim()
  const newRole = String(formData.get('role') ?? '').trim()

  if (!membershipId || !['socio', 'admin'].includes(newRole)) {
    return NextResponse.redirect(
      new URL(`/club/${id}?error=invalid_role`, req.url)
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const { data: currentMembership } = await supabase
    .from('memberships')
    .select('id, role')
    .eq('club_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!currentMembership || currentMembership.role !== 'admin') {
    return NextResponse.redirect(new URL(`/club/${id}?error=not_admin`, req.url))
  }

  const { data: targetMembership } = await supabase
    .from('memberships')
    .select('id, user_id, role')
    .eq('id', membershipId)
    .eq('club_id', id)
    .maybeSingle()

  if (!targetMembership) {
    return NextResponse.redirect(
      new URL(`/club/${id}?error=member_not_found`, req.url)
    )
  }

  if (targetMembership.role === 'admin' && newRole === 'socio') {
    const { count: adminCount } = await supabase
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', id)
      .eq('role', 'admin')

    if ((adminCount ?? 0) <= 1) {
      return NextResponse.redirect(
        new URL(`/club/${id}?error=cannot_downgrade_last_admin`, req.url)
      )
    }
  }

  const { error: updateError } = await supabase
    .from('memberships')
    .update({ role: newRole })
    .eq('id', membershipId)
    .eq('club_id', id)

  if (updateError) {
    const message = encodeURIComponent(updateError.message)
    return NextResponse.redirect(
      new URL(`/club/${id}?error=update_role_failed&message=${message}`, req.url)
    )
  }

  return NextResponse.redirect(
    new URL(`/club/${id}?success=role_updated`, req.url)
  )
}