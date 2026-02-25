import { Zap, TrendingUp, Bell, Cpu, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/common/StatCard";
import PageHeader from "../../components/common/PageHeader";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(199, 89%, 48%)",
  "hsl(152, 69%, 41%)",
  "hsl(37, 95%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 72%, 51%)",
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.dashboard.dashboardStats);
      return res.data;
    },
  });

  const { data: peakHours, isLoading: peakLoading } = useQuery({
    queryKey: ["peak-hours"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.dashboard.peakHours);
      return res.data;
    },
  });

  const { data: comparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ["monthly-comparison"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.dashboard.monthlyComparison);
      return res.data;
    },
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts-dashboard"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.alerts.base);
      return res.data;
    },
  });

  const activeAlerts =
    (Array.isArray(alerts) ? alerts : alerts?.results || [])?.filter(
      (a: any) => a.is_triggered && a.status !== "disabled",
    ) || [];

  if (statsLoading || peakLoading || comparisonLoading || alertsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Overview of your energy consumption and predictions"
      />

      {activeAlerts.length > 0 && (
        <div className="grid gap-3">
          {activeAlerts.map((alert: any) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 animate-pulse-subtle"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    High Consumption Alert: {alert.device_name}
                  </p>
                  <p className="text-xs text-destructive/80">
                    Threshold: {alert.threshold} kWh (Current:{" "}
                    {alert.current_value} kWh)
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/user/alerts")}
                className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
                id={`view-alert-${alert.id}`}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Consumption"
          value={`${stats?.totalConsumption?.toFixed(1) || 0} kWh`}
          subtitle="Last 30 days"
          icon={Zap}
          variant="primary"
        />
        <StatCard
          title="Predicted Usage"
          value={`${stats?.predictedNextMonth?.toFixed(1) || 0} kWh`}
          subtitle="Next month forecast"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Avg Daily"
          value={`${stats?.avgDailyConsumption?.toFixed(1) || 0} kWh`}
          subtitle="Last 30 days avg"
          icon={Cpu}
          variant="default"
        />
        <StatCard
          title="Peak Consumption"
          value={`${stats?.peakConsumption?.toFixed(1) || 0} kWh`}
          subtitle="Highest reading"
          icon={Bell}
          variant="warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Predicted vs Actual */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Monthly Consumption Comparison
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparison}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(220, 15%, 90%)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="hsl(220, 10%, 50%)"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 90%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend />
              <Bar
                dataKey="current"
                fill="hsl(199, 89%, 48%)"
                radius={[4, 4, 0, 0]}
                name="Current Period"
              />
              <Bar
                dataKey="previous"
                fill="hsl(220, 15%, 80%)"
                radius={[4, 4, 0, 0]}
                name="Previous Period"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Peak Hours Analysis
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={peakHours}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(220, 15%, 90%)"
              />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                stroke="hsl(220, 10%, 50%)"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 90%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(199, 89%, 48%)"
                radius={[4, 4, 0, 0]}
                name="kWh"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Device Usage Pie */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Device Usage Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats?.deviceBreakdown || []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="consumption"
                nameKey="deviceName"
              >
                {stats?.deviceBreakdown?.map((_: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)} kWh`}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Consumption Trend */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Daily Consumption Trend (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats?.dailyData || []}>
              <defs>
                <linearGradient
                  id="colorConsumption"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(199, 89%, 48%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(199, 89%, 48%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(220, 15%, 90%)"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                stroke="hsl(220, 10%, 50%)"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 90%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="consumption"
                stroke="hsl(199, 89%, 48%)"
                strokeWidth={2.5}
                fill="url(#colorConsumption)"
                name="kWh"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
