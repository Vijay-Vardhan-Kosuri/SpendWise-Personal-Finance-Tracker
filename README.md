# SpendWise — Personal Finance Management Platform

SpendWise is a responsive, full-stack personal finance management web site application designed to help individuals track income, categorize expenses, enforce monthly budgets, monitor savings goals, and analyze financial trends from a unified dashboard.

## Architecture & Technology Stack
Architecture consists of mainly 3 parts
- **Frontend:** React.js (Vite), JavaScript, Tailwind CSS, React Router, Axios, Lucide React, Recharts
- **Backend:** Python, Django, Django REST Framework, PyJWT (JWT access & refresh tokens with rotation)
- **Database:** MySQL (via PyMySQL) with Django migrations (SQLite supported via `DB_ENGINE=sqlite` for isolated CI/test runs)

## Project Structure

```text
spendwise/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # Custom User model, JWT auth, password reset, profile APIs
│   │   └── finance/           # Categories, Income, Expenses, Budgets, Savings, Analytics, Notifications
│   ├── spendwise_config/      # Django settings, root URLs, WSGI/ASGI
│   ├── tests/                 # Automated backend unit and API integration tests
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI primitives, layouts, modals, confirm dialogs
│   │   ├── context/           # AuthContext and ToastContext
│   │   ├── pages/             # Landing, Auth, Dashboard, Income, Expenses, Budgets, Savings, Analytics, Transactions, Settings
│   │   ├── services/          # Axios client + JWT refresh interceptor and API service wrappers
│   │   ├── utils/             # Currency (INR default), date, and error formatters
│   │   └── __tests__/         # Vitest + Testing Library smoke tests
│   ├── package.json
│   └── vite.config.js
└── docs/
    ├── API_DOCUMENTATION.md
    ├── BRANCH_STRATEGY.md
    ├── DATABASE_SCHEMA.md
    ├── PULL_REQUEST_TRACKER.md
    └── TESTING.md
```

## Local Setup & Execution Instructions

### 1. Database Setup (MySQL)

Create a MySQL database (default `spendwise_db`):

```sql
CREATE DATABASE spendwise_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup (Django REST API)

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your MySQL credentials (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `SECRET_KEY`):

```bash
cp .env.example .env
python manage.py migrate
python manage.py seed_categories
python manage.py runserver 8000
```

> **Optional Demo Account Seeding:** To populate sample data strictly for local preview/testing, run:
> `python manage.py seed_demo_data`

### 3. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Vite proxies `/api` requests to `http://127.0.0.1:8000`.

### 4. Running Automated Tests

- **Backend Tests:**
  ```bash
  cd backend
  # Using SQLite for fast isolated test execution:
  DB_ENGINE=sqlite python manage.py test tests -v 2
  ```
- **Frontend Tests & Production Build:**
  ```bash
  cd frontend
  npm test
  npm run build
  ```

## GitHub Collaboration & Manual Workflow

This repository follows a **strict manual-only GitHub collaboration workflow** across five permanent branches (`main`, `develop`, `developer-1`, `developer-2`, `developer-3`) targeting 105 reviewed pull requests.

- **Developer 1 (`developer-1`):** Frontend UI, design system, pages, and responsive layouts.
- **Developer 2 (`developer-2`):** Django setup, MySQL schema, JWT auth, and REST APIs.
- **Developer 3 (`developer-3`):** API integration, Recharts visualizations, testing, and documentation.

See [docs/BRANCH_STRATEGY.md](docs/BRANCH_STRATEGY.md) and [docs/PULL_REQUEST_TRACKER.md](docs/PULL_REQUEST_TRACKER.md) for the complete collaboration workflow and PR schedule.
