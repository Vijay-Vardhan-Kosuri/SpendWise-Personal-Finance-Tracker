import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../utils/formatters";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      showToast("Welcome back to SpendWise.");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <header className="bg-white border-b border-gray-200/80 h-16 px-4 sm:px-8 flex items-center justify-between">
        <BrandLogo to="/" />
        <Link to="/register" className="text-sm font-semibold text-forest-800 hover:underline">
          New to SpendWise? Create account
        </Link>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6 hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-200 px-3 py-1 text-xs font-semibold text-forest-800">
            <ShieldCheck className="h-4 w-4 text-forest-600" />
            Protected Personal Ledger
          </span>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Sign in to review your cash flow, budgets, and savings goals.
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Your SpendWise workspace is isolated to your verified account using short-lived JWT
            sessions and encrypted credential storage.
          </p>
          <ul className="space-y-3 pt-2 text-sm text-gray-700">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-forest-600" />
              Real-time monthly balance and category expense breakdowns
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-forest-600" />
              Automated budget threshold warnings and goal milestones
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-forest-600" />
              Multi-currency formatting defaulting to INR (₹)
            </li>
          </ul>
        </div>

        <div className="lg:col-span-6">
          <div className="sw-card p-6 sm:p-8 max-w-md mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sign in to SpendWise</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your registered email and password below.
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
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="sw-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-forest-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="sw-input pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="sw-btn-primary w-full py-2.5">
                <Lock className="h-4 w-4" />
                {submitting ? "Signing in..." : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-forest-800 hover:underline">
                Get Started Free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
