'use server';

import { redirect } from 'next/navigation';
import {login} from "@/services/api/public/auth";
import {cookieUtil} from "@/lib/cookieUtil";
export async function loginAction(formData: FormData) {
  const payload = {
    email: formData.get('email')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? null,
  };
  await cookieUtil.delete(['login', 'register', 'verify-email'])
  const res = await login(payload)
  const result: any = await res.json()
  if (!res.ok) {
    const status = result?.statusCode;
    const isValidationError = status === 400;
    const errors = {
      message: isValidationError ? '' : result?.message ?? '',
      old: payload,
      errors: isValidationError ? result?.message ?? [] : [],
    };
    await cookieUtil.set('login', errors, {ttl: 10})
    redirect('/login');
  }
  await cookieUtil.set('verify-email', payload.email, {ttl: 30 * 60})
  if (result?.data?.verified) {
    redirect('/verify-otp');
  } else {
    redirect(`/verify-email?token=${result?.data?.token}`);
  }
}
