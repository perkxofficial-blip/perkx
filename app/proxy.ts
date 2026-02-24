import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';

  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  const locales = ['ko', 'ja', 'zh', 'en', 'es', 'id'];
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
  
  // Apply i18n middleware for public routes
  const response = intlMiddleware(request);
  
  // Auth check for user routes
  if (pathname.includes('/user')) {
    const userToken = request.cookies.get('token');
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

