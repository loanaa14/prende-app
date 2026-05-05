import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const formData = await req.formData()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const role = String(formData.get('role') ?? 'socio').trim()

  if (!email || !['socio', 'admin'].includes(role)) {
    return NextResponse.redirect(
      new URL(`/club/${id}?error=invalid_invitation`, req.url)
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (profile) {
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('id')
      .eq('club_id', id)
      .eq('user_id', profile.id)
      .maybeSingle()

    if (existingMembership) {
      return NextResponse.redirect(
        new URL(`/club/${id}?error=already_member`, req.url)
      )
    }
  }

  const { data: existingInvitation } = await supabase
    .from('invitations')
    .select('id')
    .eq('club_id', id)
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingInvitation) {
    return NextResponse.redirect(
      new URL(`/club/${id}?error=invitation_already_pending`, req.url)
    )
  }

  const { error: inviteError } = await supabase.from('invitations').insert({
    club_id: id,
    email,
    role,
    invited_by: user.id,
    status: 'pending',
  })

  if (inviteError) {
    const message = encodeURIComponent(inviteError.message)
    return NextResponse.redirect(
      new URL(`/club/${id}?error=create_invitation_failed&message=${message}`, req.url)
    )
  }

  return NextResponse.redirect(
    new URL(`/club/${id}?success=invitation_created`, req.url)
  )
}