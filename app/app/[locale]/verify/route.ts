
import { NextRequest, NextResponse } from 'next/server';
import {headers as nextHeaders} from "next/dist/server/request/headers";
import {verify} from "@/services/api/public/auth";
import {cookieUtil} from "@/lib/cookieUtil";
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3100';
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`));
  }
  const h = await nextHeaders();
  const headers = {
    'Content-Type': 'application/json',
    'user-agent': h.get('user-agent') ?? '',
    'x-forwarded-for':
      h.get('x-forwarded-for')?.split(',')[0] ??
      h.get('x-real-ip') ??
      '',
  };
  const payload = {
    token: token
  }
  try {
    const res = await verify(payload, headers)

    if (res.ok) {
      const result: any = await res.json()
      const accessToken = result?.data?.accessToken;
      const response = NextResponse.redirect(new URL(`${FRONTEND_URL}/user/profile`));
      await cookieUtil.set('token', accessToken, {
        httpOnly: false,
        ttl: 7 * 24 * 60 * 60 // 7 days
      })

      return response;
    }
  } catch (err) {
    return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`));
  }
}
