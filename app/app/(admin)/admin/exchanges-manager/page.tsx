'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/services/auth';
import { apiClient } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import Link from 'next/link';
import Toast from '@/components/admin/Toast';
import { getExchangeStatusBadge } from '@/app/utils/statusBadge';
import { formatDate, formatDateTime } from '@/app/utils/dateUtils';

interface Exchange {
  id: number;
  user_id: number;
  user_email?: string;
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
  imageError?: boolean;
}

interface ExchangeOption {
  id: number;
  name: string;
  code: string;
  logo_url?: string;
}

export default function ExchangesManagerPage() {
  const router = useRouter();

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
    exchangeId: '',
    status: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

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
      await apiClient.patch(endpoints.admin.updateUserExchange(exchangeId), {
        status: 'ACTIVE'
      }, token);
      showToast('Exchange approved successfully', 'success');
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
      await apiClient.patch(endpoints.admin.updateUserExchange(exchangeToReject.id), {
        status: 'REJECTED',
        reason: rejectReason.trim()
      }, token);
      showToast('Exchange rejected successfully', 'success');
      handleCloseRejectModal();
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

  useEffect(() => {
    loadExchangeOptions();
  }, []);

  useEffect(() => {
    loadExchanges();
  }, [currentPage, rowsPerPage, filters.exchangeId, filters.status]);

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

    setLoading(true);
    try {
      // Build query parameters for API
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', rowsPerPage.toString());
      
      // Add filters if present
      if (filters.exchangeId) {
        params.append('exchange_id', filters.exchangeId);
      }
      if (filters.status) {
        params.append('status', filters.status);
      }

      const url = `${endpoints.admin.userExchanges}?${params.toString()}`;
      const response = await apiClient.get(url, token);
      
      // Parse response structure
      // Response format: { statusCode, message, data: { data: [...], pagination: {...} } }
      const exchangesData = response.data?.data || [];
      const pagination = response.data?.pagination || {};
      const total = pagination.total || 0;
      
      setExchanges(exchangesData);
      setTotalCount(total);
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

  const formatStatus = (status: string) => {
    if (status === 'ACTIVE') return 'Approved';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getExchangeLogo = (exchangeName: string) => {
    return `/images/exchanges/${exchangeName.toLowerCase()}.png`;
  };

  // Server-side pagination - API handles filtering and pagination
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + exchanges.length, totalCount);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.exchangeId, filters.status]);

  const clearFilters = () => {
    setFilters({
      exchangeId: '',
      status: '',
    });
  };

  // No need for statistics object anymore

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

  if (error) {
    return (
      <div className="p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">{error}</p>
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
          <span className="text-gray-900 dark:text-white">UID Verification</span>
        </nav>
      </div>

      {/* Header Section */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UID Verification</h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and validate all user exchange connections across the platform
            </p>
          </div>
          <div className="ml-6">
            <div className="flex flex-col items-center justify-center px-6 py-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 min-w-[180px]">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                TOTAL REQUESTS
              </div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {totalCount}
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
              value={filters.exchangeId}
              onChange={(e) => setFilters({ ...filters, exchangeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="">All Exchanges</option>
              {exchangeOptions.map((exchange) => (
                <option key={exchange.id} value={exchange.id}>
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
              <option value="ACTIVE">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            disabled={!filters.exchangeId && !filters.status}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              {exchanges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {totalCount === 0 ? 'No exchanges found' : 'No exchanges match the current filters'}
                  </td>
                </tr>
              ) : (
                exchanges.map((exchange) => {
                  const statusBadge = getExchangeStatusBadge(exchange.status);
                  return (
                    <tr key={exchange.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/users/${exchange.user_id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {exchange.user_email || '-'}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            {exchange.imageError ? (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            ) : (
                              <img 
                                src={getExchangeLogo(exchange.exchange_name)}
                                alt={exchange.exchange_name}
                                className="w-full h-full object-contain p-1"
                                onError={() => {
                                  setExchanges(prev => prev.map(ex => 
                                    ex.id === exchange.id ? { ...ex, imageError: true } : ex
                                  ));
                                }}
                              />
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
                          {formatStatus(exchange.status)}
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
        
        {/* Footer with Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {totalCount > 0 ? startIndex + 1 : 0} to {endIndex} of {totalCount} exchanges
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
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
                Verification Details - {formatStatus(selectedExchange.status)}
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
