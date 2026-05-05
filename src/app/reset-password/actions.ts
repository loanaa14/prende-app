'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = String(formData.get('password') ?? '').trim()

  if (!password) {
    redirect('/reset-password?error=missing_password')
  }

  if (password.length < 6) {
    redirect('/reset-password?error=weak_password')
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    redirect('/reset-password?error=update_failed')
  }

  redirect('/login?success=password_updated')
}