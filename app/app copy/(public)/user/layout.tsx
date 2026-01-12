'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication (CSR)
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (!token) {
      router.push('/');
      return;
    }

    // Validate token
    fetch('http://localhost:3000/api/profile', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 200) {
          setUser(data.data);
          setIsLoading(false);
        } else {
          router.push('/');
        }
      })
      .catch(() => router.push('/'));
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Layout - Responsive */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">User Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">{user?.email}</span>
            <button
              onClick={() => {
                document.cookie = 'token=; Max-Age=0';
                router.push('/');
              }}
              className="text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
