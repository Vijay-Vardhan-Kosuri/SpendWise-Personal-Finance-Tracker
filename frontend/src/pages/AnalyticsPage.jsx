import { useCallback, useEffect, useState } from "react";
import { BarChart3, Calendar, Percent, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { financeService } from "../services/financeService";
import { extractErrorMessage, formatCurrency } from "../utils/formatters";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency_preference || "INR";

  const [monthsWindow, setMonthsWindow] = useState(6);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params =
        startDate && endDate
          ? { start_date: startDate, end_date: endDate }
          : { months: monthsWindow };

      const [mRes, cRes] = await Promise.all([
        financeService.getAnalyticsMonthly(params),
        financeService.getAnalyticsCategories(
          startDate && endDate ? { start_date: startDate, end_date: endDate } : {}
        ),
      ]);
      setMonthlyData(mRes);
      setCategoryData(cRes);
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to load analytics."), "error");
    } finally {
      setLoading(false);
    }
  }, [monthsWindow, startDate, endDate, showToast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading && !monthlyData) {
    return <LoadingSpinner label="Computing financial analytics..." fullHeight />;
  }

  const summary = monthlyData?.summary || {};
  const series = monthlyData?.monthly_series || [];
  const budgetPerf = monthlyData?.budget_performance || [];
  const expenseCats = categoryData?.expense_categories || [];
  const incomeCats = categoryData?.income_categories || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Financial Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Interactive reports powered directly by your verified transaction records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1">
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setMonthsWindow(m);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  !startDate && monthsWindow === m
                    ? "bg-forest-800 text-white"
                    : "text-gray-600 dark:text-slate-300"
                }`}
              >
                {m}M
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 hidden sm:block" />
            <input
              type="date"
              className="sw-input py-1.5 w-auto text-xs"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              className="sw-input py-1.5 w-auto text-xs"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sw-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              Total Income
            </span>
            <TrendingUp className="h-4 w-4 text-forest-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.total_income, currency)}
          </p>
        </div>

        <div className="sw-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              Total Expenses
            </span>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.total_expenses, currency)}
          </p>
        </div>

        <div className="sw-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              Net Cash Surplus
            </span>
            <Wallet className="h-4 w-4 text-forest-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-forest-700 dark:text-forest-400">
            {formatCurrency(summary.net_savings, currency)}
          </p>
        </div>

        <div className="sw-card p-5 bg-forest-800 text-white border-forest-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-forest-200">Savings Rate</span>
            <Percent className="h-4 w-4 text-forest-200" />
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.savings_rate || 0}%</p>
          <p className="mt-1 text-[11px] text-forest-200">Net surplus divided by income</p>
        </div>
      </div>

      {/* Income vs Expense & Net Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sw-card p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Income vs. Expense Analysis
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Side-by-side monthly comparison
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#14532D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sw-card p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Monthly Financial Trends
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Trajectory of income, expenses, and net monthly savings
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#14532D"
                  strokeWidth={2.2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#DC2626"
                  strokeWidth={2.2}
                />
                <Line
                  type="monotone"
                  dataKey="net_savings"
                  name="Net Savings"
                  stroke="#059669"
                  strokeWidth={2.2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Budget Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="sw-card p-6 lg:col-span-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Category-wise Spending
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Expense distribution for the active reporting window
          </p>
          {expenseCats.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No expense categories recorded"
              description="Log expenses to inspect category-level spending shares."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCats}
                      dataKey="amount"
                      nameKey="category"
                      innerRadius={45}
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {expenseCats.map((entry) => (
                        <Cell key={entry.category} fill={entry.color || "#14532D"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5">
                {expenseCats.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.category}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(cat.amount, currency)} ({cat.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sw-card p-6 lg:col-span-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Current Month Budget Performance
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Budgeted cap versus actual expenditure per category
          </p>
          {budgetPerf.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No budgets configured this month"
              description="Create monthly budgets to compare planned limits vs. actual spending."
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                  <Legend />
                  <Bar dataKey="budgeted" name="Budgeted" fill="#BBF7D0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Actual Spent" fill="#14532D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Income Source Breakdown */}
      {incomeCats.length > 0 && (
        <div className="sw-card p-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
            Income Sources Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {incomeCats.map((src) => (
              <div
                key={src.category}
                className="rounded-xl border border-gray-200 dark:border-slate-800 p-4"
              >
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                  {src.category}
                </p>
                <p className="text-lg font-bold text-forest-700 dark:text-forest-400 mt-1">
                  {formatCurrency(src.amount, currency)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{src.percentage}% of total income</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
