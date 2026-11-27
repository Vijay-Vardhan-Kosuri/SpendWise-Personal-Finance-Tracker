# SpendWise Pull Request Tracker (Target: 105 PRs)

All pull requests originate sequentially from each developer's permanent branch (`developer-1`, `developer-2`, `developer-3`) into `develop`. Keep only one open PR per developer branch at a time, and update Status and Merge Date manually as PRs progress on GitHub.

## Summary Targets

| Developer | Responsibility | Source Branch | PR Target |
| --- | --- | --- | ---: |
| Developer 1 | Frontend | `developer-1` | 35 |
| Developer 2 | Backend | `developer-2` | 35 |
| Developer 3 | Integration, Analytics & QA | `developer-3` | 35 |
| **Total** | **All Developers** | — | **105** |

---

## Developer 1 — Frontend (`developer-1`, PRs 01–35)

| PR Number | Developer | PR Title | Task Description | Source Branch | Commit Messages | Reviewer | Status | Merge Date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1-PR01 | Developer 1 | feat: initialize Vite React project | Configure `package.json`, Vite config, and base entry files | `developer-1` | `chore: initialize react vite frontend` | Developer 3 | Pending | — |
| D1-PR02 | Developer 1 | style: configure Tailwind CSS theme | Set deep forest green, mint, warm off-white, and dark mode tokens | `developer-1` | `style: configure tailwind design tokens` | Developer 3 | Pending | — |
| D1-PR03 | Developer 1 | feat: create BrandLogo component | Build text-based SpendWise logo with Lucide icon badge | `developer-1` | `feat: add text-based brand logo` | Developer 3 | Pending | — |
| D1-PR04 | Developer 1 | feat: add Modal and ConfirmDialog | Build accessible modal wrapper and destructive action confirm dialog | `developer-1` | `feat: add reusable modal and confirm dialog` | Developer 3 | Pending | — |
| D1-PR05 | Developer 1 | feat: add EmptyState and LoadingSpinner | Build consistent loading and empty-state components | `developer-1` | `feat: add empty state and spinner components` | Developer 3 | Pending | — |
| D1-PR06 | Developer 1 | feat: add ToastProvider notifications | Implement global success, error, and info toast alerts | `developer-1` | `feat: add toast notification provider` | Developer 3 | Pending | — |
| D1-PR07 | Developer 1 | feat: build landing page navbar | Implement responsive top navigation bar with smooth section anchors | `developer-1` | `feat: implement landing page navigation` | Developer 3 | Pending | — |
| D1-PR08 | Developer 1 | feat: build hero section and CSS preview | Create headline, CTAs, trust indicators, and CSS dashboard preview | `developer-1` | `feat: implement hero and css dashboard preview` | Developer 3 | Pending | — |
| D1-PR09 | Developer 1 | feat: add statistics and features sections | Implement illustrative statistics strip and 6-card features grid | `developer-1` | `feat: add stats strip and feature cards` | Developer 3 | Pending | — |
| D1-PR10 | Developer 1 | feat: add how-it-works and benefits sections | Implement 4-step onboarding guide and SpendWise benefits grid | `developer-1` | `feat: add how-it-works and benefits sections` | Developer 3 | Pending | — |
| D1-PR11 | Developer 1 | feat: build FAQ accordion and footer | Implement interactive FAQ dropdowns and footer legal/contact modals | `developer-1` | `feat: add faq accordion and footer modals` | Developer 3 | Pending | — |
| D1-PR12 | Developer 1 | feat: build login page UI | Create `/login` form with validation and password visibility toggle | `developer-1` | `feat: implement login page interface` | Developer 3 | Pending | — |
| D1-PR13 | Developer 1 | feat: build register page UI | Create `/register` form with currency selector and password checks | `developer-1` | `feat: implement registration page interface` | Developer 3 | Pending | — |
| D1-PR14 | Developer 1 | feat: build forgot password page UI | Create `/forgot-password` two-step token request and reset UI | `developer-1` | `feat: implement password reset workflow ui` | Developer 3 | Pending | — |
| D1-PR15 | Developer 1 | feat: implement ProtectedRoute wrapper | Guard private routes and show session verification state | `developer-1` | `feat: add protected route guard` | Developer 3 | Pending | — |
| D1-PR16 | Developer 1 | feat: build DashboardLayout sidebar | Implement desktop sidebar, mobile drawer, and top header bar | `developer-1` | `feat: build responsive dashboard sidebar layout` | Developer 3 | Pending | — |
| D1-PR17 | Developer 1 | feat: add notification bell dropdown | Build header notification popover with unread badge and read actions | `developer-1` | `feat: add header notification dropdown` | Developer 3 | Pending | — |
| D1-PR18 | Developer 1 | feat: build dashboard overview KPI cards | Implement balance, income, expenses, savings, and budget cards | `developer-1` | `feat: implement dashboard kpi cards` | Developer 3 | Pending | — |
| D1-PR19 | Developer 1 | feat: add dashboard period filters | Implement monthly selector and custom date-range filter controls | `developer-1` | `feat: add dashboard month and custom date filters` | Developer 3 | Pending | — |
| D1-PR20 | Developer 1 | feat: build recent transactions widget | Display recent activity table and quick action buttons on dashboard | `developer-1` | `feat: add recent transactions table on dashboard` | Developer 3 | Pending | — |
| D1-PR21 | Developer 1 | feat: build reusable TransactionFormModal | Create shared add/edit modal for income and expense entries | `developer-1` | `feat: add shared transaction form modal` | Developer 3 | Pending | — |
| D1-PR22 | Developer 1 | feat: build reusable LedgerEntryView | Create shared search, filter, summary, and paginated ledger component | `developer-1` | `feat: build reusable ledger entry view` | Developer 3 | Pending | — |
| D1-PR23 | Developer 1 | feat: implement Income management page | Wire `/income` route with category filters and monthly summary card | `developer-1` | `feat: implement income management page` | Developer 3 | Pending | — |
| D1-PR24 | Developer 1 | feat: implement Expense management page | Wire `/expenses` route with category filters and summary card | `developer-1` | `feat: implement expense management page` | Developer 3 | Pending | — |
| D1-PR25 | Developer 1 | feat: build Budgets page layout and cards | Implement monthly budget cards with progress bars and status badges | `developer-1` | `feat: implement budget management cards` | Developer 3 | Pending | — |
| D1-PR26 | Developer 1 | feat: add Budget create/edit modal | Build budget modal supporting overall and category-level caps | `developer-1` | `feat: add budget creation and edit modal` | Developer 3 | Pending | — |
| D1-PR27 | Developer 1 | feat: build Savings Goals page and tabs | Implement all/in-progress/completed tabs and goal progress cards | `developer-1` | `feat: implement savings goals interface` | Developer 3 | Pending | — |
| D1-PR28 | Developer 1 | feat: add savings contribution modal | Implement modal to log contributions and display recent history | `developer-1` | `feat: add savings contribution modal` | Developer 3 | Pending | — |
| D1-PR29 | Developer 1 | feat: build Analytics page shell and KPIs | Implement `/analytics` header controls, range selector, and KPI row | `developer-1` | `feat: create analytics page layout and kpis` | Developer 3 | Pending | — |
| D1-PR30 | Developer 1 | feat: build Transactions history page | Implement `/transactions` unified ledger table and summary cards | `developer-1` | `feat: implement unified transactions table` | Developer 3 | Pending | — |
| D1-PR31 | Developer 1 | feat: add transaction detail modal | Add inspection modal and edit/delete triggers in transaction history | `developer-1` | `feat: add transaction detail inspection modal` | Developer 3 | Pending | — |
| D1-PR32 | Developer 1 | feat: build Profile & Settings form | Implement `/settings` personal info, currency, and theme controls | `developer-1` | `feat: implement profile and preference settings ui` | Developer 3 | Pending | — |
| D1-PR33 | Developer 1 | feat: add password change & account deletion UI | Add security password update form and account deletion confirmation | `developer-1` | `feat: add security settings and account deletion ui` | Developer 3 | Pending | — |
| D1-PR34 | Developer 1 | style: add dark theme support across pages | Ensure clean contrast and dark mode styles across all views | `developer-1` | `style: refine dark mode theme classes` | Developer 3 | Pending | — |
| D1-PR35 | Developer 1 | style: polish responsive mobile breakpoints | Audit tablet and mobile overflow across tables, charts, and modals | `developer-1` | `style: refine mobile responsive spacing` | Developer 3 | Pending | — |

---

## Developer 2 — Backend (`developer-2`, PRs 01–35)

| PR Number | Developer | PR Title | Task Description | Source Branch | Commit Messages | Reviewer | Status | Merge Date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D2-PR01 | Developer 2 | chore: initialize Django project structure | Set up `manage.py`, `spendwise_config`, and `requirements.txt` | `developer-2` | `chore: initialize django project` | Developer 3 | Pending | — |
| D2-PR02 | Developer 2 | feat: configure MySQL and environment variables | Add PyMySQL integration, `.env.example`, and CORS settings | `developer-2` | `feat: configure mysql and dotenv settings` | Developer 3 | Pending | — |
| D2-PR03 | Developer 2 | feat: implement custom User model | Create email-authenticated `User` model with currency/theme/notify prefs | `developer-2` | `feat: create custom user model` | Developer 3 | Pending | — |
| D2-PR04 | Developer 2 | feat: add PasswordResetToken and RevokedToken | Create models for password reset and refresh token revocation | `developer-2` | `feat: add token revocation and reset models` | Developer 3 | Pending | — |
| D2-PR05 | Developer 2 | feat: implement PyJWT authentication backend | Build token generation, verification, and DRF `JWTAuthentication` | `developer-2` | `feat: implement jwt authentication backend` | Developer 3 | Pending | — |
| D2-PR06 | Developer 2 | feat: add auth register and login APIs | Implement `/api/auth/register/` and `/api/auth/login/` endpoints | `developer-2` | `feat: implement register and login views` | Developer 3 | Pending | — |
| D2-PR07 | Developer 2 | feat: add token refresh and logout APIs | Implement refresh rotation and `/api/auth/logout/` revocation | `developer-2` | `feat: add refresh rotation and logout endpoints` | Developer 3 | Pending | — |
| D2-PR08 | Developer 2 | feat: add forgot and reset password APIs | Implement `/api/auth/forgot-password/` and `/api/auth/reset-password/` | `developer-2` | `feat: implement password reset endpoints` | Developer 3 | Pending | — |
| D2-PR09 | Developer 2 | feat: add profile and password change APIs | Implement `/api/profile/`, change-password, and delete-account routes | `developer-2` | `feat: implement user profile management apis` | Developer 3 | Pending | — |
| D2-PR10 | Developer 2 | feat: create Category model and defaults | Create normalized `categories` table and default category seeder | `developer-2` | `feat: create category model and default seed` | Developer 3 | Pending | — |
| D2-PR11 | Developer 2 | feat: create Income and Expense models | Create `income` and `expenses` tables with `DECIMAL(12,2)` & indexes | `developer-2` | `feat: create income and expense models` | Developer 3 | Pending | — |
| D2-PR12 | Developer 2 | feat: create Budget model | Create `budgets` table supporting overall and category monthly limits | `developer-2` | `feat: create monthly budget model` | Developer 3 | Pending | — |
| D2-PR13 | Developer 2 | feat: create SavingsGoal & Contribution models | Create `savings_goals` and `savings_contributions` tables | `developer-2` | `feat: create savings goal and contribution models` | Developer 3 | Pending | — |
| D2-PR14 | Developer 2 | feat: create Notification model and migrations | Create `notifications` table and generate initial Django migrations | `developer-2` | `feat: add notification model and migrations` | Developer 3 | Pending | — |
| D2-PR15 | Developer 2 | feat: implement IsOwner permission and pagination | Add object-level ownership checks and standard pagination class | `developer-2` | `feat: add ownership permissions and pagination` | Developer 3 | Pending | — |
| D2-PR16 | Developer 2 | feat: add custom API exception handler | Normalize DRF validation and error payloads for frontend consumption | `developer-2` | `feat: add unified drf exception handler` | Developer 3 | Pending | — |
| D2-PR17 | Developer 2 | feat: implement Category list/create API | Add `/api/categories/` endpoint with type filtering | `developer-2` | `feat: add categories api endpoint` | Developer 3 | Pending | — |
| D2-PR18 | Developer 2 | feat: implement Income CRUD ViewSet | Add `/api/income/` with search, category, date filtering, and summary | `developer-2` | `feat: implement income crud and filter api` | Developer 3 | Pending | — |
| D2-PR19 | Developer 2 | feat: implement Expense CRUD ViewSet | Add `/api/expenses/` with search, category, date filtering, and summary | `developer-2` | `feat: implement expense crud and filter api` | Developer 3 | Pending | — |
| D2-PR20 | Developer 2 | feat: implement budget utilization service | Compute spent, remaining, utilization %, and status for budgets | `developer-2` | `feat: add budget calculation service` | Developer 3 | Pending | — |
| D2-PR21 | Developer 2 | feat: implement automated budget alert evaluator | Trigger warning/exceeded notifications when expenses cross thresholds | `developer-2` | `feat: add automated budget alert notifications` | Developer 3 | Pending | — |
| D2-PR22 | Developer 2 | feat: implement Budget CRUD ViewSet | Add `/api/budgets/` with uniqueness validation and month/year filters | `developer-2` | `feat: implement budget crud api` | Developer 3 | Pending | — |
| D2-PR23 | Developer 2 | feat: implement SavingsGoal CRUD & contribute | Add `/api/savings/` and atomic `/contribute/` completion workflow | `developer-2` | `feat: implement savings goals and contribution api` | Developer 3 | Pending | — |
| D2-PR24 | Developer 2 | feat: implement Dashboard summary service | Aggregate balance, income, expenses, savings, charts, and recent activity | `developer-2` | `feat: build dashboard summary aggregation service` | Developer 3 | Pending | — |
| D2-PR25 | Developer 2 | feat: expose Dashboard summary endpoint | Add `/api/dashboard/summary/` supporting month and custom date filters | `developer-2` | `feat: add dashboard summary endpoint` | Developer 3 | Pending | — |
| D2-PR26 | Developer 2 | feat: implement unified Transactions API | Add `/api/transactions/` with search, type, category, sort, and paging | `developer-2` | `feat: implement unified transactions api` | Developer 3 | Pending | — |
| D2-PR27 | Developer 2 | feat: implement monthly analytics endpoint | Add `/api/analytics/monthly/` with savings rate and budget performance | `developer-2` | `feat: add monthly analytics endpoint` | Developer 3 | Pending | — |
| D2-PR28 | Developer 2 | feat: implement category analytics endpoint | Add `/api/analytics/categories/` for expense and income category shares | `developer-2` | `feat: add category analytics endpoint` | Developer 3 | Pending | — |
| D2-PR29 | Developer 2 | feat: implement income-expense trend endpoint | Add `/api/analytics/income-expense/` comparison endpoint | `developer-2` | `feat: add income-expense analytics endpoint` | Developer 3 | Pending | — |
| D2-PR30 | Developer 2 | feat: implement Notifications APIs | Add list, mark-read, and mark-all-read endpoints | `developer-2` | `feat: implement notification endpoints` | Developer 3 | Pending | — |
| D2-PR31 | Developer 2 | feat: add seed_categories & demo management cmds | Add `seed_categories`, `seed_demo_data`, and `/api/demo/seed/` | `developer-2` | `feat: add management commands for seeding` | Developer 3 | Pending | — |
| D2-PR32 | Developer 2 | test: add authentication & profile unit tests | Write `test_auth.py` covering register, login, refresh, and reset | `developer-2` | `test: add auth and jwt rotation tests` | Developer 3 | Pending | — |
| D2-PR33 | Developer 2 | test: add budget & savings API tests | Write `test_finance_api.py` covering budget math and goal completion | `developer-2` | `test: add budget and savings api tests` | Developer 3 | Pending | — |
| D2-PR34 | Developer 2 | test: add isolation & analytics tests | Write `test_analytics_and_security.py` for cross-user ownership checks | `developer-2` | `test: add ownership isolation and analytics tests` | Developer 3 | Pending | — |
| D2-PR35 | Developer 2 | refactor: register admin models and optimize queries | Add `select_related` / `prefetch_related` and Django admin views | `developer-2` | `refactor: optimize querysets and admin registration` | Developer 3 | Pending | — |

---

## Developer 3 — Integration, Analytics & QA (`developer-3`, PRs 01–35)

| PR Number | Developer | PR Title | Task Description | Source Branch | Commit Messages | Reviewer | Status | Merge Date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D3-PR01 | Developer 3 | feat: configure Axios client and proxy | Set up Vite `/api` proxy and base Axios client configuration | `developer-3` | `feat: configure axios client and api proxy` | Developer 1 | Pending | — |
| D3-PR02 | Developer 3 | feat: implement JWT refresh interceptor | Add automatic 401 refresh token retry and session cleanup | `developer-3` | `feat: add jwt refresh interceptor` | Developer 2 | Pending | — |
| D3-PR03 | Developer 3 | feat: build currency and date formatters | Implement INR default formatting, multi-currency symbols, and error parser | `developer-3` | `feat: add currency and date formatter utilities` | Developer 1 | Pending | — |
| D3-PR04 | Developer 3 | feat: create AuthContext session provider | Integrate login, register, logout, profile sync, and theme switching | `developer-3` | `feat: implement auth context and theme sync` | Developer 1 | Pending | — |
| D3-PR05 | Developer 3 | feat: build financeService API layer | Create typed service functions for all backend REST endpoints | `developer-3` | `feat: add finance api service wrappers` | Developer 2 | Pending | — |
| D3-PR06 | Developer 3 | feat: integrate Login and Register flows | Connect `/login` and `/register` forms to `/api/auth/*` endpoints | `developer-3` | `feat: integrate login and registration apis` | Developer 1 | Pending | — |
| D3-PR07 | Developer 3 | feat: integrate Forgot Password flow | Connect `/forgot-password` two-step token workflow to backend | `developer-3` | `feat: integrate password reset workflow` | Developer 2 | Pending | — |
| D3-PR08 | Developer 3 | feat: integrate Dashboard summary data | Wire `/dashboard` overview cards and period filters to summary API | `developer-3` | `feat: integrate dashboard summary api` | Developer 1 | Pending | — |
| D3-PR09 | Developer 3 | feat: implement Dashboard Recharts widgets | Integrate Income vs Expense BarChart, Category PieChart, and AreaChart | `developer-3` | `feat: add recharts visualizations to dashboard` | Developer 1 | Pending | — |
| D3-PR10 | Developer 3 | feat: wire Dashboard quick actions & demo seed | Connect quick add modals and optional demo seed trigger on dashboard | `developer-3` | `feat: connect dashboard quick actions and demo seed` | Developer 2 | Pending | — |
| D3-PR11 | Developer 3 | feat: integrate Income CRUD & filters | Connect `/income` list, pagination, search, date filter, and mutations | `developer-3` | `feat: integrate income management apis` | Developer 2 | Pending | — |
| D3-PR12 | Developer 3 | feat: integrate Expense CRUD & filters | Connect `/expenses` list, pagination, search, date filter, and mutations | `developer-3` | `feat: integrate expense management apis` | Developer 2 | Pending | — |
| D3-PR13 | Developer 3 | feat: integrate Budgets API & alert banner | Connect `/budgets` CRUD, live utilization metrics, and warning banner | `developer-3` | `feat: integrate budgets api and alerts` | Developer 2 | Pending | — |
| D3-PR14 | Developer 3 | feat: integrate Savings Goals & contributions | Connect `/savings` CRUD and contribution logging with auto-completion | `developer-3` | `feat: integrate savings goals and contributions` | Developer 2 | Pending | — |
| D3-PR15 | Developer 3 | feat: integrate Analytics monthly charts | Wire `/analytics` Recharts BarChart and LineChart to monthly API | `developer-3` | `feat: implement analytics monthly charts` | Developer 1 | Pending | — |
| D3-PR16 | Developer 3 | feat: integrate Analytics category & budget charts | Wire category PieChart and budget vs actual BarChart in `/analytics` | `developer-3` | `feat: add category and budget performance charts` | Developer 1 | Pending | — |
| D3-PR17 | Developer 3 | feat: add Analytics custom date-range filter | Connect 3M/6M/12M presets and custom date inputs to analytics APIs | `developer-3` | `feat: connect analytics date range filters` | Developer 2 | Pending | — |
| D3-PR18 | Developer 3 | feat: integrate unified Transactions page | Connect `/transactions` search, type/category/date filters, sort, and paging | `developer-3` | `feat: integrate unified transactions ledger` | Developer 2 | Pending | — |
| D3-PR19 | Developer 3 | feat: wire Transactions edit & delete actions | Connect inline edit modal and delete confirmation to income/expense APIs | `developer-3` | `feat: wire transaction edit and delete actions` | Developer 1 | Pending | — |
| D3-PR20 | Developer 3 | feat: integrate Settings profile & preferences | Connect `/settings` profile, currency, theme, and notification updates | `developer-3` | `feat: integrate profile and preference updates` | Developer 1 | Pending | — |
| D3-PR21 | Developer 3 | feat: integrate password change & account delete | Connect security endpoints in `/settings` with confirmation dialog | `developer-3` | `feat: integrate password change and account deletion` | Developer 2 | Pending | — |
| D3-PR22 | Developer 3 | feat: integrate header Notifications polling | Connect notification bell list, unread badge, mark-read, and mark-all | `developer-3` | `feat: integrate header notification actions` | Developer 1 | Pending | — |
| D3-PR23 | Developer 3 | test: configure Vitest & Testing Library | Set up `vitest`, `jsdom`, and `setupTests.js` in frontend | `developer-3` | `test: configure vitest frontend test runner` | Developer 1 | Pending | — |
| D3-PR24 | Developer 3 | test: add frontend smoke & route tests | Add `App.test.jsx` covering INR formatting, landing page, and auth guard | `developer-3` | `test: add frontend routing and formatter tests` | Developer 1 | Pending | — |
| D3-PR25 | Developer 3 | fix: handle empty states on zero-data accounts | Ensure charts and lists degrade cleanly for newly registered users | `developer-3` | `fix: improve empty state handling on charts` | Developer 1 | Pending | — |
| D3-PR26 | Developer 3 | fix: resolve refresh token race condition | Share single in-flight refresh promise across concurrent API calls | `developer-3` | `fix: deduplicate concurrent jwt refresh requests` | Developer 2 | Pending | — |
| D3-PR27 | Developer 3 | fix: enforce strict category type validation | Verify income/expense category mismatches return clear validation errors | `developer-3` | `fix: tighten category type validation feedback` | Developer 2 | Pending | — |
| D3-PR28 | Developer 3 | docs: write API documentation | Document all REST endpoints, query params, and auth headers | `developer-3` | `docs: add complete rest api documentation` | Developer 2 | Pending | — |
| D3-PR29 | Developer 3 | docs: write MySQL database schema guide | Document all normalized tables, keys, decimal precision, and indexes | `developer-3` | `docs: add mysql schema documentation` | Developer 2 | Pending | — |
| D3-PR30 | Developer 3 | docs: write testing guide & QA checklist | Document backend/frontend test commands and E2E acceptance checklist | `developer-3` | `docs: add testing and qa checklist` | Developer 1 | Pending | — |
| D3-PR31 | Developer 3 | docs: write branch strategy documentation | Document 5-branch model, protection rules, and manual GitHub workflow | `developer-3` | `docs: add branch strategy and collaboration guide` | Developer 2 | Pending | — |
| D3-PR32 | Developer 3 | docs: publish 105-PR tracking matrix | Create and populate `docs/PULL_REQUEST_TRACKER.md` | `developer-3` | `docs: add pull request tracker matrix` | Developer 1 | Pending | — |
| D3-PR33 | Developer 3 | docs: finalize root README setup guide | Document MySQL, Django, React setup, and demo seeding commands | `developer-3` | `docs: finalize project readme instructions` | Developer 2 | Pending | — |
| D3-PR34 | Developer 3 | test: verify Vite production build & bundle | Run full Vitest suite and `vite build` verification | `developer-3` | `test: verify frontend production build` | Developer 1 | Pending | — |
| D3-PR35 | Developer 3 | chore: final QA sign-off and release readiness | Complete final end-to-end verification before merging `develop` to `main` | `developer-3` | `chore: complete final qa verification checklist` | Developer 2 | Pending | — |
