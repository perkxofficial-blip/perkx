'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/services/auth';
import { apiClient } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import Link from 'next/link';
import Toast from '@/components/admin/Toast';
import { getExchangeStatusBadge } from '@/app/utils/statusBadge';

interface Exchange {
  id: number;
  exchange_id: number;
  exchange_uid: string;
  exchange_name: string;
  exchange_code: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  logo_path: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
  request_date?: string;
  approved_on?: string;
  updated_by?: string;
  rejected_on?: string;
  reason?: string;
}

interface UserDetail {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  exchanges: Array<{
    name: string;
    uid: string;
  }>;
}

interface ExchangeOption {
  id: number;
  name: string;
  code: string;
  logo_url?: string;
}

export default function UserExchangesPage() {
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
  
  const backToDetailUrl = `/admin/users/${userId}${filterParams.toString() ? `?${filterParams.toString()}` : ''}`;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [exchangeOptions, setExchangeOptions] = useState<ExchangeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    message: '',
    type: 'info',
  });

  const [filters, setFilters] = useState({
    exchangeName: '',
    status: '',
  });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [modalMounted, setModalMounted] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectModalMounted, setRejectModalMounted] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [exchangeToReject, setExchangeToReject] = useState<Exchange | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('UID copied to clipboard', 'success');
  };

  const handleApprove = async (exchangeId: number) => {
    const token = auth.getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // Call API to approve exchange
      await apiClient.patch(endpoints.admin.updateUserExchange(exchangeId), {
        status: 'ACTIVE'
      }, token);
      showToast('Exchange approved successfully', 'success');
      // Reload exchanges
      await loadExchanges();
    } catch (error: any) {
      console.error('Error approving exchange:', error);
      if (error.status === 401 || error.status === 403) {
        auth.clearAdminToken();
        window.location.href = '/admin/login';
      } else {
        showToast('Failed to approve exchange', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = (exchange: Exchange) => {
    setExchangeToReject(exchange);
    setRejectReason('');
    setShowRejectModal(true);
    setTimeout(() => setRejectModalMounted(true), 10);
  };

  const handleCloseRejectModal = () => {
    setRejectModalMounted(false);
    setTimeout(() => {
      setShowRejectModal(false);
      setExchangeToReject(null);
      setRejectReason('');
    }, 200);
  };

  const handleSubmitReject = async () => {
    if (!exchangeToReject || !rejectReason.trim()) {
      showToast('Please enter a reason for rejection', 'warning');
      return;
    }

    const token = auth.getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // Call API to reject exchange
      await apiClient.patch(endpoints.admin.updateUserExchange(exchangeToReject.id), {
        status: 'REJECTED',
        reason: rejectReason.trim()
      }, token);
      showToast('Exchange rejected successfully', 'success');
      handleCloseRejectModal();
      // Reload exchanges
      await loadExchanges();
    } catch (error: any) {
      console.error('Error rejecting exchange:', error);
      if (error.status === 401 || error.status === 403) {
        auth.clearAdminToken();
        window.location.href = '/admin/login';
      } else {
        showToast('Failed to reject exchange', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (exchange: Exchange) => {
    setSelectedExchange(exchange);
    setShowDetailModal(true);
    setTimeout(() => setModalMounted(true), 10);
  };

  const handleCloseModal = () => {
    setModalMounted(false);
    setTimeout(() => {
      setShowDetailModal(false);
      setSelectedExchange(null);
    }, 200);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  useEffect(() => {
    if (!userId) return;

    const token = auth.getAdminToken();
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    // Load user basic info
    apiClient.get(endpoints.admin.userDetail(userId), token || undefined)
      .then(data => {
        if (data.statusCode === 200 && data.data) {
          setUser(data.data);
        } else if (data.id) {
          setUser(data);
        } else {
          setError('User not found');
        }
      })
      .catch(err => {
        console.error('Error fetching user:', err);
        if (err.status === 500 || err.status === 401 || err.status === 403) {
          auth.clearAdminToken();
          window.location.href = '/admin/login';
        } else {
          setError('Failed to load user details');
        }
      });

    // Load user exchanges and exchange options
    loadExchanges();
    loadExchangeOptions();
  }, [userId]);

  const loadExchangeOptions = async () => {
    const token = auth.getAdminToken();
    if (!token) return;

    try {
      const response = await apiClient.get(endpoints.admin.exchangesList, token);
      const optionsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.exchanges || response.data?.data || []);
      setExchangeOptions(optionsData);
    } catch (error: any) {
      console.error('Error loading exchange options:', error);
    }
  };

  const loadExchanges = async () => {
    const token = auth.getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      // Get user exchanges from admin exchanges endpoint
      const response = await apiClient.get(endpoints.admin.userExchanges, token);
      const exchangesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.exchanges || response.data?.data || []);
      console.log('Exchanges data:', exchangesData);
      if (exchangesData.length > 0) {
        console.log('First exchange structure:', exchangesData[0]);
      }
      setExchanges(exchangesData);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading exchanges:', error);
      
      if (error.status === 401 || error.status === 403) {
        auth.clearAdminToken();
        window.location.href = '/admin/login';
      } else {
        setError('Failed to load exchanges');
        setLoading(false);
      }
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

  const filteredExchanges = exchanges.filter(exchange => {
    // Compare exchange name from selectbox with exchange_name in list
    const matchesExchange = !filters.exchangeName || 
      filters.exchangeName === exchange.exchange_name;
    const matchesStatus = !filters.status || exchange.status === filters.status;
    return matchesExchange && matchesStatus;
  });

  const clearFilters = () => {
    setFilters({
      exchangeName: '',
      status: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading exchanges...</p>
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
          href={backToDetailUrl}
          className="mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Back to User Detail
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
          <Link href="/admin/users" className="hover:text-gray-700 dark:hover:text-gray-200">
            User Management
          </Link>
          <span className="mx-2">/</span>
          <Link href={backToDetailUrl} className="hover:text-gray-700 dark:hover:text-gray-200">
            {user.email}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">Linked Exchanges</span>
        </nav>
      </div>

      {/* Header Section */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Linked Exchanges</h1>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {exchanges.length} CONNECTED
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review and validate user-submitted UID links across exchanges for {user.email}
            </p>
          </div>
          <div className="ml-6">
            <div className="flex flex-col items-center justify-center px-6 py-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 min-w-[180px]">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                TOTAL REQUESTS
              </div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {exchanges.length}
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Exchange
            </label>
            <select
              value={filters.exchangeName}
              onChange={(e) => setFilters({ ...filters, exchangeName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="">All Exchanges</option>
              {exchangeOptions.map((exchange) => (
                <option key={exchange.id} value={exchange.name}>
                  {exchange.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            disabled={!filters.exchangeName && !filters.status}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer pb-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Exchanges Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Exchange
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  UID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredExchanges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {exchanges.length === 0 ? 'No exchanges connected' : 'No exchanges match the current filters'}
                  </td>
                </tr>
              ) : (
                filteredExchanges.map((exchange) => {
                  const statusBadge = getExchangeStatusBadge(exchange.status);
                  return (
                    <tr key={exchange.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">{user?.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-2">
                            {exchange.logo_url ? (
                              <img 
                                src={exchange.logo_url} 
                                alt={exchange.exchange_name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{exchange.exchange_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => copyToClipboard(exchange.exchange_uid)}
                          className="flex items-center gap-2 group cursor-pointer"
                          title="Click to copy"
                        >
                          <span className="font-mono text-sm text-gray-900 dark:text-white">{exchange.exchange_uid}</span>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(exchange.request_date || exchange.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {exchange.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {exchange.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleApprove(exchange.id)}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectClick(exchange)}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded-lg border border-red-600 bg-transparent text-red-600 text-sm font-medium hover:bg-red-50 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-900/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleViewDetails(exchange)}
                              className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Summary */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredExchanges.length} of {exchanges.length} exchanges
          </p>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && exchangeToReject && (
        <div 
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${
            rejectModalMounted ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleCloseRejectModal}
        >
          <div 
            className={`bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl transition-all duration-200 ${
              rejectModalMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reject UID Verification
              </h3>
              <button
                onClick={handleCloseRejectModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                The user will be notified of the rejection and the reason provided below
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  REASON FOR REJECTION
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter specific details for user e.g., UID does not match screenshot, exchange not supported for this region..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCloseRejectModal}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReject}
                disabled={isSubmitting || !rejectReason.trim()}
                className="px-6 py-2 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailModal && selectedExchange && (
        <div 
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${
            modalMounted ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleCloseModal}
        >
          <div 
            className={`bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl transition-all duration-200 ${
              modalMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Verification Details - {selectedExchange.status === 'ACTIVE' ? 'Active' : 'Rejected'}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {selectedExchange.status === 'ACTIVE' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Approved On
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDateTime(selectedExchange.approved_on || selectedExchange.updated_at)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Approved By
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedExchange.updated_by || '-'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Rejected On
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDateTime(selectedExchange.rejected_on || selectedExchange.updated_at)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Rejected By
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedExchange.updated_by || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Reason
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white italic">
                      {selectedExchange.reason || ''}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                CLOSE
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
