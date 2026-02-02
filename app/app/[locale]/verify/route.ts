import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verify } from '@/services/api/public/auth';
import { cookieUtil } from '@/lib/cookieUtil';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3100';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`));
  }

  try {
    const h = await headers();

    const apiHeaders = {
      'Content-Type': 'application/json',
      'user-agent': h.get('user-agent') ?? '',
      'x-forwarded-for':
        h.get('x-forwarded-for')?.split(',')[0] ??
        h.get('x-real-ip') ??
        '',
    };

    const res = await verify({ token }, apiHeaders);
    const result: any = await res.json();
    if (!res.ok) {
      await cookieUtil.set('login-message', {
        status: false,
        message: result?.message ?? 'message.token_invalid',
      }, {ttl: 10})
      return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`));
    }

    const accessToken = result?.data?.accessToken;
    await cookieUtil.set('token', accessToken, {
      httpOnly: false,
      ttl: 7 * 24 * 60 * 60,
    });

    return NextResponse.redirect(new URL(`${FRONTEND_URL}/user/profile`));
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`));
  }
}
