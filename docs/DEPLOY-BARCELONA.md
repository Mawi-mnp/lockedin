# 🦺 COMMITSCORE — BARCELONA DEPLOYMENT GUIDE

**Supreme Leader — Your app is ready for instant deployment from anywhere.**

---

## 📦 WHAT'S PREPARED

| Component | Files | Status |
|-----------|-------|--------|
| **Backend** | `backend/` + `railway.json` | ✅ Ready for Railway |
| **Frontend** | `frontend/` + `vercel.json` | ✅ Ready for Vercel |
| **Premium Landing** | `frontend/public/landing-pro.html` | ✅ Vercel/Framer design |
| **Git Repo** | 52 files committed | ✅ Ready to push |

---

## 🚀 DEPLOY FROM BARCELONA (10 MINUTES)

### Option A: Quick Deploy (Recommended)

**1. Push to GitHub**
```bash
cd ~/commitment-score-app
git remote add origin https://github.com/YOUR_USERNAME/commitscore.git
git push -u origin master
```

**2. Deploy Backend → Railway**
- Go to https://railway.app
- Click "New Project" → "Deploy from GitHub repo"
- Select `commitscore` repo
- Add PostgreSQL: `+ New` → `Database` → `PostgreSQL`
- Set env vars in Railway dashboard:
  - `SECRET_KEY` = run `openssl rand -hex 32`
  - `FRONTEND_URL` = (your Vercel URL from next step)

**3. Deploy Frontend → Vercel**
- Go to https://vercel.com/new
- Import `commitscore` repo
- Set root directory: `frontend`
- Set env var: `NEXT_PUBLIC_API_URL` = (your Railway URL)
- Click "Deploy"

---

### Option B: CLI Deploy (If you have terminals access)

```bash
# Install CLIs (already done on home machine)
npm i -g vercel @railway/cli

# Backend → Railway
cd ~/commitment-score-app
railway login
railway init --name commitscore-api
railway add --database postgresql
railway up --path backend

# Frontend → Vercel
cd ~/commitment-score-app/frontend
vercel login
vercel --prod
```

---

## 🔐 ENVIRONMENT VARIABLES

### Railway (Backend)
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Auto-provided by Railway PG |
| `SECRET_KEY` | `openssl rand -hex 32` |
| `FRONTEND_URL` | Your Vercel URL |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `ALGORITHM` | `HS256` |

### Vercel (Frontend)
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway API URL |

---

## ✅ POST-DEPLOY CHECKLIST

| Check | URL |
|-------|-----|
| Frontend | `https://commitscore.vercel.app` |
| Backend Health | `https://commitscore-api.railway.app/health` |
| API Docs | `https://commitscore-api.railway.app/docs` |
| Landing Page | `https://commitscore.vercel.app/landing-pro.html` |

---

## 📁 PROJECT STRUCTURE

```
~/commitment-score-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── scoring.py       # Score algorithm
│   │   └── routers/         # API endpoints
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/                 # Next.js pages
│   ├── public/
│   │   ├── landing-pro.html ← Premium design
│   │   └── mascots/         # Commit SVG assets
│   └── package.json
├── railway.json             # Railway config
├── vercel.json              # Vercel config
├── deploy.sh                # One-click script
└── docs/
    └── DEPLOY-CHECKLIST.md
```

---

## 🎯 RESULT

You'll have:
- **Live URL:** `https://commitscore.vercel.app` (accessible from Barcelona)
- **API:** `https://commitscore-api.railway.app`
- **Mascot:** Commit the Honey Badger — glowing, animated
- **Design:** Vercel + Framer premium aesthetic

---

**🦡 Ready when you are, Supreme Leader.**
