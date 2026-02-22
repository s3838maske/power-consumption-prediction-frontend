import { useState } from "react";
import { Cpu, Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";
import { toast } from "react-toastify";

const DevicesPage = () => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "", location: "", power_rating: "" });
  
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.devices.base);
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await axiosInstance.post(API.devices.base, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device added successfully");
      setShowForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return await axiosInstance.patch(API.devices.byId(id), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device updated successfully");
      setShowForm(false);
      setEditingId(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosInstance.delete(API.devices.byId(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device deleted successfully");
    }
  });

  const resetForm = () => {
    setForm({ name: "", type: "", location: "", power_rating: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (device: any) => {
    setForm({
      name: device.name,
      type: device.type,
      location: device.location,
      power_rating: device.power_rating.toString()
    });
    setEditingId(device.id);
    setShowForm(true);
  };

  const filtered = devices?.results?.filter(
    (d: any) => d.name.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Device Management" description="Manage and monitor your connected devices">
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {showForm ? "Close Panel" : <><Plus className="h-4 w-4" /> Add Device</>}
        </button>
      </PageHeader>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 shadow-card animate-fade-in">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">
            {editingId ? "Edit Device" : "Add New Device"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Device Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., HVAC Unit 3"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
              <input
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="e.g., HVAC, Lighting"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Building A"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Power Rating (W)</label>
              <input
                required
                type="number"
                value={form.power_rating}
                onChange={(e) => setForm({ ...form, power_rating: e.target.value })}
                placeholder="e.g., 5000"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-3 w-3 animate-spin" />}
              {editingId ? "Update Device" : "Save Device"}
            </button>
            <button 
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }} 
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search devices..."
          className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading devices...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Device", "Type", "Location", "Power (W)", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                      No devices found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  filtered.map((device: any) => (
                    <tr key={device.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Cpu className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{device.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{device.type}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{device.location}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{device.power_rating?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          device.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${device.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                          {device.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleEdit(device)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this device?")) {
                                deleteMutation.mutate(device.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicesPage;
