import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
    // Get FormData from request
    const formData = await request.formData();
    
    // Debug: Log FormData contents
    console.log('[Create Campaign] FormData contents:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    // Create new FormData to send to backend
    const backendFormData = new FormData();
    
    // Copy all fields from request to backend FormData
    formData.forEach((value, key) => {
      backendFormData.append(key, value);
    });
    
    // Prepare headers
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = token;
    }
    // Don't set Content-Type - let fetch handle it with proper boundary
    
    // Send to backend API
    const response = await fetch(`${API_BASE_URL}/admin/campaigns`, {
      method: 'POST',
      headers,
      body: backendFormData as any,
    });
    
    console.log(`[Create Campaign] Status: ${response.status}`);
    
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
    console.error('[Create Campaign Error]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    // Add query params to endpoint
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams 
      ? `${API_BASE_URL}/admin/campaigns?${searchParams}` 
      : `${API_BASE_URL}/admin/campaigns`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    console.log(`[List Campaigns] Status: ${response.status}`);

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
    console.error('[List Campaigns Error]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
