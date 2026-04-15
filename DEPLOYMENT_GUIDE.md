# Deployment Guide

This document provides instructions for deploying code after updating to the master branch.

## Requirements

- SSH key file for server access
- Git credentials (username/password)

## Deployment Steps

### 1. Access Server

Connect to the server using SSH with key file:

```bash
ssh -i <path-to-key-file> <username>@<server-ip>
```

Example:
```bash
ssh -i ~/.ssh/perkx-server.pem ubuntu@<server-ip>
```

### 2. Navigate to Project Directory

```bash
cd /var/www/perkx
```

Change to root user.
```bash
sudo -s
```

### 3. Pull Latest Code

Pull code from master branch:

```bash
git pull origin master
```

Enter Git username and password when prompted.

### 4. Deploy API Service

#### 4.1. Navigate to API directory

```bash
cd /var/www/perkx/api
```

#### 4.2. Build code

```bash
npm run build
```

#### 4.3. Restart service

```bash
pm2 restart ecosystem.config.js
```

### 5. Deploy App Service (Frontend)

#### 5.1. Navigate to App directory

```bash
cd /var/www/perkx/app
```

#### 5.2. Stop current service (to save resources)

```bash
pm2 del next-ssr
```

#### 5.3. Build code

```bash
npm run build
```

#### 5.4. Restart service

```bash
pm2 restart ecosystem.config.js
```

## Verify Deployment

After deployment, check service status:

```bash
pm2 status
```

Check logs if there are errors:

```bash
# View API logs
pm2 logs <api-process-name>

# View App logs
pm2 logs <app-process-name>
```

## Important Notes

- Ensure data backup before deployment if necessary
- Check `.env` file and environment configuration before building
- If dependencies changed, run `npm install` before building
- Monitor logs after deployment to ensure no errors occur

## Rollback

If deployment encounters issues, rollback to previous version:

```bash
git reset --hard HEAD~1
# Then repeat build and restart service steps
```
