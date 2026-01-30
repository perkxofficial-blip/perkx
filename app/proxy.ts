import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;
  
  // Skip i18n for admin routes
  if (pathname.startsWith('/admin')) {
    // Auth check for admin
    const adminToken = request.cookies.get('admin_token');
    if (!adminToken && !pathname.startsWith('/admin/login')) {
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

// export const config = {
//   matcher: [
//     '/',
//     '/(en|ko)/:path*',
//     '/login',
//     '/register',
//     '/verify-email',
//     '/verify',
//     '/verify-otp',
//     '/forgot-password',
//     '/reset-password',
//     '/user/:path*',
//     '/admin/:path*'
//   ]
// };

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|js).*)',
  ]
};

