import { Users, Cpu, TrendingUp, Activity, Shield, CheckCircle, XCircle } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import PageHeader from "../../components/common/PageHeader";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const AdminDashboard = () => {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.dashboard.adminSummary);
      return res.data;
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.dashboard.monthlyComparison);
      return res.data;
    }
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.admin.users);
      return res.data;
    }
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.admin.logs);
      return res.data;
    }
  });

  if (summaryLoading || statsLoading || usersLoading || logsLoading) {
    return <div className="flex h-96 items-center justify-center">Loading system status...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Admin Dashboard" description="System overview and management" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total System Usage" 
          value={`${summary?.total_system_consumption?.toFixed(1) || 0} kWh`} 
          icon={TrendingUp} 
          variant="primary" 
        />
        <StatCard 
          title="Total Users" 
          value={summary?.total_users || 0} 
          icon={Users} 
          variant="success" 
        />
        <StatCard 
          title="Avg Per User" 
          value={`${summary?.average_per_user?.toFixed(1) || 0} kWh`} 
          icon={Activity} 
          variant="warning" 
        />
        <StatCard 
          title="Platform Status" 
          value="Healthy" 
          icon={Shield} 
          variant="default" 
        />
      </div>

      {/* Growth Chart */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">System Consumption Overview</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
            <Tooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,15%,90%)", borderRadius: "8px", fontSize: "12px" }} />
            <Legend />
            <Bar dataKey="current" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Current Period" />
            <Bar dataKey="previous" fill="hsl(152, 69%, 41%)" radius={[4, 4, 0, 0]} name="Previous Period" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-4 py-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Platform Users</h3>
          </div>
          <div className="divide-y divide-border h-[300px] overflow-y-auto">
            {users?.results?.slice(0, 10)?.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.role === "admin" && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  )}
                  {user.status === 'active' ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <div className="border-b border-border px-4 py-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">System Activity Logs</h3>
          </div>
          <div className="divide-y divide-border h-[300px] overflow-y-auto">
            {logs?.map((log: any) => (
              <div key={log.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary`}>
                    info
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{log.user}</span>
                  <span>·</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
