import { useCallback, useEffect, useState } from "react";
import { ArrowLeftRight, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import TransactionFormModal from "../components/TransactionFormModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { financeService } from "../services/financeService";
import { extractErrorMessage, formatCurrency, formatDate } from "../utils/formatters";

export default function TransactionsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const currency = user?.currency_preference || "INR";

  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, net: 0 });
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [txType, setTxType] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("-date");

  const [detailTx, setDetailTx] = useState(null);
  const [formState, setFormState] = useState({ open: false, type: "expense", initialData: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10, type: txType, sort_by: sortBy };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [txRes, catRes] = await Promise.all([
        financeService.getTransactions(params),
        financeService.getCategories(),
      ]);

      setTransactions(txRes.results || []);
      setTotals(txRes.totals || { income: 0, expenses: 0, net: 0 });
      setCount(txRes.count || 0);
      setTotalPages(txRes.total_pages || 1);
      setCategories(catRes);
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to load transactions."), "error");
    } finally {
      setLoading(false);
    }
  }, [page, txType, sortBy, search, categoryFilter, startDate, endDate, showToast]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "income") {
        await financeService.deleteIncome(deleteTarget.id);
      } else {
        await financeService.deleteExpense(deleteTarget.id);
      }
      showToast("Transaction deleted.");
      setDeleteTarget(null);
      loadTransactions();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Transaction History
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Unified ledger of all income and expense transactions with sorting and filtering.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setFormState({ open: true, type: "income", initialData: null })}
            className="sw-btn-secondary"
          >
            <Plus className="h-4 w-4 text-forest-700" />
            Add Income
          </button>
          <button
            type="button"
            onClick={() => setFormState({ open: true, type: "expense", initialData: null })}
            className="sw-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sw-card p-4">
          <p className="text-xs text-gray-500 dark:text-slate-400">Filtered Inflows</p>
          <p className="text-xl font-bold text-forest-700 dark:text-forest-400 mt-1">
            {formatCurrency(totals.income, currency)}
          </p>
        </div>
        <div className="sw-card p-4">
          <p className="text-xs text-gray-500 dark:text-slate-400">Filtered Outflows</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totals.expenses, currency)}
          </p>
        </div>
        <div className="sw-card p-4">
          <p className="text-xs text-gray-500 dark:text-slate-400">Net Period Cash Flow</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totals.net, currency)}
          </p>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="sw-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search description, category, method..."
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
          value={txType}
          onChange={(e) => {
            setPage(1);
            setTxType(e.target.value);
          }}
        >
          <option value="all">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </select>

        <select
          className="sw-input py-2"
          value={categoryFilter}
          onChange={(e) => {
            setPage(1);
            setCategoryFilter(e.target.value);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type})
            </option>
          ))}
        </select>

        <select
          className="sw-input py-2"
          value={sortBy}
          onChange={(e) => {
            setPage(1);
            setSortBy(e.target.value);
          }}
        >
          <option value="-date">Newest First</option>
          <option value="date">Oldest First</option>
          <option value="-amount">Highest Amount</option>
          <option value="amount">Lowest Amount</option>
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            aria-label="Start date"
            className="sw-input py-2 text-xs"
            value={startDate}
            onChange={(e) => {
              setPage(1);
              setStartDate(e.target.value);
            }}
          />
          <input
            type="date"
            aria-label="End date"
            className="sw-input py-2 text-xs"
            value={endDate}
            onChange={(e) => {
              setPage(1);
              setEndDate(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Unified Ledger Table */}
      <div className="sw-card overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading transactions..." />
        ) : transactions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ArrowLeftRight}
              title="No matching transactions"
              description="Try adjusting your filters or record a new transaction."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                  {transactions.map((tx) => (
                    <tr key={tx.uid} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-5 text-xs text-gray-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                            tx.type === "income"
                              ? "bg-forest-50 text-forest-800 dark:bg-forest-900/50 dark:text-forest-200"
                              : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-gray-800 dark:text-slate-200">
                        {tx.category_name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                        {tx.description}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-slate-400">
                        {tx.payment_method}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-semibold whitespace-nowrap ${
                          tx.type === "income"
                            ? "text-forest-700 dark:text-forest-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount, currency)}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailTx(tx)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-slate-800"
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormState({ open: true, type: tx.type, initialData: tx })
                            }
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-forest-800 dark:hover:bg-slate-800"
                            aria-label="Edit transaction"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(tx)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                            aria-label="Delete transaction"
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
                  Page {page} of {totalPages} ({count} transactions)
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

      {/* Transaction Details Modal */}
      <Modal
        open={Boolean(detailTx)}
        onClose={() => setDetailTx(null)}
        title="Transaction Details"
        maxWidth="max-w-md"
      >
        {detailTx && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
              <dt className="text-gray-500">Type</dt>
              <dd className="font-semibold capitalize">{detailTx.type}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
              <dt className="text-gray-500">Category</dt>
              <dd className="font-semibold">{detailTx.category_name}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
              <dt className="text-gray-500">Amount</dt>
              <dd className="font-bold text-forest-800 dark:text-forest-400">
                {formatCurrency(detailTx.amount, currency)}
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
              <dt className="text-gray-500">Date</dt>
              <dd className="font-medium">{formatDate(detailTx.date)}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-800">
              <dt className="text-gray-500">Payment Method</dt>
              <dd className="font-medium">{detailTx.payment_method}</dd>
            </div>
            <div className="py-2">
              <dt className="text-gray-500 mb-1">Description</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{detailTx.description}</dd>
            </div>
          </dl>
        )}
      </Modal>

      <TransactionFormModal
        open={formState.open}
        type={formState.type}
        initialData={formState.initialData}
        categories={categories}
        onClose={() => setFormState({ ...formState, open: false })}
        onSuccess={loadTransactions}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Transaction"
        description={`Permanently delete "${deleteTarget?.description}" (${formatCurrency(
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
