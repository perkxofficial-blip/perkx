
import { NextRequest, NextResponse } from 'next/server';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3100';
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`));
  }
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token
      }),
      cache: 'no-store',
    });

    if (res.ok) {
      const result: any = await res.json()
      const accessToken = result?.data?.accessToken;
      const response = NextResponse.redirect(new URL(`${FRONTEND_URL}/user/profile`));
      response.cookies.set({
        name: 'token',
        value: accessToken,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24
      });

      return response;
    }
  } catch (err) {
    return NextResponse.redirect(new URL(`${FRONTEND_URL}/login`));
  }
}
