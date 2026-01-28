import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'GET',
      headers,
    });

    console.log(`[Get Campaign ${id}] Status: ${response.status}`);

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return new NextResponse(null, { status: response.status });
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      if (response.ok) {
        return new NextResponse(null, { status: response.status });
      }
      return NextResponse.json(
        { error: 'Server error', message: response.statusText },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[Get Campaign Error]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization');
    
    // Get FormData from request
    const formData = await request.formData();
    
    // Debug: Log FormData contents
    console.log(`[Update Campaign ${id}] FormData contents:`);
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
    
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'PUT',
      headers,
      body: backendFormData as any,
    });

    console.log(`[Update Campaign ${id}] Status: ${response.status}`);

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return new NextResponse(null, { status: response.status });
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      if (response.ok) {
        return new NextResponse(null, { status: response.status });
      }
      return NextResponse.json(
        { error: 'Server error', message: response.statusText },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[Update Campaign Error]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization');
    
    // Parse JSON body for PATCH requests
    const body = await request.json();
    
    console.log(`[Patch Campaign ${id}] Body:`, body);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    console.log(`[Patch Campaign ${id}] Status: ${response.status}`);

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return new NextResponse(null, { status: response.status });
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      if (response.ok) {
        return new NextResponse(null, { status: response.status });
      }
      return NextResponse.json(
        { error: 'Server error', message: response.statusText },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[Patch Campaign Error]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${id}`, {
      method: 'DELETE',
      headers,
    });

    console.log(`[Delete Campaign ${id}] Status: ${response.status}`);

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return new NextResponse(null, { status: response.status });
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      if (response.ok) {
        return new NextResponse(null, { status: response.status });
      }
      return NextResponse.json(
        { error: 'Server error', message: response.statusText },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[Delete Campaign Error]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
