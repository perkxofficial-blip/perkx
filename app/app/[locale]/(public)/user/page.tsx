'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function UserDashboardPage() {
  const t = useTranslations('user.dashboard');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CSR - Fetch data with authentication
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (token) {
      fetch('http://localhost:3000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setData(data.data);
          setLoading(false);
        });
    }
  }, []);

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('title')}</h1>
      
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">{t('welcome')}</h3>
          <p className="text-xl font-bold">{data?.first_name} {data?.last_name}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">{t('email')}</h3>
          <p className="text-lg">{data?.email}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">{t('status')}</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${
            data?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {data?.is_active ? t('active') : t('inactive')}
          </span>
        </div>
      </div>
    </div>
  );
}
