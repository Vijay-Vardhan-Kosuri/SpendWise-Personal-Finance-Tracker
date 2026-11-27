import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Database,
  PiggyBank,
  Plus,
  Receipt,
  Target,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import TransactionFormModal from "../components/TransactionFormModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { financeService } from "../services/financeService";
import { extractErrorMessage, formatCurrency, formatDate } from "../utils/formatters";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency_preference || "INR";

  const now = new Date();
  const [filterMode, setFilterMode] = useState("month"); // month | custom
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [txModal, setTxModal] = useState({ open: false, type: "expense" });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params =
        filterMode === "custom" && customStart && customEnd
          ? { start_date: customStart, end_date: customEnd }
          : { month, year };

      const [dashData, catData] = await Promise.all([
        financeService.getDashboardSummary(params),
        financeService.getCategories(),
      ]);
      setSummary(dashData);
      setCategories(catData);
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to load dashboard data."), "error");
    } finally {
      setLoading(false);
    }
  }, [filterMode, month, year, customStart, customEnd, showToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLoadDemoData = async () => {
    setSeeding(true);
    try {
      await financeService.seedDemoData();
      showToast("Sample demo data loaded into your account.");
      loadDashboard();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSeeding(false);
    }
  };

  if (loading && !summary) {
    return <LoadingSpinner label="Loading your financial overview..." fullHeight />;
  }

  const overview = summary?.overview || {};
  const budget = overview.budget_utilization || {};
  const hasAnyData =
    overview.total_income > 0 ||
    overview.total_expenses > 0 ||
    (summary?.recent_transactions || []).length > 0;

  return (
    <div className="space-y-6">
      {/* Header Controls & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.full_name?.split(" ")[0] || "there"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Real-time snapshot of your balances, monthly budgets, and spending trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setTxModal({ open: true, type: "income" })}
            className="sw-btn-secondary"
          >
            <Plus className="h-4 w-4 text-forest-700" />
            Add Income
          </button>
          <button
            type="button"
            onClick={() => setTxModal({ open: true, type: "expense" })}
            className="sw-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="sw-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-forest-700" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Reporting Period
          </span>
          <div className="ml-2 inline-flex rounded-lg bg-gray-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setFilterMode("month")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filterMode === "month"
                  ? "bg-white dark:bg-slate-700 text-forest-800 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-slate-400"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("custom")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filterMode === "custom"
                  ? "bg-white dark:bg-slate-700 text-forest-800 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-slate-400"
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {filterMode === "month" ? (
          <div className="flex items-center gap-2.5">
            <select
              className="sw-input py-1.5 w-auto"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              className="sw-input py-1.5 w-auto"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="date"
              className="sw-input py-1.5 w-auto"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              className="sw-input py-1.5 w-auto"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Empty Demo Helper Banner when account is brand new */}
      {!hasAnyData && (
        <div className="rounded-xl border border-forest-200 bg-forest-50/70 dark:bg-forest-900/20 dark:border-forest-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-forest-900 dark:text-forest-100">
              Your SpendWise ledger is ready
            </h3>
            <p className="text-xs text-forest-800/80 dark:text-forest-200/80 mt-1">
              Add your own income and expenses above, or load clearly labeled sample demo records to
              preview charts and budgets immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLoadDemoData}
            disabled={seeding}
            className="sw-btn-primary shrink-0"
          >
            <Database className="h-4 w-4" />
            {seeding ? "Loading Demo..." : "Load Demo Data"}
          </button>
        </div>
      )}

      {/* 5 Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="sw-card p-5 bg-forest-800 text-white border-forest-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-forest-200">Total Balance</span>
            <Wallet className="h-4 w-4 text-forest-200" strokeWidth={1.75} />
          </div>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(overview.total_balance, currency)}</p>
          <p className="mt-1 text-[11px] text-forest-200">Cumulative income minus expenses</p>
        </div>

        <div className="sw-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              Period Income
            </span>
            <ArrowDownLeft className="h-4 w-4 text-forest-600" strokeWidth={2} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(overview.total_income, currency)}
          </p>
          <Link
            to="/income"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 hover:underline"
          >
            Manage income <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="sw-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              Period Expenses
            </span>
            <ArrowUpRight className="h-4 w-4 text-red-500" strokeWidth={2} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(overview.total_expenses, currency)}
          </p>
          <Link
            to="/expenses"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 hover:underline"
          >
            Manage expenses <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="sw-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              Total Savings
            </span>
            <PiggyBank className="h-4 w-4 text-forest-600" strokeWidth={1.75} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(overview.total_savings, currency)}
          </p>
          <Link
            to="/savings"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 hover:underline"
          >
            View savings goals <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="sw-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              Budget Utilization
            </span>
            <Target className="h-4 w-4 text-forest-600" strokeWidth={1.75} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {budget.status === "unconfigured" ? "Not Set" : `${budget.percentage}%`}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                budget.percentage >= 100
                  ? "bg-red-600"
                  : budget.percentage >= 80
                  ? "bg-amber-500"
                  : "bg-forest-600"
              }`}
              style={{ width: `${Math.min(budget.percentage || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row 1: Income vs Expense & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="sw-card p-6 lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Income vs. Expense Comparison
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Monthly cash inflows versus outflows
              </p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-forest-700 hover:underline">
              Full Analytics
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.income_vs_expense_chart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                <Bar dataKey="income" name="Income" fill="#14532D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sw-card p-6 lg:col-span-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Expense Category Breakdown
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Distribution for the selected period
            </p>
          </div>
          {(summary?.expense_category_breakdown || []).length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses in period"
              description="Record an expense to see category allocation."
            />
          ) : (
            <div className="space-y-4">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.expense_category_breakdown}
                      dataKey="amount"
                      nameKey="category"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {summary.expense_category_breakdown.map((entry) => (
                        <Cell key={entry.category} fill={entry.color || "#14532D"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                {summary.expense_category_breakdown.map((item) => (
                  <div key={item.category} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.category}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount, currency)} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Spending Trends & Savings Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="sw-card p-6 lg:col-span-7">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Period Spending Trend
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Daily expense curve across the selected period
            </p>
          </div>
          {(summary?.monthly_spending_trends || []).length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No spending trend data yet"
              description="Daily spending points appear once expenses are logged."
            />
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.monthly_spending_trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="Spent"
                    stroke="#14532D"
                    fill="#DCFCE7"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="sw-card p-6 lg:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Savings Progress</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Active personal savings milestones
              </p>
            </div>
            <Link to="/savings" className="text-xs font-semibold text-forest-700 hover:underline">
              Manage Goals
            </Link>
          </div>
          {(summary?.savings_progress || []).length === 0 ? (
            <EmptyState
              icon={PiggyBank}
              title="No savings goals"
              description="Set your first savings target to track contributions."
              action={
                <Link to="/savings" className="sw-btn-primary text-xs">
                  Create Savings Goal
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {summary.savings_progress.map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-800 dark:text-slate-200">{goal.title}</span>
                    <span className="text-forest-700 dark:text-forest-400">
                      {goal.progress_percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-forest-600 transition-all"
                      style={{ width: `${goal.progress_percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 dark:text-slate-400">
                    <span>Saved: {formatCurrency(goal.saved_amount, currency)}</span>
                    <span>Target: {formatCurrency(goal.target_amount, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="sw-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Latest entries recorded within the selected period
            </p>
          </div>
          <Link to="/transactions" className="text-xs font-semibold text-forest-700 hover:underline">
            View All Transactions
          </Link>
        </div>

        {(summary?.recent_transactions || []).length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No recent transactions"
            description="Add an income or expense entry to see activity here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="py-2.5 pr-4">Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 pl-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                {summary.recent_transactions.map((tx) => (
                  <tr key={`${tx.type}-${tx.id}`} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-slate-300">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tx.category_color }}
                        />
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-slate-400">
                      {tx.payment_method}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 dark:text-slate-400">
                      {formatDate(tx.date)}
                    </td>
                    <td
                      className={`py-3 pl-4 text-right font-semibold ${
                        tx.type === "income"
                          ? "text-forest-700 dark:text-forest-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionFormModal
        open={txModal.open}
        type={txModal.type}
        categories={categories}
        onClose={() => setTxModal({ ...txModal, open: false })}
        onSuccess={loadDashboard}
      />
    </div>
  );
}
