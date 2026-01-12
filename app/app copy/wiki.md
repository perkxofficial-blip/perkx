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
└── middleware.ts                 # Route protection

## 4. Route Mapping
| URL             | File                             | Rendering | Layout       |
| --------------- | -------------------------------- | --------- | ------------ |
| `/`             | `(public)/page.tsx`              | SSR       | PublicLayout |
| `/user`         | `(public)/user/page.tsx`         | CSR       | PublicLayout |
| `/user/profile` | `(public)/user/profile/page.tsx` | CSR       | PublicLayout |
| `/admin`        | `(admin)/admin/page.tsx`         | CSR       | AdminLayout  |
| `/admin/users`  | `(admin)/admin/users/page.tsx`   | CSR       | AdminLayout  |
