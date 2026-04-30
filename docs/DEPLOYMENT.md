# Deployment Guide — Commitment Score App

## 🚀 Quick Deploy

### Backend (Railway)
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Init: `railway init --name commitment-score-api`
4. Add PostgreSQL: `railway add --database postgresql`
5. Deploy: `railway up --path backend`

### Frontend (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

---

## 🔐 Environment Variables

### Backend (Railway)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Auto-provided by Railway PostgreSQL |
| `SECRET_KEY` | Run `openssl rand -hex 32` to generate |
| `FRONTEND_URL` | Your Vercel URL (e.g., `https://commitment-score.vercel.app`) |
| `STRIPE_SECRET_KEY` | Optional — add for payments |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Your Railway API URL |

---

## 🧪 Post-Deploy Checklist

- [ ] Backend health check: `https://your-api.railway.app/health`
- [ ] Frontend loads: `https://commitment-score.vercel.app`
- [ ] Register a test user
- [ ] Create a goal
- [ ] Verify score calculation

---

## 📞 Support

All code is in `~/commitment-score-app/`
- Backend: `/backend`
- Frontend: `/frontend`
- Docs: `/docs`
