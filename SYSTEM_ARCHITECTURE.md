# System Architecture

## Overview
The Perkx system is a **Full-Stack Web Application** built on a client-server architecture. The system manages user exchanges, campaigns, and administrative operations with support for multiple languages and user roles (Guest, User, Admin).

---

## Architecture Diagram

```
User/Admin/DevOps
      ↓
  Firewall (WAF)
      ↓
  Loadbalancer (ALB)
      ↓
  ┌─────────────────────────────────────┐
  │            Perkx System             │
  │                                     │
  │  ┌─────────────────┐  ┌──────────┐ │
  │  │  APP            │→→│ Storage  │ │
  │  │  (NextJS-SSR)   │  │ (S3+CDN) │ │
  │  └─────────────────┘  └──────────┘ │
  │                                     │
  │  ┌─────────────────┐  ┌──────────┐ │
  │  │  API            │→→│ Database │ │
  │  │  (NestJS)       │  │ (RDS PG) │ │
  │  └─────────────────┘  └──────────┘ │
  └─────────────────────────────────────┘
```

---

## Core Components

### 1. Firewall (AWS WAF)
**Role:** First line of defense
- Filters malicious traffic before reaching the application
- Protects against common web exploits (SQL injection, XSS, DDoS)
- Attached to Application Load Balancers

---

### 2. Loadbalancer (Application Load Balancer)
**Role:** Traffic distribution and SSL termination

**Frontend ALB** (`perkx.co`):
- Routes HTTPS traffic to APP component (port 80)
- Handles SSL/TLS termination
- Health checks on Next.js instances

**Backend ALB** (`api.perkx.co`):
- Routes HTTPS traffic to API component (port 8080)
- Handles SSL/TLS termination
- Health checks on NestJS instances

---

### 3. APP Component (Next.js SSR)
**Technology:** Next.js 16 + TypeScript  
**Runtime:** Node.js (port 3000) managed by PM2  
**Access:** Via Nginx reverse proxy on port 80

**Role:** Frontend application layer
- **Server-Side Rendering (SSR)** for optimal SEO and performance
- **Multi-language support** (EN, ES, ID, JA, KO, ZH) using `next-intl`
- **Three user interfaces:**
  - **Guest** (`/`): Public landing pages, catalogs
  - **User** (`/user/*`): Authenticated user dashboard, profile, exchanges
  - **Admin** (`/admin/*`): Administrative management interface

**Tech Stack:**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4 + Sass + Bootstrap 5
- Custom hooks: `useAuth`, `useUser`

**File Structure:**
```
/app
├── components/
│   ├── public/    # Guest components
│   ├── user/      # User dashboard components
│   └── admin/     # Admin panel components
├── services/      # API client services
├── i18n/          # Internationalization
└── [locale]/      # Localized routes
```

**Connection to Storage:**
- Loads images from CloudFront CDN (`cdn.perkx.co`)
- Displays user-uploaded content
- Static assets delivery

---

### 4. API Component (NestJS)
**Technology:** NestJS + TypeScript  
**Runtime:** Node.js (port 3001) managed by PM2  
**Access:** Via Nginx reverse proxy on port 8080

**Role:** Backend business logic and data management
- **RESTful API** endpoints for all operations
- **JWT authentication** with separate tokens for Users/Admins
- **Database operations** via TypeORM
- **File upload handling** to S3
- **Email notifications** via Nodemailer

**Module Structure:**

**User Module** (`/api/src/modules/user`):
- Authentication (registration, login, OTP, email verification)
- Profile management
- Exchange operations

**Admin Module** (`/api/src/modules/admin`):
- Admin authentication (separate JWT secret, 1-day expiration)
- User account management
- Campaign management
- Content management (pages/wiki)
- Exchange oversight

**Public Module** (`/api/src/modules/public`):
- Public endpoints (no authentication required)
- Public exchange catalogs
- Public content pages

**Common Utilities** (`/api/src/common`):
- Guards: `AdminGuard`, `UserGuard` (RBAC)
- Interceptors: Response formatting, logging
- Decorators: `@CurrentUser`, `@CurrentAdmin`
- Validators: Custom validation rules

**Tech Stack:**
- NestJS framework
- Passport.js (JWT Strategy)
- TypeORM (database ORM)
- Swagger/OpenAPI (documentation)
- AWS SDK v3 (S3 integration)
- Nodemailer (email)
- bcrypt (password hashing)

**Connection to Database:**
- All CRUD operations via TypeORM repositories
- Transaction management
- Migration-based schema changes

---

### 5. Storage (AWS S3 + CloudFront)
**AWS S3 Bucket:**
- User-uploaded images
- Static product images
- Marketing assets

**CloudFront CDN** (`cdn.perkx.co`):
- Global content delivery
- Caches images for fast access
- Reduces latency worldwide

**Integration:**
- API uploads files using AWS SDK v3 + Multer
- APP loads images via CloudFront URLs
- Automatic cache invalidation when needed

---

### 6. Database (AWS RDS PostgreSQL)
**Technology:** PostgreSQL 16+  
**Access:** Internal only (Security Group restrictions)

**Role:** Persistent data storage

**Entities:**
- **Users:** `user`, `user_login_otp`, `user_email_verification`, `user_password_reset`
- **Admins:** `admin`, `admin_password_reset`
- **Exchanges:** `exchange`, `exchange_product`, `user_exchange`
- **Content:** `page`, `campaign`
- **Security:** `access_log`, `access_block_rule`

**Management:**
- TypeORM migrations for schema changes
- Automated backups via AWS Backup
- Security Group allows EC2 access only

---

## Request Flow

### Guest User Flow
```
User → WAF → Frontend ALB → Nginx:80 → Next.js:3000
                              ↓
                    Fetch data from API
                              ↓
User ← HTML (SSR) ← Next.js:3000 ← Backend ALB ← Nginx:8080 ← NestJS:3001 ← Database
```

### Authenticated User Flow
```
User login → WAF → Backend ALB → Nginx:8080 → NestJS:3001
                                                   ↓
                                            Validate credentials
                                                   ↓
                                            Generate JWT (7 days)
                                                   ↓
User ← JWT token ← Backend ALB ← Nginx:8080 ← NestJS:3001
```

### File Upload Flow
```
User → Upload → WAF → Backend ALB → Nginx:8080 → NestJS:3001
                                                      ↓
                                                  Multer + AWS SDK
                                                      ↓
                                                   S3 Bucket
                                                      ↓
User ← CDN URL ← Backend ALB ← Nginx:8080 ← NestJS:3001 ← Database (save URL)
```

### Image Loading Flow
```
User → Request image → CloudFront CDN → S3 Bucket → Image returned to User
```

---

## Deployment Architecture

**EC2 Instance Structure:**
```
┌─────────────────────────────────────┐
│          EC2 Instance               │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Nginx (Reverse Proxy)       │  │
│  │  - Port 80  → Next.js:3000   │  │
│  │  - Port 8080 → NestJS:3001   │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  PM2 (Process Manager)       │  │
│  │  - Next.js SSR process       │  │
│  │  - NestJS API process        │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Application Code            │  │
│  │  - /app (Next.js)            │  │
│  │  - /api (NestJS)             │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Deployment Process:**
1. SSH to EC2 instance
2. `git pull` latest code
3. `npm install` (install dependencies)
4. `npm run build` (build applications)
5. `pm2 restart ecosystem.config.js` (restart processes)

**Scaling:** Manual provisioning of additional EC2 instances and ALB target group registration

---

## Security Architecture

**Authentication:**
- JWT-based stateless authentication
- Separate secrets for User (7-day) and Admin (1-day) tokens
- Password hashing with bcrypt
- OTP login support
- Email verification tokens

**Authorization:**
- Role-Based Access Control (RBAC)
- Guard-protected routes (`AdminGuard`, `UserGuard`)
- Controller-level permission checks

**Infrastructure:**
- WAF filtering at application edge
- HTTPS-only communication
- Security Group network isolation
- Public subnet with controlled access
