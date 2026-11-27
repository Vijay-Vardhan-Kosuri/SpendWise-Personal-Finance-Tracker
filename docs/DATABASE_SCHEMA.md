# SpendWise Normalized MySQL Database Schema

All monetary values use `DECIMAL(12, 2)` for exact financial precision. All user-owned tables reference `users(id)` via foreign keys with `ON DELETE CASCADE` (except category protection on active transactions).

## Tables Overview

1. **`users`** (`apps.accounts.User`)
   - Primary Key: `id` (BIGINT AUTO_INCREMENT)
   - Unique Indexed: `email` (VARCHAR 255)
   - Attributes: `full_name`, `password` (PBKDF2/hashed), `phone`, `occupation`, `currency_preference` (default `INR`), `theme_preference` (default `light`), `notify_budget_alerts`, `notify_goal_milestones`, `notify_monthly_summary`, `is_active`, `is_staff`, `created_at`, `updated_at`.

2. **`categories`** (`apps.finance.Category`)
   - Primary Key: `id`
   - Foreign Key: `user_id` -> `users.id` (nullable for system default categories)
   - Attributes: `name` (VARCHAR 80), `type` (`income` | `expense`), `color` (VARCHAR 20), `is_default`, `created_at`.
   - Index: `(type, is_default)`.

3. **`income`** (`apps.finance.Income`)
   - Primary Key: `id`
   - Foreign Keys: `user_id` -> `users.id`, `category_id` -> `categories.id` (`PROTECT`)
   - Attributes: `amount` (`DECIMAL(12,2)`), `date` (`DATE`), `payment_method` (VARCHAR 40), `description` (VARCHAR 255), `created_at`, `updated_at`.
   - Indexes: `(user_id, date)`, `(user_id, category_id)`.

4. **`expenses`** (`apps.finance.Expense`)
   - Primary Key: `id`
   - Foreign Keys: `user_id` -> `users.id`, `category_id` -> `categories.id` (`PROTECT`)
   - Attributes: `amount` (`DECIMAL(12,2)`), `date` (`DATE`), `payment_method` (VARCHAR 40), `description` (VARCHAR 255), `created_at`, `updated_at`.
   - Indexes: `(user_id, date)`, `(user_id, category_id)`.

5. **`budgets`** (`apps.finance.Budget`)
   - Primary Key: `id`
   - Foreign Keys: `user_id` -> `users.id`, `category_id` -> `categories.id` (nullable for overall monthly budget)
   - Attributes: `month` (SMALLINT 1–12), `year` (SMALLINT), `amount` (`DECIMAL(12,2)`), `alert_threshold` (SMALLINT default 80), `created_at`, `updated_at`.
   - Index: `(user_id, year, month)`.

6. **`savings_goals`** (`apps.finance.SavingsGoal`)
   - Primary Key: `id`
   - Foreign Key: `user_id` -> `users.id`
   - Attributes: `title` (VARCHAR 150), `target_amount` (`DECIMAL(12,2)`), `target_date` (`DATE`, nullable), `description`, `status` (`pending` | `completed`), `created_at`, `updated_at`.
   - Index: `(user_id, status)`.

7. **`savings_contributions`** (`apps.finance.SavingsContribution`)
   - Primary Key: `id`
   - Foreign Keys: `goal_id` -> `savings_goals.id` (`CASCADE`), `user_id` -> `users.id` (`CASCADE`)
   - Attributes: `amount` (`DECIMAL(12,2)`), `contribution_date` (`DATE`), `note` (VARCHAR 255), `created_at`.
   - Index: `(goal_id, contribution_date)`.

8. **`notifications`** (`apps.finance.Notification`)
   - Primary Key: `id`
   - Foreign Key: `user_id` -> `users.id`
   - Attributes: `title` (VARCHAR 150), `message` (TEXT), `type` (`budget_warning` | `budget_exceeded` | `goal_completed` | `system`), `is_read` (BOOLEAN), `created_at`.
   - Index: `(user_id, is_read)`.

9. **Authentication Support Tables**
   - `password_reset_tokens`: `user_id`, `token` (UUID), `expires_at`, `is_used`, `created_at`
   - `revoked_tokens`: `jti` (unique), `user_id`, `revoked_at`
