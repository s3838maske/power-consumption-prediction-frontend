import { useState } from "react";
import { Bell, Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";
import { toast } from "react-toastify";

const statusStyles = {
  triggered: "bg-destructive/10 text-destructive border-destructive/20",
  active: "bg-primary/10 text-primary border-primary/20",
  resolved: "bg-success/10 text-success border-success/20",
  disabled: "bg-muted text-muted-foreground border-border",
};

const AlertsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ device_id: "", threshold: "" });
  const queryClient = useQueryClient();

  const { data: devices } = useQuery({
    queryKey: ["devices-list"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.devices.base);
      return res.data;
    },
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.alerts.base);
      return res.data;
    },
  });

  const setThresholdMutation = useMutation({
    mutationFn: async (data: any) => {
      return await axiosInstance.post(API.alerts.setThreshold, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Threshold set successfully");
      setShowForm(false);
      setForm({ device_id: "", threshold: "" });
    },
    onError: (err: any) => {
      const errorData = err.response?.data;
      if (typeof errorData === "object") {
        Object.keys(errorData).forEach((key) => {
          const message = Array.isArray(errorData[key])
            ? errorData[key].join(", ")
            : errorData[key];
          toast.error(`${key}: ${message}`);
        });
      } else {
        toast.error("Failed to set threshold");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosInstance.delete(API.alerts.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert removed");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to remove alert");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.device_id || !form.threshold) {
      toast.error("Please fill in all fields");
      return;
    }
    setThresholdMutation.mutate(form);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Alerts"
        description="Set thresholds and manage energy alerts"
      >
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {showForm ? (
            "Close"
          ) : (
            <>
              <Plus className="h-4 w-4" /> Set Threshold
            </>
          )}
        </button>
      </PageHeader>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-card p-5 shadow-card animate-fade-in"
        >
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            Set Alert Threshold
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Device
              </label>
              <select
                value={form.device_id}
                onChange={(e) =>
                  setForm({ ...form, device_id: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                required
              >
                <option value="">Select device...</option>
                {devices?.results?.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Threshold (kWh)
              </label>
              <input
                type="number"
                value={form.threshold}
                onChange={(e) =>
                  setForm({ ...form, threshold: e.target.value })
                }
                placeholder="e.g., 5000"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={setThresholdMutation.isPending}
                className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {setThresholdMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Create Alert
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center p-8 text-muted-foreground">
            Loading alerts...
          </div>
        ) : alerts?.results?.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
            No alerts set. Create a threshold to monitor consumption.
          </div>
        ) : (
          alerts?.results?.map((alert: any) => (
            <div
              key={alert.id}
              className={`rounded-lg border bg-card p-4 shadow-card transition-colors ${
                alert.is_triggered && alert.status !== "disabled"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${alert.is_triggered && alert.status !== "disabled" ? "bg-destructive/15" : "bg-muted"}`}
                  >
                    {alert.is_triggered && alert.status !== "disabled" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
                    ) : (
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {alert.device_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Threshold: {alert.threshold?.toLocaleString()} kWh ·
                      Current: {alert.current_value?.toLocaleString() || 0} kWh
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${
                      alert.is_triggered && alert.status !== "disabled"
                        ? statusStyles.triggered
                        : statusStyles[
                            alert.status as keyof typeof statusStyles
                          ] || statusStyles.disabled
                    }`}
                  >
                    {alert.is_triggered && alert.status !== "disabled"
                      ? "High Usage"
                      : alert.status}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this alert?")) {
                        deleteMutation.mutate(alert.id);
                      }
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
