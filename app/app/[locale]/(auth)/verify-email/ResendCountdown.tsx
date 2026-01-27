'use client';

import { useEffect, useState } from 'react';

interface Props {
  expiredAt: string;
  btnText: string;
}

export default function ResendCountdown({ expiredAt, btnText }: Props) {
  const expiredTime =
    new Date(expiredAt).getTime() + 60 * 1000;

  const getRemaining = () =>
    Math.max(0, Math.floor((expiredTime - Date.now()) / 1000));

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiredAt]);

  const isDisabled = remaining > 0;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div>
      {isDisabled && (
        <p className='count-down'>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-login w-100 mb-4"
        disabled={isDisabled}
      >
        {btnText}
      </button>
    </div>
  );
}
