import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';
import {LOCALES} from './app/utils/const';
import { cookies } from 'next/headers';

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: true,
});

function getLocaleFromHost(host: string): string {
  const hostname = host.replace(/^www\./, '').split(':')[0];
  const validLocales = ['ko', 'zh', 'ja', 'id', 'es'];
  
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && validLocales.includes(parts[0])) {
      return parts[0];
    }
  } else {
    const parts = hostname.split('.');
    if (parts.length > 2 && validLocales.includes(parts[0])) {
      return parts[0];
    }
  }
  
  return 'en'; // default
}

function getBaseDomain(host: string): string {
  const hostname = host.replace(/^www\./, '').split(':')[0];
  
  if (hostname.includes('localhost')) {
    return '.localhost';
  }
  
  if (hostname.includes('perkx.co')) {
    return '.perkx.co';
  }
  
  // Extract base domain from hostname (e.g., perkx.co from ko.perkx.co)
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    // Get last 2 parts (domain.tld)
    const baseDomain = parts.slice(-2).join('.');
    return '.' + baseDomain;
  }
  
  return '.' + hostname;
}

export default async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const {pathname} = request.nextUrl;
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  const locales = LOCALES;
  // Apply i18n middleware for public routes
  const response = intlMiddleware(request);
  // Detect locale from subdomain and sync with NEXT_LOCALE cookie
  const detectedLocale = getLocaleFromHost(host);
  const currentLocaleCookie = request.cookies.get('NEXT_LOCALE')?.value;
  const baseDomain = getBaseDomain(host);
  const userToken = cookieStore.get('token')?.value;

  if (locales.includes(maybeLocale)) {
    const newPath = '/' + segments.slice(2).join('/');
    const cleanPath = newPath === '/' ? '' : newPath;
    const hostname = host.replace(/^www\./, '');
    let baseDomain;
    if (hostname.includes('localhost')) {
      baseDomain = hostname.split('.').slice(-1)[0];
    } else {
      baseDomain = hostname.split('.').slice(-2).join('.');
    }
    if (maybeLocale === 'en') {
      const redirectUrl = `${protocol}://${baseDomain}${cleanPath}`;
      return NextResponse.redirect(redirectUrl);
    }

    const redirectUrl = `${protocol}://${maybeLocale}.${baseDomain}${cleanPath}`;
    return NextResponse.redirect(redirectUrl);
  }

  // Skip i18n for admin routes
  if (pathname.startsWith('/admin')) {
    // Auth check for admin
    const adminToken = request.cookies.get('admin_token');
    if (!adminToken && 
        !pathname.startsWith('/admin/login') && 
        !pathname.startsWith('/admin/forgot-password') &&
        !pathname.startsWith('/admin/reset-password')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // If locale changed or not set, update NEXT_LOCALE cookie with base domain
  if (currentLocaleCookie !== detectedLocale) {
    console.log('[proxy] Locale changed:', currentLocaleCookie, '->', detectedLocale, '| Domain:', baseDomain);
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      path: '/',
      domain: baseDomain, // Share cookie across all subdomains
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  response.headers.set('x-pathname', pathname);
  
  if (pathname.includes('/admin/login') && userToken) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Auth check for user routes
  if (pathname.includes('/user')) {
    if (!userToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  if (pathname.includes('/login') && userToken) {
    return NextResponse.redirect(new URL('/user/profile', request.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|js|uploads).*)',
  ]
};

