# Deployment Guide

## Overview

This guide covers deploying the Facilis Starch Optimizer to production using Docker and Coolify. The application is production-ready with optimized build configuration, security headers, and proper MIME type handling.

## Prerequisites

- Docker installed (v20.10+)
- Docker Compose (optional, for local testing)
- Coolify account or server access
- Git repository access
- Node.js 18+ (for local development)

## Local Development

### Setup

```bash
# Navigate to project directory
cd /home/facilis/workspace/storage/6HHd5B5pMQe4Bqm18VsSGudhMyo2/projects/facilis-starch-optimizer

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_APP_NAME=Facilis Starch Optimizer
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEMO_MODE=true
VITE_UPDATE_INTERVAL=3000
```

## Production Build

### Pre-Deployment Validation

**CRITICAL:** Run these checks before deploying:

```bash
# 1. Verify deployment files exist
ls -la Dockerfile nginx.conf
# Both files MUST exist

# 2. Install dependencies
npm install

# 3. Run linter
npm run lint
# Must pass with 0 errors

# 4. Build the application
npm run build
# Must complete successfully

# 5. Verify dist/ folder
ls -la dist/
# Should contain index.html, assets/, etc.

# 6. Check asset paths in index.html
cat dist/index.html | grep "script"
# Should show relative paths: ./assets/index-*.js
# NOT absolute paths: /assets/index-*.js

# 7. Test production build locally
npm run preview
# Access at http://localhost:4173
```

### Build Output

Expected build output:
```
vite v5.1.0 building for production...
✓ 250 modules transformed.
dist/index.html                   0.58 kB │ gzip:  0.35 kB
dist/assets/index-abc123.css    125.43 kB │ gzip: 21.34 kB
dist/assets/index-def456.js     342.67 kB │ gzip: 98.23 kB
✓ built in 3.45s
```

## Docker Deployment

### Build Docker Image

```bash
# Build the image
docker build -t facilis-starch-optimizer:latest .

# Verify image
docker images | grep facilis-starch-optimizer
```

### Run Docker Container Locally

```bash
# Run container
docker run -d \
  --name facilis-app \
  -p 8080:80 \
  facilis-starch-optimizer:latest

# Check logs
docker logs facilis-app

# Test application
curl http://localhost:8080
```

### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run with:
```bash
docker-compose up -d
```

## Coolify Deployment

### Prerequisites

1. Coolify instance running
2. Git repository connected
3. Domain name configured (optional)

### Step 1: Create New Project

1. Log into Coolify dashboard
2. Click "New Project"
3. Select "Docker" as deployment type
4. Connect your Git repository

### Step 2: Configure Build Settings

Coolify will auto-detect the `Dockerfile`. Verify these settings:

**Build Settings:**
- Build Pack: Docker
- Dockerfile Path: `./Dockerfile`
- Context: `.`
- Port: 80

### Step 3: Environment Variables

In Coolify UI, add environment variables:

```
VITE_APP_NAME=Facilis Starch Optimizer
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEMO_MODE=true
VITE_UPDATE_INTERVAL=3000
```

**Important:** For React/Vite apps, all frontend variables must be prefixed with `VITE_`

### Step 4: Health Check Configuration

**CRITICAL:** Do NOT add internal healthchecks to Dockerfile.

Coolify manages healthchecks externally. Internal healthchecks cause false negatives.

In Coolify UI:
- Health Check Path: `/`
- Health Check Interval: 30s
- Health Check Timeout: 5s

### Step 5: Deploy

1. Click "Deploy" button
2. Monitor build logs
3. Wait for deployment to complete
4. Access your application at the configured domain

### Step 6: Post-Deployment Verification

```bash
# Check application is running
curl https://your-domain.com

# Verify JavaScript loads correctly
curl -I https://your-domain.com/assets/index-*.js
# Should return: Content-Type: application/javascript

# Check security headers
curl -I https://your-domain.com
# Should include:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
```

## Troubleshooting

### Issue 1: Blank Page After Deployment

**Symptoms:**
- Application works locally (`npm run dev`)
- Deployed application shows blank page
- Browser console error: "Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of ''"

**Root Cause:**
Missing `base: './'` in `vite.config.js` causes absolute asset paths.

**Solution:**

1. Verify `vite.config.js` contains:
```javascript
export default defineConfig({
  base: './',  // REQUIRED
  // ... rest of config
})
```

2. Rebuild and redeploy:
```bash
npm run build
git add .
git commit -m "fix: add base path for deployment"
git push
```

3. Trigger redeploy in Coolify

### Issue 2: Missing Deployment Files

**Symptoms:**
- Coolify build fails
- Error: "Dockerfile not found"

**Solution:**

Ensure these files exist in repository root:
```bash
ls -la Dockerfile nginx.conf
```

If missing, they are required for proper deployment.

### Issue 3: Build Fails with Dependency Errors

**Symptoms:**
- Build fails during `npm install`
- Missing peer dependencies

**Solution:**

```bash
# Clear node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Commit updated lock file
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Issue 4: Environment Variables Not Working

**Symptoms:**
- Variables work locally but not in production
- Undefined values in application

**Solution:**

1. Verify variable naming:
   - ✅ `VITE_API_URL`
   - ❌ `API_URL` (won't work in frontend)

2. Add variables in Coolify UI, not `.env` file

3. Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

### Issue 5: Nginx 403 Forbidden

**Symptoms:**
- Application deployed but returns 403

**Solution:**

Verify `nginx.conf` permissions:
```bash
# In Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod 644 /etc/nginx/conf.d/default.conf
```

### Issue 6: Assets Not Loading

**Symptoms:**
- HTML loads but CSS/JS files return 404

**Solution:**

1. Check build output directory matches nginx config:
```nginx
root /usr/share/nginx/html;
```

2. Verify Dockerfile copies correct directory:
```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Performance Optimization

### Gzip Compression

Already configured in `nginx.conf`:
```nginx
gzip on;
gzip_vary on;
gzip_comp_level 6;
gzip_types text/plain text/css application/javascript ...;
```

### Asset Caching

Static assets cached for 1 year:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Bundle Size Optimization

Current bundle size:
- Main bundle: ~340 KB (uncompressed)
- Gzipped: ~98 KB
- Vendor chunk: ~180 KB
- UI chunk: ~60 KB

## Monitoring

### Application Logs

```bash
# Docker logs
docker logs -f facilis-app

# Nginx access logs
docker exec facilis-app tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec facilis-app tail -f /var/log/nginx/error.log
```

### Performance Monitoring

Use Lighthouse for performance audits:
```bash
lighthouse https://your-domain.com --view
```

Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

## Rollback Procedure

### Coolify Rollback

1. Go to Coolify dashboard
2. Navigate to deployment history
3. Click "Rollback" on previous successful deployment
4. Confirm rollback

### Manual Docker Rollback

```bash
# List images
docker images | grep facilis-starch-optimizer

# Stop current container
docker stop facilis-app
docker rm facilis-app

# Run previous version
docker run -d \
  --name facilis-app \
  -p 8080:80 \
  facilis-starch-optimizer:previous-tag
```

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Coolify
        run: |
          curl -X POST ${{ secrets.COOLIFY_WEBHOOK_URL }}
```

## Security Considerations

### SSL/TLS

Coolify automatically provisions Let's Encrypt certificates:
- Auto-renewal enabled
- HTTPS enforced
- HTTP redirects to HTTPS

### Security Headers

Already configured in `nginx.conf`:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### Vulnerability Scanning

```bash
# Scan dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Docker image scanning
docker scan facilis-starch-optimizer:latest
```

## Backup & Recovery

### Backup Strategy

1. **Code:** Git repository (source of truth)
2. **Configuration:** Environment variables in Coolify
3. **Data:** (Future) Database backups

### Recovery Steps

1. Clone repository
2. Restore environment variables
3. Rebuild and redeploy
4. Verify application functionality

## Scaling

### Vertical Scaling

Increase container resources in Coolify:
- CPU: 2+ cores
- Memory: 2GB+ RAM

### Horizontal Scaling (Future)

For high-traffic scenarios:
1. Deploy multiple instances
2. Add load balancer (Nginx/HAProxy)
3. Configure session affinity
4. Implement caching (Redis)

## Maintenance

### Regular Updates

**Monthly:**
- Security patches
- Dependency updates
- Vulnerability fixes

**Quarterly:**
- Feature updates
- Performance optimizations
- Library upgrades

**Annually:**
- Major version upgrades
- Architecture review
- Technology stack evaluation

### Update Procedure

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update major versions (carefully)
npm install package@latest

# Test thoroughly
npm test
npm run build

# Deploy
git commit -am "chore: update dependencies"
git push
```

## Support

For deployment issues:
1. Check Coolify build logs
2. Review nginx error logs
3. Verify environment variables
4. Test local Docker build
5. Contact DevOps team

---

**Last Updated:** January 24, 2025
**Version:** 1.0.0
