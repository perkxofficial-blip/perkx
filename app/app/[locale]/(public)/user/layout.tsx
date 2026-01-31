'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/endpoints';

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
      router.push('/login');
      return;
    }

    // Validate token
    apiClient.get(endpoints.user.profile, token)
      .then(data => {
        if (data.statusCode === 200 || data.data) {
          setUser(data.data);
          setIsLoading(false);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen relative bg-cover bg-center bg-no-repeat flex items-center justify-center" style={{ backgroundImage: 'url(/images/bg-source.jpg)' }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        <div className="text-white text-lg relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        body:has(.user-layout-no-footer) footer {
          display: none !important;
        }
      `}</style>
      <div className="user-layout-no-footer">
        {children}
      </div>
    </>
  );
}
