'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/endpoints';
import { auth } from '@/services/auth';
import { COUNTRIES } from '@/lib/countries';
import Toast from '@/components/admin/Toast';

interface UserProfile {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: 'male' | 'female';
  birthday?: string;
  country?: string;
  referral_code?: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Field-level errors
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    gender: '',
    birthday: '',
    country: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isCopied, setIsCopied] = useState(false);

  // Helper function to parse field errors from API response
  const parseFieldErrors = (error: any): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};

    if (error.response?.message && Array.isArray(error.response.message)) {
      error.response.message.forEach((item: any) => {
        if (typeof item === 'object' && item.field && item.message) {
          fieldErrors[item.field] = item.message;
        }
      });
    }

    return fieldErrors;
  };

  // Helper function to validate password
  const validatePassword = (password: string): string | null => {
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Password needs to be a minimum of 8 characters, 1 number, and 1 uppercase letter.';
    }
    return null;
  };

  // Ref for date picker
  const datePickerRef = useRef<HTMLInputElement>(null);

  // Helper function to format date from ISO to display format (01 Jan 2026)
  const formatDateToDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Helper function to format date from Date object to ISO (YYYY-MM-DD)
  const formatDateToISO = (date: Date): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = auth.getUserToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await apiClient.get(endpoints.user.profile, token);
      const userData = response.data;

      setProfile(userData);
      setProfileForm({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        birthday: userData.birthday || '',
        country: userData.country || '',
      });
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleCopyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = auth.getUserToken();

      if (!token) {
        auth.clearUserToken();
        router.push('/');
        return;
      }

      await apiClient.put(endpoints.user.updateProfile, profileForm, token);

      showToast('Profile updated successfully!', 'success');
      setProfileErrors({}); // Clear all field errors on success
      await loadProfile();
    } catch (error: any) {
      console.error('Profile update error:', error);

      // Check for 401 Unauthorized - session expired
      if (error.status === 401) {
        auth.clearUserToken();
        router.push('/');
        return;
      }

      // Parse field-specific errors
      const fieldErrors = parseFieldErrors(error);

      if (Object.keys(fieldErrors).length > 0) {
        // Has field-specific errors - display them below fields
        setProfileErrors(fieldErrors);
        showToast('Please fix the errors in the form', 'error');
      } else {
        // General error - display as toast
        showToast(error.message || 'Failed to update profile', 'error');
        setProfileErrors({}); // Clear field errors
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validate new password
    const passwordValidationError = validatePassword(passwordForm.new_password);
    if (passwordValidationError) {
      showToast(passwordValidationError, 'error');
      setSaving(false);
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      showToast('Confirm password does not match.', 'error');
      setSaving(false);
      return;
    }

    try {
      const token = auth.getUserToken();

      if (!token) {
        auth.clearUserToken();
        router.push('/');
        return;
      }

      await apiClient.patch(endpoints.user.updatePassword, passwordForm, token);

      showToast('Reset password successfully!', 'success');
      setPasswordErrors({}); // Clear all field errors on success
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_new_password: '',
      });
    } catch (error: any) {
      console.error('Password update error:', error);

      // Check for 401 Unauthorized - session expired
      if (error.status === 401) {
        auth.clearUserToken();
        router.push('/');
        return;
      }

      // Parse field-specific errors
      const fieldErrors = parseFieldErrors(error);

      if (Object.keys(fieldErrors).length > 0) {
        // Has field-specific errors - display them below fields
        setPasswordErrors(fieldErrors);
        showToast('Please fix the errors in the form', 'error');
      } else {
        // General error - display as toast
        showToast(error.message || 'Failed to update password', 'error');
        setPasswordErrors({}); // Clear field errors
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    auth.clearUserToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18163C] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18163C] relative overflow-hidden">
      {/* Decorative Background Image */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(/images/bg-source.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'lighten'
        }}
      />

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:w-[260px] flex-shrink-0 bg-white/[0.02] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] min-h-screen">
          <div className="w-full flex flex-col pb-3">
            {/* Logo */}
            <div className="h-[73px] flex items-center justify-center px-4 py-[13px]">
              <img
                src="/images/logo.png"
                alt="PerkX Logo"
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-3 px-3">
              <a
                href="/user/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#DAB2FF]/20 !text-[#DAB2FF]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M22 20.9999V18.9999C21.9993 18.1136 21.7044 17.2527 21.1614 16.5522C20.6184 15.8517 19.8581 15.3515 19 15.1299M16 3.12988C16.8604 3.35018 17.623 3.85058 18.1676 4.55219C18.7122 5.2538 19.0078 6.11671 19.0078 7.00488C19.0078 7.89305 18.7122 8.75596 18.1676 9.45757C17.623 10.1592 16.8604 10.6596 16 10.8799M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" />
                </svg>
                <span className="text-sm font-bold leading-5 tracking-normal">My Profile</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2 rounded-lg !text-[#C9C9C9] hover:bg-white/5 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997M14.0002 11C13.5707 10.4259 13.0228 9.9508 12.3936 9.60704C11.7645 9.26328 11.0687 9.05886 10.3535 9.00765C9.63841 8.95643 8.92061 9.05961 8.24885 9.3102C7.5771 9.56079 6.96709 9.95291 6.4602 10.46L3.4602 13.46C2.54941 14.403 2.04544 15.666 2.05683 16.977C2.06822 18.288 2.59407 19.542 3.52111 20.4691C4.44815 21.3961 5.70221 21.922 7.01319 21.9334C8.32418 21.9447 9.58719 21.4408 10.5302 20.53L12.2402 18.82" />
                </svg>
                <span className="text-sm font-bold leading-5 tracking-normal">Linked Exchanges</span>
              </a>
            </nav>

            {/* Logout Button */}
            <div className="px-3 mt-auto">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#C9C9C9] hover:bg-white/5 transition w-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M10 8V6C10 5.46957 10.2107 4.96086 10.5858 4.58579C10.9609 4.21071 11.4696 4 12 4H19C19.5304 4 20.0391 4.21071 20.4142 4.58579C20.7893 4.96086 21 5.46957 21 6V18C21 18.5304 20.7893 19.0391 20.4142 19.4142C20.0391 19.7893 19.5304 20 19 20H12C11.4696 20 10.9609 19.7893 10.5858 19.4142C10.2107 19.0391 10 18.5304 10 18V16" />
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 12H3L6 9" />
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15L3 12" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-[20px]">
          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
              <h1 className="!text-[#FCFCFC] text-2xl font-bold">My Profile</h1>
              <p className="!text-[#FCFCFC] text-sm leading-7 m-0">Manage your official profile and secure your affiliate account</p>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mx-[40px]">
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                {/* Affiliate Connection Card */}
                <div
                  className="relative overflow-hidden rounded-[10px] shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] p-6"
                  style={{
                    background: 'linear-gradient(90deg, #2E193B 46.43%, rgba(46, 25, 59, 0.00) 100%), url(/images/login-bg.png) no-repeat right, rgba(255, 255, 255, 0.08)',
                    backgroundSize: '100%, 100% 100%, 100%',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  {/* Content */}
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="!text-[#FCFCFC] text-xl font-bold">Affiliate Connection</h2>
                      <p className="!text-[#FCFCFC] text-sm leading-[21px]">Share your referral link to earn rewards</p>
                    </div>

                    <div className="flex items-center gap-3 rounded-[8px] border-[0.5px] border-[#9FABED] bg-white/10 p-3 self-start">
                      <div className="inline-flex flex-col gap-2 rounded-lg px-4 py-0">
                        <label className="text-[#C9C9C9] text-sm font-medium leading-5 tracking-normal uppercase">
                          MY REFERRER ID
                        </label>
                        <div className="text-[#DAB2FF] text-2xl font-medium leading-5 tracking-normal">
                          {profile?.referral_code || 'PX-99284'}
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={handleCopyReferralCode}
                          className="flex items-center justify-center w-15 h-10 !rounded-[10px] shadow-[0_1px_2px_0_rgba(55,93,251,0.08)] hover:opacity-90 transition"
                          style={{
                            background: 'linear-gradient(95deg, #EF73D1 1.16%, #B388F4 102.96%)',
                            borderRadius: '10px'
                          }}
                          title={isCopied ? 'Copied!' : 'Copy Referral Code'}
                        >
                          {isCopied ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.25 5.5V3.25C6.25 3.05109 6.32902 2.86032 6.46967 2.71967C6.61032 2.57902 6.80109 2.5 7 2.5H16C16.1989 2.5 16.3897 2.57902 16.5303 2.71967C16.671 2.86032 16.75 3.05109 16.75 3.25V13.75C16.75 13.9489 16.671 14.1397 16.5303 14.2803C16.3897 14.421 16.1989 14.5 16 14.5H13.75V16.75C13.75 17.164 13.4125 17.5 12.9948 17.5H4.00525C3.90635 17.5006 3.8083 17.4816 3.71674 17.4442C3.62519 17.4068 3.54192 17.3517 3.47174 17.282C3.40156 17.2123 3.34584 17.1294 3.30779 17.0381C3.26974 16.9468 3.2501 16.8489 3.25 16.75L3.25225 6.25C3.25225 5.836 3.58975 5.5 4.0075 5.5H6.25ZM4.75225 7L4.75 16H12.25V7H4.75225ZM7.75 5.5H13.75V13H15.25V4H7.75V5.5Z" />
                            </svg>
                          )}
                        </button>
                        {isCopied && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#18163C] text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
                            Copied!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security & Password Card */}
                <div className="rounded-[10px] bg-white/[0.08] shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] backdrop-blur-[12px] p-6 flex flex-col flex-1">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="!text-[#FCFCFC] text-xl font-bold">Security & Password</h2>
                      <p className="!text-[#FCFCFC] text-sm leading-[21px]">Ensure your account is using a safe and secure password</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                      {/* Current Password */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? 'text' : 'password'}
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                            placeholder="Enter your password"
                            className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showPassword.current ? (
                              <svg className="w-5 h-5" fill="#C9C9C9" viewBox="0 0 20 20">
                                <path d="M9.99999 3.25C14.044 3.25 17.4085 6.16 18.1142 10C17.4092 13.84 14.044 16.75 9.99999 16.75C5.95599 16.75 2.59149 13.84 1.88574 10C2.59074 6.16 5.95599 3.25 9.99999 3.25ZM9.99999 15.25C11.5296 15.2497 13.0138 14.7301 14.2096 13.7764C15.4055 12.8226 16.2422 11.4912 16.5827 10C16.2409 8.50998 15.4037 7.18 14.208 6.22752C13.0122 5.27504 11.5287 4.7564 9.99999 4.7564C8.47126 4.7564 6.98776 5.27504 5.79202 6.22752C4.59629 7.18 3.75907 8.50998 3.41724 10C3.75781 11.4912 4.5945 12.8226 5.79035 13.7764C6.9862 14.7301 8.47039 15.2497 9.99999 15.25ZM9.99999 13.375C9.10489 13.375 8.24644 13.0194 7.61351 12.3865C6.98057 11.7536 6.62499 10.8951 6.62499 10C6.62499 9.10489 6.98057 8.24645 7.61351 7.61352C8.24644 6.98058 9.10489 6.625 9.99999 6.625C10.8951 6.625 11.7535 6.98058 12.3865 7.61352C13.0194 8.24645 13.375 9.10489 13.375 10C13.375 10.8951 13.0194 11.7536 12.3865 12.3865C11.7535 13.0194 10.8951 13.375 9.99999 13.375ZM9.99999 11.875C10.4973 11.875 10.9742 11.6775 11.3258 11.3258C11.6774 10.9742 11.875 10.4973 11.875 10C11.875 9.50272 11.6774 9.02581 11.3258 8.67418C10.9742 8.32254 10.4973 8.125 9.99999 8.125C9.50271 8.125 9.0258 8.32254 8.67417 8.67418C8.32254 9.02581 8.12499 9.50272 8.12499 10C8.12499 10.4973 8.32254 10.9742 8.67417 11.3258C9.0258 11.6775 9.50271 11.875 9.99999 11.875Z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="#C9C9C9" viewBox="0 0 20 20">
                                <path d="M2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L4.43753 5.14463C3.27307 6.08144 2.30413 7.25534 1.6082 8.59196C1.53177 8.73361 1.49065 8.89233 1.48877 9.05412C1.4869 9.21591 1.52433 9.37557 1.59754 9.51901C2.39572 11.2312 3.63585 12.6997 5.19421 13.7804C6.75258 14.8611 8.56966 15.416 10.4287 15.3818C11.2996 15.3699 12.1622 15.2327 12.9909 14.9747L15.1464 17.1303C15.3417 17.3256 15.6583 17.3256 15.8536 17.1303C16.0488 16.9351 16.0488 16.6185 15.8536 16.4232L2.85355 2.14645ZM11.9838 13.9676C11.3283 14.1713 10.6438 14.2748 9.95508 14.2748C7.11133 14.2748 4.51367 12.5859 3.13672 10C3.76562 8.88867 4.62695 7.92676 5.66797 7.17578L7.18359 8.69141C6.88672 9.20508 6.72461 9.79492 6.72461 10.418C6.72461 12.4297 8.36133 14.0664 10.373 14.0664C10.9961 14.0664 11.5859 13.9043 12.0996 13.6074L11.9838 13.9676Z" />
                                <path d="M8.95508 4.76758C9.28125 4.73633 9.61133 4.72266 9.94531 4.72266C12.7891 4.72266 15.3867 6.41211 16.7637 9C16.2617 10.0078 15.5781 10.9141 14.75 11.6738L15.4902 12.4141C16.4434 11.5234 17.2285 10.4551 17.8047 9.26758C17.877 9.12695 17.916 8.97266 17.918 8.81641C17.9199 8.66016 17.8848 8.50586 17.8145 8.36523C17.0234 6.66211 15.791 5.20117 14.2441 4.12695C12.6973 3.05273 10.8926 2.40234 9.03906 2.25C8.67578 2.22266 8.31641 2.21289 7.96094 2.22266L8.95508 4.76758Z" />
                                <path d="M10.373 7.76953C11.8301 7.76953 13.0215 8.96094 13.0215 10.418C13.0215 10.7129 12.9707 11.001 12.873 11.2695L10.373 7.76953Z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? 'text' : 'password'}
                            value={passwordForm.new_password}
                            onChange={(e) => {
                              setPasswordForm({ ...passwordForm, new_password: e.target.value });
                              if (passwordErrors.new_password) {
                                setPasswordErrors({ ...passwordErrors, new_password: '' });
                              }
                            }}
                            placeholder="Enter New Password"
                            className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showPassword.new ? (
                              <svg className="w-5 h-5" fill="#C9C9C9" viewBox="0 0 20 20">
                                <path d="M9.99999 3.25C14.044 3.25 17.4085 6.16 18.1142 10C17.4092 13.84 14.044 16.75 9.99999 16.75C5.95599 16.75 2.59149 13.84 1.88574 10C2.59074 6.16 5.95599 3.25 9.99999 3.25ZM9.99999 15.25C11.5296 15.2497 13.0138 14.7301 14.2096 13.7764C15.4055 12.8226 16.2422 11.4912 16.5827 10C16.2409 8.50998 15.4037 7.18 14.208 6.22752C13.0122 5.27504 11.5287 4.7564 9.99999 4.7564C8.47126 4.7564 6.98776 5.27504 5.79202 6.22752C4.59629 7.18 3.75907 8.50998 3.41724 10C3.75781 11.4912 4.5945 12.8226 5.79035 13.7764C6.9862 14.7301 8.47039 15.2497 9.99999 15.25ZM9.99999 13.375C9.10489 13.375 8.24644 13.0194 7.61351 12.3865C6.98057 11.7536 6.62499 10.8951 6.62499 10C6.62499 9.10489 6.98057 8.24645 7.61351 7.61352C8.24644 6.98058 9.10489 6.625 9.99999 6.625C10.8951 6.625 11.7535 6.98058 12.3865 7.61352C13.0194 8.24645 13.375 9.10489 13.375 10C13.375 10.8951 13.0194 11.7536 12.3865 12.3865C11.7535 13.0194 10.8951 13.375 9.99999 13.375ZM9.99999 11.875C10.4973 11.875 10.9742 11.6775 11.3258 11.3258C11.6774 10.9742 11.875 10.4973 11.875 10C11.875 9.50272 11.6774 9.02581 11.3258 8.67418C10.9742 8.32254 10.4973 8.125 9.99999 8.125C9.50271 8.125 9.0258 8.32254 8.67417 8.67418C8.32254 9.02581 8.12499 9.50272 8.12499 10C8.12499 10.4973 8.32254 10.9742 8.67417 11.3258C9.0258 11.6775 9.50271 11.875 9.99999 11.875Z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="#C9C9C9" viewBox="0 0 20 20">
                                <path d="M2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L4.43753 5.14463C3.27307 6.08144 2.30413 7.25534 1.6082 8.59196C1.53177 8.73361 1.49065 8.89233 1.48877 9.05412C1.4869 9.21591 1.52433 9.37557 1.59754 9.51901C2.39572 11.2312 3.63585 12.6997 5.19421 13.7804C6.75258 14.8611 8.56966 15.416 10.4287 15.3818C11.2996 15.3699 12.1622 15.2327 12.9909 14.9747L15.1464 17.1303C15.3417 17.3256 15.6583 17.3256 15.8536 17.1303C16.0488 16.9351 16.0488 16.6185 15.8536 16.4232L2.85355 2.14645ZM11.9838 13.9676C11.3283 14.1713 10.6438 14.2748 9.95508 14.2748C7.11133 14.2748 4.51367 12.5859 3.13672 10C3.76562 8.88867 4.62695 7.92676 5.66797 7.17578L7.18359 8.69141C6.88672 9.20508 6.72461 9.79492 6.72461 10.418C6.72461 12.4297 8.36133 14.0664 10.373 14.0664C10.9961 14.0664 11.5859 13.9043 12.0996 13.6074L11.9838 13.9676Z" />
                                <path d="M8.95508 4.76758C9.28125 4.73633 9.61133 4.72266 9.94531 4.72266C12.7891 4.72266 15.3867 6.41211 16.7637 9C16.2617 10.0078 15.5781 10.9141 14.75 11.6738L15.4902 12.4141C16.4434 11.5234 17.2285 10.4551 17.8047 9.26758C17.877 9.12695 17.916 8.97266 17.918 8.81641C17.9199 8.66016 17.8848 8.50586 17.8145 8.36523C17.0234 6.66211 15.791 5.20117 14.2441 4.12695C12.6973 3.05273 10.8926 2.40234 9.03906 2.25C8.67578 2.22266 8.31641 2.21289 7.96094 2.22266L8.95508 4.76758Z" />
                                <path d="M10.373 7.76953C11.8301 7.76953 13.0215 8.96094 13.0215 10.418C13.0215 10.7129 12.9707 11.001 12.873 11.2695L10.373 7.76953Z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {passwordErrors.new_password && (
                          <p className="text-red-400 text-sm mt-1">{passwordErrors.new_password}</p>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? 'text' : 'password'}
                            value={passwordForm.confirm_new_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_new_password: e.target.value })}
                            placeholder="Confirm New Password"
                            className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {showPassword.confirm ? (
                              <svg className="w-5 h-5" fill="#C9C9C9" viewBox="0 0 20 20">
                                <path d="M9.99999 3.25C14.044 3.25 17.4085 6.16 18.1142 10C17.4092 13.84 14.044 16.75 9.99999 16.75C5.95599 16.75 2.59149 13.84 1.88574 10C2.59074 6.16 5.95599 3.25 9.99999 3.25ZM9.99999 15.25C11.5296 15.2497 13.0138 14.7301 14.2096 13.7764C15.4055 12.8226 16.2422 11.4912 16.5827 10C16.2409 8.50998 15.4037 7.18 14.208 6.22752C13.0122 5.27504 11.5287 4.7564 9.99999 4.7564C8.47126 4.7564 6.98776 5.27504 5.79202 6.22752C4.59629 7.18 3.75907 8.50998 3.41724 10C3.75781 11.4912 4.5945 12.8226 5.79035 13.7764C6.9862 14.7301 8.47039 15.2497 9.99999 15.25ZM9.99999 13.375C9.10489 13.375 8.24644 13.0194 7.61351 12.3865C6.98057 11.7536 6.62499 10.8951 6.62499 10C6.62499 9.10489 6.98057 8.24645 7.61351 7.61352C8.24644 6.98058 9.10489 6.625 9.99999 6.625C10.8951 6.625 11.7535 6.98058 12.3865 7.61352C13.0194 8.24645 13.375 9.10489 13.375 10C13.375 10.8951 13.0194 11.7536 12.3865 12.3865C11.7535 13.0194 10.8951 13.375 9.99999 13.375ZM9.99999 11.875C10.4973 11.875 10.9742 11.6775 11.3258 11.3258C11.6774 10.9742 11.875 10.4973 11.875 10C11.875 9.50272 11.6774 9.02581 11.3258 8.67418C10.9742 8.32254 10.4973 8.125 9.99999 8.125C9.50271 8.125 9.0258 8.32254 8.67417 8.67418C8.32254 9.02581 8.12499 9.50272 8.12499 10C8.12499 10.4973 8.32254 10.9742 8.67417 11.3258C9.0258 11.6775 9.50271 11.875 9.99999 11.875Z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="#C9C9C9" viewBox="0 0 20 20">
                                <path d="M2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L4.43753 5.14463C3.27307 6.08144 2.30413 7.25534 1.6082 8.59196C1.53177 8.73361 1.49065 8.89233 1.48877 9.05412C1.4869 9.21591 1.52433 9.37557 1.59754 9.51901C2.39572 11.2312 3.63585 12.6997 5.19421 13.7804C6.75258 14.8611 8.56966 15.416 10.4287 15.3818C11.2996 15.3699 12.1622 15.2327 12.9909 14.9747L15.1464 17.1303C15.3417 17.3256 15.6583 17.3256 15.8536 17.1303C16.0488 16.9351 16.0488 16.6185 15.8536 16.4232L2.85355 2.14645ZM11.9838 13.9676C11.3283 14.1713 10.6438 14.2748 9.95508 14.2748C7.11133 14.2748 4.51367 12.5859 3.13672 10C3.76562 8.88867 4.62695 7.92676 5.66797 7.17578L7.18359 8.69141C6.88672 9.20508 6.72461 9.79492 6.72461 10.418C6.72461 12.4297 8.36133 14.0664 10.373 14.0664C10.9961 14.0664 11.5859 13.9043 12.0996 13.6074L11.9838 13.9676Z" />
                                <path d="M8.95508 4.76758C9.28125 4.73633 9.61133 4.72266 9.94531 4.72266C12.7891 4.72266 15.3867 6.41211 16.7637 9C16.2617 10.0078 15.5781 10.9141 14.75 11.6738L15.4902 12.4141C16.4434 11.5234 17.2285 10.4551 17.8047 9.26758C17.877 9.12695 17.916 8.97266 17.918 8.81641C17.9199 8.66016 17.8848 8.50586 17.8145 8.36523C17.0234 6.66211 15.791 5.20117 14.2441 4.12695C12.6973 3.05273 10.8926 2.40234 9.03906 2.25C8.67578 2.22266 8.31641 2.21289 7.96094 2.22266L8.95508 4.76758Z" />
                                <path d="M10.373 7.76953C11.8301 7.76953 13.0215 8.96094 13.0215 10.418C13.0215 10.7129 12.9707 11.001 12.873 11.2695L10.373 7.76953Z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={saving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_new_password}
                        className="inline-flex items-center justify-center gap-1 px-4 py-[10px] !rounded-[10px] bg-gradient-to-r from-[#EF73D1]/80 to-[#B388F4]/80 hover:from-[#EF73D1] hover:to-[#B388F4] shadow-[0_1px_2px_0_rgba(55,93,251,0.08)] disabled:opacity-50 self-start"
                      >
                        <span className="text-white text-center text-lg font-medium leading-5 tracking-[-0.108px]">
                          {saving ? 'Updating...' : 'Update Password'}
                        </span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Overview */}
              <div className="rounded-[10px] bg-white/[0.08] shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] backdrop-blur-[12px] p-6 flex flex-col">
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex flex-col gap-1">
                    <h2 className="!text-[#FCFCFC] text-xl font-bold">Profile Overview</h2>
                    <p className="!text-[#FCFCFC] text-sm leading-[21px]">Update your account info and manage your profile</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                    {/* First Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, first_name: e.target.value });
                          if (profileErrors.first_name) {
                            setProfileErrors({ ...profileErrors, first_name: '' });
                          }
                        }}
                        placeholder="Jane Thompson"
                        className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                      />
                      {profileErrors.first_name && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.first_name}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, last_name: e.target.value });
                          if (profileErrors.last_name) {
                            setProfileErrors({ ...profileErrors, last_name: '' });
                          }
                        }}
                        placeholder="Jane Thompson"
                        className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                      />
                      {profileErrors.last_name && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.last_name}</p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile?.email}
                        disabled
                        className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959]/30 bg-transparent shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white/40 text-sm cursor-not-allowed"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, phone: e.target.value });
                          if (profileErrors.phone) {
                            setProfileErrors({ ...profileErrors, phone: '' });
                          }
                        }}
                        placeholder="+1-9293-764-8903"
                        className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                      />
                      {profileErrors.phone && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.phone}</p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                        Gender
                      </label>
                      <div className="relative">
                        <select
                          value={profileForm.gender}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, gender: e.target.value });
                            if (profileErrors.gender) {
                              setProfileErrors({ ...profileErrors, gender: '' });
                            }
                          }}
                          className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm appearance-none focus:outline-none focus:border-purple-500 [&>option]:bg-[#18163C] [&>option]:text-white"
                        >
                          <option value="" className="bg-[#18163C] text-white">Select gender</option>
                          <option value="Male" className="bg-[#18163C] text-white">Male</option>
                          <option value="Female" className="bg-[#18163C] text-white">Female</option>
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" fill="#C9C9C9" viewBox="0 0 20 20">
                          <path d="M10.0001 10.8785L13.7126 7.16602L14.7731 8.22652L10.0001 12.9995L5.22705 8.22652L6.28755 7.16602L10.0001 10.8785Z" />
                        </svg>
                      </div>
                      {profileErrors.gender && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.gender}</p>
                      )}
                    </div>

                    {/* Birthday */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                        Birthday
                      </label>
                      <div className="relative">
                        {/* Hidden native date input */}
                        <input
                          ref={datePickerRef}
                          type="date"
                          value={profileForm.birthday}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, birthday: e.target.value });
                            if (profileErrors.birthday) {
                              setProfileErrors({ ...profileErrors, birthday: '' });
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '1px',
                            height: '1px',
                            opacity: 0
                          }}
                        />
                        {/* Visible custom input */}
                        <div
                          onClick={() => {
                            const input = datePickerRef.current;
                            if (input) {
                              if (typeof input.showPicker === 'function') {
                                try {
                                  input.showPicker();
                                } catch (e) {
                                  // Fallback for browsers that don't support showPicker
                                  input.focus();
                                }
                              } else {
                                input.focus();
                              }
                            }
                          }}
                          className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white placeholder:text-white/50 text-sm focus:outline-none focus:border-purple-500 cursor-pointer flex items-center justify-between"
                        >
                          <span className={profileForm.birthday ? 'text-white' : 'text-white/50'}>
                            {profileForm.birthday ? formatDateToDisplay(profileForm.birthday) : '01 Jan 2000'}
                          </span>
                          {/* Calendar icon */}
                          <svg
                            className="w-5 h-5 opacity-70"
                            fill="none"
                            stroke="#C9C9C9"
                            viewBox="0 0 24 24"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></rect>
                            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
                            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
                            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
                          </svg>
                        </div>
                      </div>
                      {profileErrors.birthday && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.birthday}</p>
                      )}
                    </div>

                    {/* Country */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">
                        Country
                      </label>
                      <div className="relative">
                        <select
                          value={profileForm.country}
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, country: e.target.value });
                            if (profileErrors.country) {
                              setProfileErrors({ ...profileErrors, country: '' });
                            }
                          }}
                          className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm appearance-none focus:outline-none focus:border-purple-500 [&>option]:bg-[#18163C] [&>option]:text-white"
                        >
                          <option value="" className="bg-[#18163C] text-white">Select country</option>
                          {COUNTRIES.map((country) => (
                            <option key={country.value} value={country.value} className="bg-[#18163C] text-white">
                              {country.label}
                            </option>
                          ))}
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" fill="#C9C9C9" viewBox="0 0 20 20">
                          <path d="M10.0001 10.8785L13.7126 7.16602L14.7731 8.22652L10.0001 12.9995L5.22705 8.22652L6.28755 7.16602L10.0001 10.8785Z" />
                        </svg>
                      </div>
                      {profileErrors.country && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.country}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-start gap-2 mt-auto">
                      <button
                        type="submit"
                        disabled={saving || !profileForm.first_name.trim() || !profileForm.last_name.trim()}
                        className="flex items-center justify-center gap-1 px-4 py-[10px] !rounded-[10px] bg-gradient-to-r from-[#EF73D1]/80 to-[#B388F4]/80 hover:from-[#EF73D1] hover:to-[#B388F4] shadow-[0_1px_2px_0_rgba(55,93,251,0.08)] disabled:opacity-50"
                      >
                        <span className="text-[#FCFCFC] text-center text-lg font-medium leading-5 tracking-[-0.108px]">
                          {saving ? 'Saving...' : 'Save Profile Changes'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={loadProfile}
                        className="flex items-center justify-center gap-1 px-4 py-[10px] !rounded-[10px] bg-white/10 hover:bg-white/20 shadow-[0_1px_2px_0_rgba(55,93,251,0.08)]"
                      >
                        <span className="text-[#FCFCFC] text-center text-lg font-medium leading-5 tracking-[-0.108px]">
                          Cancel
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={5000}
        />
      )}
    </div>
  );
}
