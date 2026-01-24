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

    return res.json();
  },

  // POST request
  async post(endpoint: string, data: any, token?: string) {
    console.log('this.baseURL', this.baseURL);
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

    return res.json();
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

    return res.json();
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

    return res.json();
  },
};
