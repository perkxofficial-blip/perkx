'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/services/auth';
import { apiClient } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import Link from 'next/link';
import Toast from '@/components/admin/Toast';

interface UserDetail {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  country?: string;
  avatar?: string;
  status: string;
  referral_code: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  ip_address?: string;
  referrer?: {
    id: number;
    name?: string;
    email: string;
  };
  referrals: Array<{
    id: number;
    email: string;
    created_at: string;
    status?: string;
    country?: string;
  }>;
  exchanges: Array<{
    name: string;
    uid: string;
  }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params?.id as string;

  // Preserve filter parameters for back navigation
  const filterParams = new URLSearchParams();
  if (searchParams.get('search')) filterParams.set('search', searchParams.get('search')!);
  if (searchParams.get('status')) filterParams.set('status', searchParams.get('status')!);
  if (searchParams.get('dateFrom')) filterParams.set('dateFrom', searchParams.get('dateFrom')!);
  if (searchParams.get('dateTo')) filterParams.set('dateTo', searchParams.get('dateTo')!);
  if (searchParams.get('page')) filterParams.set('page', searchParams.get('page')!);
  if (searchParams.get('rowsPerPage')) filterParams.set('rowsPerPage', searchParams.get('rowsPerPage')!);
  
  const backToListUrl = `/admin/users${filterParams.toString() ? `?${filterParams.toString()}` : ''}`;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (!userId) return;

    const token = auth.getAdminToken();
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    apiClient.get(endpoints.admin.userDetail(userId), token || undefined)
      .then(data => {
        if (data.statusCode === 200 && data.data) {
          setUser(data.data);
        } else if (data.id) {
          setUser(data);
        } else {
          setError('User not found');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user:', err);

        // If error status is 500, 401, or 403, clear token and redirect to login
        if (err.status === 500 || err.status === 401 || err.status === 403) {
          auth.clearAdminToken();
          window.location.href = '/admin/login';
        } else {
          setError('Failed to load user details');
          setLoading(false);
        }
      });
  }, [userId]);

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'DEACTIVATE') => {
    setActionLoading(true);
    const token = auth.getAdminToken();

    try {
      const data = await apiClient.patch(endpoints.admin.userStatus(userId), { status: newStatus }, token || undefined);

      if (data.statusCode === 200 && data.data) {
        setUser(prev => prev ? { ...prev, status: data.data.status } : null);
        showToast(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`, 'success');
      }
      setShowDeactivateModal(false);
    } catch (err: any) {
      console.error('Error updating status:', err);

      // If error status is 500, 401, or 403, clear token and redirect to login
      if (err.status === 500 || err.status === 401 || err.status === 403) {
        auth.clearAdminToken();
        window.location.href = '/admin/login';
      } else {
        showToast('Failed to update user status', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">{error}</p>
        <Link
          href={backToListUrl}
          className="mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Back to Users List
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex text-sm text-gray-500 dark:text-gray-400">
          <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-200">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <Link href={backToListUrl} className="hover:text-gray-700 dark:hover:text-gray-200">
            User Management
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">User Detail</span>
        </nav>
      </div>

      {/* Header Section */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.email}</h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${user.status?.toUpperCase() === 'ACTIVE'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : user.status?.toUpperCase() === 'INACTIVE'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                {user.status?.toUpperCase() === 'ACTIVE' ? 'Active' : user.status?.toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Deactivated'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">User ID:</span> {user.id}
              </div>
              <div>
                <span className="font-medium">Reg. Date:</span> {formatDate(user.created_at)}
              </div>
              <div>
                <span className="font-medium">Last Login:</span> {formatDateTime(user.last_login)}
              </div>
              <div>
                <span className="font-medium">IP Address:</span> {user.ip_address || '-'}
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Referral ID:</span>{' '}
                <span className="font-mono text-blue-600 dark:text-blue-400">{user.referral_code}</span>
                <span className="ml-4 text-xs text-gray-500">
                  (Year created: {new Date(user.created_at).getFullYear()})
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-6">
            <Link
              href={backToListUrl}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back to List
            </Link>
            <Link
              href={`/admin/users/${user.id}/edit`}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Personal Information */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
          </div>
          <div className="p-6">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.email}
                  className="w-24 h-24 rounded-full object-cover border-2 border-orange-200 dark:border-orange-900/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-orange-200 dark:bg-orange-900/30 flex items-center justify-center">
                  <svg className="w-12 h-12 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  {user.first_name || user.last_name
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right break-all">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right">{user.phone || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Birthday:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right">{formatDate(user.birthday)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right">{user.gender || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Reg. Date:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right">{formatDate(user.created_at)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Country:</span>
                <span className="text-sm text-gray-900 dark:text-white text-right">{user.country || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Referrer:</span>
                {user.referrer ? (
                  <Link
                    href={`/admin/users/${user.referrer.id}${filterParams.toString() ? `?${filterParams.toString()}` : ''}`}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-right"
                  >
                    {user.referrer.email}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-900 dark:text-white text-right">-</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Linked Exchanges */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Linked Exchanges
              <span className="ml-auto px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {user.exchanges.length} CONNECTED
              </span>
            </h3>
          </div>
          <div className="p-6">
            {user.exchanges.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">No exchanges connected</p>
            ) : (
              <div className="space-y-3">
                {user.exchanges.map((exchange, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{exchange.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">UID: {exchange.uid}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Referral Network */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Referral Network
              <span className="ml-auto px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {user.referrals.length} REFERRALS
              </span>
            </h3>
          </div>
          <div className="p-6">
            {user.referrals.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">No referrals yet</p>
            ) : (
              <div className="space-y-2">
                {user.referrals.slice(0, 10).map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${referral.status?.toUpperCase() === 'ACTIVE'
                        ? 'bg-green-500'
                        : referral.status?.toUpperCase() === 'INACTIVE'
                          ? 'bg-yellow-500'
                          : referral.status?.toUpperCase() === 'DEACTIVATE'
                            ? 'bg-red-500'
                            : 'bg-gray-500'
                        }`}></div>
                      <div className="relative group flex-1 min-w-0">
                        <span className={`text-sm truncate block ${referral.status?.toUpperCase() === 'DEACTIVATE' 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                        }`}>{referral.email}</span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {referral.email}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(referral.created_at)}
                    </span>
                  </div>
                ))}
                {user.referrals.length > 10 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setShowReferralModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      View All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Administrative Controls */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Administrative Controls
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage account access and status. Changes are logged for security auditing.
          </p>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            {user.status?.toUpperCase() === 'DEACTIVATE' ? (
              <button
                onClick={() => handleStatusChange('ACTIVE')}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {actionLoading ? 'Activating...' : 'Activate Account'}
              </button>
            ) : (
              <button
                onClick={() => setShowDeactivateModal(true)}
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Deactivate Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deactivate Account</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure?</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to deactivate this account? The user will not be able to login until the account is reactivated.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeactivateModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange('DEACTIVATE')}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Deactivating...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Network Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col shadow-xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Referral Network</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    All referrals for {user.email} ({user.referrals.length} total)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReferralModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PerkX UID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Country</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {user.referrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="relative group max-w-xs">
                            <span className={`text-sm truncate block ${referral.status?.toUpperCase() === 'DEACTIVATE' 
                              ? 'text-gray-500 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-white'
                            }`}>{referral.email}</span>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              {referral.email}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">{referral.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(referral.created_at)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${referral.status?.toUpperCase() === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : referral.status?.toUpperCase() === 'INACTIVE'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : referral.status?.toUpperCase() === 'DEACTIVATE'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                            {referral.status?.toUpperCase() === 'ACTIVE' ? 'Active' : referral.status?.toUpperCase() === 'INACTIVE' ? 'Inactive' : referral.status?.toUpperCase() === 'DEACTIVATE' ? 'Deactivated' : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{referral.country || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowReferralModal(false)}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}
