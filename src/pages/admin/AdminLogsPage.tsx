import { Activity, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";

const levelStyles = {
  info: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  error: "bg-destructive/10 text-destructive",
};

const AdminLogsPage = () => {
  const [search, setSearch] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-logs-full"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.admin.logs);
      return res.data;
    }
  });

  const filtered = logs?.filter((l: any) => 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.user.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="System Logs" description="View system activity and audit trail" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs..."
          className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading system logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Action", "User", "IP Address", "Timestamp", "Level"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No logs found</td>
                  </tr>
                ) : (
                  filtered.map((log: any) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{log.user}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">{log.ip || '0.0.0.0'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${levelStyles[log.level as keyof typeof levelStyles] || levelStyles.info}`}>
                          {log.level || 'info'}
                        </span>
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

export default AdminLogsPage;
