'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/services/auth';

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = auth.getUserToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    auth.setUserToken(token);
    setIsAuthenticated(true);
    router.push('/user');
  };

  const logout = () => {
    auth.clearUserToken();
    setIsAuthenticated(false);
    router.push('/');
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}

export function useAdminAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = auth.getAdminToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    auth.setAdminToken(token);
    setIsAuthenticated(true);
    router.push('/admin');
  };

  const logout = () => {
    auth.clearAdminToken();
    setIsAuthenticated(false);
    router.push('/');
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
