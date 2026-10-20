# 🏠 Roommate Finder AI

AI-powered roommate matching platform that helps students and young professionals find compatible living partners.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Tests](https://img.shields.io/badge/Tests-70%2B-success)

---

## 🎯 Overview

Roommate Finder AI uses a **hybrid matching algorithm** (weighted scoring + LLM-generated explanations) to help users find compatible roommates based on lifestyle preferences, budget, location, and daily habits.

### Why this project?

Finding a compatible roommate is one of the most stressful parts of moving to a new city — especially for international students and young professionals. Traditional platforms match based on budget and location alone; **this project adds a lifestyle compatibility layer powered by AI**.

---

## ✨ Key Features

- 🧑 **User profiles** — age, target city, budget, lifestyle preferences (smoking, schedule, pets, social level, cleanliness)
- 🤖 **AI matching** — compatibility score (0–100) + natural-language explanation via OpenAI GPT-4o-mini
- 🔍 **Search & filters** — by city, budget range, availability
- 🧪 **70+ automated tests** — JUnit 5, Mockito, Testcontainers, MockMvc
- 🚀 **CI/CD pipeline** — GitHub Actions with test coverage reporting
- 🌍 **Bilingual interface** — French & English

---

## 🏗️ Architecture

┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│   React + Vite  │◄────►│  Spring Boot 3.3    │◄────►│    PostgreSQL   │
│  (Tailwind CSS) │ REST │   (Java 17)         │      │   (Supabase)    │
└─────────────────┘      └──────────┬──────────┘      └─────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │   OpenAI API    │
                          │ (GPT-4o-mini)   │
                          └─────────────────┘

### The Matching Algorithm (hybrid approach)

1. **Rule-based scoring** (fast, deterministic, free):
   - Budget overlap compatibility
   - City / availability match
   - Lifestyle dimensions: smoking, schedule, pets, social level, cleanliness
   - Age range preference

2. **LLM-generated explanation** (OpenAI GPT) — triggered only for top matches to keep API costs low

3. **Result caching** — match scores cached in PostgreSQL to avoid recomputation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3, Spring Data JPA, Hibernate |
| **Frontend** | React 18, Vite, Tailwind CSS, TypeScript |
| **Database** | PostgreSQL (via Supabase) |
| **Auth** | JWT (Spring Security) |
| **AI** | OpenAI GPT-4o-mini |
| **Testing** | JUnit 5, Mockito, Testcontainers, MockMvc, AssertJ |
| **CI/CD** | GitHub Actions, JaCoCo coverage |
| **Deployment** | Vercel (frontend) + Railway (backend) |

---

## 🧪 Testing

| Type | Framework | What it validates |
|---|---|---|
| **Unit** | JUnit 5 + Mockito | Service logic isolated from external dependencies |
| **Integration** | Testcontainers (real PostgreSQL) | End-to-end flow with real database |
| **Web** | MockMvc | REST endpoints, validation, HTTP codes |

```bash
# Run all tests
./mvnw test

# Run with coverage
./mvnw verify

Test Coverage: 80%+ (JaCoCo)

---

🚀 Getting Started

Prerequisites

- Java 17+
- Node.js 20+
- PostgreSQL (or use Docker Compose)
- A free Supabase project
- An OpenAI API key

Setup

1. Clone the repo

git clone https://github.com/bilalkanba/roommate-finder.git
cd roommate-finder

2. Configure environment variables

# Backend
cd backend-java
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Fill in your Supabase URL, key, and OpenAI API key

# Frontend
cd ../frontend
cp .env.example .env
# Fill in your backend API URL

3. Launch with Docker Compose (optional)

docker-compose up --build

OR run manually:

# Backend
cd backend-java
./mvnw spring-boot:run

# Frontend (in another terminal)
cd frontend
npm install
npm run dev

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API docs (Swagger): http://localhost:8080/swagger-ui.html

---

📂 Project Structure

roommate-finder/
├── backend-java/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/.../roommatematcher/
│   │   │   │   ├── controller/     # REST endpoints
│   │   │   │   ├── service/        # Business logic + AI integration
│   │   │   │   ├── repository/     # JPA repositories
│   │   │   │   ├── model/          # JPA entities
│   │   │   │   ├── dto/            # Request/Response DTOs
│   │   │   │   └── matching/       # Matching algorithm
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                   # 70+ tests
│   └── pom.xml
├── frontend/
│   └── src/
│       ├── components/             # Reusable UI components
│       ├── pages/                  # Route-level pages
│       ├── services/               # API client
│       ├── hooks/                  # Custom React hooks
│       └── types/                  # TypeScript types
├── .github/workflows/              # CI/CD pipelines
└── docker-compose.yml

---

📸 Screenshots

Coming soon — will be added once the MVP is deployed.

---

🚧 Roadmap (V2)

- 💬 In-app chat between matched users
- 🗺️ Interactive European roommate map
- 📧 Email notifications for new matches
- 🔔 Real-time notifications with WebSocket

---

👤 Author

Bilal Kanba — Software Engineer, EHEI Oujda (Class of 2026)

- 💼 LinkedIn (https://www.linkedin.com/in/bilal-kanba)
- 🐙 GitHub (https://github.com/bilalkanba)
