# 🏠 Roommate Finder AI

> AI-powered roommate matching platform that helps students and young professionals find compatible living partners across Europe.

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e.svg)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

---

## 🎯 Overview

**Roommate Finder AI** uses a hybrid matching algorithm (weighted scoring + LLM-generated explanations) to help users find compatible roommates based on lifestyle preferences, budget, location, and daily habits.

### Why this project?

Finding a compatible roommate is one of the most stressful parts of moving to a new city — especially for international students and young professionals relocating across Europe. Traditional platforms match based on budget and location alone; this project adds a **lifestyle compatibility layer** powered by AI.

---

## ✨ Key Features (MVP)

- 🧑 **User profile** — age, target city, budget, lifestyle preferences (smoking, schedule, pets, social level)
- 🤖 **AI matching** — compatibility score (0–100) + natural-language explanation of why two profiles match
- 🔍 **Search & filters** — by city, budget range, availability
- 🌍 **Bilingual interface** — French & English

### Planned (V2)

- 💬 In-app chat between matched users
- 🗺️ Interactive European roommate map
- 📧 Email notifications for new matches

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React + Vite  │◄────►│    FastAPI      │◄────►│    Supabase     │
│  (Tailwind CSS) │ REST │   (Python 3.11) │      │   (PostgreSQL)  │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   OpenAI API    │
                         │  (explanations) │
                         └─────────────────┘
```

### The Matching Algorithm (hybrid approach)

1. **Rule-based scoring** (fast, deterministic, free):
   - Budget overlap compatibility
   - City / availability match
   - Lifestyle dimensions: smoking, schedule, pets, social level, cleanliness
   - Age range preference
2. **LLM-generated explanation** (OpenAI GPT) — only triggered for the top matches, to keep API costs low
3. **Result caching** — match scores are cached in PostgreSQL to avoid recomputation

---

## 🛠️ Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, TypeScript|
| Backend     | FastAPI, Python 3.11, Pydantic v2       |
| Database    | PostgreSQL (via Supabase)               |
| Auth        | Supabase Auth (JWT)                     |
| AI          | OpenAI GPT-4o-mini                      |
| Infra       | Docker, docker-compose                  |
| CI/CD       | GitHub Actions                          |
| Deployment  | Vercel (frontend) + Railway (backend)   |

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- A free [Supabase](https://supabase.com) project
- An [OpenAI API key](https://platform.openai.com)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/roommate-finder-ai.git
cd roommate-finder-ai

# 2. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Fill in your Supabase + OpenAI credentials

# 3. Launch with Docker
docker-compose up --build
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

### Running locally without Docker

See [`docs/getting-started.md`](docs/getting-started.md) (local run without Docker: use `uvicorn` in `backend/` and `npm run dev` in `frontend/` with `.env` files configured).

---

## 📂 Project Structure

```
roommate-finder-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints (routers)
│   │   ├── core/         # Config, security, settings
│   │   ├── db/           # Supabase client, database session
│   │   ├── models/       # SQLAlchemy / Pydantic DB models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Business logic (OpenAI, etc.)
│   │   └── matching/     # The matching algorithm
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level pages
│       ├── services/     # API client
│       ├── hooks/        # Custom React hooks
│       └── types/        # TypeScript types
├── .github/workflows/    # CI/CD pipelines
└── docker-compose.yml
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && npm test
```

---

## 📸 Screenshots

*Coming soon — will be added once the MVP is deployed.*

---

## 👤 Author

**Bilal Kanba** — Software Engineer, EHEI Oujda (Class of 2026)
- 💼 [LinkedIn](https://linkedin.com/in/YOUR_PROFILE)
- 🐙 [GitHub](https://github.com/YOUR_USERNAME)

---

## 📜 License

MIT — see [LICENSE](LICENSE)
