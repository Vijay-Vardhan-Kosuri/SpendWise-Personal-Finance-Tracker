import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/financeService";
import { extractErrorMessage } from "../utils/formatters";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState("request"); // request | reset
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devTokenNotice, setDevTokenNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await authService.forgotPassword(email.trim());
      if (data.reset_token) {
        setToken(data.reset_token);
        setDevTokenNotice(data.reset_token);
      }
      showToast(data.message || "Reset instructions generated.", "info");
      setStep("reset");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPassword({
        token: token.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showToast("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to reset password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      <header className="bg-white border-b border-gray-200/80 h-16 px-4 sm:px-8 flex items-center justify-between">
        <BrandLogo to="/" />
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-800 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="sw-card p-6 sm:p-8 max-w-md w-full">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-800 mb-4">
            {step === "request" ? (
              <MailCheck className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <KeyRound className="h-5 w-5" strokeWidth={1.75} />
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            {step === "request" ? "Reset your password" : "Enter reset token & new password"}
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            {step === "request"
              ? "Enter your registered email address to receive a time-limited reset token."
              : "Paste your reset token below and choose a new strong password."}
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {devTokenNotice && step === "reset" && (
            <div className="mb-4 rounded-lg bg-forest-50 border border-forest-200 px-4 py-3 text-xs text-forest-900">
              <p className="font-semibold">Local Development Token Generated:</p>
              <p className="font-mono break-all mt-1">{devTokenNotice}</p>
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Registered Email
                </label>
                <input
                  type="email"
                  className="sw-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={submitting} className="sw-btn-primary w-full">
                {submitting ? "Generating token..." : "Request Reset Token"}
              </button>
              <button
                type="button"
                onClick={() => setStep("reset")}
                className="w-full text-center text-xs font-medium text-forest-700 hover:underline pt-1"
              >
                Already have a reset token?
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Reset Token
                </label>
                <input
                  type="text"
                  className="sw-input font-mono text-xs"
                  placeholder="Paste UUID token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  className="sw-input"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="sw-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={submitting} className="sw-btn-primary w-full">
                {submitting ? "Resetting password..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
