import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const formData = await req.formData()
  const invitationId = String(formData.get('invitation_id') ?? '').trim()

  if (!invitationId) {
    return NextResponse.redirect(
      new URL(`/club/${id}?error=invitation_not_found`, req.url)
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

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'cancelled' })
    .eq('id', invitationId)
    .eq('club_id', id)
    .eq('status', 'pending')

  if (error) {
    const message = encodeURIComponent(error.message)
    return NextResponse.redirect(
      new URL(`/club/${id}?error=cancel_invitation_failed&message=${message}`, req.url)
    )
  }

  return NextResponse.redirect(
    new URL(`/club/${id}?success=invitation_cancelled`, req.url)
  )
}