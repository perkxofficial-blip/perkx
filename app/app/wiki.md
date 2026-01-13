# Next.js Architecture Wiki

## 1. Mục tiêu hệ thống

Thiết kế cấu trúc Next.js đáp ứng các yêu cầu sau:

- **Landing Page**
  - Responsive
  - Server-Side Rendering (SSR)
  - Load dữ liệu từ API có authentication
  - Phục vụ SEO

- **User Page**
  - Responsive
  - Client-Side Rendering (CSR)
  - Load dữ liệu từ API có authentication
  - Dùng chung style với Landing Page

- **Admin Page**
  - Không responsive
  - Client-Side Rendering (CSR)
  - Load dữ liệu từ API có authentication
  - Style riêng, độc lập với Landing/User

---

## 2. Nguyên tắc kiến trúc

### 2.1 Rendering Strategy

| Khu vực | Rendering | Mục đích |
|------|---------|---------|
| Landing Page | SSR | SEO, load nhanh |
| User Page | CSR | Trải nghiệm SPA |
| Admin Page | CSR | Nội bộ, không SEO |

### 2.2 Style Strategy

- Landing Page và User Page:
  - Dùng chung layout
  - Dùng chung design system
  - Responsive

- Admin Page:
  - Layout riêng
  - Theme riêng
  - Không responsive

### 2.3 Authentication

- Token-based authentication (JWT / Session Cookie)
- SSR: lấy token từ `cookies()`
- CSR: token từ cookie (khuyến nghị) hoặc localStorage
- Route protection bằng `middleware.ts`

### 2.4 Multiple Languages (i18n)

**Chiến lược đa ngôn ngữ:**

- **Library**: `next-intl` (khuyến nghị cho App Router) hoặc `next-i18next`
- **Locale Storage**: Server-side cookies để persist language preference
- **Routing**: URL-based locale (`/vi`, `/en`) hoặc domain-based
- **SSR Support**: Translations load server-side cho SEO
- **CSR Support**: Client hydration với đúng locale

**Supported Locales:**
- `en` - English (default)
- `ko` - 한국어 (Korean)

**Translation Strategy:**

| Khu vực | Yêu cầu i18n | Priority |
|---------|--------------|----------|
| Landing Page | English + Korean (SEO) | High |
| User Page | English + Korean | High |
| Admin Page | English only | Medium |

---

## 3. Cấu trúc thư mục Next.js (App Router)

```txt
src/
├── app/
│   ├── public/                # Landing + User (chung style)
│   │   ├── layout.tsx            # PublicLayout (responsive)
│   │   ├── page.tsx              # Landing page (SSR)
│   │   ├── user/
│   │   │   ├── layout.tsx        # UserLayout
│   │   │   ├── page.tsx          # User dashboard (CSR)
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │
│   ├── admin/                  # Admin zone (style riêng)
│   │   ├── layout.tsx            # AdminLayout (non-responsive)
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin dashboard (CSR)
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │
│   ├── api/                      # (Optional) BFF / API Proxy
│   │   └── proxy/
│   │       └── route.ts
│   │
│   └── globals.css
│
├── components/
│   ├── common/                   # Dùng chung landing + user
│   ├── user/
│   └── admin/
│
├── services/
│   ├── api.ts                    # Axios / fetch wrapper
│   ├── auth.ts
│   └── endpoints.ts
│
├── hooks/
│   ├── useAuth.ts
│   └── useUser.ts
│
├── styles/
│   ├── public/                   # Landing + User styles
│   └── admin/                    # Admin styles
│
├── utils/
│   └── fetcher.ts
│
├── i18n/
│   ├── request.ts                # Server-side i18n config
│   └── routing.ts                # Locale routing config

### 4.1 Route Structure (with i18n)

| URL                  | File                             | Rendering | Layout       | i18n |
| -------------------- | -------------------------------- | --------- | ------------ | ---- |
| `/`                  | `[locale]/(public)/page.tsx`     | SSR       | PublicLayout | ✅   |
| `/en`                | `[locale]/(public)/page.tsx`     | SSR       | PublicLayout | ✅   |
| `/ko`                | `[locale]/(public)/page.tsx`     | SSR       | PublicLayout | ✅   |
| `/en/user`           | `[locale]/(public)/user/page.tsx`| CSR       | PublicLayout | ✅   |
| `/ko/user`           | `[locale]/(public)/user/page.tsx`| CSR       | PublicLayout | ✅   |
| `/en/user/profile`   | `[locale]/(public)/user/profile/page.tsx` | CSR | PublicLayout | ✅ |
| `/ko/user/profile`   | `[locale]/(public)/user/profile/page.tsx` | CSR | PublicLayout | ✅ |
| `/admin`             | `(admin)/admin/page.tsx`         | CSR       | AdminLayout  | ❌   |
| `/admin/users`       | `(admin)/admin/users/page.tsx`   | CSR       | AdminLayout  | ❌   |

### 4.2 Route Structure (without i18n - simple)

│

---

## 5. i18n Implementation Guide

### 5.1 Cài đặt

```bash
npm install next-intl
```

### 5.2 Cấu trúc thư mục với i18n

```txt
app/
├── [locale]/                     # Dynamic locale segment
│   ├── (public)/
│   │   ├── layout.tsx            # Wrapped with NextIntlClientProvider
│   │   ├── page.tsx              # Landing (SSR + i18n)
│   │   └── user/
│   │       ├── page.tsx          # User dashboard (CSR + i18n)
│   │       └── profile/
│   │           └── page.tsx
│   └── layout.tsx                # Root locale layout
│
├── (admin)/                      # Admin zone (no locale)
│   └── admin/
│       ├── page.tsx
│       └── ...
│
└── layout.tsx                    # Root layout

messages/
├── en.json
└── ko.json
```

### 5.3 Translation Files Example

**messages/en.json**
```json
{
  "common": {
    "welcome": "Welcome",
    "login": "Login",
    "logout": "Logout"
  },
  "landing": {
    "title": "Welcome to Perkx",
    "description": "SSR Landing Page with Authentication"
  },
  "user": {
    "dashboard": "Dashboard",
    "profile": "Profile"
  }
}
```

**messages/ko.json**
```json
{
  "common": {
    "welcome": "환영합니다",
    "login": "로그인",
    "logout": "로그아웃"
  },
  "landing": {
    "title": "Perkx에 오신 것을 환영합니다",
    "description": "인증이 포함된 SSR 랜딩 페이지"
  },
  "user": {
    "dashboard": "대시보드",
    "profile": "프로필"
  }
}
```

### 5.4 i18n Configuration

**i18n/request.ts**
```typescript
import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}));
```

**i18n/routing.ts**
```typescript
import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' // '/en' optional, '/ko' required
});

export const {Link, redirect, usePathname, useRouter} = 
  createNavigation(routing);
```

**next.config.ts**
```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl({
  // Your Next.js config
});
```

### 5.5 Middleware với i18n + Auth

**middleware.ts**
```typescript
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
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

export const config = {
  matcher: ['/', '/(en|ko)/:path*', '/admin/:path*']
};
```

### 5.6 Usage trong Components

**SSR Component (Landing Page)**
```tsx
import {useTranslations} from 'next-intl';
import {getTranslations} from 'next-intl/server';

// Server Component
export default async function LandingPage() {
  const t = await getTranslations('landing');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

**CSR Component (User Page)**
```tsx
'use client';

import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/routing';

export default function UserDashboard() {
  const t = useTranslations('user');
  const router = useRouter();
  
  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <button onClick={() => router.push('/user/profile')}>
        {t('profile')}
      </button>
    </div>
  );
}
```

### 5.7 Language Switcher Component

**components/common/LanguageSwitcher.tsx**
```tsx
'use client';

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/routing';
import {useTransition} from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const changeLanguage = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, {locale: newLocale});
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLanguage('en')}
        disabled={isPending}
        className={locale === 'en' ? 'font-bold' : ''}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ko')}
        disabled={isPending}
        className={locale === 'ko' ? 'font-bold' : ''}
      >
        한국어
      </button>
    </div>
  );
}
```

### 5.8 Best Practices

1. **Server Components**: Dùng `getTranslations()` từ `next-intl/server`
2. **Client Components**: Dùng `useTranslations()` hook
3. **Navigation**: Dùng `Link`, `useRouter` từ `@/i18n/routing` (không phải `next/navigation`)
4. **Locale Detection**: 
   - Cookie (`NEXT_LOCALE`)
   - Accept-Language header
   - URL parameter
5. **SEO**: Mỗi locale có URL riêng cho tốt SEO
6. **Performance**: Chỉ load translation file của locale hiện tại
7. **Admin Zone**: Không dùng i18n cho admin (giữ đơn giản)

---

## 6. API Integration với i18n

### 6.1 Gửi Locale trong API Request

```typescript
// services/api.ts
export async function fetchWithLocale(
  url: string,
  locale: string,
  options?: RequestInit
) {
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Accept-Language': locale,
    },
  });
}
```

### 6.2 Backend Response với Multiple Languages

NestJS backend có thể:
- Nhận `Accept-Language` header
- Trả về content theo ngôn ngữ
- Hoặc trả về object có nhiều ngôn ngữ:

```json
{
  "title": {
    "en": "Welcome",
    "ko": "환영합니다"
  }
}
```
├── messages/                     # Translation files
│   ├── en.json
│   └── ko.json
│
└── middleware.ts                 # Route protection + Locale detection

## 4. Route Mapping
| URL             | File                             | Rendering | Layout       |
| --------------- | -------------------------------- | --------- | ------------ |
| `/`             | `(public)/page.tsx`              | SSR       | PublicLayout |
| `/user`         | `(public)/user/page.tsx`         | CSR       | PublicLayout |
| `/user/profile` | `(public)/user/profile/page.tsx` | CSR       | PublicLayout |
| `/admin`        | `(admin)/admin/page.tsx`         | CSR       | AdminLayout  |
| `/admin/users`  | `(admin)/admin/users/page.tsx`   | CSR       | AdminLayout  |
