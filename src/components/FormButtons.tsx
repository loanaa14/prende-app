'use client'

import { useFormStatus } from 'react-dom'

type SubmitButtonProps = {
  children: React.ReactNode
  className?: string
}

export function SubmitButton({ children, className }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button disabled={pending} className={className}>
      {pending ? 'Procesando...' : children}
    </button>
  )
}

type ConfirmSubmitButtonProps = {
  children: React.ReactNode
  confirmMessage: string
  className?: string
}

export function ConfirmSubmitButton({
  children,
  confirmMessage,
  className,
}: ConfirmSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault()
        }
      }}
    >
      {pending ? 'Procesando...' : children}
    </button>
  )
}