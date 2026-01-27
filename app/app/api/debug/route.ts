import { NextResponse } from 'next/server';

// Debug endpoint - REMOVE IN PRODUCTION!
export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
    info: 'This endpoint shows current environment configuration. Remove in production!'
  });
}
