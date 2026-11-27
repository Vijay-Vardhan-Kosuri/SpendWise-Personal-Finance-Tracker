# SpendWise REST API Documentation

Base URL: `/api`

All endpoints except registration, login, token refresh, password reset, and health check require an `Authorization: Bearer <access_token>` header.

---

## 1. Authentication & Profile

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register/` | Register a user (`full_name`, `email`, `password`, `confirm_password`, `currency_preference`) | Public |
| `POST` | `/api/auth/login/` | Authenticate with `email` and `password`; returns `user` and `tokens` (`access`, `refresh`) | Public |
| `POST` | `/api/auth/refresh/` | Rotate `refresh` token and obtain a new `access` token | Public |
| `POST` | `/api/auth/logout/` | Revoke the active `refresh` token | Bearer |
| `POST` | `/api/auth/forgot-password/` | Generate a password reset UUID token for an email | Public |
| `POST` | `/api/auth/reset-password/` | Reset password using `token`, `new_password`, `confirm_password` | Public |
| `GET` | `/api/profile/` | Fetch authenticated user profile & preferences | Bearer |
| `PUT/PATCH` | `/api/profile/` | Update profile fields, currency, theme, and notification preferences | Bearer |
| `POST` | `/api/profile/change-password/` | Change password with `current_password`, `new_password`, `confirm_password` | Bearer |
| `DELETE` | `/api/profile/delete-account/` | Permanently delete account after password confirmation | Bearer |

---

## 2. Categories & Dashboard

| Method | Endpoint | Query Params / Body | Description |
| --- | --- | --- | --- |
| `GET` | `/api/categories/` | `?type=income\|expense` | List default + custom categories |
| `POST` | `/api/categories/` | `{ "name", "type", "color" }` | Create a custom user category |
| `GET` | `/api/dashboard/summary/` | `?month=&year=` or `?start_date=&end_date=` | Overview KPIs, charts, recent transactions, and savings progress |

---

## 3. Income & Expense Management

| Method | Endpoint | Query Params | Description |
| --- | --- | --- | --- |
| `GET` | `/api/income/` | `?search=&category=&payment_method=&start_date=&end_date=&month=&year=&page=` | Paginated income list + `summary_total` |
| `POST` | `/api/income/` | — | Create income (`category`, `amount`, `date`, `payment_method`, `description`) |
| `PUT/PATCH` | `/api/income/{id}/` | — | Update owned income entry |
| `DELETE` | `/api/income/{id}/` | — | Delete owned income entry |
| `GET` | `/api/expenses/` | `?search=&category=&payment_method=&start_date=&end_date=&month=&year=&page=` | Paginated expense list + `summary_total` |
| `POST` | `/api/expenses/` | — | Create expense (evaluates budget threshold alerts) |
| `PUT/PATCH` | `/api/expenses/{id}/` | — | Update owned expense entry |
| `DELETE` | `/api/expenses/{id}/` | — | Delete owned expense entry |

---

## 4. Budgets & Savings Goals

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/budgets/` | List budgets (`?month=&year=`) with `spent_amount`, `remaining_amount`, `utilization_percentage`, `status` |
| `POST` | `/api/budgets/` | Create overall (`category: null`) or category budget for a month/year |
| `PUT/PATCH` | `/api/budgets/{id}/` | Update owned budget |
| `DELETE` | `/api/budgets/{id}/` | Delete owned budget |
| `GET` | `/api/savings/` | List savings goals (`?status=pending\|completed`) with contributions |
| `POST` | `/api/savings/` | Create savings goal (`title`, `target_amount`, `target_date`, `description`) |
| `PUT/PATCH` | `/api/savings/{id}/` | Update savings goal |
| `DELETE` | `/api/savings/{id}/` | Delete savings goal |
| `POST` | `/api/savings/{id}/contribute/` | Record contribution (`amount`, `contribution_date`, `note`); marks goal completed at 100% |

---

## 5. Transactions, Analytics, Notifications & Demo Seed

| Method | Endpoint | Query Params | Description |
| --- | --- | --- | --- |
| `GET` | `/api/transactions/` | `?type=all\|income\|expense&search=&category=&start_date=&end_date=&sort_by=-date\|date\|-amount\|amount&page=&page_size=` | Unified paginated ledger |
| `GET` | `/api/analytics/monthly/` | `?months=6` or `?start_date=&end_date=` | Monthly series, savings rate, and budget performance |
| `GET` | `/api/analytics/categories/` | `?month=&year=` or `?start_date=&end_date=` | Expense & income category shares |
| `GET` | `/api/analytics/income-expense/` | `?months=6` or `?start_date=&end_date=` | Income vs. expense comparison series |
| `GET` | `/api/notifications/` | — | List user notifications and unread count |
| `PATCH` | `/api/notifications/{id}/read/` | — | Mark single notification as read |
| `POST` | `/api/notifications/mark-all-read/` | — | Mark all notifications as read |
| `POST` | `/api/demo/seed/` | — | Explicitly populate sample demo data for previewing |
