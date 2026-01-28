'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
export async function verifyOtpAction(formData: FormData) {
  const cookieStore = await cookies();
  let token = formData.get('token')?.toString() ?? '';
  const numbers = formData.getAll('numbers[]') as string[];
  const otp = numbers.join('');
  const payload = {
    email: formData.get('email')?.toString() ?? '',
    otp: otp
  };
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    cookieStore.set(
      'verify-email-message',
      'message.verify_otp_failed',
      {
        httpOnly: true,
        path: '/',
        maxAge: 10
      }
    );
    redirect(`/verify-otp`);
  }

  const result: any = await res.json()
  cookieStore.set(
    'token',
    result?.data?.accessToken,
    {
      httpOnly: true,
      path: '/',
    }
  );
  redirect(`/user/profile`);
}

export async function resendOtpAction(formData: FormData) {
  const payload = {
    email: formData.get('email')?.toString() ?? '',
  };
  const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

}