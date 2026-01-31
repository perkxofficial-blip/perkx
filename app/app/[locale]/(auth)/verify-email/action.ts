'use server';

import { redirect } from 'next/navigation';
import {resend} from "@/services/api/public/auth";
import {cookieUtil} from "@/lib/cookieUtil";

export async function resendAction(formData: FormData) {
  let token = formData.get('token')?.toString() ?? '';
  const payload = {
    email: formData.get('email')?.toString() ?? '',
  };
  const res = await resend(payload)
  const result: any = await res.json()
  token = res.ok ? result?.data?.token : token

  const message = res.ok ? {
    status: true,
    message: 'message.resend_email_success',
  } : {
    status: false,
    message: 'message.resend_email_failed',
  }
  await cookieUtil.set('verify-email-message', message, {ttl: 10})
  redirect(`/verify-email?token=${token}`);
}
