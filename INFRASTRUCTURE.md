# Infrastructure Documentation

## Overview
The Perkx infrastructure is hosted on **Amazon Web Services (AWS)**, designed for high availability, fault tolerance, and secure public access. The setup utilizes a Virtual Private Cloud (VPC) with public and private segmentation to protect sensitive resources like application servers and databases.

---

## AWS Resource Map

### 1. Network Layer
*   **VPC (Virtual Private Cloud):** Hosting the entire isolated network environment.
*   **Availability Zones (AZs):** Resources are distributed across multiple AZs (likely 2+) for redundancy.
*   **Subnets:**
    *   **Public Subnets (Implied):** Hosting Load Balancers and NAT Gateways.
    *   **Private Subnets:** Hosting the Compute Fleet (EC2) and Database (RDS).

### 2. Traffic Entry & Routing
*   **Route 53 (DNS):** Manages domain resolution for:
    *   `perkx.co` (Main landing/app)
    *   `api.perkx.co` (Backend API)
    *   `cdn.perkx.co` (Static Assets)
*   **WAF (Web Application Firewall):** Sits in front of the Load Balancers/CloudFront to filter malicious traffic.
*   **CloudFront (CDN):** Caches and delivers static content (images, JS, CSS) globally from S3/Load Balancers to reduce latency.

### 3. Application Layer (Compute)
*   **Application Load Balancers (ALB) - Dual Configuration:**
    *   **Frontend ALB (`perkx.co`):**
        *   Routes HTTPS traffic to Nginx on port 80 of the EC2 instances.
        *   Handles SSL termination for the main web application.
        *   Serves all user-facing routes: Guest (`/`), User (`/user/*`), Admin (`/admin/*`).
    *   **Backend ALB (`api.perkx.co`):**
        *   Routes HTTPS traffic to Nginx on port 8080 of the EC2 instances.
        *   Handles SSL termination for API requests.
        *   Provides RESTful endpoints consumed by the frontend.
*   **Auto Scaling Group (Fleet of EC2):**
    *   Dynamically adjusts the number of EC2 instances based on traffic load (CPU/Memory utilization).
    *   Ensures high availability; if an instance fails, a new one is spun up.
*   **EC2 Instances (Co-located Services):**
    *   Each instance runs **Nginx** as a reverse proxy in front of the application containers.
    *   **Architecture within EC2:**
        *   **Nginx (Reverse Proxy):**
            *   Listens on port 80 → Proxies to Next.js SSR container (internal port 3000)
            *   Listens on port 8080 → Proxies to NestJS API container (internal port varies)
        *   **Next.js Docker Container:** Runs the SSR application, accessible via Nginx on port 80
        *   **NestJS Docker Container:** Runs the API service, accessible via Nginx on port 8080
    *   Both containers on the same instance share access to the RDS database.

### 4. Data Layer
*   **Amazon RDS (PostgreSQL):**
    *   Managed Relational Database Service.
    *   Running in a private subnet, accessible only by the EC2 fleet.
    *   configured for automated backups.
*   **S3 (Simple Storage Service):**
    *   Stores user uploads and static assets.
    *   Integrated with CloudFront for fast delivery.
*   **AWS Backup:**
    *   Centralized management for backing up EBS volumes and RDS snapshots.

### 5. Monitoring & Operations
*   **CloudWatch:**
    *   Collects logs and metrics from EC2, RDS, and LB.
    *   **Alarms:** Triggers notifications on thresholds (e.g., High CPU, 5xx Errors).
*   **SNS (Simple Notification Service):**
    *   Receives alarm triggers and notifies the **DevOps** team via email/SMS.

---

## User Access Flows

### Guest User (`perkx.co`)
1.  User resolves DNS via **Route 53**.
2.  Traffic hits **CloudFront** (for static assets) or **Frontend ALB** (for dynamic content).
3.  **WAF** inspects the request.
4.  Frontend ALB forwards the request to **port 80** on the **EC2 Fleet** (Nginx).
5.  **Nginx** reverse-proxies to the Next.js SSR container (internal port 3000).
6.  Next.js may call `api.perkx.co` for public data (routed through Backend ALB to port 8080 → Nginx → NestJS).
7.  Application queries **RDS** or fetches media from **S3**.

### Authenticated User (`perkx.co/user/*`)
1.  Follows the same flow as Guest through **Frontend ALB** (port 80 → Nginx → Next.js).
2.  User logs in and receives a **JWT token** (7-day expiration).
3.  Next.js sends authenticated requests to **Backend ALB** (`api.perkx.co`) with the JWT in headers.
4.  Backend ALB routes to **port 8080 → Nginx → NestJS API** container.
5.  NestJS API validates the JWT and grants access to user-specific endpoints.
6.  Data is persisted to **RDS** and returned to the frontend.

### Administrator (`perkx.co/admin/*`)
1.  Admin accesses the admin portal via **Frontend ALB** (port 80 → Nginx → Next.js).
2.  Admin logs in with separate credentials and receives an **Admin JWT** (1-day expiration).
3.  All admin API calls go through **Backend ALB** (port 8080 → Nginx → NestJS) with strict role-based authorization.
4.  Additional **WAF rules** can filter admin routes for enhanced security.

### DevOps Access (`Limited IPs`)
*   Direct SSH/RDP access to the **Compute Fleet** is restricted to specific IP addresses (Bastion Host or VPN) for maintenance and debugging.
*   DevOps can manage both Next.js and NestJS containers on each EC2 instance.

---

## Deployment & CI/CD
*   Both applications (Next.js and NestJS) are containerized using **Docker**.
*   **Deployment Architecture:**
    *   Each EC2 instance runs the following services:
        *   **Nginx** (Reverse Proxy) - Routes external traffic to internal containers
        *   **Next.js SSR container** (internal port 3000)
        *   **NestJS API container** (internal application port)
    *   Managed via **docker-compose** or orchestration scripts.
*   Images are built and pushed to **ECR (Elastic Container Registry)** before being deployed to the EC2 Fleet.
*   **Traffic Flow:**
    *   Frontend ALB (`perkx.co`) → EC2:80 (Nginx) → Next.js Container:3000
    *   Backend ALB (`api.perkx.co`) → EC2:8080 (Nginx) → NestJS Container
