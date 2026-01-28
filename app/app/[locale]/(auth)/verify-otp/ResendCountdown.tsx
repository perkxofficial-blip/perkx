'use client';

import { useEffect, useState } from 'react';

const COUNTDOWN = 60;

export default function ResendCountdown() {
  const [remaining, setRemaining] = useState(COUNTDOWN);

  useEffect(() => {
    if (remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((v) => v - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const locked = remaining > 0;

  return (
    <button
      type="submit"
      onClick={() => {
        if (!locked) {
          setRemaining(COUNTDOWN);
        }
      }}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        color: locked ? '#999' : '#1a73e8',
        cursor: locked ? 'default' : 'pointer',
        pointerEvents: locked ? 'none' : 'auto',
      }}
    >
      {locked
        ? `Resend in: ${minutes}:${seconds.toString().padStart(2, '0')}`
        : 'Resend'}
    </button>
  );
}
