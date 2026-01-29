'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
export async function forgotPasswordAction(formData: FormData) {
  const cookieStore = await cookies();
  const payload = {
    email: formData.get('email')?.toString() ?? '',
  };
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  console.log(res.json())

  const message = res.ok ? {
    status: true,
    message: 'message.forgot_email_success',
  } : {
    status: false,
    message: 'message.forgot_email_failed',
  }
  cookieStore.set(
    'forgot-password-message',
    JSON.stringify(message),
    {
      httpOnly: true,
      path: '/',
      maxAge: 5
    }
  );

  redirect(`/forgot-password`);
}
