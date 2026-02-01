'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/services/auth';
import { apiClient } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import Toast from '@/components/admin/Toast';
import Link from 'next/link';

interface FormData {
  title: string;
  subtitle: string;
  exchange_id: number | null;
  category: string;
  redirect_url: string;
  description: string;
  preview_start: string;
  preview_end: string;
  launch_start: string;
  launch_end: string;
  archive_start: string;
  archive_end: string;
  banner: File | null;
  banner_url?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface Exchange {
  id: number;
  name: string;
}

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasFetched = useRef(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    exchange_id: null,
    category: 'all_user',
    redirect_url: '',
    description: '',
    preview_start: '',
    preview_end: '',
    launch_start: '',
    launch_end: '',
    archive_start: '',
    archive_end: '',
    banner: null,
    banner_url: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      const token = auth.getAdminToken();

      // Fetch campaign data
      try {
        const data = await apiClient.get(endpoints.admin.campaignDetail(resolvedParams.id), token || undefined);
        const campaign = data.data;

        setFormData({
          title: campaign.title || '',
          subtitle: campaign.sub_title || campaign.subtitle || '',
          exchange_id: campaign.exchange_id || null,
          category: campaign.category || 'all_user',
          redirect_url: campaign.redirect_url || '',
          description: campaign.description || '',
          preview_start: formatDateTimeLocal(campaign.preview_start),
          preview_end: formatDateTimeLocal(campaign.preview_end),
          launch_start: formatDateTimeLocal(campaign.launch_start),
          launch_end: formatDateTimeLocal(campaign.launch_end),
          archive_start: formatDateTimeLocal(campaign.archive_start),
          archive_end: formatDateTimeLocal(campaign.archive_end),
          banner: null,
          banner_url: campaign.banner_url || '',
        });

        if (campaign.banner_url) {
          setBannerPreview(campaign.banner_url);
        }
      } catch (err: any) {
        console.error('Error fetching campaign:', err);

        // If error status is 500, 401, or 403, clear token and redirect to login
        if (err.status === 500 || err.status === 401 || err.status === 403) {
          auth.clearAdminToken();
          window.location.href = '/admin/login';
        } else {
          showToast('Failed to load campaign', 'error');
        }
      } finally {
        setFetching(false);
      }

      // Fetch exchanges list
      try {
        const exchangesData = await apiClient.get(endpoints.admin.exchangesList, token || undefined);

        if (exchangesData.statusCode === 200 && Array.isArray(exchangesData.data)) {
          setExchanges(exchangesData.data);
        } else if (Array.isArray(exchangesData)) {
          setExchanges(exchangesData);
        }
      } catch (err: any) {
        console.error('Error fetching exchanges:', err);

        // If error status is 500, 401, or 403, clear token and redirect to login
        if (err.status === 500 || err.status === 401 || err.status === 403) {
          auth.clearAdminToken();
          window.location.href = '/admin/login';
        } else {
          showToast('Failed to load exchanges list', 'error');
        }
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, banner: 'File must not exceed 5MB.' }));
      showToast('File must not exceed 5MB.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, banner: 'Please select an image file.' }));
      showToast('Please select an image file.', 'error');
      return;
    }

    setFormData(prev => ({ ...prev, banner: file }));
    setErrors(prev => ({ ...prev, banner: '' }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = () => {
    setFormData(prev => ({ ...prev, banner: null, banner_url: '' }));
    setBannerPreview(null);
    setErrors(prev => ({ ...prev, banner: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors.title = 'This is a required field.';
    if (!formData.subtitle.trim()) newErrors.subtitle = 'This is a required field.';
    if (!formData.description.trim()) newErrors.description = 'This is a required field.';
    if (!formData.banner && !formData.banner_url) newErrors.banner = 'This is a required field.';

    // Validate redirect_url if provided
    if (formData.redirect_url.trim()) {
      try {
        new URL(formData.redirect_url);
      } catch {
        newErrors.redirect_url = 'Please enter a valid URL (e.g., https://example.com)';
      }
    }

    if (!formData.preview_start) newErrors.preview_start = 'This is a required field.';
    if (!formData.preview_end) newErrors.preview_end = 'This is a required field.';
    if (formData.preview_start && formData.preview_end) {
      if (new Date(formData.preview_end) <= new Date(formData.preview_start)) {
        newErrors.preview_end = 'End Date must be greater than Start Date.';
      }
    }

    if (!formData.launch_start) newErrors.launch_start = 'This is a required field.';
    if (!formData.launch_end) newErrors.launch_end = 'This is a required field.';
    if (formData.launch_start && formData.launch_end) {
      if (new Date(formData.launch_end) <= new Date(formData.launch_start)) {
        newErrors.launch_end = 'End Date must be greater than Start Date.';
      }
    }

    if (!formData.archive_start) newErrors.archive_start = 'This is a required field.';
    if (!formData.archive_end) newErrors.archive_end = 'This is a required field.';
    if (formData.archive_start && formData.archive_end) {
      if (new Date(formData.archive_end) <= new Date(formData.archive_start)) {
        newErrors.archive_end = 'End Date must be greater than Start Date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix all errors before submitting.', 'error');
      return;
    }

    setLoading(true);
    const token = auth.getAdminToken();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('sub_title', formData.subtitle);
      if (formData.exchange_id) {
        formDataToSend.append('exchange_id', formData.exchange_id.toString());
      }
      formDataToSend.append('category', formData.category);
      // Always send redirect_url, even if empty, to allow clearing it
      formDataToSend.append('redirect_url', formData.redirect_url.trim());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('preview_start', formData.preview_start);
      formDataToSend.append('preview_end', formData.preview_end);
      formDataToSend.append('launch_start', formData.launch_start);
      formDataToSend.append('launch_end', formData.launch_end);
      formDataToSend.append('archive_start', formData.archive_start);
      formDataToSend.append('archive_end', formData.archive_end);
      if (formData.banner) {
        formDataToSend.append('banner', formData.banner);
      }

      await apiClient.patchFormData(
        endpoints.admin.campaignDetail(resolvedParams.id),
        formDataToSend,
        token || undefined,
      );

      // Turn off loading state after API completes
      setLoading(false);

      // Show success message and set redirecting state
      showToast('Campaign updated successfully!', 'success');
      setRedirecting(true);

      // Wait longer if uploading a new banner file to ensure backend completes processing
      const delayTime = formData.banner ? 5000 : 1500;
      setTimeout(() => {
        router.push('/admin/campaigns');
      }, delayTime);
    } catch (err: any) {
      console.error('Error updating campaign:', err);
      console.error('Error status:', err.status);
      console.error('Error response:', err.response);

      setLoading(false);

      // Only redirect to login for authentication/authorization errors, not server errors
      if (err.status === 401 || err.status === 403) {
        auth.clearAdminToken();
        window.location.href = '/admin/login';
        return;
      }
      // Error message is already formatted in client.ts
      showToast(err.message || 'Failed to update campaign', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const token = auth.getAdminToken();

    try {
      await apiClient.delete(endpoints.admin.campaignDetail(resolvedParams.id), token || undefined);
      setShowDeleteModal(false);
      showToast('Campaign deleted successfully', 'success');
      setTimeout(() => {
        router.push('/admin/campaigns');
      }, 1500);
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

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/admin/campaigns" className="hover:text-blue-600">Campaigns</Link>
          <span>/</span>
          <span>Campaign Editor</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Campaign Editor</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Configure and publish your global crypto affiliate campaign.</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Campaign
          </button>
        </div>
      </div>

      {/* Same form sections as create page */}
      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Title
              </label>
              <input
                type="text"
                placeholder="e.g. BTC Moon Rewards 2024"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.title ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Campaign Subtitle
              </label>
              <input
                type="text"
                placeholder="Enter a brief subtitle for the campaign"
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.subtitle ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors`}
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
              />
              {errors.subtitle && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subtitle}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Holder Selection
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors"
                  value={formData.exchange_id || ''}
                  onChange={(e) => handleInputChange('exchange_id', e.target.value ? parseInt(e.target.value) : null)}
                >
                  {exchanges.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Category
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="all_user">All Users</option>
                  <option value="new_user">New User</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Join Campaign Button Redirect URL
              </label>
              <input
                type="text"
                placeholder="https://exchange.com/ref..."
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.redirect_url ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors`}
                value={formData.redirect_url}
                onChange={(e) => handleInputChange('redirect_url', e.target.value)}
              />
              {errors.redirect_url && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.redirect_url}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Describe the campaign objectives and details..."
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors`}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Timeline & Lifecycle - Same as create */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline & Lifecycle</h3>
          </div>

          <div className="space-y-6">
            {/* 1. Preview Duration */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <span className="text-red-600">1.</span> PREVIEW DURATION (UPCOMING STATE)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview Start
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.preview_start ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors`}
                    value={formData.preview_start}
                    onChange={(e) => handleInputChange('preview_start', e.target.value)}
                  />
                  {errors.preview_start && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.preview_start}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview End
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.preview_end ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors`}
                    value={formData.preview_end}
                    onChange={(e) => handleInputChange('preview_end', e.target.value)}
                  />
                  {errors.preview_end && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.preview_end}</p>}
                </div>
              </div>
            </div>

            {/* 2. Actual Run Duration */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <span className="text-red-600">2.</span> ACTUAL RUN DURATION (ACTIVE STATE)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Launch
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.launch_start ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors`}
                    value={formData.launch_start}
                    onChange={(e) => handleInputChange('launch_start', e.target.value)}
                  />
                  {errors.launch_start && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.launch_start}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campaign Expiry
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.launch_end ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors`}
                    value={formData.launch_end}
                    onChange={(e) => handleInputChange('launch_end', e.target.value)}
                  />
                  {errors.launch_end && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.launch_end}</p>}
                </div>
              </div>
            </div>

            {/* 3. Post Duration */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                <span className="text-red-600">3.</span> POST DURATION (EXPIRED STATE)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Post Settlement Start
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.archive_start ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors`}
                    value={formData.archive_start}
                    onChange={(e) => handleInputChange('archive_start', e.target.value)}
                  />
                  {errors.archive_start && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.archive_start}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Final Archive Date
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.archive_end ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors`}
                    value={formData.archive_end}
                    onChange={(e) => handleInputChange('archive_end', e.target.value)}
                  />
                  {errors.archive_end && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.archive_end}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Campaign Banner */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Banner</h3>
          </div>

          <div>
            {!bannerPreview ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Click to upload banner</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Recommended size: 1250 x 400px. Max file size: 5MB</p>
                  <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Select File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerChange}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={handleRemoveBanner}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {errors.banner && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.banner}</p>}
          </div>
        </div>

        {/* Section 4: Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/campaigns"
              className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading || redirecting}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : redirecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Redirecting...
                </>
              ) : (
                'Save & Publish'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                onClick={() => setShowDeleteModal(false)}
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
