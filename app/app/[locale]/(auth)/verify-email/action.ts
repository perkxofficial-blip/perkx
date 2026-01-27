'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
export async function resendAction(formData: FormData) {
  const cookieStore = await cookies();
  let token = formData.get('email')?.toString() ?? '';
  const payload = {
    email: formData.get('email')?.toString() ?? '',
  };
  const res = await fetch(`${API_BASE_URL}/auth/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const result: any = await res.json()
  token = res.ok ? result?.data?.token : token

  const message = res.ok ? {
    status: true,
    message: 'message.resend_email_success',
  } : {
    status: false,
    message: 'message.resend_email_failed',
  }
  cookieStore.set(
    'verify-email-message',
    JSON.stringify(message),
    {
      httpOnly: true,
      path: '/',
      maxAge: 10
    }
  );

  redirect(`/verify-email?token=${token}`);
}
