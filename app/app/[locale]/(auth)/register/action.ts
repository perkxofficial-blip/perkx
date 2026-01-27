'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
export async function registerAction(formData: FormData) {
  const payload = {
    email: formData.get('email')?.toString() ?? '',
    referral_user_id: formData.get('referral_uid')?.toString() ?? null,
  };
  const cookieStore = await cookies();
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        password: formData.get('password'),
        confirm_password: formData.get('confirm_password'),
      }),
    cache: 'no-store',
  });

  const result = await res.json();
  if (!res.ok) {
    cookieStore.set(
      'register',
      JSON.stringify({
        message: 'REGISTER_FAILED',
        old: payload,
        errors: result?.message ?? []
      }),
      {
        httpOnly: true,
        path: '/',
        maxAge: 5
      }
    );
    redirect('/register');
  }

  // 🎉 success
  (await cookies()).set('register_success', 'REGISTER_SUCCESS');
  redirect('/login');
}
