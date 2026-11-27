import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { AppRoutes } from "../App";
import { formatCurrency } from "../utils/formatters";

describe("SpendWise Frontend Smoke & Formatting Tests", () => {
  it("formats INR currency by default", () => {
    expect(formatCurrency(5000, "INR")).toContain("₹");
    expect(formatCurrency(5000, "INR")).toContain("5,000");
  });

  it("renders the public landing page headline and navigation links", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Take Control of Your Money\. Build a Better Financial Future\./i)
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /^Login$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /^Get Started$/i })).toBeInTheDocument();
  });

  it("redirects unauthenticated users from /dashboard to /login", () => {
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Sign in to SpendWise/i)).toBeInTheDocument();
  });
});
