'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/services/auth';
import { apiClient } from '@/services/api/client';

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = auth.getUserToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await apiClient.get('/profile', token);

        if (response.statusCode === 200) {
          setUser(response.data);
        } else {
          setError('Failed to load user data');
        }
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
