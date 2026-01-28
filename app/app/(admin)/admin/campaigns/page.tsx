'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { auth } from '@/services/auth';
import { apiClient } from '@/services/api';
import Link from 'next/link';
import Toast from '@/components/admin/Toast';

interface Exchange {
  id: number;
  name: string;
  code: string;
}

interface Campaign {
  id: number;
  exchange_id: number | null;
  title: string;
  description: string;
  banner_path: string;
  banner_url: string;
  redirect_url: string | null;
  is_active: boolean;
  preview_start: string | null;
  preview_end: string | null;
  launch_start: string;
  launch_end: string;
  archive_start: string | null;
  archive_end: string | null;
  featured: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
  exchange: Exchange | null;
}

type TimelineStatus = 'ACTIVE' | 'UPCOMING' | 'ENDED';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    // Prevent double fetch in React Strict Mode
    if (hasFetched.current) return;
    hasFetched.current = true;

    const token = auth.getAdminToken();

    if (token) {
      apiClient.get('/admin/campaigns', token || undefined)
        .then(data => {
          if (data.statusCode === 200 && data.data && Array.isArray(data.data.data)) {
            setCampaigns(data.data.data);
          } else if (data.statusCode === 200 && Array.isArray(data.data)) {
            setCampaigns(data.data);
          } else if (Array.isArray(data)) {
            setCampaigns(data);
          } else {
            setCampaigns([]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching campaigns:', err);
          
          // If error status is 500, 401, or 403, clear token and redirect to login
          if (err.status === 500 || err.status === 401 || err.status === 403) {
            auth.clearAdminToken();
            window.location.href = '/admin/login';
          } else {
            setError('Failed to load campaigns');
            setLoading(false);
          }
        });
    } else {
      setError('No authentication token found');
      setLoading(false);
    }
  }, []);

  // Determine timeline status based on dates
  const getTimelineStatus = (campaign: Campaign): TimelineStatus => {
    const now = new Date();
    const launchStart = new Date(campaign.launch_start);
    const launchEnd = new Date(campaign.launch_end);

    if (now < launchStart) {
      return 'UPCOMING';
    } else if (now > launchEnd) {
      return 'ENDED';
    } else {
      return 'ACTIVE';
    }
  };

  // Filter and search logic
  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.exchange?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(campaign => {
        const timelineStatus = getTimelineStatus(campaign);
        return timelineStatus === statusFilter;
      });
    }

    return filtered;
  }, [campaigns, searchQuery, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCampaigns.length / rowsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredCampaigns.slice(startIndex, endIndex);
  }, [filteredCampaigns, currentPage, rowsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, rowsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleStatus = async (campaignId: number, field: 'is_active' | 'featured', currentValue: boolean) => {
    const token = auth.getAdminToken();
    if (!token) {
      showToast('No authentication token found', 'error');
      return;
    }

    // Check featured campaigns limit (max 5)
    if (field === 'featured' && !currentValue) {
      const currentFeaturedCount = campaigns.filter(c => c.featured).length;
      if (currentFeaturedCount >= 5) {
        showToast('Maximum 5 featured campaigns allowed. Please disable another campaign first.', 'warning');
        return;
      }
    }

    try {
      // Use PATCH /:id endpoint instead of /status endpoint
      const data = await apiClient.patch(
        `/admin/campaigns/${campaignId}`,
        { [field]: !currentValue },
        token || undefined
      );

      // Update local state
      setCampaigns(prevCampaigns =>
        prevCampaigns.map(campaign =>
          campaign.id === campaignId
            ? { ...campaign, [field]: !currentValue }
            : campaign
        )
      );
      
      // Show success toast
      showToast(`Campaign ${field === 'featured' ? 'featured status' : 'publish status'} updated successfully`, 'success');
    } catch (err: any) {
      console.error(`Error updating ${field}:`, err);
      
      // If error status is 500, 401, or 403, clear token and redirect to login
      if (err.status === 500 || err.status === 401 || err.status === 403) {
        auth.clearAdminToken();
        window.location.href = '/admin/login';
      } else {
        const errorMsg = err.response?.message || `Failed to update ${field}`;
        showToast(errorMsg, 'error');
      }
    }
  };

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;

    setDeleting(true);
    const token = auth.getAdminToken();

    try {
      await apiClient.delete(`/admin/campaigns/${campaignToDelete.id}`, token || undefined);
      setCampaigns(prevCampaigns => prevCampaigns.filter(c => c.id !== campaignToDelete.id));
      setShowDeleteModal(false);
      setCampaignToDelete(null);
      showToast('Campaign deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting campaign:', err);
      
      // If error status is 500, 401, or 403, clear token and redirect to login
      if (err.status === 500 || err.status === 401 || err.status === 403) {
        auth.clearAdminToken();
        window.location.href = '/admin/login';
      } else {
        showToast('Failed to delete campaign', 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

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
          <p className="text-gray-600 dark:text-gray-400">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Campaign Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view all campaigns</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search Bar */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Campaign Name
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by campaign name or exchange..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ENDED">Ended</option>
            </select>
          </div>

          {/* Create Button */}
          <div className="w-full md:w-auto">
            <Link
              href="/admin/campaigns/create"
              className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Campaign
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        {paginatedCampaigns.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No campaigns found matching your search'
                : 'No campaigns found'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign Holder</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timeline Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Publish</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedCampaigns.map((campaign) => {
                    const timelineStatus = getTimelineStatus(campaign);
                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{campaign.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{campaign.exchange?.name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(campaign.launch_start)} - {formatDate(campaign.launch_end)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            timelineStatus === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : timelineStatus === 'UPCOMING'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {timelineStatus === 'ACTIVE' ? 'Active' : timelineStatus === 'UPCOMING' ? 'Upcoming' : 'Ended'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(campaign.id, 'is_active', campaign.is_active)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              campaign.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                campaign.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(campaign.id, 'featured', campaign.featured)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              campaign.featured ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                campaign.featured ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/campaigns/${campaign.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(campaign)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * rowsPerPage, filteredCampaigns.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredCampaigns.length}</span> campaigns
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor="rowsPerPage" className="text-sm text-gray-700 dark:text-gray-300">
                    Show
                  </label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && campaignToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Campaign</h3>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure to delete this campaign?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCampaignToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Ok'}
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
