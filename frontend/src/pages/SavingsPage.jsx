import { useCallback, useEffect, useState } from "react";
import { Calendar, CheckCircle2, Pencil, PiggyBank, Plus, PlusCircle, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { financeService } from "../services/financeService";
import {
  extractErrorMessage,
  formatCurrency,
  formatDate,
  getCurrencySymbol,
  todayISO,
} from "../utils/formatters";

export default function SavingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency_preference || "INR";

  const [goals, setGoals] = useState([]);
  const [tab, setTab] = useState("all"); // all | pending | completed
  const [loading, setLoading] = useState(true);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({
    title: "",
    target_amount: "",
    target_date: "",
    description: "",
  });

  const [contribGoal, setContribGoal] = useState(null);
  const [contribForm, setContribForm] = useState({
    amount: "",
    contribution_date: todayISO(),
    note: "",
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await financeService.getSavingsGoals();
      setGoals(data);
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to load savings goals."), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const openCreateGoal = () => {
    setEditingGoal(null);
    setGoalForm({ title: "", target_amount: "", target_date: "", description: "" });
    setGoalModalOpen(true);
  };

  const openEditGoal = (g) => {
    setEditingGoal(g);
    setGoalForm({
      title: g.title,
      target_amount: String(g.target_amount),
      target_date: g.target_date || "",
      description: g.description || "",
    });
    setGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.title.trim() || Number(goalForm.target_amount) <= 0) {
      showToast("Provide a goal title and positive target amount.", "error");
      return;
    }
    setSubmitting(true);
    const payload = {
      title: goalForm.title.trim(),
      target_amount: Number(goalForm.target_amount).toFixed(2),
      target_date: goalForm.target_date || null,
      description: goalForm.description.trim(),
    };
    try {
      if (editingGoal) {
        await financeService.updateSavingsGoal(editingGoal.id, payload);
        showToast("Savings goal updated.");
      } else {
        await financeService.createSavingsGoal(payload);
        showToast("Savings goal created.");
      }
      setGoalModalOpen(false);
      loadGoals();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!contribGoal || Number(contribForm.amount) <= 0) {
      showToast("Enter a valid contribution amount.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await financeService.addSavingsContribution(contribGoal.id, {
        amount: Number(contribForm.amount).toFixed(2),
        contribution_date: contribForm.contribution_date,
        note: contribForm.note.trim(),
      });
      showToast(`Contribution added to "${contribGoal.title}".`);
      setContribGoal(null);
      setContribForm({ amount: "", contribution_date: todayISO(), note: "" });
      loadGoals();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await financeService.deleteSavingsGoal(deleteTarget.id);
      showToast("Savings goal deleted.");
      setDeleteTarget(null);
      loadGoals();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const visibleGoals = goals.filter((g) => (tab === "all" ? true : g.status === tab));
  const pendingCount = goals.filter((g) => g.status === "pending").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Savings Goals
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Define financial targets, log contributions, and celebrate completed milestones.
          </p>
        </div>

        <button type="button" onClick={openCreateGoal} className="sw-btn-primary">
          <Plus className="h-4 w-4" />
          New Savings Goal
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1">
        {[
          { key: "all", label: `All Goals (${goals.length})` },
          { key: "pending", label: `In Progress (${pendingCount})` },
          { key: "completed", label: `Completed (${completedCount})` },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab === t.key
                ? "bg-forest-800 text-white"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading savings goals..." />
      ) : visibleGoals.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No savings goals in this view"
          description="Create a dedicated goal such as buying a laptop or building an emergency fund."
          action={
            <button type="button" onClick={openCreateGoal} className="sw-btn-primary">
              <Plus className="h-4 w-4" />
              Create Savings Goal
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleGoals.map((goal) => {
            const isCompleted = goal.status === "completed";
            return (
              <div key={goal.id} className="sw-card p-6 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isCompleted
                            ? "bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-forest-200"
                            : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {isCompleted ? "Completed" : "In Progress"}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditGoal(goal)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-forest-800 dark:hover:bg-slate-800"
                        aria-label="Edit goal"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(goal)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        aria-label="Delete goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-forest-700 dark:text-forest-400">
                        Saved: {formatCurrency(goal.saved_amount, currency)}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {goal.progress_percentage}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-forest-600 transition-all"
                        style={{ width: `${goal.progress_percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                      <span>Target: {formatCurrency(goal.target_amount, currency)}</span>
                      <span>Remaining: {formatCurrency(goal.remaining_amount, currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {goal.target_date ? `Target: ${formatDate(goal.target_date)}` : "No target date"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setContribGoal(goal);
                      setContribForm({ amount: "", contribution_date: todayISO(), note: "" });
                    }}
                    className="sw-btn-primary py-2 px-3.5 text-xs"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Add Contribution
                  </button>
                </div>

                {goal.contributions && goal.contributions.length > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-slate-800/50 p-3 space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      Recent Contributions
                    </p>
                    {goal.contributions.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-slate-300 truncate">
                          {formatDate(c.contribution_date)}
                          {c.note ? ` — ${c.note}` : ""}
                        </span>
                        <span className="font-semibold text-forest-700 dark:text-forest-400 shrink-0 ml-2">
                          +{formatCurrency(c.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <Modal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={editingGoal ? "Edit Savings Goal" : "Create Savings Goal"}
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g., Buy a laptop"
              className="sw-input"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Target Amount ({getCurrencySymbol(currency)})
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="60000"
                className="sw-input"
                value={goalForm.target_amount}
                onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                className="sw-input"
                value={goalForm.target_date}
                onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes about this savings milestone"
              className="sw-input"
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setGoalModalOpen(false)} className="sw-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="sw-btn-primary">
              {submitting ? "Saving..." : editingGoal ? "Save Changes" : "Create Goal"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contribution Modal */}
      <Modal
        open={Boolean(contribGoal)}
        onClose={() => setContribGoal(null)}
        title={`Add Contribution — ${contribGoal?.title || ""}`}
      >
        <form onSubmit={handleContribute} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Amount ({getCurrencySymbol(currency)})
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="5000"
                className="sw-input"
                value={contribForm.amount}
                onChange={(e) => setContribForm({ ...contribForm, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                className="sw-input"
                value={contribForm.contribution_date}
                onChange={(e) =>
                  setContribForm({ ...contribForm, contribution_date: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
              Note
            </label>
            <input
              type="text"
              placeholder="e.g., Monthly savings deposit"
              className="sw-input"
              value={contribForm.note}
              onChange={(e) => setContribForm({ ...contribForm, note: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setContribGoal(null)} className="sw-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="sw-btn-primary">
              {submitting ? "Adding..." : "Record Contribution"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Savings Goal"
        description={`Delete "${deleteTarget?.title}" and its contribution history?`}
        loading={submitting}
        onConfirm={handleDeleteGoal}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
