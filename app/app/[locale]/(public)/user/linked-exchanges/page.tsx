'use client';

import {useEffect, useRef, useState} from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { auth } from '@/services/auth';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/endpoints';

const LANGUAGES = [
  { code: 'en', key: 'language.en' },
  { code: 'ko', key: 'language.ko' },
  { code: 'zh', key: 'language.zh' },
  { code: 'ja', key: 'language.ja' },
  { code: 'id', key: 'language.id' },
  { code: 'es', key: 'language.es' },
] as const;

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
}

export default function LinkedExchangesPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('user.linked_exchanges');
  const tLang = useTranslations('language');
  const tProfile = useTranslations('user.profile');
  const [loading, setLoading] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('');
  const [uidCode, setUidCode] = useState('');
  const [availableExchanges, setAvailableExchanges] = useState<any[]>([]);
  const [isRelinking, setIsRelinking] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exchangeToDelete, setExchangeToDelete] = useState<Exchange | null>(null);
  const [modalMounted, setModalMounted] = useState(false);
  const [deleteModalMounted, setDeleteModalMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        asideRef.current &&
        !asideRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    loadExchanges();
  }, []);

  useEffect(() => {
    if (showLinkModal) {
      setTimeout(() => setModalMounted(true), 10);
    } else {
      setModalMounted(false);
    }
  }, [showLinkModal]);

  useEffect(() => {
    if (showDeleteModal) {
      setTimeout(() => setDeleteModalMounted(true), 10);
    } else {
      setDeleteModalMounted(false);
    }
  }, [showDeleteModal]);

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

  const loadExchanges = async () => {
    try {
      const token = auth.getUserToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await apiClient.get(endpoints.user.exchanges, token);
      // Handle different response formats
      const exchangesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.exchanges || response.data?.data || []);
      console.log(exchangesData);
      setExchanges(exchangesData as Exchange[]);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading exchanges:', error);
      
      // Check for 401 Unauthorized - session expired
      if (error.status === 401) {
        auth.clearUserToken();
        router.push('/login');
        return;
      }
      
      setLoading(false);
    }
  };

  const loadAvailableExchanges = async () => {
    try {
      const response = await apiClient.get(endpoints.public.exchanges);
      const exchangesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.exchanges || response.data?.data || []);
      setAvailableExchanges(exchangesData);
    } catch (error: any) {
      console.error('Error loading available exchanges:', error);
    }
  };

  const handleLogout = () => {
    auth.clearUserToken();
    router.push('/');
  };

  const handleDeleteClick = (exchange: Exchange) => {
    setExchangeToDelete(exchange);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!exchangeToDelete) return;

    try {
      const token = auth.getUserToken();

      if (!token) {
        router.push('/login');
        return;
      }

      // Call API to delete exchange
      await apiClient.delete(
        `${endpoints.user.linkExchange}/${exchangeToDelete.id}`,
        token
      );

      // Remove from local state
      setExchanges(exchanges.filter(ex => ex.id !== exchangeToDelete.id));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setExchangeToDelete(null);
      
      // Show success toast
      setToast({ message: t('delete_success'), type: 'success' });
    } catch (error: any) {
      console.error('Error deleting exchange:', error);
      
      if (error.status === 401) {
        auth.clearUserToken();
        router.push('/login');
        return;
      }
      
      // Show error toast
      setToast({ message: t('delete_error'), type: 'error' });
      
      // Close modal
      setShowDeleteModal(false);
      setExchangeToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setExchangeToDelete(null);
  };

  const handleLinkAgain = async (exchange: Exchange) => {
    await loadAvailableExchanges();
    setSelectedExchange(exchange.exchange_id.toString());
    setUidCode('');
    setLinkErrors({});
    setIsRelinking(true);
    setShowLinkModal(true);
  };

  const handleSubmitLink = async () => {
    try {
      const token = auth.getUserToken();

      if (!token) {
        router.push('/login');
        return;
      }

      const exchangeId = parseInt(selectedExchange);
      console.log('Selected exchange:', selectedExchange);
      console.log('Exchange ID (parsed):', exchangeId);
      
      if (isNaN(exchangeId)) {
        console.error('Invalid exchange ID');
        setToast({ message: t('link_error'), type: 'error' });
        return;
      }

      const response = await apiClient.post(endpoints.user.linkExchange, {
        exchange_id: exchangeId,
        exchange_uid: uidCode
      }, token);

      // Reset form and close modal
      setSelectedExchange('');
      setUidCode('');
      setLinkErrors({});
      setShowLinkModal(false);
      setIsRelinking(false);
      
      // Show success toast
      setToast({ message: t('link_success'), type: 'success' });
      
      // Reload exchanges
      await loadExchanges();
    } catch (error: any) {
      console.error('Error linking exchange:', error);
      
      if (error.status === 401) {
        auth.clearUserToken();
        router.push('/login');
        return;
      }
      
      // Parse field-specific errors
      const fieldErrors = parseFieldErrors(error);

      if (Object.keys(fieldErrors).length > 0) {
        // Has field-specific errors - display them below fields
        setLinkErrors(fieldErrors);
        setToast({ message: t('link_error'), type: 'error' });
      } else {
        // General error - display as toast only
        const errorMessage = error.response?.message || error.message || t('link_error');
        setToast({ message: errorMessage, type: 'error' });
        setLinkErrors({});
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'rgba(226, 255, 241, 0.20)',
          text: '#21DC84'
        };
      case 'PENDING':
        return {
          bg: 'rgba(253, 171, 48, 0.16)',
          text: '#FDAB30'
        };
      case 'REJECTED':
        return {
          bg: 'rgba(255, 102, 102, 0.16)',
          text: '#FF6666'
        };
      default:
        return {
          bg: 'rgba(226, 255, 241, 0.20)',
          text: '#21DC84'
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return t('status_active');
      case 'PENDING':
        return t('status_pending');
      case 'REJECTED':
        return t('status_rejected');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18163C] flex items-center justify-center">
        <div className="text-white text-lg">{t('loading')}</div>
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
        <aside
          ref={asideRef}
          className={`hidden lg:flex lg:w-[260px] flex-shrink-0 bg-white/[0.02] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] min-h-screen ${open ? 'profile-aside' : ''}`}
        >
          <div className="w-full flex flex-col pb-3">
            {/* Logo */}
            <div className="h-[73px] flex items-center justify-center px-4 py-[13px] profile-aside-top">
              <button
                className="navbar-toggler show-xs"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
                onClick={() => setOpen(!open)}
              >
                <span className="navbar-toggler-icon" />
              </button>
              <a href="/" className="block">
                <img
                  src="/images/logo.png"
                  alt="PerkX Logo"
                  className="h-10 w-auto object-contain hover:opacity-90 transition-opacity cursor-pointer"
                />
              </a>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-3 px-3">
              <a
                href={`/${locale}/user/profile`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg !text-[#C9C9C9] hover:bg-white/5 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M22 20.9999V18.9999C21.9993 18.1136 21.7044 17.2527 21.1614 16.5522C20.6184 15.8517 19.8581 15.3515 19 15.1299M16 3.12988C16.8604 3.35018 17.623 3.85058 18.1676 4.55219C18.7122 5.2538 19.0078 6.11671 19.0078 7.00488C19.0078 7.89305 18.7122 8.75596 18.1676 9.45757C17.623 10.1592 16.8604 10.6596 16 10.8799M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5  4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" />
                </svg>
                <span className="text-sm font-medium leading-5 tracking-normal">{tProfile('title')}</span>
              </a>
              <a
                href={`/${locale}/user/linked-exchanges`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#DAB2FF]/20 !text-[#DAB2FF]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997M14.0002 11C13.5707 10.4259 13.0228 9.9508 12.3936 9.60704C11.7645 9.26328 11.0687 9.05886 10.3535 9.00765C9.63841 8.95643 8.92061 9.05961 8.24885 9.3102C7.5771 9.56079 6.96709 9.95291 6.4602 10.46L3.4602 13.46C2.54941 14.403 2.04544 15.666 2.05683 16.977C2.06822 18.288 2.59407 19.542 3.52111 20.4691C4.44815 21.3961 5.70221 21.922 7.01319 21.9334C8.32418 21.9447 9.58719 21.4408 10.5302 20.53L12.2402 18.82" />
                </svg>
                <span className="text-sm font-bold leading-5 tracking-normal">{t('title')}</span>
              </a>
            </nav>

           <div className="btn-user-bottom">
             {/* Language Switcher */}
             <div className="px-3 mb-3">
               <div className="relative">
                 <button
                   onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                   className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-[#C9C9C9]"
                 >
                   <div className="flex items-center gap-2">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                       <path d="M22 12C22 17.5228 17.5228 22 12 22M22 12C22 6.47715 17.5228 2 12 2M22 12H2M12 22C6.47715 22 2 17.5228 2 12M12 22C9.43223 19.3038 8 15.7233 8 12C8 8.27674 9.43223 4.69615 12 2M12 22C14.5678 19.3038 16 15.7233 16 12C16 8.27674 14.5678 4.69615 12 2M2 12C2 6.47715 6.47715 2 12 2" stroke="#C9C9C9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                     <span className="text-sm font-medium">{tLang(locale)}</span>
                   </div>
                   <svg className={`w-4 h-4 transition-transform ${showLanguageDropdown ? '-rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                   </svg>
                 </button>

                 {showLanguageDropdown && (
                   <div className="absolute left-full bottom-0 ml-1 bg-[#2A2651] rounded-lg shadow-lg overflow-hidden z-[100] border border-white/10 min-w-[200px]">
                     {LANGUAGES.map((lang) => (
                       <a
                         key={lang.code}
                         href={`/${lang.code}/user/linked-exchanges`}
                         className={`block px-4 py-2 text-sm transition no-underline ${
                           locale === lang.code
                             ? 'bg-[#DAB2FF]/20 !text-[#DAB2FF] font-medium'
                             : '!text-[#C9C9C9] hover:bg-white/5 hover:!text-white'
                         }`}
                         onClick={() => setShowLanguageDropdown(false)}
                       >
                         {tLang(lang.code)}
                       </a>
                     ))}
                   </div>
                 )}
               </div>
             </div>

             {/* Logout Button */}
             <div className="px-3">
               <button
                 onClick={handleLogout}
                 className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#C9C9C9] hover:bg-white/5 transition w-full"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M10 8V6C10 5.46957 10.2107 4.96086 10.5858 4.58579C10.9609 4.21071 11.4696 4 12 4H19C19.5304 4 20.0391 4.21071 20.4142 4.58579C20.7893 4.96086 21 5.46957 21 6V18C21 18.5304 20.7893 19.0391 20.4142 19.4142C20.0391 19.7893 19.5304 20 19 20H12C11.4696 20 10.9609 19.7893 10.5858 19.4142C10.2107 19.0391 10 18.5304 10 18V16" />
                   <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 12H3L6 9" />
                   <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 15L3 12" />
                 </svg>
                 <span className="text-sm font-medium">{tProfile('logout')}</span>
               </button>
             </div>
           </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-[20px] profile-main">
          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="items-end gap-6 le-header">
              <div className="flex flex-col gap-1 flex-1">
                <div className="d-flex align-items-center justify-content-between profile-menu">
                  <button
                    ref={btnRef}
                    className="navbar-toggler show-xs"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    onClick={() => setOpen(!open)}
                  >
                    <span className="navbar-toggler-icon" />
                  </button>

                  <h1 className="text-secondary m-0">
                    {t('title')}
                  </h1>
                </div>
                <p className="text-muted leading-7 m-0 hidden-xs">{t('subtitle')}</p>
              </div>

              <div className="flex items-center gap-4 le-box">
                {/* Total Linked Badge */}
                <div className="le-box-link flex items-center gap-3 px-3 py-2 border border-white/10" style={{ borderRadius: '12px', background: 'rgba(248, 249, 250, 0.20)' }}>
                  <div className="flex flex-col gap-1 pr-3 border-r" style={{ borderRightColor: 'rgba(252, 252, 252, 0.20)', borderRightWidth: '1px' }}>
                    <span className="text-[#FCFCFC] text-sm font-normal uppercase leading-5 tracking-normal">{t('total_linked')}</span>
                    <span className="text-[#6EDAFF] text-2xl font-bold leading-tight">{exchanges.length}</span>
                  </div>
                  <div className="flex items-center justify-center w-10 ml-3 h-10 bg-[#89EFFF]" style={{ borderRadius: '6px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997M14.0002 11C13.5707 10.4259 13.0228 9.9508 12.3936 9.60704C11.7645 9.26328 11.0687 9.05886 10.3535 9.00765C9.63841 8.95643 8.92061 9.05961 8.24885 9.3102C7.5771 9.56079 6.96709 9.95291 6.4602 10.46L3.4602 13.46C2.54941 14.403 2.04544 15.666 2.05683 16.977C2.06822 18.288 2.59407 19.542 3.52111 20.4691C4.44815 21.3961 5.70221 21.922 7.01319 21.9334C8.32418 21.9447 9.58719 21.4408 10.5302 20.53L12.2402 18.82" stroke="#18163C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Link New Exchange Button */}
                <button
                  onClick={() => {
                    loadAvailableExchanges();
                    setIsRelinking(false);
                    setSelectedExchange('');
                    setUidCode('');
                    setLinkErrors({});
                    setShowLinkModal(true);
                  }}
                  className="le-btn flex items-center justify-center gap-1 px-4 py-[10px] !rounded-[10px] bg-gradient-to-r from-[#EF73D1]/80 to-[#B388F4]/80 hover:from-[#EF73D1] hover:to-[#B388F4] shadow-[0_1px_2px_0_rgba(55,93,251,0.08)] transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 20 20">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4.16675 10.0003H15.8334M10.0001 4.16699V15.8337" />
                  </svg>
                  <span className="text-white text-center text-lg font-medium leading-5 tracking-[-0.108px]">{t('link_new_exchange')}</span>
                </button>
              </div>
            </div>

            {/* Exchange Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exchanges && exchanges.length > 0 ? exchanges.map((exchange) => {
                const statusBadge = getStatusBadge(exchange.status);
                return (
                  <div
                    key={exchange.id}
                    className="flex items-center gap-4 p-4 rounded-[10px] bg-white/[0.08] shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] backdrop-blur-[12px]"
                  >
                    {/* Exchange Logo */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black p-0 flex-shrink-0">
                      <img 
                        src={exchange.logo_url} 
                        alt={exchange.exchange_name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="!text-[#FCFCFC] text-sm font-bold leading-tight truncate">{exchange.exchange_name}</h3>
                        <p className="!text-[#FCFCFC] text-sm font-normal leading-5 tracking-normal m-0 mb-1 break-all">{t('uid')}: {exchange.exchange_uid}</p>
                        <div
                          className="inline-flex items-center justify-center px-2 py-0.5 rounded-[60px] self-start"
                          style={{ background: statusBadge.bg }}
                        >
                          <span
                            className="text-xs font-medium uppercase"
                            style={{ color: statusBadge.text, lineHeight: '120%', letterSpacing: '0.36px' }}
                          >
                            {getStatusLabel(exchange.status)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 items-end">
                        {/* Delete Icon */}
                        <button
                          onClick={() => handleDeleteClick(exchange)}
                          className="text-[#C9C9C9] hover:text-red-400 transition flex-shrink-0 mb-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M10 11V17M14 11V17" />
                          </svg>
                        </button>

                        {/* Link Again Button for REJECTED status */}
                        {exchange.status === 'REJECTED' && (
                          <button
                            onClick={() => handleLinkAgain(exchange)}
                            className="flex items-center justify-center gap-1 px-3 py-2 hover:bg-white/30 transition"
                            style={{ 
                              borderRadius: '10px',
                              background: 'rgba(255, 255, 255, 0.20)'
                            }}
                          >
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M17.5 10C17.5 8.01088 16.7098 6.10322 15.3033 4.6967C13.8968 3.29018 11.9891 2.5 10 2.5C7.90329 2.50789 5.89081 3.32602 4.38333 4.78333L2.5 6.66667M2.5 6.66667V2.5M2.5 6.66667H6.66667M2.5 10C2.5 11.9891 3.29018 13.8968 4.6967 15.3033C6.10322 16.7098 8.01088 17.5 10 17.5C12.0967 17.4921 14.1092 16.674 15.6167 15.2167L17.5 13.3333M17.5 13.3333H13.3333M17.5 13.3333V17.5" stroke="white"/>
                          </svg>
                            <span className="text-white text-xs font-medium whitespace-nowrap">{t('link_again')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-[#C9C9C9] text-base">{t('no_exchanges')}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Link New Exchange Modal */}
      {showLinkModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[200] p-4 transition-all duration-200"
          style={{
            backgroundColor: modalMounted ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
          }}
          onClick={() => setShowLinkModal(false)}
        >
          <div 
            className="bg-[#2A2651] rounded-[20px] w-full max-w-md p-6 relative transition-all duration-200"
            style={{
              opacity: modalMounted ? 1 : 0,
              transform: modalMounted ? 'scale(1)' : 'scale(0.95)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowLinkModal(false);
                setIsRelinking(false);
                setSelectedExchange('');
                setUidCode('');
                setLinkErrors({});
              }}
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="flex flex-col gap-6">
              <h2 className="!text-[#FCFCFC] !text-lg !font-semibold !leading-7 !tracking-normal">
                {isRelinking ? t('modal_link_again_title') : t('modal_link_title')}
              </h2>

              {/* Exchange Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">{t('exchange_label')}</label>
                <div className="relative">
                  <select
                    value={selectedExchange}
                    onChange={(e) => {
                      setSelectedExchange(e.target.value);
                      // Clear error when user selects exchange
                      if (linkErrors.exchange_id) {
                        setLinkErrors({ ...linkErrors, exchange_id: '' });
                      }
                    }}
                    disabled={isRelinking}
                    className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm appearance-none focus:outline-none focus:border-purple-500 [&>option]:bg-[#18163C] [&>option]:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-[#18163C] text-white">{t('select_exchange')}</option>
                    {availableExchanges.map((exchange: any) => (
                      <option 
                        key={exchange.id} 
                        value={exchange.id} 
                        className="bg-[#18163C] text-white"
                      >
                        {exchange.name}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" fill="#C9C9C9" viewBox="0 0 20 20">
                    <path d="M10.0001 10.8785L13.7126 7.16602L14.7731 8.22652L10.0001 12.9995L5.22705 8.22652L6.28755 7.16602L10.0001 10.8785Z" />
                  </svg>
                </div>
                {linkErrors.exchange_id && (
                  <p className="text-red-400 text-sm mt-1">{linkErrors.exchange_id}</p>
                )}
              </div>

              {/* UID Code Input */}
              <div className="flex flex-col gap-1">
                <label className="text-[#C9C9C9] text-sm leading-5 tracking-[-0.084px]">{t('uid_code_label')}</label>
                <input
                  type="text"
                  value={uidCode}
                  onChange={(e) => {
                    setUidCode(e.target.value);
                    // Clear error when user types
                    if (linkErrors.exchange_uid) {
                      setLinkErrors({ ...linkErrors, exchange_uid: '' });
                    }
                  }}
                  placeholder={t('uid_code_placeholder')}
                  maxLength={20}
                  className="w-full h-10 px-3 py-2 rounded-[10px] border-[0.5px] border-[#595959] bg-white/12 shadow-[0_1px_2px_0_rgba(228,229,231,0.24)] text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-purple-500"
                />
                {linkErrors.exchange_uid && (
                  <p className="text-red-400 text-sm mt-1">{linkErrors.exchange_uid}</p>
                )}
              </div>

              {/* View Exchange Info Link */}
              <a
                href={`/${locale}/exchanges`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6EDAFF] text-sm font-medium hover:underline text-center w-full"
              >
                {t('view_exchange_info')}
              </a>

              {/* Submit Button */}
              <button
                onClick={handleSubmitLink}
                disabled={!selectedExchange || !uidCode}
                className="w-full py-[10px] !rounded-[10px] bg-gradient-to-r from-[#EF73D1]/80 to-[#B388F4]/80 hover:from-[#EF73D1] hover:to-[#B388F4] shadow-[0_1px_2px_0_rgba(55,93,251,0.08)] text-white text-lg font-medium leading-5 tracking-[-0.108px] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {t('submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && exchangeToDelete && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[300] p-4 transition-all duration-200"
          style={{
            backgroundColor: deleteModalMounted ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
          }}
          onClick={handleCancelDelete}
        >
          <div 
            className="bg-[#2A2651] rounded-[20px] w-full max-w-md p-6 relative transition-all duration-200"
            style={{
              opacity: deleteModalMounted ? 1 : 0,
              transform: deleteModalMounted ? 'scale(1)' : 'scale(0.95)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCancelDelete}
              className="absolute top-6 right-6 text-white hover:text-gray-300 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="flex flex-col gap-6">
              <h2 className="!text-[#FCFCFC] !text-lg !font-semibold !leading-7 !tracking-normal">{t('modal_delete_title')}</h2>

              {/* Message */}
              <div className="flex flex-col gap-2 text-center mb-3">
                <p className="!text-[#FCFCFC] text-base font-normal leading-normal tracking-normal m-0">
                  {t('delete_confirm_message')}
                </p>
                <p className="!text-[#FCFCFC] text-base font-normal leading-normal tracking-normal m-0">
                  {t('delete_confirm_warning')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 py-[10px] !rounded-[10px] bg-white/10 hover:bg-white/20 text-white text-center text-lg font-medium leading-5 tracking-[-0.108px] transition"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-[10px] !rounded-[10px] bg-gradient-to-r from-[#EF73D1]/80 to-[#B388F4]/80 hover:from-[#EF73D1] hover:to-[#B388F4] shadow-[0_1px_2px_0_rgba(55,93,251,0.08)] text-white text-center text-lg font-medium leading-5 tracking-[-0.108px] transition"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999]" style={{ animation: 'slideUp 0.3s ease-out' }}>
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.4)] min-w-[360px] max-w-md ${
            toast.type === 'success' ? 'bg-[#0d2818] border-[#22c55e]' : 'bg-[#2a0f0f] border-[#ef4444]'
          }`}>
            <span className={toast.type === 'success' ? 'text-[#4ade80]' : 'text-[#f87171]'}>
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              )}
            </span>
            <p className={`text-sm font-medium mb-0 flex-1 ${toast.type === 'success' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
              {toast.message}
            </p>
            <button onClick={() => setToast(null)} className={`flex-shrink-0 hover:opacity-70 transition-opacity ${toast.type === 'success' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
