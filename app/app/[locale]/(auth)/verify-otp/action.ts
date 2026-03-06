'use server';

import { redirect } from 'next/navigation';
import {resendOtp, verifyOtp} from "@/services/api/public/auth";
import {cookieUtil} from "@/lib/cookieUtil";
import { headers as nextHeaders } from 'next/headers';
export async function verifyOtpAction(formData: FormData) {
  const numbers = formData.getAll('numbers[]') as string[];
  const otp = numbers.join('');
  const payload = {
    email: formData.get('email')?.toString() ?? '',
    otp: otp
  };

  const h = await nextHeaders();
  const headers = {
    'Content-Type': 'application/json',
    'user-agent': h.get('user-agent') ?? '',
    'x-forwarded-for':
      h.get('x-forwarded-for')?.split(',')[0] ??
      h.get('x-real-ip') ??
      '',
  };
  const res = await verifyOtp(payload, headers)

  if (!res.ok) {
    await cookieUtil.set('verify-otp-message', {
      status: false,
      message: 'message.verify_otp_failed',
    }, {ttl: 10})
    redirect(`/verify-otp`);
  }

  const result: any = await res.json()
  
  // Get base domain from host header to share cookie across subdomains
  const host = h.get('host') || '';
  const hostname = host.replace(/^www\./, '').split(':')[0];
  let baseDomain;
  if (hostname.includes('localhost')) {
    baseDomain = '.localhost';
  } else {
    // Extract base domain (e.g., example.com from ko.example.com)
    const parts = hostname.split('.');
    baseDomain = '.perkx.co';
  }

  // Set token cookie with httpOnly: false so client-side JavaScript can access it
  await cookieUtil.set('token', result?.data?.accessToken, {
    httpOnly: false,
    ttl: 7 * 24 * 60 * 60, // 7 days
    domain: baseDomain
  })
  redirect(`/user/linked-exchanges`);
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