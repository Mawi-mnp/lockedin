# Vercel Deployment Guide - CommitScore Frontend

## Prerequisites
- Backend API must be deployed first (see `render-backend.yaml`)
- Note your backend URL (e.g., `https://commitment-score-api.onrender.com`)

---

## Step 1: Push to GitHub

```bash
cd /home/win1122h2/commitment-score-app/frontend
git init
git add .
git commit -m "Initial commit - CommitScore frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/commit-score-frontend.git
git push -u origin main
```

---

## Step 2: Vercel Project Settings

### Import Project
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `commit-score-frontend` repository
4. Click **"Import"**

### Build Settings (Auto-detected)
Vercel will auto-detect Next.js. Verify these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `./` (leave empty if frontend is repo root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` (leave default) |
| **Install Command** | `npm install` |

### Environment Variables
Add this variable in **Settings → Environment Variables**:

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.onrender.com` | ✅ Production, ✅ Preview, ✅ Development |

> ⚠️ **Important**: Replace `your-backend-url` with your actual Render backend URL.

---

## Step 3: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

---

## Step 4: Post-Deploy Verification

### Check Environment Variable
```bash
# After deployment, verify the env var is set:
vercel env ls
```

### Test API Connection
Visit your deployed site and check browser console for any API connection errors.

---

## Local Production Testing

Before deploying, test with production env locally:

```bash
cd /home/win1122h2/commitment-score-app/frontend
npm run build
npm run start
```

This uses `.env.production.local` which contains `NEXT_PUBLIC_API_URL`.

---

## Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed

---

## Troubleshooting

### Build Fails
- Ensure `package.json` is in the repository root
- Check Node.js version compatibility (Next.js 14.1.0 requires Node 18.17+)

### API Calls Fail
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Ensure backend allows CORS from your Vercel domain
- Check backend is running and accessible

### 404 on Refresh
- Add `vercel.json` with rewrites (already included in this project)

---

## Files Included for Deployment

- ✅ `vercel.json` - Build configuration
- ✅ `.env.production.local` - Production environment variables template
- ✅ `package.json` - Dependencies and scripts
- ✅ `next.config.js` - Next.js configuration (if exists)

---

## Quick Reference

**Frontend Path:** `/home/win1122h2/commitment-score-app/frontend`
**Backend URL:** Update `.env.production.local` with actual Render URL
**Vercel Dashboard:** https://vercel.com/dashboard
