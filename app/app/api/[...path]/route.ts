import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

// Generic proxy handler
async function proxyRequest(
  request: NextRequest,
  endpoint: string,
  method: string = 'GET'
) {
  try {
    const token = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for POST/PUT/PATCH requests if body exists
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const body = await request.json();
        options.body = JSON.stringify(body);
      } catch (e) {
        // No body or invalid JSON - continue without body
      }
    }

    // Add query params to endpoint
    const searchParams = request.nextUrl.searchParams.toString();
    const fullEndpoint = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    const fullUrl = `${API_BASE_URL}${fullEndpoint}`;


    
    const response = await fetch(fullUrl, options);
    
    console.log(`[Proxy Response] Status: ${response.status} ${response.statusText}`);
    
    // Handle empty response (204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return new NextResponse(null, { status: response.status });
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If no JSON body but request was successful (2xx)
      if (response.ok) {
        return new NextResponse(null, { status: response.status });
      }
      // If error and no JSON body
      return NextResponse.json(
        { error: 'Server error', message: response.statusText },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[Proxy Error]', {
      method,
      endpoint,
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Internal server error', message: error.message, details: `Failed to proxy ${method} ${endpoint}` },
      { status: 500 }
    );
  }
}

// Catch-all proxy route
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = '/' + path.join('/');
  return proxyRequest(request, endpoint, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = '/' + path.join('/');
  return proxyRequest(request, endpoint, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = '/' + path.join('/');
  return proxyRequest(request, endpoint, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = '/' + path.join('/');
  return proxyRequest(request, endpoint, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = '/' + path.join('/');
  return proxyRequest(request, endpoint, 'DELETE');
}
