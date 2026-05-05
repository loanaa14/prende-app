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

  if (!email) {
    return NextResponse.redirect(
      new URL(`/club/${id}?error=user_not_found`, req.url)
    )
  }

  if (!['socio', 'admin'].includes(role)) {
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

  const { data: foundProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (!foundProfile) {
    return NextResponse.redirect(
      new URL(`/club/${id}?error=user_not_found`, req.url)
    )
  }

  const { data: existingMembership } = await supabase
    .from('memberships')
    .select('id')
    .eq('club_id', id)
    .eq('user_id', foundProfile.id)
    .maybeSingle()

  if (existingMembership) {
    return NextResponse.redirect(
      new URL(`/club/${id}?error=already_member`, req.url)
    )
  }

  const { error: insertError } = await supabase.from('memberships').insert({
    user_id: foundProfile.id,
    club_id: id,
    role,
    status: 'active',
  })

  if (insertError) {
    const message = encodeURIComponent(insertError.message)
    return NextResponse.redirect(
      new URL(`/club/${id}?error=create_membership&message=${message}`, req.url)
    )
  }

  return NextResponse.redirect(
    new URL(`/club/${id}?success=member_created`, req.url)
  )
}