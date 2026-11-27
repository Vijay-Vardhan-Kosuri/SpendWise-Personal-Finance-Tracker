# SpendWise Branch Strategy & Manual GitHub Collaboration Guide

## 1. Permanent Branch Structure

The repository maintains exactly five permanent branches:

| Branch | Purpose | Protection Rules |
| --- | --- | --- |
| `main` | Stable, production-ready releases | No direct pushes; PR from `develop` required with approval and passing checks |
| `develop` | Shared integration branch | No direct pushes; PRs from `developer-*` branches required with peer review |
| `developer-1` | Dedicated branch for Developer 1 (Frontend) | Owned by Developer 1 |
| `developer-2` | Dedicated branch for Developer 2 (Backend) | Owned by Developer 2 |
| `developer-3` | Dedicated branch for Developer 3 (Integration, Analytics & QA) | Owned by Developer 3 |

## 2. Developer Ownership

- **Developer 1 (`developer-1`):** React setup, Tailwind configuration, reusable UI components, Landing page, Auth UI, Dashboard UI, Income/Expense UI, Budgets/Savings UI, Transactions UI, Settings UI, responsive design.
- **Developer 2 (`developer-2`):** Django setup, MySQL configuration, normalized models & migrations, JWT authentication, permissions & ownership checks, Income/Expense/Budget/Savings/Transactions/Dashboard/Analytics/Profile APIs, backend validation & unit tests.
- **Developer 3 (`developer-3`):** Axios client & JWT refresh interceptor, Auth/Dashboard/Module integration, Recharts implementation, shared search & filters, notifications integration, frontend tests, integration tests, bug fixes, and documentation.

## 3. Strict Manual-Only GitHub Policy

All Git and GitHub actions (branch creation, commits, pushes, PR creation, PR descriptions, code review, approvals, merges, and branch synchronization) must be executed manually by the three human developers.

## 4. Sequential PR Workflow per Developer Branch

Keep **only one open PR per developer branch at a time**.

1. **Synchronize branch before starting a task:**
   ```bash
   git checkout developer-1
   git pull origin developer-1
   git fetch origin
   git merge origin/develop
   ```
2. **Implement only the assigned task** on your dedicated branch.
3. **Create meaningful commits:**
   ```bash
   git add .
   git commit -m "feat: implement budget utilization cards"
   ```
4. **Push branch:**
   ```bash
   git push origin developer-1
   ```
5. **Open PR manually on GitHub:** Base `develop` ← Compare `developer-1` (or `developer-2` / `developer-3`). Assign one of the other two developers as reviewer.
6. **Peer review & manual merge** after approval and checks pass.
7. **Sync after merge** before starting the next PR:
   ```bash
   git checkout developer-1
   git fetch origin
   git merge origin/develop
   git push origin developer-1
   ```
