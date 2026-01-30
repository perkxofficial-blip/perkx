'use client';

import { useState } from 'react';
import Image from "next/image";

interface Props {
  name: string;
  label: string;
  placeholder: string;
  error: any;
}

export default function PasswordInput({name, label, placeholder, error = null }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-3 position-relative">
      <label htmlFor={`${name}-input`} className="form-label">
        {label}
      </label>

      <input
        id={`${name}-input`}
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        autoComplete="current-password"
        className={`form-control ${error ? 'is-invalid' : ''}`}
        defaultValue=""
      />

      <div
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
      </div>
      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
