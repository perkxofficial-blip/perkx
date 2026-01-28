'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
export async function loginAction(formData: FormData) {
  const payload = {
    email: formData.get('email')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? null,
  };
  const cookieStore = await cookies();
  cookieStore.delete('login')
  cookieStore.delete('verify-email')

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const result: any = await res.json()
console.log(result)
  if (!res.ok) {
    const status = result?.statusCode;
    const isValidationError = status === 400;
    const loginPayload = {
      message: isValidationError ? '' : result?.message ?? '',
      old: payload,
      errors: isValidationError ? result?.message ?? [] : [],
    };
    cookieStore.set(
      'login',
      JSON.stringify(loginPayload),
      {
        httpOnly: true,
        path: '/',
        maxAge: 5, // flash cookie
      },
    );
    redirect('/login');
  }

  if (result?.data?.verify) {
    redirect('/verify-otp');
  } else {
    cookieStore.set(
      'verify-email',
      payload.email,
      {
        httpOnly: true,
        path: '/',
      },
    );
    redirect(`/verify-email?token=${result?.data?.token}`);
  }
}
