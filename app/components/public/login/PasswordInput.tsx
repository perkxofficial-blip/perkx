'use client';

import { useState } from 'react';
import Image from "next/image";

interface Props {
  label: string;
  placeholder: string;
}

export default function PasswordInput({ label, placeholder }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-3 position-relative">
      <label htmlFor="password" className="form-label">
        {label}
      </label>

      <input
        id="password"
        name="password"
        type={show ? 'text' : 'password'}
        className="form-control pe-5"
        placeholder={placeholder}
        autoComplete="current-password"
      />

      <button
        type="button"
        className="password-toggle"
        aria-label={show ? 'Hide password' : 'Show password'}
        onClick={() => setShow(!show)}
      >
        <Image
          src={show ? '/images/eye-off.svg' : '/images/eye-line.svg'}
          alt={show ? 'Hide password' : 'Show password'}
          width={20}
          height={20}
          priority={false}
        />
      </button>
    </div>
  );
}
