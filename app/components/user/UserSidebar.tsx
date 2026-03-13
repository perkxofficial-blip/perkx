'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { RefObject, useState } from 'react';
import { auth } from '@/services/auth';
import { LANGUAGES } from '@/app/utils/const';

interface UserProfileSidebarProps {
  asideRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function UserSidebar({
  asideRef,
  open,
  setOpen,
}: UserProfileSidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('user.profile');
  const tLang = useTranslations('language');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  const handleLogout = () => {
    // Clear cookies from client-side (cookies are httpOnly: false)
    auth.clearUserToken();
    // Redirect to home page
    router.push('/');
  };

  // Hàm tạo URL đổi ngôn ngữ giữ nguyên pathname hiện tại
  const getLanguageUrl = (langCode: string) => {
    if (typeof window === 'undefined') return '#';
    
    const host = window.location.host;
    const protocol = window.location.protocol;
    
    // Loại bỏ locale hiện tại khỏi pathname
    const pathWithoutLocale = pathname.replace(/^\/(en|ko|zh|ja|id|es)/, '') || '/';
    
    // Lấy base domain (loại bỏ subdomain locale nếu có)
    const hostname = host.replace(/^www\./, '');
    let baseDomain;
    
    if (hostname.includes('localhost')) {
      baseDomain = hostname; // giữ nguyên localhost:3000
    } else {
      // Loại bỏ subdomain locale (ko., ja., etc.)
      const parts = hostname.split('.');
      if (['ko', 'ja', 'zh', 'id', 'es'].includes(parts[0])) {
        baseDomain = parts.slice(1).join('.');
      } else {
        baseDomain = hostname;
      }
    }
    
    // Tạo URL với subdomain locale mới
    const targetUrl = langCode === 'en'
      ? `${protocol}//${baseDomain}${pathWithoutLocale}`
      : `${protocol}//${langCode}.${baseDomain}${pathWithoutLocale}`;
    
    return targetUrl;
  };

  return (
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
            href="/user/profile"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isActive('/user/profile')
                ? 'bg-[#DAB2FF]/20 !text-[#DAB2FF]'
                : '!text-[#C9C9C9] hover:bg-white/5 transition'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M22 20.9999V18.9999C21.9993 18.1136 21.7044 17.2527 21.1614 16.5522C20.6184 15.8517 19.8581 15.3515 19 15.1299M16 3.12988C16.8604 3.35018 17.623 3.85058 18.1676 4.55219C18.7122 5.2538 19.0078 6.11671 19.0078 7.00488C19.0078 7.89305 18.7122 8.75596 18.1676 9.45757C17.623 10.1592 16.8604 10.6596 16 10.8799M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" />
            </svg>
            <span className={`text-sm leading-5 tracking-normal ${
              isActive('/user/profile') ? 'font-bold' : 'font-medium'
            }`}>{t('title')}</span>
          </a>
          <a
            href="/user/linked-exchanges"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isActive('/user/linked-exchanges')
                ? 'bg-[#DAB2FF]/20 !text-[#DAB2FF]'
                : '!text-[#C9C9C9] hover:bg-white/5 transition'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997M14.0002 11C13.5707 10.4259 13.0228 9.9508 12.3936 9.60704C11.7645 9.26328 11.0687 9.05886 10.3535 9.00765C9.63841 8.95643 8.92061 9.05961 8.24885 9.3102C7.5771 9.56079 6.96709 9.95291 6.4602 10.46L3.4602 13.46C2.54941 14.403 2.04544 15.666 2.05683 16.977C2.06822 18.288 2.59407 19.542 3.52111 20.4691C4.44815 21.3961 5.70221 21.922 7.01319 21.9334C8.32418 21.9447 9.58719 21.4408 10.5302 20.53L12.2402 18.82" />
            </svg>
            <span className={`text-sm leading-5 tracking-normal ${
              isActive('/user/linked-exchanges') ? 'font-bold' : 'font-medium'
            }`}>{t('linked_exchanges')}</span>
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
                  <span className="text-sm font-medium">{LANGUAGES.filter(lang => lang.code === locale)[0]?.key}</span>
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
                      href={getLanguageUrl(lang.code)}
                      className={`block px-4 py-2 text-sm transition no-underline ${
                        locale === lang.code
                          ? 'bg-[#DAB2FF]/20 !text-[#DAB2FF] font-medium'
                          : '!text-[#C9C9C9] hover:bg-white/5 hover:!text-white'
                      }`}
                      onClick={() => setShowLanguageDropdown(false)}
                    >
                      {lang.key}
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
              <span className="text-sm font-medium">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
