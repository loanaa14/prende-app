'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '').trim()

  if (!email || !password) {
    redirect('/login?error=missing_fields')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=invalid_credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '').trim()

  if (!email || !password) {
    redirect('/login?error=missing_fields')
  }

  if (password.length < 6) {
    redirect('/login?error=weak_password')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    if (error.code === 'user_already_exists') {
      redirect('/login?error=user_already_exists')
    }

    redirect('/login?error=signup_failed')
  }

  if (!data.user) {
    redirect('/login?error=signup_failed')
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: data.user.id,
      email,
    },
    {
      onConflict: 'id',
    }
  )

  if (profileError) {
    redirect('/login?error=profile_create_failed')
  }

  revalidatePath('/', 'layout')

  if (!data.session) {
    redirect('/login?success=check_email')
  }

  redirect('/dashboard')
}

export async function sendPasswordReset(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!email) {
    redirect('/login?error=missing_email')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) {
    redirect('/login?error=password_reset_failed')
  }

  redirect('/login?success=password_reset_sent')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}