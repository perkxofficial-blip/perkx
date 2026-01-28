'use client';

import { useRef } from 'react';

export default function OtpInput() {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const length = 6;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const key = e.key;
    const input = inputsRef.current[index];

    if (!input) return;

    if (key === 'Backspace') {
      e.preventDefault();

      if (input.value) {
        input.value = '';
      } else if (index > 0) {
        const prevInput = inputsRef.current[index - 1];
        if (prevInput) {
          prevInput.value = '';
          prevInput.focus();
        }
      }
      return;
    }

    if (
      key === 'Tab' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight'
    ) {
      return;
    }

    if (!/^\d$/.test(key)) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    input.value = key;

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, '');

    e.target.value = value;

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const data = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);

    data.split('').forEach((char, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = char;
      }
    });

    inputsRef.current[data.length - 1]?.focus();
  };

  return (
    <div style={{ display: 'inline-flex', gap: 10 }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          name="numbers[]"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete="one-time-code"
          onKeyDown={(e) => handleKeyDown(e, i)}
          onChange={(e) => handleChange(e, i)}
          onPaste={handlePaste}
          style={{
            width: 44.5,
            height: 50,
            textAlign: 'center',
            fontSize: 20,
            border: 'none',
            borderBottom: '1px solid #c7d2fe',
            outline: 'none',
          }}
        />
      ))}
    </div>
  );
}
