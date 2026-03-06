import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';
import {LOCALES} from './app/utils/sitemapUtils';
import { cookies } from 'next/headers';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const {pathname} = request.nextUrl;
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';

  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  const locales = LOCALES;
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
console.log('Request URL:', request.url);
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
  
  // Apply i18n middleware for public routes
  const response = intlMiddleware(request);
  
  // Thêm pathname vào response headers để server component có thể đọc
  response.headers.set('x-pathname', pathname);
  
  // Auth check for user routes
  if (pathname.includes('/user')) {
    const userToken = cookieStore.get('token')?.value;
    console.log('userToken:', userToken);
    if (!userToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|js|uploads).*)',
  ]
};

