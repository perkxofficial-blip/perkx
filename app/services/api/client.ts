// API Client Configuration
// For server-side: use Docker internal URL (http://api:80/api) or localhost
// For client-side: use Next.js API routes as proxy to avoid CORS issues
const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api')
  : '/api'; // Use Next.js API routes as proxy for browser requests


export const apiClient = {
  baseURL: API_BASE_URL,
  // GET request
  async get(endpoint: string, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    const responseData = await res.json();

    // If response is not ok, throw error with response body
    if (!res.ok) {
      const error: any = new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.response = responseData;
      throw error;
    }

    return responseData;
  },

  // POST request
  async post(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    // If response is not ok, throw error with response body
    if (!res.ok) {
      const error: any = new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.response = responseData;
      throw error;
    }

    return responseData;
  },

  // PUT request
  async put(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    // If response is not ok, throw error with response body
    if (!res.ok) {
      const error: any = new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.response = responseData;
      throw error;
    }

    return responseData;
  },

  // PATCH request
  async patch(endpoint: string, data: any, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    // If response is not ok, throw error with response body
    if (!res.ok) {
      const error: any = new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.response = responseData;
      throw error;
    }

    return responseData;
  },

  // POST FormData (multipart/form-data, e.g. file upload)
  async postFormData(endpoint: string, formData: FormData, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Do not set Content-Type; browser sets multipart/form-data with boundary

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    let responseData: any;
    try {
      responseData = await res.json();
    } catch {
      if (!res.ok) {
        const error: any = new Error(`HTTP ${res.status}: ${res.statusText}`);
        error.status = res.status;
        throw error;
      }
      return null;
    }

    if (!res.ok) {
      const error: any = new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.response = responseData;
      throw error;
    }
    return responseData;
  },

  // PATCH FormData (multipart/form-data, e.g. file upload)
  async patchFormData(endpoint: string, formData: FormData, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: formData,
    });

    let responseData: any;
    try {
      responseData = await res.json();
    } catch {
      if (!res.ok) {
        const error: any = new Error(`HTTP ${res.status}: ${res.statusText}`);
        error.status = res.status;
        throw error;
      }
      return null;
    }

    if (!res.ok) {
      const error: any = new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.response = responseData;
      throw error;
    }
    return responseData;
  },

  // DELETE request
  async delete(endpoint: string, token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    // Handle empty response (204 No Content)
    if (res.status === 204 || res.headers.get('content-length') === '0') {
      if (!res.ok) {
        const error: any = new Error(`HTTP ${res.status}: ${res.statusText}`);
        error.status = res.status;
        throw error;
      }
      return null;
    }

    // Try to parse JSON response
    let responseData;
    try {
      responseData = await res.json();
    } catch (e) {
      // If no JSON body but request was successful
      if (res.ok) {
        return null;
      }
      // If error and no JSON body
      const error: any = new Error(`HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      throw error;
    }

    // If response is not ok, throw error with response body
    if (!res.ok) {
      const error: any = new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.response = responseData;
      throw error;
    }

    return responseData;
  },

  // GET request
  async publicGet(endpoint: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    const responseData = await res.json();

    // If response is not ok, throw error with response body
    if (!res.ok) {
      const error: any = new Error(responseData.message || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.response = responseData;
      throw error;
    }
    return responseData;
  },

  // POST request
  async authPost(endpoint: string, payload: {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    return await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  },

  async authGet(
    endpoint: string,
    query?: Record<string, any>,
    options?: RequestInit
  ) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    }
    const queryString = buildQuery(query)
    return fetch(`${this.baseURL}${endpoint}${queryString}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
      ...options,
    })
  }
};

function buildQuery(query?: Record<string, any>) {
  if (!query || Object.keys(query).length === 0) return ''

  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, String(v)))
    } else {
      params.append(key, String(value))
    }
  })

  return `?${params.toString()}`
}
