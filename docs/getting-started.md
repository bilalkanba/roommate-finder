# Getting Started — Step-by-Step Setup

This guide walks you through setting up Roommate Finder AI from zero to a running app.

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose installed
- Node.js 20+ (only needed if running frontend outside Docker)
- A [Supabase](https://supabase.com/) account (free tier is enough)
- An [OpenAI](https://platform.openai.com/) API key (pay-as-you-go, ~$5 of credit is plenty for dev)

## Step 1: Clone and configure

```bash
git clone https://github.com/YOUR_USERNAME/roommate-finder-ai.git
cd roommate-finder-ai
```

## Step 2: Create a Supabase project

1. Go to https://supabase.com/dashboard and create a new project
2. Wait ~2 minutes for the project to be provisioned
3. Go to **Settings → API** and copy:
   - `Project URL` (the `SUPABASE_URL`)
   - `anon public` key (the `SUPABASE_ANON_KEY`)
   - `service_role secret` key (the `SUPABASE_SERVICE_ROLE_KEY`) — **keep this secret!**
4. Go to **Settings → API → JWT Settings** and copy the `JWT Secret` (the `SUPABASE_JWT_SECRET`)
5. Go to **Settings → Database → Connection string** and copy the URI (the `DATABASE_URL`)
   Replace `[YOUR-PASSWORD]` with the actual password

## Step 3: Create the database schema

1. In Supabase, go to **SQL Editor** → **New query**
2. Open `docs/supabase-setup.sql` in this repo
3. Copy-paste the entire content into the SQL Editor and run it
4. You should see: `Success. No rows returned`

This creates the `profiles` table with all enums, indexes, triggers, and Row Level Security policies.

## Step 4: Configure environment variables

### Backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in:
- `SUPABASE_URL` — from step 2
- `SUPABASE_ANON_KEY` — from step 2
- `SUPABASE_SERVICE_ROLE_KEY` — from step 2
- `SUPABASE_JWT_SECRET` — from step 2
- `DATABASE_URL` — from step 2
- `OPENAI_API_KEY` — from https://platform.openai.com/api-keys

### Frontend

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env` and fill in:
- `VITE_SUPABASE_URL` — same as backend's `SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` — same as backend's `SUPABASE_ANON_KEY`

(The frontend **must not** have the service-role key — that's backend-only.)

## Step 5: Launch the app

```bash
docker-compose up --build
```

This starts:
- PostgreSQL (local, for development)
- Backend API on `http://localhost:8000`
- Frontend on `http://localhost:5173`

Open `http://localhost:5173` in your browser — you should see the landing page.

## Step 6: Test the flow

1. Click "Commencer" → you're redirected to `/login`
2. Create an account (sign up)
3. You'll be prompted to create your profile
4. Fill in your lifestyle preferences (all 7 dimensions)
5. Submit → you're redirected to `/matches`
6. If you're alone in the database, you'll see "Aucun match"
7. Create a second account (different email) in a private/incognito window and fill in a compatible profile
8. Switch back to the first account — you should now see matches with AI explanations! ✨

## Troubleshooting

**Backend crashes on startup with "SUPABASE_URL field required"**
→ Your `.env` file is missing or not loaded. Check `backend/.env` exists and has all required variables.

**Frontend: "Variables Supabase manquantes"**
→ Same issue for the frontend. Check `frontend/.env`.

**`matches` endpoint returns empty but I have multiple profiles**
→ Check that profiles target the **same city** (case-insensitive) and have **overlapping budget ranges**. Hard-incompatibility filters eliminate candidates upstream.

**OpenAI errors in logs**
→ Your `OPENAI_API_KEY` is wrong or out of credit. The app will fall back to template explanations automatically — no crash.

**Tables not created / "relation 'profiles' does not exist"**
→ You skipped step 3. Run `docs/supabase-setup.sql` in the Supabase SQL Editor.

## Development workflow

### Run tests

```bash
# Backend tests (25+ tests for the matching algorithm)
cd backend
pytest tests/ -v --cov=app
```

### Lint

```bash
cd backend
ruff check app/

cd ../frontend
npm run lint
```

### Hot reload

Docker Compose mounts `backend/app` and `frontend/src` as volumes, so any code change is reflected immediately without rebuilding the image.

### Format code

```bash
cd frontend
npm run format
```
