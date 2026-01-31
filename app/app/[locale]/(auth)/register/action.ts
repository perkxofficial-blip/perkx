'use server';

import { redirect } from 'next/navigation';
import {cookieUtil} from "@/lib/cookieUtil";
import {register} from "@/services/api/public/auth";
export async function registerAction(formData: FormData) {
  const payload = {
    email: formData.get('email')?.toString() ?? '',
    referral_user_id: formData.get('referral_uid')?.toString() ?? null,
  };
  await cookieUtil.delete(['login', 'register', 'verify-email'])
  const res = await register({
    ...payload,
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  })

  const result = await res.json();
  const token = result?.data?.token;
  if (!res.ok) {
    await cookieUtil.set('register', {
      message: 'REGISTER_FAILED',
      old: payload,
      errors: result?.message ?? []
    }, {ttl: 10})
    redirect('/register');
  }
  await cookieUtil.set('verify-email', payload.email, {ttl: 30 * 60})
  redirect(`/verify-email?token=${token}`);
}
