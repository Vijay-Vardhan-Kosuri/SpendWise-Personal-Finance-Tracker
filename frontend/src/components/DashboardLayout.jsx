import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  CheckCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Receipt,
  Settings,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { financeService } from "../services/financeService";
import { formatDate } from "../utils/formatters";
import BrandLogo from "./BrandLogo";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/income", label: "Income", icon: Wallet },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/budgets", label: "Budgets", icon: Target },
  { to: "/savings", label: "Savings Goals", icon: PiggyBank },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await financeService.getNotifications();
      setNotifications(data.results || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // Silently ignore background notification poll errors
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [location.pathname]);

  const handleMarkRead = async (id) => {
    try {
      await financeService.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(c - 1, 0));
    } catch {
      showToast("Unable to update notification.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await financeService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      showToast("Unable to mark notifications read.", "error");
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast("Signed out of SpendWise.", "info");
    navigate("/login");
  };

  const activeNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] dark:bg-slate-950">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200/80 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
          <BrandLogo to="/dashboard" />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-forest-800 text-white shadow-sm"
                    : "text-gray-600 dark:text-slate-300 hover:bg-forest-50 dark:hover:bg-slate-800 hover:text-forest-800 dark:hover:text-white"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-800 text-white text-xs font-bold">
              {user?.initials || "SW"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.full_name || "SpendWise User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-gray-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {activeNav?.label || "SpendWise"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center rounded-full bg-forest-50 dark:bg-forest-900/40 px-3 py-1 text-xs font-semibold text-forest-800 dark:text-forest-200 border border-forest-100 dark:border-forest-800">
              Currency: {user?.currency_preference || "INR"}
            </span>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative rounded-lg p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle notifications"
              >
                <Bell className="h-5 w-5" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-elevated z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Notifications ({unreadCount} unread)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1 text-xs font-medium text-forest-700 hover:text-forest-900 dark:text-forest-400"
                      >
                        <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <p className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                        You are all caught up.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && handleMarkRead(n.id)}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            n.is_read
                              ? "bg-white dark:bg-slate-900 opacity-75"
                              : "bg-forest-50/60 dark:bg-forest-900/20 hover:bg-forest-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <span className="h-2 w-2 rounded-full bg-forest-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {formatDate(n.created_at)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition-colors"
              title="Account Settings"
            >
              {user?.initials || "SW"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
