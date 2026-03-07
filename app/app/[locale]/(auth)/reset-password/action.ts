'use server';

import { redirect } from 'next/navigation';
import {resetPassword} from "@/services/api/public/auth";
import {cookieUtil} from "@/lib/cookieUtil";
export async function resetAction(formData: FormData) {
  const payload = {
    token: formData.get('token')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? '',
    confirm_password: formData.get('confirm_password')?.toString() ?? '',
  };
  const res = await resetPassword(payload)

  const result: any = await res.json()
  if (!res.ok) {
    if (result.statusCode === 400) {
      await cookieUtil.set('reset', {
        message: 'RESET_FAILED',
        old: payload,
        errors: result?.message ?? []
      }, {ttl: 10})

      redirect(`/reset-password?token=${payload.token}`);
    }

    await cookieUtil.set('login-message', {
      status: false,
      message: result?.message
    }, {ttl: 10})

    redirect(`/login`);
  }

  await cookieUtil.set('login-message', {
    status: true,
    message: 'message.reset_password_success',
  }, {ttl: 10})

  redirect(`/login`);
}
