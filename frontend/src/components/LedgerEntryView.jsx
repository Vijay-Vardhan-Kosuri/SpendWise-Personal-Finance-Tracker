import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, Wallet, Receipt } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import LoadingSpinner from "./LoadingSpinner";
import TransactionFormModal from "./TransactionFormModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { financeService } from "../services/financeService";
import { extractErrorMessage, formatCurrency, formatDate } from "../utils/formatters";

export default function LedgerEntryView({ type = "expense" }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency_preference || "INR";
  const isIncome = type === "income";

  const [entries, setEntries] = useState([]);
  const [summaryTotal, setSummaryTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [listData, catData] = await Promise.all([
        isIncome ? financeService.getIncomes(params) : financeService.getExpenses(params),
        financeService.getCategories(),
      ]);

      setEntries(listData.results || []);
      setSummaryTotal(listData.summary_total || 0);
      setCount(listData.count || (listData.results || []).length);
      setCategories(catData);
    } catch (err) {
      showToast(extractErrorMessage(err, `Failed to load ${type} history.`), "error");
    } finally {
      setLoading(false);
    }
  }, [type, isIncome, page, search, categoryFilter, startDate, endDate, showToast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (isIncome) {
        await financeService.deleteIncome(deleteTarget.id);
      } else {
        await financeService.deleteExpense(deleteTarget.id);
      }
      showToast(`${isIncome ? "Income" : "Expense"} entry deleted.`);
      setDeleteTarget(null);
      fetchRecords();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  };

  const typeCategories = categories.filter((c) => c.type === type);
  const totalPages = Math.max(Math.ceil(count / 10), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {isIncome ? "Income Management" : "Expense Management"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {isIncome
              ? "Track salary, freelancing, business, and investment inflows."
              : "Monitor daily expenses across categories and payment methods."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingEntry(null);
            setFormOpen(true);
          }}
          className="sw-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add {isIncome ? "Income" : "Expense"}
        </button>
      </div>

      {/* Summary & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="sw-card p-5 lg:col-span-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              Filtered {isIncome ? "Income" : "Expense"} Total
            </p>
            <p
              className={`mt-1.5 text-2xl font-bold ${
                isIncome ? "text-forest-700 dark:text-forest-400" : "text-gray-900 dark:text-white"
              }`}
            >
              {formatCurrency(summaryTotal, currency)}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {count} matching {count === 1 ? "entry" : "entries"}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-300">
            {isIncome ? <Wallet className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
          </div>
        </div>

        <div className="sw-card p-4 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 items-center">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description..."
              className="sw-input pl-9 py-2"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          <select
            className="sw-input py-2"
            value={categoryFilter}
            onChange={(e) => {
              setPage(1);
              setCategoryFilter(e.target.value);
            }}
          >
            <option value="">All Categories</option>
            {typeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="sw-input py-2"
            aria-label="Start date"
            value={startDate}
            onChange={(e) => {
              setPage(1);
              setStartDate(e.target.value);
            }}
          />
          <input
            type="date"
            className="sw-input py-2"
            aria-label="End date"
            value={endDate}
            onChange={(e) => {
              setPage(1);
              setEndDate(e.target.value);
            }}
          />
        </div>
      </div>

      {/* History Table */}
      <div className="sw-card overflow-hidden">
        {loading ? (
          <LoadingSpinner label={`Loading ${type} records...`} />
        ) : entries.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={isIncome ? Wallet : Receipt}
              title={`No ${type} entries found`}
              description={`Record your first ${type} entry or clear active search filters.`}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntry(null);
                    setFormOpen(true);
                  }}
                  className="sw-btn-primary text-xs"
                >
                  <Plus className="h-4 w-4" />
                  Add {isIncome ? "Income" : "Expense"}
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                  {entries.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-5 text-xs text-gray-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-slate-200">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.category_color || "#14532D" }}
                          />
                          {item.category_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                        {item.description || item.category_name}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-slate-400">
                        {item.payment_method}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-semibold whitespace-nowrap ${
                          isIncome
                            ? "text-forest-700 dark:text-forest-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {formatCurrency(item.amount, currency)}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEntry(item);
                              setFormOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-forest-800 dark:hover:bg-slate-800"
                            aria-label="Edit entry"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
                <span>
                  Page {page} of {totalPages} ({count} total)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="sw-btn-secondary py-1.5 px-3 text-xs"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="sw-btn-secondary py-1.5 px-3 text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionFormModal
        open={formOpen}
        type={type}
        initialData={editingEntry}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchRecords}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${isIncome ? "Income" : "Expense"}`}
        description={`Delete "${deleteTarget?.description || deleteTarget?.category_name}" (${formatCurrency(
          deleteTarget?.amount,
          currency
        )})?`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
