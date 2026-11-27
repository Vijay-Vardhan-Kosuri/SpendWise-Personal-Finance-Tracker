import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Pencil, Plus, Target, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { financeService } from "../services/financeService";
import { extractErrorMessage, formatCurrency, getCurrencySymbol } from "../utils/formatters";

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

export default function BudgetsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency_preference || "INR";

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    category: "",
    amount: "",
    alert_threshold: 80,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetList, catList] = await Promise.all([
        financeService.getBudgets({ month, year }),
        financeService.getCategories("expense"),
      ]);
      setBudgets(budgetList);
      setExpenseCategories(catList);
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to load budgets."), "error");
    } finally {
      setLoading(false);
    }
  }, [month, year, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditing(null);
    setForm({
      category: "",
      amount: "",
      alert_threshold: 80,
      month,
      year,
    });
    setModalOpen(true);
  };

  const openEditModal = (budget) => {
    setEditing(budget);
    setForm({
      category: budget.category ? String(budget.category) : "",
      amount: String(budget.amount),
      alert_threshold: budget.alert_threshold || 80,
      month: budget.month,
      year: budget.year,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      showToast("Enter a valid positive budget amount.", "error");
      return;
    }
    setSubmitting(true);
    const payload = {
      category: form.category ? Number(form.category) : null,
      amount: Number(form.amount).toFixed(2),
      alert_threshold: Number(form.alert_threshold),
      month: Number(form.month),
      year: Number(form.year),
    };

    try {
      if (editing) {
        await financeService.updateBudget(editing.id, payload);
        showToast("Budget updated.");
      } else {
        await financeService.createBudget(payload);
        showToast("Monthly budget created.");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await financeService.deleteBudget(deleteTarget.id);
      showToast("Budget deleted.");
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  };

  const warnings = budgets.filter((b) => b.status === "warning" || b.status === "exceeded");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Budget Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Configure monthly overall and category spending limits with real-time utilization alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            className="sw-input py-2 w-auto"
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
            className="sw-input py-2 w-auto"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button type="button" onClick={openCreateModal} className="sw-btn-primary">
            <Plus className="h-4 w-4" />
            Set Budget
          </button>
        </div>
      </div>

      {/* Warning Notifications Banner */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 dark:text-amber-100">
            <p className="font-semibold">
              Budget Warning ({warnings.length}{" "}
              {warnings.length === 1 ? "category requires" : "categories require"} attention)
            </p>
            <ul className="mt-1 space-y-0.5 text-xs">
              {warnings.map((w) => (
                <li key={w.id}>
                  <strong>{w.category_name}</strong>: {w.utilization_percentage}% used (
                  {formatCurrency(w.spent_amount, currency)} of {formatCurrency(w.amount, currency)})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Calculating budget utilization..." />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title={`No budgets set for ${MONTH_NAMES[month - 1]} ${year}`}
          description="Set an overall monthly budget or category-specific caps such as Food or Shopping."
          action={
            <button type="button" onClick={openCreateModal} className="sw-btn-primary">
              <Plus className="h-4 w-4" />
              Create Your First Budget
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const pct = Math.min(b.utilization_percentage, 100);
            const isExceeded = b.status === "exceeded";
            const isWarning = b.status === "warning";
            const remainingNum = Number(b.remaining_amount);

            return (
              <div key={b.id} className="sw-card p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isExceeded
                            ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                            : isWarning
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-forest-50 text-forest-800 dark:bg-forest-900/50 dark:text-forest-200"
                        }`}
                      >
                        {isExceeded ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {isExceeded ? "Exceeded" : isWarning ? "Near Limit" : "On Track"}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-white">
                        {b.category_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {MONTH_NAMES[b.month - 1]} {b.year}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(b)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-forest-800 dark:hover:bg-slate-800"
                        aria-label="Edit budget"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(b)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        aria-label="Delete budget"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-600 dark:text-slate-300">
                        Spent: {formatCurrency(b.spent_amount, currency)}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {b.utilization_percentage}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isExceeded
                            ? "bg-red-600"
                            : isWarning
                            ? "bg-amber-500"
                            : "bg-forest-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-slate-400">Monthly Limit</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                      {formatCurrency(b.amount, currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 dark:text-slate-400">
                      {remainingNum < 0 ? "Over Budget" : "Remaining"}
                    </p>
                    <p
                      className={`font-bold mt-0.5 ${
                        remainingNum < 0
                          ? "text-red-600"
                          : "text-forest-700 dark:text-forest-400"
                      }`}
                    >
                      {formatCurrency(Math.abs(remainingNum), currency)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Monthly Budget" : "Create Monthly Budget"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
              Budget Scope
            </label>
            <select
              className="sw-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Overall Monthly Budget</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  Category: {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Budget Limit ({getCurrencySymbol(currency)})
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="5000"
                className="sw-input"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Warning Alert Threshold (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className="sw-input"
                value={form.alert_threshold}
                onChange={(e) => setForm({ ...form, alert_threshold: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Month
              </label>
              <select
                className="sw-input"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Year
              </label>
              <input
                type="number"
                min="2000"
                max="2100"
                className="sw-input"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="sw-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="sw-btn-primary">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Save Budget"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Budget"
        description={`Remove the ${deleteTarget?.category_name} budget for ${
          deleteTarget ? MONTH_NAMES[deleteTarget.month - 1] : ""
        } ${deleteTarget?.year || ""}?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
