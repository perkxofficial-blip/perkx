'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { auth } from '@/services/auth';
import { apiClient } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import Link from 'next/link';
import { formatDate } from '@/app/utils/dateUtils';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  status: string;
  country?: string;
  referral_code?: string;
  referrer_email?: string;
  created_at?: string;
  referral_by?: {
    id: number;
    email: string;
    referral_code: string;
  };
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);
  
  // Store initial values to detect actual changes vs initialization
  const initialValues = useRef({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'ALL',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    rowsPerPage: parseInt(searchParams.get('rowsPerPage') || '10')
  });

  // Filter states - initialize from URL params
  const [searchQuery, setSearchQuery] = useState(initialValues.current.search);
  const [statusFilter, setStatusFilter] = useState(initialValues.current.status);
  const [dateFrom, setDateFrom] = useState(initialValues.current.dateFrom);
  const [dateTo, setDateTo] = useState(initialValues.current.dateTo);

  // Pagination states - initialize from URL params
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [rowsPerPage, setRowsPerPage] = useState(initialValues.current.rowsPerPage);

  useEffect(() => {
    // Prevent double fetch in React Strict Mode
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = auth.getAdminToken();

    if (token) {
      apiClient.get(endpoints.admin.users, token || undefined)
        .then(data => {
          // Handle response structure: { statusCode: 200, data: { data: [...], pagination: {...} } }
          if (data.statusCode === 200 && data.data && Array.isArray(data.data.data)) {
            setUsers(data.data.data);
          } else if (data.statusCode === 200 && Array.isArray(data.data)) {
            setUsers(data.data);
          } else if (Array.isArray(data)) {
            setUsers(data);
          } else {
            setUsers([]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching users:', err);

          // If error status is 500, 401, or 403, clear token and redirect to login
          if (err.status === 500 || err.status === 401 || err.status === 403) {
            auth.clearAdminToken();
            window.location.href = '/admin/login';
          } else {
            setError('Failed to load users');
            setLoading(false);
          }
        });
    } else {
      setError('No authentication token found');
      setLoading(false);
    }
  }, []);

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(query) ||
        user.referral_code?.toLowerCase().includes(query) ||
        user.country?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(user => user.status?.toUpperCase() === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(user => {
        if (!user.created_at) return false;
        return new Date(user.created_at) >= new Date(dateFrom);
      });
    }
    if (dateTo) {
      filtered = filtered.filter(user => {
        if (!user.created_at) return false;
        return new Date(user.created_at) <= new Date(dateTo);
      });
    }

    return filtered;
  }, [users, searchQuery, statusFilter, dateFrom, dateTo]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, rowsPerPage]);

  // Reset to page 1 only when filters actually change (not during initialization)
  useEffect(() => {
    const hasFiltersChanged = 
      searchQuery !== initialValues.current.search ||
      statusFilter !== initialValues.current.status ||
      dateFrom !== initialValues.current.dateFrom ||
      dateTo !== initialValues.current.dateTo ||
      rowsPerPage !== initialValues.current.rowsPerPage;
    
    if (hasFiltersChanged) {
      setCurrentPage(1);
    }
  }, [searchQuery, statusFilter, dateFrom, dateTo, rowsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  // Build query string for preserving filters when navigating to detail page
  const getDetailUrl = (userId: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    params.set('page', currentPage.toString());
    params.set('rowsPerPage', rowsPerPage.toString());
    
    return `/admin/users/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  // Pagination numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">User Management Master List</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view all user accounts</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by email, UID or country"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Date From */}
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range (From)
            </label>
            <input
              id="dateFrom"
              type="date"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 transition-colors"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range (To)
            </label>
            <input
              id="dateTo"
              type="date"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 transition-colors"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter Row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status Filter:</label>
            <div className="flex gap-2">
              {['ALL', 'ACTIVE', 'INACTIVE', 'DEACTIVATE'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        {paginatedUsers.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
              {searchQuery || statusFilter !== 'ALL' || dateFrom || dateTo
                ? 'No users found matching your search'
                : 'No users found'}
            </p>
            {(searchQuery || statusFilter !== 'ALL' || dateFrom || dateTo) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="w-64 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</th>
                    <th className="w-32 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PerkX UID</th>
                    <th className="w-32 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined Date</th>
                    <th className="w-48 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Referrer(email)</th>
                    <th className="w-28 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status Badge</th>
                    <th className="w-24 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Country</th>
                    <th className="w-20 px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="w-64 px-6 py-4 text-sm text-gray-900 dark:text-white">{user.email}</td>
                      <td className="w-32 px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">{user.referral_code}</td>
                      <td className="w-32 px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(user.created_at)}</td>
                        <td className="w-48 px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.referral_by?.email || '-'}</td>
                      <td className="w-28 px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${user.status?.toUpperCase() === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : user.status?.toUpperCase() === 'INACTIVE'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : user.status?.toUpperCase() === 'DEACTIVATE'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                          {user.status?.toUpperCase() === 'ACTIVE' ? 'Active' : user.status?.toUpperCase() === 'INACTIVE' ? 'Inactive' : user.status?.toUpperCase() === 'DEACTIVATE' ? 'Deactivated' : 'Unknown'}
                        </span>
                      </td>
                      <td className="w-24 px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.country || '-'}</td>
                      <td className="w-20 px-6 py-4">
                        <Link
                          href={getDetailUrl(user.id)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * rowsPerPage, filteredUsers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredUsers.length}</span> users
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor="rowsPerPage" className="text-sm text-gray-700 dark:text-gray-300">
                    Show
                  </label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700 dark:text-gray-300">records per page</span>
                </div>
              </div>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>

                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="px-2 text-gray-500 dark:text-gray-400">
                      {page}
                    </span>
                  )
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
