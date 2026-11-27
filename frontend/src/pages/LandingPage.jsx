import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Lock,
  Menu,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import Modal from "../components/Modal";

const FEATURES = [
  {
    icon: Receipt,
    title: "Expense Tracking",
    desc: "Log daily spending across Food, Housing, Bills, Transportation, and more with instant search and filtering.",
  },
  {
    icon: Wallet,
    title: "Income Management",
    desc: "Record Salary, Freelancing, Business, and Investment inflows to monitor every rupee entering your accounts.",
  },
  {
    icon: Target,
    title: "Monthly Budgeting",
    desc: "Set overall and category-level caps with live utilization bars and automated threshold alerts before overspending.",
  },
  {
    icon: PiggyBank,
    title: "Savings Goals",
    desc: "Create dedicated milestones for laptops, emergency reserves, or travel and track every contribution toward 100%.",
  },
  {
    icon: BarChart3,
    title: "Financial Analytics",
    desc: "Interactive charts comparing income vs. expenses, category splits, savings rates, and multi-month spending trends.",
  },
  {
    icon: ShieldCheck,
    title: "Unified Transaction Ledger",
    desc: "Inspect, sort, filter, and audit your complete financial history in one clean, paginated workspace.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create Your Account",
    desc: "Register in under a minute with email authentication and choose INR (₹) or your preferred currency.",
  },
  {
    step: "02",
    title: "Record Income & Expenses",
    desc: "Categorize daily transactions and payment methods so every outflow and inflow is accurately accounted for.",
  },
  {
    step: "03",
    title: "Configure Budgets & Goals",
    desc: "Define monthly category limits and savings targets with automated progress tracking and alert thresholds.",
  },
  {
    step: "04",
    title: "Act on Real Insights",
    desc: "Review live dashboard summaries and Recharts analytics to spot leaks and grow your monthly savings rate.",
  },
];

const BENEFITS = [
  {
    title: "Complete Cash-Flow Clarity",
    desc: "Know your exact net balance, monthly burn rate, and top spending categories in seconds without spreadsheet formulas.",
  },
  {
    title: "Proactive Budget Discipline",
    desc: "Visual progress bars and automatic 80% / 100% alerts keep discretionary spending aligned with your monthly plan.",
  },
  {
    title: "Strict Per-User Data Isolation",
    desc: "Every financial record is protected by JWT authentication and database-level ownership checks.",
  },
  {
    title: "Goal-Oriented Wealth Habits",
    desc: "Turn abstract intentions into concrete savings milestones with target dates and contribution histories.",
  },
];

const FAQS = [
  {
    q: "How does SpendWise keep my financial records secure?",
    a: "SpendWise uses hashed passwords, short-lived JWT access tokens, refresh token rotation, and strict server-side ownership checks so only you can view or modify your records.",
  },
  {
    q: "Which currencies are supported on SpendWise?",
    a: "INR (₹) is configured as the default currency for all new accounts, and you can switch to USD ($), EUR (€), or GBP (£) anytime in your profile settings.",
  },
  {
    q: "Can I track both overall monthly budgets and category-specific budgets?",
    a: "Yes. You can define an overall monthly spending cap as well as individual limits for categories like Food, Shopping, Housing, or Transportation, each with customizable warning thresholds.",
  },
  {
    q: "How do savings goals and contributions work?",
    a: "Create a goal with a target amount and optional target date, then log contributions whenever you set money aside. SpendWise automatically calculates remaining amounts and marks goals completed once funded.",
  },
  {
    q: "Is there a fee to use SpendWise?",
    a: "SpendWise is designed as an accessible personal finance management platform with zero subscription barriers to start tracking your finances.",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [infoModal, setInfoModal] = useState(null);

  return (
    <div id="home" className="min-h-screen bg-[#FAF9F6] text-gray-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo to="/" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#home" className="hover:text-forest-800 transition-colors">
              Home
            </a>
            <a href="#features" className="hover:text-forest-800 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-forest-800 transition-colors">
              How It Works
            </a>
            <a href="#about-us" className="hover:text-forest-800 transition-colors">
              About Us
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-50 transition-colors"
            >
              Login
            </Link>
            <Link to="/register" className="sw-btn-primary">
              Get Started
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 py-1.5"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 py-1.5"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 py-1.5"
            >
              How It Works
            </a>
            <a
              href="#about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 py-1.5"
            >
              About Us
            </a>
            <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
              <Link to="/login" className="sw-btn-secondary w-full text-center">
                Login
              </Link>
              <Link to="/register" className="sw-btn-primary w-full text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200/70 bg-gradient-to-b from-white to-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-forest-50 border border-forest-200 px-3.5 py-1.5 text-xs font-semibold text-forest-800">
                <Sparkles className="h-3.5 w-3.5 text-forest-600" strokeWidth={2} />
                <span>Smart Personal Finance &amp; Budget Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-[1.15]">
                Take Control of Your Money. Build a Better Financial Future.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                Track every rupee across income, expenses, monthly budgets, and savings goals in one
                calm, precision-built dashboard designed for everyday financial clarity.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                <Link to="/register" className="sw-btn-primary px-6 py-3 text-base">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
                <a href="#features" className="sw-btn-secondary px-6 py-3 text-base">
                  Explore Capabilities
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200/80 max-w-lg">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" strokeWidth={2} />
                  <span>₹0 Setup Cost</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <Lock className="h-4 w-4 text-forest-600 shrink-0" strokeWidth={2} />
                  <span>JWT Secured</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <TrendingUp className="h-4 w-4 text-forest-600 shrink-0" strokeWidth={2} />
                  <span>Live Analytics</span>
                </div>
              </div>
            </div>

            {/* CSS-Based Financial Dashboard Preview (Zero External Images) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white border border-gray-200 shadow-elevated p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Illustrative Workspace Preview
                    </p>
                    <h2 className="text-base font-bold text-gray-900 mt-0.5">
                      Monthly Financial Overview
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-800">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    +28.4% Saved
                  </span>
                </div>

                {/* CSS KPI Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-forest-800 text-white p-3.5">
                    <p className="text-[11px] text-forest-200 font-medium">Net Balance</p>
                    <p className="text-base sm:text-lg font-bold mt-1">₹1,42,850</p>
                  </div>
                  <div className="rounded-xl bg-warm-50 border border-gray-200/80 p-3.5">
                    <p className="text-[11px] text-gray-500 font-medium">Income</p>
                    <p className="text-base sm:text-lg font-bold text-forest-700 mt-1">₹92,500</p>
                  </div>
                  <div className="rounded-xl bg-warm-50 border border-gray-200/80 p-3.5">
                    <p className="text-[11px] text-gray-500 font-medium">Expenses</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900 mt-1">₹37,050</p>
                  </div>
                </div>

                {/* CSS Mini Bar Chart */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-700">
                      6-Month Cash Flow (Income vs Expense)
                    </span>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-forest-800" /> Income
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Expense
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2.5 items-end h-24 pt-2">
                    {[
                      { m: "Jun", inc: "78%", exp: "46%" },
                      { m: "Jul", inc: "84%", exp: "52%" },
                      { m: "Aug", inc: "80%", exp: "44%" },
                      { m: "Sep", inc: "92%", exp: "49%" },
                      { m: "Oct", inc: "88%", exp: "42%" },
                      { m: "Nov", inc: "96%", exp: "40%" },
                    ].map((bar) => (
                      <div key={bar.m} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="flex items-end gap-1 w-full justify-center h-full">
                          <div
                            className="w-2.5 sm:w-3 rounded-t bg-forest-800"
                            style={{ height: bar.inc }}
                          />
                          <div
                            className="w-2.5 sm:w-3 rounded-t bg-emerald-400"
                            style={{ height: bar.exp }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">{bar.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CSS Budget Progress & Goal Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200/80 p-3.5 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700">Food Budget</span>
                      <span className="text-forest-700">₹3,500 / ₹5,000</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-forest-600 w-[70%]" />
                    </div>
                    <p className="text-[11px] text-gray-500">₹1,500 remaining this month</p>
                  </div>
                  <div className="rounded-xl border border-gray-200/80 p-3.5 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700">Goal: Buy a Laptop</span>
                      <span className="text-forest-700">42%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 w-[42%]" />
                    </div>
                    <p className="text-[11px] text-gray-500">₹25,000 saved of ₹60,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Financial Statistics Strip */}
      <section className="bg-forest-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-forest-200">
              Platform Benchmarks (Illustrative Figures)
            </p>
            <p className="text-xs text-forest-200/80">
              Sample targets demonstrating typical SpendWise household tracking outcomes
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "24%", label: "Average Monthly Savings Lift (Illustrative)" },
              { value: "14+", label: "Pre-Configured Income & Expense Categories" },
              { value: "100%", label: "Owner-Isolated Financial Records" },
              { value: "< 60s", label: "Time to Configure Your First Budget" },
            ].map((stat) => (
              <div key={stat.label} className="border-l-2 border-forest-500 pl-4">
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-forest-100/90 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-forest-700">
              Core Capabilities
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              Everything required for disciplined personal finance
            </h2>
            <p className="mt-3 text-gray-600">
              Built with clean separation between daily entries, monthly budgets, long-term savings,
              and analytical reporting.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="sw-card p-6 hover:shadow-elevated hover:border-forest-200 transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-800 mb-4">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-20 bg-white border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-forest-700">
              How It Works
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              Four structured steps to financial control
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-gray-200/90 bg-[#FAF9F6] p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-flex items-center justify-center rounded-lg bg-forest-800 px-2.5 py-1 text-xs font-bold text-white">
                    Step {item.step}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & About Us */}
      <section id="about-us" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-forest-700">
              About SpendWise &amp; Benefits
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Built to turn complex money habits into clear daily decisions
            </h2>
            <p className="text-gray-600 leading-relaxed">
              SpendWise combines a React and Recharts analytics workspace with a normalized Django
              REST and MySQL backend so every number on your screen reflects verified database
              records—never guesswork.
            </p>
            <div className="pt-2">
              <Link to="/register" className="sw-btn-primary">
                Start Tracking Today
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="sw-card p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-forest-600 shrink-0" strokeWidth={2} />
                  <h3 className="text-sm font-bold text-gray-900">{b.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 lg:py-20 bg-white border-t border-gray-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-forest-700">
              Frequently Asked Questions
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              Common questions about SpendWise
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-xl border border-gray-200 bg-[#FAF9F6] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                  >
                    <span className="text-sm sm:text-base font-semibold text-gray-900">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-forest-800" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-200/60 pt-3 bg-white">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-900 text-forest-100 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <BrandLogo to="/" light />
              <p className="text-sm text-forest-200/85 max-w-md leading-relaxed">
                SpendWise is a full-stack personal finance platform built to help individuals track
                cash flow, enforce budgets, and reach savings milestones with confidence.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-sm text-forest-200">
                <li>
                  <a href="#about-us" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Support &amp; Legal
              </h4>
              <ul className="space-y-2 text-sm text-forest-200">
                <li>
                  <button
                    type="button"
                    onClick={() => setInfoModal("contact")}
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setInfoModal("privacy")}
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setInfoModal("terms")}
                    className="hover:text-white transition-colors"
                  >
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-forest-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-forest-200/75">
            <p>&copy; {new Date().getFullYear()} SpendWise Personal Finance Platform. All rights reserved.</p>
            <p>Built with React, Tailwind CSS, Django REST Framework &amp; MySQL.</p>
          </div>
        </div>
      </footer>

      <Modal
        open={Boolean(infoModal)}
        onClose={() => setInfoModal(null)}
        title={
          infoModal === "contact"
            ? "Contact SpendWise Support"
            : infoModal === "privacy"
            ? "Privacy Policy"
            : "Terms of Use"
        }
      >
        {infoModal === "contact" && (
          <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
            <p>
              Need assistance with your SpendWise workspace or account setup? Reach our support
              team at <span className="font-semibold text-forest-800">support@spendwise.in</span>.
            </p>
            <p>Support Hours: Monday to Friday, 9:00 AM – 6:00 PM IST.</p>
          </div>
        )}
        {infoModal === "privacy" && (
          <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
            <p>
              SpendWise stores only the profile and financial ledger details you explicitly enter.
              Passwords are stored using strong cryptographic hashing, and all API routes enforce
              authenticated per-user ownership checks.
            </p>
            <p>We never sell or share your personal transaction data with third-party advertisers.</p>
          </div>
        )}
        {infoModal === "terms" && (
          <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
            <p>
              SpendWise provides personal budgeting, expense tracking, and analytical reporting tools
              for informational planning purposes. You remain the sole owner of all records entered
              under your account.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
