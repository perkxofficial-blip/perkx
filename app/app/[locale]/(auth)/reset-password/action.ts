'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
export async function resetAction(formData: FormData) {
  const cookieStore = await cookies();
  const payload = {
    token: formData.get('token')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? '',
    confirm_password: formData.get('confirm_password')?.toString() ?? '',
  };
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const result: any = await res.json()
  if (!res.ok) {
    if (result.statusCode === 400) {
      cookieStore.set(
        'login-message',
        JSON.stringify({
          status: false,
          message: result?.message
        }),
        {
          httpOnly: true,
          path: '/',
          maxAge: 5
        }
      )
      redirect(`/login`);
    }
    cookieStore.set(
      'reset',
      JSON.stringify({
        message: 'RESET_FAILED',
        old: payload,
        errors: result?.message ?? []
      }),
      {
        httpOnly: true,
        path: '/',
        maxAge: 10
      }
    );
    redirect(`/reset-password?token=${payload.token}`);
  }
  cookieStore.set(
    'login-message',
    JSON.stringify({
      status: true,
      message: 'message.reset_password_success',
    }),
    {
      httpOnly: true,
      path: '/',
      maxAge: 5
    }
  )
  redirect(`/login`);
}
