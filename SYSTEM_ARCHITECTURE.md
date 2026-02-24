# System Architecture

## Overview
The Perkx system follows a modern **Monorepo-style Client-Server Architecture**, separating the frontend presentation layer from the backend business logic. The system is designed for scalability, security, and internationalization, utilizing **Next.js** for the frontend and **NestJS** for the backend, deployed on **AWS**.

## High-Level Architecture
1.  **Frontend (Client):** A Next.js application that serves as the user interface for both public users and administrators. It consumes RESTful APIs exposed by the backend.
2.  **Backend (Server):** A NestJS application acting as the core API service, handling business logic, data persistence, and external integrations (Email, S3).
3.  **Database:** A relational PostgreSQL database managing all application data, utilizing TypeORM for object-relational mapping.
4.  **Storage:** AWS S3 is used for storing uploaded user content and public assets, served via CloudFront CDN.

---

## Technology Stack

### Frontend (`/app`)
*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **Styling:**
    *   **Tailwind CSS v4** (Utility-first CSS)
    *   **Sass/SCSS** (Custom styles)
    *   **Bootstrap 5** (Component library)
*   **Internationalization:** `next-intl` (Supports EN, ES, ID, JA, KO, ZH)
*   **State Management:** React Hooks (`useAuth`, `useUser`)
*   **Key Libraries:** `swiper` (Carousels), `react-dom`

### Backend (`/api`)
*   **Framework:** [NestJS](https://nestjs.com/)
*   **Language:** TypeScript
*   **Database ORM:** TypeORM
*   **Documentation:** Swagger / OpenAPI
*   **Authentication:** Passport.js (JWT Strategy)
*   **Validation:** `class-validator`, `class-transformer`
*   **File Handling:** Multer + AWS SDK v3 (S3)
*   **Email:** Nodemailer

### Database
*   **Engine:** PostgreSQL 16+
*   **Management:** TypeORM Migrations

---

## Core Modules & Features

### 1. User Module (`/api/src/modules/user`)
Handles end-user functionality:
*   **Authentication:** Registration, Login (OTP, Password), Email Verification.
*   **Profile:** Management of user details and preferences.
*   **Exchange:** Logic for product exchanges and transactions.

### 2. Admin Module (`/api/src/modules/admin`)
Provides back-office capabilities:
*   **Dashboards:** System overview and metrics.
*   **User Management:** Control over user accounts and permissions.
*   **Campaign Management:** Creation and monitoring of marketing campaigns.
*   **Content Management:** Managing Wiki/Pages.

### 3. Public Module (`/api/src/modules/public`)
*   Exposes public-facing endpoints that do not require authentication (e.g., initial configuration, public catalogs).

### 4. Common Utilities (`/api/src/common`)
Shared logic across the backend:
*   **Guards:** Role-based access control (Admin/User).
*   **Interceptors:** Response formatting and logging.
*   **Decorators:** Custom parameter extraction (e.g., `@CurrentUser`).

---

## Data Flow
1.  **User Request:** A user interacts with the Next.js frontend.
2.  **API Call:** The frontend sends a request to `api.perkx.co` (routed via Route 53 -> ALB).
3.  **Processing:**
    *   The NestJS API validates the JWT token (if protected).
    *   The request is routed to the appropriate Controller/Service.
    *   Business logic is executed.
4.  **Persistence:** The service interacts with the PostgreSQL DB via TypeORM repositories.
5.  **Response:** The data is transformed and sent back to the client as JSON.

## User Roles & Access Control

The system supports three distinct user roles with different access levels:

### 1. Guest (Public Access)
*   **Access Path:** `perkx.co`
*   **Permissions:** Can view public content, browse catalogs, and access marketing pages.
*   **Authentication:** Not required.

### 2. User (Authenticated)
*   **Access Path:** `perkx.co/user`
*   **Permissions:** Full access to user features including profile management, product exchanges, and transactions.
*   **Authentication:** JWT-based authentication required.

### 3. Admin (Privileged)
*   **Access Path:** `perkx.co/admin`
*   **Permissions:** Complete administrative access including user management, campaign creation, and system configuration.
*   **Authentication:** Separate JWT token with shorter expiration (1 day vs 7 days for users).

---

## Security & Auth
*   **JWT (JSON Web Tokens):** Used for stateless authentication.
*   **Dual JWT Secrets:** Separate secrets for User and Admin authentication.
    *   User JWT: 7-day expiration
    *   Admin JWT: 1-day expiration
*   **RBAC (Role-Based Access Control):** Enforced via Guards at the API level.
*   **Encryption:** Passwords hashed using `bcrypt`.
