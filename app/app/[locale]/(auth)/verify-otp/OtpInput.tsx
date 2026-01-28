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

    // Nếu là số → replace value
    if (/^\d$/.test(key)) {
      e.preventDefault();

      const input = inputsRef.current[index];
      if (!input) return;

      input.value = key;

      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
      return;
    }

    // Backspace
    if (key === 'Backspace') {
      const input = inputsRef.current[index];
      if (!input) return;

      if (input.value) {
        input.value = '';
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!data) return;

    data
      .split('')
      .slice(0, length)
      .forEach((char, i) => {
        if (inputsRef.current[i]) {
          inputsRef.current[i]!.value = char;
        }
      });

    inputsRef.current[Math.min(data.length, length) - 1]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          name="numbers[]"
          inputMode="numeric"
          maxLength={1}
          onKeyDown={(e) => handleKeyDown(e, i)}
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
