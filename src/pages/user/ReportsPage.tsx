import { useState } from "react";
import { Download, Calendar, Loader2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";
import { toast } from "react-toastify";

const ReportsPage = () => {
  const [filter, setFilter] = useState<"daily" | "weekly" | "monthly">("weekly");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports", filter],
    queryFn: async () => {
      let url = API.reports.weekly;
      if (filter === "daily") url = API.reports.daily;
      if (filter === "monthly") url = API.reports.monthly;
      const res = await axiosInstance.get(url);
      return res.data;
    }
  });

  const handleDownload = async (
    format: "excel" | "pdf",
    reportFilter?: "daily" | "weekly" | "monthly",
    period?: string
  ) => {
    const reportType = reportFilter ?? filter;
    try {
      toast.info(period ? `Preparing ${period} report...` : `Preparing your ${format.toUpperCase()} report...`);
      const baseUrl = format === "excel" ? API.reports.downloadExcel : API.reports.downloadPdf;
      let url = `${baseUrl}?type=${reportType}`;
      if (period) url += `&period=${encodeURIComponent(period)}`;
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], {
        type: format === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const safePeriod = period ? period.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") : reportType;
      link.setAttribute("download", `report-${safePeriod}-${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
    } catch (err) {
      toast.error("Failed to download report");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Reports" description="View and download consumption reports">
        <div className="flex gap-2">
          <button 
            onClick={() => handleDownload("excel")}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" /> Excel
          </button>
          <button 
            onClick={() => handleDownload("pdf")}
            className="flex items-center gap-2 rounded-lg gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
        </div>
      </PageHeader>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(["daily", "weekly", "monthly"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === type ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Generating report data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Period", "Devices", "Total (kWh)", "Avg Daily (kWh)", "Peak (kWh)", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports?.results?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                      No report data available for this period.
                    </td>
                  </tr>
                ) : (
                  reports?.results?.map((report: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{report.period || report.date || report.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{report.device_count || 1} devices</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{report.total_consumption?.toLocaleString() || report.value?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{report.avg_daily?.toLocaleString() || (report.total_consumption / 30).toFixed(1)}</td>
                      <td className="px-4 py-3 text-sm text-warning font-medium">{report.peak?.toLocaleString() || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDownload("excel", filter, report.period || report.date || report.name)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title={`Download ${report.period || report.date || "report"} (Excel)`}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload("pdf", filter, report.period || report.date || report.name)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title={`Download ${report.period || report.date || "report"} (PDF)`}
                          >
                            <Download className="h-4 w-4" />
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

export default ReportsPage;
