'use client'

import { useRef, useState, useEffect } from 'react'

export default function OtpInputWithSubmit({
                                             submitLabel = 'Verify'
                                           }: {
  submitLabel?: string
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const length = 6
  const [canSubmit, setCanSubmit] = useState(false)

  const checkFilled = () => {
    const filled =
      inputsRef.current.length === length &&
      inputsRef.current.every(
        (input) => input && input.value !== ''
      )

    setCanSubmit(filled)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const key = e.key
    const input = inputsRef.current[index]
    if (!input) return

    if (key === 'Backspace') {
      e.preventDefault()

      if (input.value) {
        input.value = ''
      } else if (index > 0) {
        const prev = inputsRef.current[index - 1]
        if (prev) {
          prev.value = ''
          prev.focus()
        }
      }

      checkFilled()
      return
    }

    if (key === 'Tab' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return
    }

    if (!/^\d$/.test(key)) {
      e.preventDefault()
      return
    }

    e.preventDefault()
    input.value = key

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }

    checkFilled()
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, '')
    e.target.value = value

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }

    checkFilled()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()

    const data = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)

    data.split('').forEach((char, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = char
      }
    })

    inputsRef.current[data.length - 1]?.focus()
    checkFilled()
  }

  return (
    <div>
      <div className="justify-content-center text-center otp-input">
        <div style={{ display: 'inline-flex', gap: 10, marginBottom: 24 }}>
          {Array.from({ length }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el
              }}
              type="text"
              name="numbers[]"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete="one-time-code"
              onKeyDown={(e) => handleKeyDown(e, i)}
              onChange={(e) => handleChange(e, i)}
              onPaste={handlePaste}
            />
          ))}
        </div>
      </div>
      <div className="btn-otp-submit">
        <button
          type="submit"
          className="btn btn-login w-100"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
