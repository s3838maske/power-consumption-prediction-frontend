import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { logoutUser } from "../../features/auth/authSlice";
import {
  LayoutDashboard,
  Cpu,
  Upload,
  TrendingUp,
  FileText,
  Bell,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Menu,
  X,
} from "lucide-react";

const userNavItems = [
  { to: "/user/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/user/devices", icon: Cpu, label: "Devices" },
  { to: "/user/consumption", icon: Upload, label: "Consumption" },
  { to: "/user/predictions", icon: TrendingUp, label: "Predictions" },
  { to: "/user/reports", icon: FileText, label: "Reports" },
  { to: "/user/alerts", icon: Bell, label: "Alerts" },
];

const adminNavItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/devices", icon: Cpu, label: "Devices" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const navItems = user?.role === "admin" ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col gradient-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-foreground">PowerPredict</h1>
            <p className="text-[10px] text-sidebar-muted">Energy Intelligence</p>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-sidebar-accent-foreground capitalize">
            {user?.role} Panel
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-destructive/15 hover:text-destructive ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-card p-2 shadow-elevated md:hidden border border-border"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 md:relative ${
          collapsed ? "w-[72px]" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
