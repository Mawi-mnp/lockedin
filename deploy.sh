#!/bin/bash
# 🚀 Commitment Score — One-Click Deploy Script
# Run this from ~/commitment-score-app/

set -e

echo "🦺 COMMITMENT SCORE — DEPLOYMENT SCRIPT"
echo "========================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Install Node.js first."
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ git not found. Install git first."
    exit 1
fi

# Install CLIs if missing
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo ""
echo "✅ Prerequisites ready!"
echo ""

# Initialize git repo if not exists
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit — Commitment Score App"
fi

echo ""
echo "🚀 DEPLOYMENT READY"
echo "==================="
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Deploy Backend (Railway):"
echo "   railway login"
echo "   railway init --name commitment-score-api"
echo "   railway add --database postgresql"
echo "   railway up --path backend"
echo ""
echo "2️⃣  Deploy Frontend (Vercel):"
echo "   vercel login"
echo "   vercel --prod"
echo ""
echo "3️⃣  Set environment variables in Railway dashboard:"
echo "   - SECRET_KEY (generate with: openssl rand -hex 32)"
echo "   - FRONTEND_URL (your Vercel URL)"
echo ""
echo "4️⃣  Set environment variable in Vercel:"
echo "   - NEXT_PUBLIC_API_URL (your Railway API URL)"
echo ""
echo "🦺 Let's go, Supreme Leader!"
echo ""
