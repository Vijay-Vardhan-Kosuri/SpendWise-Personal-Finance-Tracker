import api from "./api";

export const authService = {
  register: (payload) => api.post("/auth/register/", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login/", payload).then((r) => r.data),
  logout: (refresh) => api.post("/auth/logout/", { refresh }).then((r) => r.data),
  forgotPassword: (email) => api.post("/auth/forgot-password/", { email }).then((r) => r.data),
  resetPassword: (payload) => api.post("/auth/reset-password/", payload).then((r) => r.data),
  getProfile: () => api.get("/profile/").then((r) => r.data),
  updateProfile: (payload) => api.patch("/profile/", payload).then((r) => r.data),
  changePassword: (payload) => api.post("/profile/change-password/", payload).then((r) => r.data),
  deleteAccount: (password) =>
    api.delete("/profile/delete-account/", { data: { password } }).then((r) => r.data),
};

export const financeService = {
  getCategories: (type) =>
    api.get("/categories/", { params: type ? { type } : {} }).then((r) => r.data),
  getDashboardSummary: (params) =>
    api.get("/dashboard/summary/", { params }).then((r) => r.data),

  getIncomes: (params) => api.get("/income/", { params }).then((r) => r.data),
  createIncome: (payload) => api.post("/income/", payload).then((r) => r.data),
  updateIncome: (id, payload) => api.put(`/income/${id}/`, payload).then((r) => r.data),
  deleteIncome: (id) => api.delete(`/income/${id}/`).then((r) => r.data),

  getExpenses: (params) => api.get("/expenses/", { params }).then((r) => r.data),
  createExpense: (payload) => api.post("/expenses/", payload).then((r) => r.data),
  updateExpense: (id, payload) => api.put(`/expenses/${id}/`, payload).then((r) => r.data),
  deleteExpense: (id) => api.delete(`/expenses/${id}/`).then((r) => r.data),

  getBudgets: (params) => api.get("/budgets/", { params }).then((r) => r.data),
  createBudget: (payload) => api.post("/budgets/", payload).then((r) => r.data),
  updateBudget: (id, payload) => api.put(`/budgets/${id}/`, payload).then((r) => r.data),
  deleteBudget: (id) => api.delete(`/budgets/${id}/`).then((r) => r.data),

  getSavingsGoals: (params) => api.get("/savings/", { params }).then((r) => r.data),
  createSavingsGoal: (payload) => api.post("/savings/", payload).then((r) => r.data),
  updateSavingsGoal: (id, payload) => api.put(`/savings/${id}/`, payload).then((r) => r.data),
  deleteSavingsGoal: (id) => api.delete(`/savings/${id}/`).then((r) => r.data),
  addSavingsContribution: (goalId, payload) =>
    api.post(`/savings/${goalId}/contribute/`, payload).then((r) => r.data),

  getTransactions: (params) => api.get("/transactions/", { params }).then((r) => r.data),

  getAnalyticsMonthly: (params) => api.get("/analytics/monthly/", { params }).then((r) => r.data),
  getAnalyticsCategories: (params) =>
    api.get("/analytics/categories/", { params }).then((r) => r.data),
  getAnalyticsIncomeExpense: (params) =>
    api.get("/analytics/income-expense/", { params }).then((r) => r.data),

  getNotifications: () => api.get("/notifications/").then((r) => r.data),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read/`).then((r) => r.data),
  markAllNotificationsRead: () => api.post("/notifications/mark-all-read/").then((r) => r.data),

  seedDemoData: () => api.post("/demo/seed/").then((r) => r.data),
};
