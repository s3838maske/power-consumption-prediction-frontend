export const API = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    adminLogin: "/api/auth/admin-login",
    logout: "/api/auth/logout",
    profile: "/api/auth/profile",
    changePassword: "/api/auth/change-password",
  },
  devices: {
    base: "/api/devices/",
    byId: (id: string) => `/api/devices/${id}`,
  },
  consumption: {
    upload: "/api/consumption/upload-excel",
    history: "/api/consumption/history",
    byDevice: (deviceId: string) => `/api/consumption/${deviceId}`,
    delete: (id: string) => `/api/consumption/${id}`,
  },
  prediction: {
    generate: "/api/prediction/generate",
    byDevice: (deviceId: string) => `/api/prediction/${deviceId}`,
    history: "/api/prediction/history",
    compareActual: "/api/prediction/compare-actual",
  },
  dashboard: {
    userSummary: "/api/dashboard/user-summary",
    adminSummary: "/api/dashboard/admin-summary",
    dashboardStats: "/api/dashboard/dashboard-stats",
    peakHours: "/api/dashboard/peak-hours",
    monthlyComparison: "/api/dashboard/monthly-comparison",
  },
  reports: {
    daily: "/api/reports/daily",
    weekly: "/api/reports/weekly",
    monthly: "/api/reports/monthly",
    downloadExcel: "/api/reports/download-excel",
    downloadPdf: "/api/reports/download-pdf",
  },
  alerts: {
    base: "/api/alerts/",
    setThreshold: "/api/alerts/set-threshold",
    update: "/api/alerts/update",
    delete: (id: string) => `/api/alerts/${id}`,
  },
  admin: {
    users: "/api/admin/users",
    activateUser: (id: string) => `/api/admin/users/${id}/activate`,
    logs: "/api/admin/logs",
    category: "/api/admin/category",
    categoryById: (id: string) => `/api/admin/category/${id}`,
    product: "/api/admin/product",
  },
};
