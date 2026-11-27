const CURRENCY_CONFIG = {
  INR: { locale: "en-IN", symbol: "₹" },
  USD: { locale: "en-US", symbol: "$" },
  EUR: { locale: "de-DE", symbol: "€" },
  GBP: { locale: "en-GB", symbol: "£" },
};

export function getCurrencySymbol(currency = "INR") {
  return (CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR).symbol;
}

export function formatCurrency(amount, currency = "INR") {
  const num = Number(amount || 0);
  const cfg = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    }).format(num);
  } catch {
    return `${cfg.symbol}${num.toLocaleString()}`;
  }
}

export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function extractErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  const data = error?.response?.data;
  if (!data) return error.message || fallback;
  if (typeof data === "string") return data;
  if (data.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    const val = data.errors[firstKey];
    if (Array.isArray(val) && val.length > 0) return `${firstKey}: ${val[0]}`;
    if (typeof val === "string") return val;
  }
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  return fallback;
}
