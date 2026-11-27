# SpendWise Testing Documentation

## 1. Automated Backend Tests (Django `APITestCase`)

Location: `backend/tests/`

- `test_auth.py`:
  - User registration, INR default currency, initials generation
  - Email + password login and JWT token issuance
  - Profile fetch via Bearer access token
  - Refresh token rotation and rejection of reused refresh tokens
  - Forgot password token generation and password reset verification
- `test_finance_api.py`:
  - Monthly budget creation (`Food` category)
  - Income & expense CRUD operations
  - Dynamic budget utilization calculation (`spent`, `remaining`, `utilization_percentage`, `status`)
  - Automated budget warning notification generation
  - Savings goal creation, partial & full contributions, and automatic transition to `completed`
- `test_analytics_and_security.py`:
  - Cross-user ownership isolation (User A cannot fetch or mutate User B's expenses)
  - Dashboard summary aggregation (`total_balance`, `total_income`, `total_expenses`)
  - Unified `/api/transactions/` sorting and filtering
  - `/api/analytics/monthly/`, `/api/analytics/categories/`, and `/api/analytics/income-expense/`

### Running Backend Tests

```bash
cd backend
DB_ENGINE=sqlite python manage.py test tests -v 2
```

---

## 2. Automated Frontend Tests (Vitest + React Testing Library)

Location: `frontend/src/__tests__/App.test.jsx`

- Currency formatter verification (`INR` default `₹` formatting)
- Landing page headline and primary CTA link rendering
- Protected route redirection for unauthenticated users accessing `/dashboard`

### Running Frontend Tests & Build Verification

```bash
cd frontend
npm test
npm run build
```

---

## 3. Manual End-to-End Acceptance Checklist

1. Register a new account at `/register`, verify redirect to `/dashboard`.
2. Add an income entry and expense entry from `/dashboard` quick actions; confirm overview KPIs update immediately.
3. Create a ₹5,000 Food budget in `/budgets` and add ₹3,500+ in Food expenses; verify progress bar shows ₹1,500 remaining and triggers warning when crossing threshold.
4. Create a ₹60,000 savings goal in `/savings`, add a ₹25,000 contribution, and verify ₹35,000 remaining.
5. Verify Recharts visualizations render cleanly on `/dashboard` and `/analytics` with real database data.
6. Test search, category filter, type filter, sorting, and pagination on `/transactions`.
7. Update currency/theme preferences and change password on `/settings`.
