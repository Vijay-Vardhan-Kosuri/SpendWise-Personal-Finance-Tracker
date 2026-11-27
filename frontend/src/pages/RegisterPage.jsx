import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Eye, EyeOff, UserPlus } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../utils/formatters";

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    currency_preference: "INR",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.full_name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
        currency_preference: form.currency_preference,
      });
      showToast("Account created! Welcome to SpendWise.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to complete registration."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <header className="bg-white border-b border-gray-200/80 h-16 px-4 sm:px-8 flex items-center justify-between">
        <BrandLogo to="/" />
        <Link to="/login" className="text-sm font-semibold text-forest-800 hover:underline">
          Already registered? Sign in
        </Link>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6 hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-200 px-3 py-1 text-xs font-semibold text-forest-800">
            Start in under 60 seconds
          </span>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Build lasting financial clarity with SpendWise.
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Set up your private personal finance workspace to track income, categorize spending,
            enforce monthly budgets, and fund savings goals.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              "Dynamic Dashboard KPIs",
              "Monthly Budget Alerts",
              "Savings Milestone Tracker",
              "Interactive Recharts Analytics",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-lg bg-white border border-gray-200/80 px-3.5 py-2.5 text-xs font-semibold text-gray-700"
              >
                <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="sw-card p-6 sm:p-8 max-w-md mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create your SpendWise account</h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in your details below to open your personal workspace.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Aarav Sharma"
                  className="sw-input"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="aarav@example.com"
                  className="sw-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Preferred Currency
                </label>
                <select
                  className="sw-input"
                  value={form.currency_preference}
                  onChange={(e) => setForm({ ...form, currency_preference: e.target.value })}
                >
                  <option value="INR">INR (₹) — Indian Rupee (Default)</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Password (min. 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className="sw-input pr-10"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="sw-input"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" disabled={submitting} className="sw-btn-primary w-full py-2.5">
                <UserPlus className="h-4 w-4" />
                {submitting ? "Creating account..." : "Create Account"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-forest-800 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
