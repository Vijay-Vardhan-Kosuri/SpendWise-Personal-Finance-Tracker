import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { financeService } from "../services/financeService";
import { extractErrorMessage, getCurrencySymbol, todayISO } from "../utils/formatters";
import Modal from "./Modal";

const PAYMENT_METHODS = ["UPI", "Bank Transfer", "Card", "Cash", "Other"];

export default function TransactionFormModal({
  open,
  onClose,
  type = "expense",
  initialData = null,
  categories = [],
  onSuccess,
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    date: todayISO(),
    payment_method: type === "income" ? "Bank Transfer" : "UPI",
    description: "",
  });

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        category: String(initialData.category || ""),
        amount: String(initialData.amount || ""),
        date: initialData.date || todayISO(),
        payment_method: initialData.payment_method || (type === "income" ? "Bank Transfer" : "UPI"),
        description: initialData.description || "",
      });
    } else {
      setForm({
        category: filteredCategories[0]?.id ? String(filteredCategories[0].id) : "",
        amount: "",
        date: todayISO(),
        payment_method: type === "income" ? "Bank Transfer" : "UPI",
        description: "",
      });
    }
  }, [open, initialData, type, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      showToast("Please select a category.", "error");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      showToast("Please enter a valid positive amount.", "error");
      return;
    }

    setSubmitting(true);
    const payload = {
      category: Number(form.category),
      amount: Number(form.amount).toFixed(2),
      date: form.date,
      payment_method: form.payment_method,
      description: form.description.trim(),
    };

    try {
      if (type === "income") {
        if (initialData?.id) {
          await financeService.updateIncome(initialData.id, payload);
          showToast("Income entry updated.");
        } else {
          await financeService.createIncome(payload);
          showToast("Income entry added.");
        }
      } else {
        if (initialData?.id) {
          await financeService.updateExpense(initialData.id, payload);
          showToast("Expense entry updated.");
        } else {
          await financeService.createExpense(payload);
          showToast("Expense entry added.");
        }
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const title = initialData
    ? `Edit ${type === "income" ? "Income" : "Expense"}`
    : `Add ${type === "income" ? "Income" : "Expense"}`;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
              Category
            </label>
            <select
              className="sw-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
              Amount ({getCurrencySymbol(user?.currency_preference)})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="sw-input"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
              Date
            </label>
            <input
              type="date"
              className="sw-input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
              Payment Method
            </label>
            <select
              className="sw-input"
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
            Description
          </label>
          <input
            type="text"
            maxLength={255}
            placeholder={type === "income" ? "e.g., Monthly salary deposit" : "e.g., Grocery shopping"}
            className="sw-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="sw-btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="sw-btn-primary">
            {submitting ? "Saving..." : initialData ? "Save Changes" : "Add Entry"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
