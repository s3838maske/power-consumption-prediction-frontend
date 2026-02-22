import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./app/store";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import UserDashboard from "./pages/user/UserDashboard";
import DevicesPage from "./pages/user/DevicesPage";
import ConsumptionPage from "./pages/user/ConsumptionPage";
import PredictionsPage from "./pages/user/PredictionsPage";
import ReportsPage from "./pages/user/ReportsPage";
import AlertsPage from "./pages/user/AlertsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminLogsPage from "./pages/admin/AdminLogsPage";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            
            {/* User Routes */}
            <Route path="/user" element={
              <ProtectedRoute allowedRoles={["user"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="devices" element={<DevicesPage />} />
              <Route path="consumption" element={<ConsumptionPage />} />
              <Route path="predictions" element={<PredictionsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="devices" element={<DevicesPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="logs" element={<AdminLogsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
