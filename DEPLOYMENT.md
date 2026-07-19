# Arcana Pocket — Deployment Guide

## ✅ Prerequisites
- GitHub account: `arrumadosvmodas-alt`
- Email: `arrumadosvmodas@gmail.com`
- Repository: https://github.com/arrumadosvmodas-alt/arcana-pocket (already pushed)

---

## 📋 Step-by-Step Deployment

### **STEP 1: Supabase (PostgreSQL Database)**

#### 1.1 Create Supabase Account & Project
1. Go to **https://supabase.com**
2. **Sign up** with email: `arrumadosvmodas@gmail.com`
3. **Create new project**:
   - **Project name**: `arcana-pocket`
   - **Database password**: Save it securely! (you'll need it)
   - **Region**: Choose closest to you (e.g., South America - São Paulo)
   - Wait ~2 minutes for initialization

#### 1.2 Get Database Credentials
In Supabase dashboard, go to **Settings → Database → Connection Pooling**:
- Copy the connection string (looks like):
  ```
  postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
  ```
- **Save this! You'll need it for Railway and Vercel**

Also get from **Settings → API**:
- **Project URL**: `https://xxxxx.supabase.co`
- **Anon Key**: (the public key)

#### 1.3 ✅ Done!
**Save all credentials in a safe place** (password manager recommended)

---

### **STEP 2: Railway (FastAPI Backend)**

#### 2.1 Create Railway Account
1. Go to **https://railway.app**
2. **Sign up with GitHub** using `arrumadosvmodas-alt` account
3. Authorize Railway to access GitHub

#### 2.2 Connect Repository
1. Click **New Project** → **Deploy from GitHub repo**
2. Select: `arrumadosvmodas-alt/arcana-pocket`
3. Railway auto-detects `apps/api/main.py`

#### 2.3 Set Environment Variables
In Railway dashboard for your project:
1. Click **Variables** tab
2. Add:
   ```
   DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
   ENVIRONMENT=production
   ```
   (Replace PASSWORD with your Supabase password from Step 1)

#### 2.4 Generate Production Domain
1. Click **Deployments** → Your latest deploy
2. You'll see a domain like: `arcana-pocket-api-prod.railway.app`
3. **Save this URL! You need it for Vercel**

#### 2.5 ✅ Done!
Your FastAPI backend is live at the domain above.

---

### **STEP 3: Vercel (Next.js Frontend)**

#### 3.1 Create Vercel Account
1. Go to **https://vercel.com**
2. **Sign up with GitHub** using `arrumadosvmodas-alt` account
3. Authorize Vercel to access GitHub

#### 3.2 Import Project
1. Vercel shows your repos automatically
2. Find `arcana-pocket` and click **Import**
3. Click **Deploy**

#### 3.3 Set Environment Variables (IMPORTANT!)
Before or during deployment, go to **Settings → Environment Variables** and add:
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
NEXT_PUBLIC_API_URL=https://arcana-pocket-api-prod.railway.app
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=[your-anon-key-from-step-1]
```

#### 3.4 Wait for Deploy
- Vercel builds automatically
- The script `prebuild` runs first, adapting Prisma schema to PostgreSQL
- Prisma migrations run automatically on first deploy
- Takes ~3-5 minutes

#### 3.5 ✅ Done!
Your app is live at: `https://arcana-pocket.vercel.app`

---

## 🎯 Summary Table

| Service | URL | What it does |
|---------|-----|--------------|
| **GitHub** | `https://github.com/arrumadosvmodas-alt/arcana-pocket` | Source code |
| **Supabase** | `https://xxxxx.supabase.co` | PostgreSQL database |
| **Railway** | `https://arcana-pocket-api-prod.railway.app` | FastAPI backend (future) |
| **Vercel** | `https://arcana-pocket.vercel.app` | Next.js frontend |

---

## 🔗 How It All Connects

```
Browser User
    ↓
[Vercel] arcana-pocket.vercel.app
    ↓
[Supabase] PostgreSQL Database
    ↓
(Optional) [Railway] FastAPI Backend API
```

---

## 🐛 Troubleshooting

### Vercel Build Fails
- Check **Deployments** → latest deploy → **Build Logs**
- Common issues:
  - Missing `DATABASE_URL` env var → Add it in Settings
  - Prisma migration error → Check Supabase connection string

### Railway Deploy Fails
- Check **Deployments** → Build Logs
- Make sure `DATABASE_URL` is correct

### Database Connection Error
- Verify password is correct (no typos!)
- Check `DATABASE_URL` format: `postgresql://postgres:PASSWORD@db.REGION.supabase.co:5432/postgres`

---

## 📝 Local Development (no changes needed!)

```bash
npm install
npm run dev
# Opens http://localhost:3000
# Uses local SQLite database
```

The `.env.local` file is already set to use SQLite, so everything works locally without any Supabase/Railway setup!

---

## 🚀 Next Steps (After Deploy)

1. Test the live app: https://arcana-pocket.vercel.app
2. Open packs, build decks, battle NPCs
3. Check all features work
4. Later: Add authentication, multiplayer, etc.
