'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ClearFeedbackUrlProps = {
  delay?: number
}

export default function ClearFeedbackUrl({ delay = 3500 }: ClearFeedbackUrlProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(window.location.pathname)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [delay, router])

  return null
}