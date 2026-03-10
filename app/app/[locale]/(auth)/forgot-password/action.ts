'use server';

import { redirect } from 'next/navigation';
import {forgotPassword} from "@/services/api/public/auth";
import {cookieUtil} from "@/lib/cookieUtil";
export async function forgotPasswordAction(formData: FormData) {
  const payload = {
    email: formData.get('email')?.toString() ?? '',
  };
  const res = await forgotPassword(payload)

  if (!res.ok) {
    const result: any = await res.json();
    const message = {
      status: false,
      message: result?.message ?? 'message.forgot_email_failed',
    };
    await cookieUtil.set('forgot-password-message', message, {ttl: 10})
  } else {
    const message = {
      status: true,
      message: 'message.forgot_email_success',
    };
    await cookieUtil.set('forgot-password-message', message, {ttl: 10})
  }
  redirect(`/forgot-password`);
}
