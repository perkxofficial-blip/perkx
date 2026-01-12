'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin authentication
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1];
    
    if (!token) {
      router.push('/');
      return;
    }

    // Validate admin token
    fetch('http://localhost:3000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.statusCode === 200) {
          setIsLoading(false);
        } else {
          router.push('/');
        }
      })
      .catch(() => router.push('/'));
  }, [router]);

  const handleLogout = () => {
    document.cookie = 'admin_token=; Max-Age=0';
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-w-[1440px]">
      {/* Fixed width - NO RESPONSIVE */}
      <div className="flex">
        {/* Fixed Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen fixed">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-8">Admin Portal</h1>
            
            <nav className="space-y-2">
              <a href="/admin" className="block px-4 py-3 text-white rounded hover:bg-gray-700">
                📊 Dashboard
              </a>
              <a href="/admin/users" className="block px-4 py-3 text-white rounded hover:bg-gray-700">
                👥 Users
              </a>
              <a href="/admin/settings" className="block px-4 py-3 text-white rounded hover:bg-gray-700">
                ⚙️ Settings
              </a>
            </nav>

            <button
              onClick={handleLogout}
              className="mt-8 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="ml-64 flex-1">
          <header className="bg-white shadow-sm p-6">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          </header>

          <main className="p-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm mb-2">Total Users</h3>
                <p className="text-3xl font-bold">0</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm mb-2">Active Users</h3>
                <p className="text-3xl font-bold">0</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm mb-2">Admin Users</h3>
                <p className="text-3xl font-bold">1</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
