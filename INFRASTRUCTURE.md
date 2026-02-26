# Infrastructure Documentation

## Overview
The Perkx infrastructure is hosted on **Amazon Web Services (AWS)** using a simplified single-server architecture for cost efficiency. All resources are deployed in a single Availability Zone within a VPC.

---

## AWS Resources

### 1. Network & DNS
*   **VPC (Virtual Private Cloud)**
    *   Isolated network environment for all Perkx resources
    *   Single Availability Zone deployment
    *   Public subnet configuration for all resources
    
*   **Route 53 (DNS Service)**
    *   Domain: `perkx.co` → Routes to Frontend ALB
    *   Domain: `api.perkx.co` → Routes to Backend ALB
    *   Domain: `cdn.perkx.co` → Routes to CloudFront CDN

### 2. Security & CDN
*   **WAF (Web Application Firewall)**
    *   Attached to both Application Load Balancers
    *   Filters malicious traffic and protects against common web exploits
    
*   **CloudFront (CDN)**
    *   Caches and delivers static images and user-uploaded images from S3
    *   Global edge locations for reduced latency
    *   Origin: S3 bucket

### 3. Load Balancing
*   **Frontend ALB** (`perkx.co`)
    *   Protocol: HTTPS (SSL termination)
    *   Target: EC2 instance on port 80
    *   Routes: `/` (Guest), `/user/*` (User), `/admin/*` (Admin)
    
*   **Backend ALB** (`api.perkx.co`)
    *   Protocol: HTTPS (SSL termination)
    *   Target: EC2 instance on port 8080
    *   Routes: RESTful API endpoints

### 4. Compute
*   **EC2 Instance**
    *   **Nginx** - Reverse proxy listening on ports 80 and 8080
    *   **PM2** - Process manager for Node.js applications
    *   **Next.js SSR** - Frontend application (port 3000)
    *   **NestJS API** - Backend application (port 3001)

### 5. Database
*   **RDS PostgreSQL**
    *   Managed relational database
    *   Located in public subnet
    *   Access controlled via Security Groups (only EC2 instance)
    *   Automated backups enabled

### 6. Storage
*   **S3 Bucket**
    *   Stores user-uploaded images
    *   Stores static assets (images)
    *   Integrated with CloudFront for CDN delivery
    
*   **AWS Backup**
    *   RDS snapshot management

---

## Traffic Flow

**Web Application (`perkx.co`):**
```
User → Route 53 → Frontend ALB → EC2:80 (Nginx) → PM2 → Next.js:3000
```

**API Requests (`api.perkx.co`):**
```
Client → Route 53 → Backend ALB → EC2:8080 (Nginx) → PM2 → NestJS:3001
```

**Static Images (`cdn.perkx.co`):**
```
User → Route 53 → CloudFront → S3 Bucket
```

---

## Security Groups

*   **ALB Security Group:** Allow inbound HTTPS (443) from internet
*   **EC2 Security Group:** Allow inbound from ALB on ports 80, 8080; SSH from specific IPs
*   **RDS Security Group:** Allow inbound PostgreSQL (5432) from EC2 only

---

## Deployment Process

1. Code pulled from Git repository to EC2 instance
2. Dependencies installed (`npm install`)
3. Applications built (`npm run build`)
4. PM2 restarts processes (configured via ecosystem files)
5. Nginx routes traffic to PM2-managed processes
