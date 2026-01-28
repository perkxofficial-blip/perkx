'use client';

import { useState, useEffect } from 'react';
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
}

interface FormErrors {
  [key: string]: string;
}

interface Exchange {
  id: number;
  name: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    exchange_id: null,
    category: 'All Users',
    redirect_url: '',
    description: '',
    preview_start: '',
    preview_end: '',
    launch_start: '',
    launch_end: '',
    archive_start: '',
    archive_end: '',
    banner: null,
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

  // Fetch exchanges list on component mount
  useEffect(() => {
    const fetchExchanges = async () => {
      const token = auth.getAdminToken();
      if (!token) return;

      try {
        const data = await apiClient.get(endpoints.admin.exchangesList, token);
        
        if (data.statusCode === 200 && Array.isArray(data.data)) {
          setExchanges(data.data);
        } else if (Array.isArray(data)) {
          setExchanges(data);
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

    fetchExchanges();
  }, []);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, banner: 'File must not exceed 5MB.' }));
      showToast('File must not exceed 5MB.', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, banner: 'Please select an image file.' }));
      showToast('Please select an image file.', 'error');
      return;
    }

    setFormData(prev => ({ ...prev, banner: file }));
    setErrors(prev => ({ ...prev, banner: '' }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBanner = () => {
    setFormData(prev => ({ ...prev, banner: null }));
    setBannerPreview(null);
    setErrors(prev => ({ ...prev, banner: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'This is a required field.';
    }
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = 'This is a required field.';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'This is a required field.';
    }
    if (!formData.banner) {
      newErrors.banner = 'This is a required field.';
    }

    // Preview duration validation
    if (!formData.preview_start) {
      newErrors.preview_start = 'This is a required field.';
    }
    if (!formData.preview_end) {
      newErrors.preview_end = 'This is a required field.';
    }
    if (formData.preview_start && formData.preview_end) {
      if (new Date(formData.preview_end) <= new Date(formData.preview_start)) {
        newErrors.preview_end = 'End Date must be greater than Start Date.';
      }
    }

    // Launch duration validation
    if (!formData.launch_start) {
      newErrors.launch_start = 'This is a required field.';
    }
    if (!formData.launch_end) {
      newErrors.launch_end = 'This is a required field.';
    }
    if (formData.launch_start && formData.launch_end) {
      if (new Date(formData.launch_end) <= new Date(formData.launch_start)) {
        newErrors.launch_end = 'End Date must be greater than Start Date.';
      }
    }

    // Archive duration validation
    if (!formData.archive_start) {
      newErrors.archive_start = 'This is a required field.';
    }
    if (!formData.archive_end) {
      newErrors.archive_end = 'This is a required field.';
    }
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
      // Only send category if it's not "All Users" (which means no filter/category)
      if (formData.category && formData.category !== 'All Users') {
        formDataToSend.append('category', formData.category);
      }
      if (formData.redirect_url) {
        formDataToSend.append('redirect_url', formData.redirect_url);
      }
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

      await apiClient.postFormData(endpoints.admin.campaigns, formDataToSend, token || undefined);

      showToast('Campaign created successfully!', 'success');
      setTimeout(() => {
        router.push('/admin/campaigns');
      }, 5000);
    } catch (err: any) {
      console.error('Error creating campaign:', err);

      if (err.status === 500 || err.status === 401 || err.status === 403) {
        auth.clearAdminToken();
        window.location.href = '/admin/login';
        return;
      }
      const msg = err.response?.message ?? 'Failed to create campaign';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setLoading(false);
    }
  };

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
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold">
              1
            </div>
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
                  <option value="">Select Exchange</option>
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
                  <option value="All Users">All Users</option>
                  <option value="New User">New User</option>
                  <option value="Trading Competition">Trading Competition</option>
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                value={formData.redirect_url}
                onChange={(e) => handleInputChange('redirect_url', e.target.value)}
              />
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

        {/* Section 2: Timeline & Lifecycle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold">
              2
            </div>
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
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold">
              3
            </div>
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
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save & Publish'
              )}
            </button>
          </div>
        </div>
      </div>

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
