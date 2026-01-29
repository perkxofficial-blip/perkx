'use client';

import { useFormStatus } from 'react-dom';

interface Props {
  label: string;
}

export default function SubmitButton({ label }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn btn-login w-100 mb-4"
      disabled={pending}
    >
      {pending ? (
        <>
          {label} {' '}
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
  );
}
