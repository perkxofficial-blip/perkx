'use client'

import { useEffect, useState, useRef } from 'react'
import { useFormStatus } from 'react-dom'

interface Props {
  label: string
  watch: string[]
}

export default function SubmitButton({ label, watch }: Props) {
  const { pending } = useFormStatus()
  const [disabled, setDisabled] = useState(true)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    const form = button?.closest('form')
    if (!form || !watch.length) return

    const getInputs = (name: string) =>
      Array.from(
        form.querySelectorAll<HTMLInputElement>(`[name="${name}"]`)
      )

    const isEmpty = (input: HTMLInputElement) => {
      if (input.type === 'number') {
        return input.value === ''
      }
      return !input.value || !input.value.trim()
    }

    const check = () => {
      const hasEmpty = watch.some((name) => {
        const inputs = getInputs(name)
        if (!inputs.length) return true

        if (name.endsWith('[]')) {
          return inputs.some(isEmpty)
        }

        return isEmpty(inputs[0])
      })

      setDisabled(hasEmpty)
    }

    check()

    const listeners: HTMLInputElement[] = []
    watch.forEach((name) => {
      getInputs(name).forEach((input) => {
        listeners.push(input)
        input.addEventListener('input', check)
        input.addEventListener('change', check)
      })
    })

    return () => {
      listeners.forEach((input) => {
        input.removeEventListener('input', check)
        input.removeEventListener('change', check)
      })
    }
  }, [watch])

  return (
    <button
      ref={buttonRef}
      type="submit"
      className="btn btn-login w-100 mb-4"
      disabled={pending || disabled}
    >
      {pending ? (
        <>
          {label}{' '}
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
        </>
      ) : (
        label
      )}
    </button>
  )
}
