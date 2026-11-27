import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, KeyRound, Moon, Save, ShieldAlert, Sun, User } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/financeService";
import { extractErrorMessage } from "../utils/formatters";

export default function SettingsPage() {
  const { user, syncUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    occupation: user?.occupation || "",
    currency_preference: user?.currency_preference || "INR",
    theme_preference: user?.theme_preference || "light",
    notify_budget_alerts: user?.notify_budget_alerts ?? true,
    notify_goal_milestones: user?.notify_goal_milestones ?? true,
    notify_monthly_summary: user?.notify_monthly_summary ?? true,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await authService.updateProfile(profileForm);
      syncUser(updated);
      showToast("Profile and preferences saved.");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast("New passwords do not match.", "error");
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword(passwordForm);
      showToast("Password changed successfully.");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast("Enter your password to confirm account deletion.", "error");
      return;
    }
    setDeletingAccount(true);
    try {
      await authService.deleteAccount(deletePassword);
      await logout();
      showToast("Your SpendWise account has been deleted.", "info");
      navigate("/");
    } catch (err) {
      showToast(extractErrorMessage(err, "Password confirmation failed."), "error");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Profile &amp; Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Manage your personal details, default currency, theme, notifications, and security.
        </p>
      </div>

      {/* Profile & Preferences Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="sw-card p-6 space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-800 text-white text-lg font-bold">
              {user?.initials || "SW"}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-4 w-4 text-forest-700" />
                Personal Information
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Keep your contact and currency preferences up to date.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                className="sw-input"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="sw-input"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                className="sw-input"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Occupation
              </label>
              <input
                type="text"
                placeholder="Software Engineer"
                className="sw-input"
                value={profileForm.occupation}
                onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Currency Preference
              </label>
              <select
                className="sw-input"
                value={profileForm.currency_preference}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, currency_preference: e.target.value })
                }
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400 mb-1.5">
                Theme Preference
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setProfileForm({ ...profileForm, theme_preference: "light" })}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    profileForm.theme_preference === "light"
                      ? "border-forest-800 bg-forest-50 text-forest-900"
                      : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setProfileForm({ ...profileForm, theme_preference: "dark" })}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    profileForm.theme_preference === "dark"
                      ? "border-forest-500 bg-slate-800 text-white"
                      : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="sw-card p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-forest-700" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            {[
              {
                key: "notify_budget_alerts",
                label: "Budget Threshold Warnings",
                desc: "Notify me when spending crosses my configured budget warning threshold or 100%.",
              },
              {
                key: "notify_goal_milestones",
                label: "Savings Goal Milestones",
                desc: "Notify me when a savings goal reaches 100% completion.",
              },
              {
                key: "notify_monthly_summary",
                label: "Monthly Summary Digests",
                desc: "Include monthly cash flow summaries in my workspace alerts.",
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 dark:border-slate-800 p-3.5 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-slate-800/40"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-forest-800"
                  checked={Boolean(profileForm[item.key])}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, [item.key]: e.target.checked })
                  }
                />
              </label>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingProfile} className="sw-btn-primary">
              <Save className="h-4 w-4" />
              {savingProfile ? "Saving..." : "Save Profile & Preferences"}
            </button>
          </div>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="sw-card p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <KeyRound className="h-4 w-4 text-forest-700" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Change Password</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="password"
            placeholder="Current password"
            className="sw-input"
            value={passwordForm.current_password}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, current_password: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="New password (min. 8 chars)"
            className="sw-input"
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="sw-input"
            value={passwordForm.confirm_password}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
            }
            required
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={changingPassword} className="sw-btn-secondary">
            {changingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>

      {/* Account Management / Danger Zone */}
      <div className="sw-card p-6 border-red-200 dark:border-red-900/60 space-y-4">
        <div className="flex items-center gap-2.5 text-red-700 dark:text-red-400">
          <ShieldAlert className="h-5 w-5" />
          <h3 className="text-base font-bold">Account Management</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Deleting your account permanently removes your profile, income records, expenses, budgets,
          and savings goals. This action cannot be undone.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="password"
            placeholder="Confirm password to delete account"
            className="sw-input max-w-xs"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Delete My Account
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Permanently Delete Account"
        description="Are you sure you want to permanently delete your SpendWise account and all associated financial data?"
        confirmLabel="Delete Permanently"
        loading={deletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
