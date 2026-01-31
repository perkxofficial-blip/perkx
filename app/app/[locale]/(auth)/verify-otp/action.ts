'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {resendOtp, verifyOtp} from "@/services/api/public/auth";
import {cookieUtil} from "@/lib/cookieUtil";
export async function verifyOtpAction(formData: FormData) {
  const cookieStore = await cookies();
  const numbers = formData.getAll('numbers[]') as string[];
  const otp = numbers.join('');
  const payload = {
    email: formData.get('email')?.toString() ?? '',
    otp: otp
  };
  const res = await verifyOtp(payload)

  if (!res.ok) {
    await cookieUtil.set('verify-otp-message', {
      status: false,
      message: 'message.verify_otp_failed',
    }, {ttl: 10})
    redirect(`/verify-otp`);
  }

  const result: any = await res.json()
  await cookieUtil.set('token', result?.data?.accessToken)
  redirect(`/user/profile`);
}

export async function resendOtpAction(formData: FormData) {
  const payload = {
    email: formData.get('email')?.toString() ?? '',
  };
  const res = await resendOtp(payload)

  const message = res.ok ? {
    status: true,
    message: 'message.resend_otp_success',
  } : {
    status: false,
    message: 'message.resend_otp_failed',
  }
  await cookieUtil.set('verify-otp-message', message, {ttl: 10})
}