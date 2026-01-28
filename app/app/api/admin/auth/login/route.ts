import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });


    // Handle empty response
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return new NextResponse(null, { status: response.status });
    }

    // Try to parse JSON
    let data;
    try {
      const text = await response.text();
      data = JSON.parse(text);
    } catch (parseError: any) {
      return NextResponse.json(
        { error: 'Invalid JSON response from API', message: parseError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
