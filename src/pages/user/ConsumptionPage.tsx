import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, Trash2, CheckCircle, Loader2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";
import { toast } from "react-toastify";

const ConsumptionPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ["consumption-history"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.consumption.history);
      return res.data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return await axiosInstance.post(API.consumption.upload, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumption-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("File uploaded and processed successfully");
      setSelectedFile(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to upload file");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosInstance.delete(API.consumption.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumption-history"] });
      toast.success("Record deleted");
    }
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      setSelectedFile(file);
    } else {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Consumption Data" description="Upload and manage energy consumption records" />

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border bg-card"
        }`}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="h-10 w-10 text-success" />
            <div>
              <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {uploadMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Upload File
              </button>
              <button 
                onClick={() => setSelectedFile(null)} 
                disabled={uploadMutation.isPending}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Drop your Excel file here</p>
              <p className="text-xs text-muted-foreground">or click to browse (.xlsx, .xls)</p>
            </div>
            <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Browse Files
              <input type="file" accept=".xlsx,.xls" onChange={handleFileInput} className="hidden" />
            </label>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-card-foreground">Consumption History</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Device", "Consumption", "Unit", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history?.results?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                      No consumption records found.
                    </td>
                  </tr>
                ) : (
                  history?.results?.map((record: any) => (
                    <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{record.device_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{record.value?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{record.unit}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(record.timestamp || record.recorded_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => {
                            if (window.confirm("Delete this record?")) {
                              deleteMutation.mutate(record.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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

export default ConsumptionPage;
