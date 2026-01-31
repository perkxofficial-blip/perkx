'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/endpoints';
import { auth } from '@/services/auth';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = auth.getUserToken();

      if (!token) {
        // This shouldn't happen as middleware already checked, but just in case
        router.push('/login');
        return;
      }

      try {
        const data = await apiClient.get(endpoints.user.profile, token);
        if (data.statusCode === 200 || data.data) {
          setUser(data.data);
        } else {
          // Invalid token
          auth.clearUserToken();
          router.push('/login');
        }
      } catch (error) {
        // Token expired or invalid
        auth.clearUserToken();
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
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
