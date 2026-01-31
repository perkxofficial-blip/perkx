'use client';

import { useState, useRef } from 'react';
import { auth } from '@/services/auth';
import { apiClient } from '@/services/api';
import { endpoints } from '@/services/endpoints';
import Toast from '@/components/admin/Toast';

export default function ExchangePartnerConfigPage() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({
    show: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleDownloadTemplate = () => {
    const templateUrl = process.env.NEXT_PUBLIC_EXCHANGE_TEMPLATE_URL;
    
    if (!templateUrl) {
      showToast('Template URL not configured', 'error');
      return;
    }

    const link = document.createElement('a');
    link.href = templateUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template downloaded successfully', 'success');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous errors when selecting new file
    setUploadErrors([]);

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      showToast('Invalid file format. Please use the provided template.', 'error');
      return;
    }

    setSelectedFile(file);
    handleUpload(file);
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadErrors([]);
    const token = auth.getAdminToken();

    try {
      const formData = new FormData();
      formData.append('file', file);

      await apiClient.postFormData(endpoints.admin.exchangesImport, formData, token || undefined);

      showToast('File uploaded successfully! Exchanges page updated.', 'success');
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      
      // If error status is 500, 401, or 403, clear token and redirect to login
      if (err.status === 500 || err.status === 401 || err.status === 403) {
        auth.clearAdminToken();
        window.location.href = '/admin/login';
      } else if (err.status === 400) {
        // Handle validation errors (400 Bad Request)
        const errors: string[] = [];
        
        if (err.response?.errors && Array.isArray(err.response.errors)) {
          // If backend returns errors array
          errors.push(...err.response.errors);
        } else if (err.response?.message) {
          // If backend returns message
          if (Array.isArray(err.response.message)) {
            errors.push(...err.response.message);
          } else {
            errors.push(err.response.message);
          }
        } else if (err.message) {
          errors.push(err.message);
        } else {
          errors.push('Validation error occurred');
        }
        
        setUploadErrors(errors);
      } else {
        showToast(err.message || 'Failed to upload file', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Exchange Partner Configuration
        </h2>
      </div>

      {/* Main Content Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="p-8">
          {/* Instructions */}
          <div className="mb-8 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Instructions</h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Update your homepage exchange list by uploading an Excel file. Use the template provided below to ensure correct data formatting and avoid validation errors.
              </p>
            </div>
          </div>

          {/* Download Template Button */}
          <div className="mb-8">
            <button
              onClick={handleDownloadTemplate}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Excel Template
            </button>

            {/* Upload Errors Display */}
            {uploadErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                      Upload Failed - Validation Errors:
                    </h4>
                    <ul className="space-y-1">
                      {uploadErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-800 dark:text-red-300">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload File Area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Upload Excel File here
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {selectedFile ? `Selected: ${selectedFile.name}` : 'Click the button below to select a file'}
              </p>

              <button
                onClick={handleSelectFileClick}
                disabled={uploading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Select File
                  </>
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
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
