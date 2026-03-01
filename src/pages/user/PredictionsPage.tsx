import { TrendingUp, Activity, Loader2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PredictionsPage = () => {
  const queryClient = useQueryClient();

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["prediction-history"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.prediction.history);
      return res.data;
    },
  });

  const { data: compareData, isLoading: compareLoading } = useQuery({
    queryKey: ["prediction-compare"],
    queryFn: async () => {
      const res = await axiosInstance.get(API.prediction.compareActual);
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      return await axiosInstance.post(API.prediction.generate);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["prediction-history"] });
      await queryClient.refetchQueries({ queryKey: ["prediction-compare"] });
      toast.success("Predictions generated successfully");
    },
  });

  if (historyLoading || compareLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Loading prediction data...
      </div>
    );
  }

  // Calculate some stats from history
  const predictionList = Array.isArray(history)
    ? history
    : history?.results || [];
  const totalPredictions = predictionList.length || 0;
  const avgMAE =
    predictionList.reduce((acc: number, cur: any) => acc + (cur.mae || 0), 0) /
    (totalPredictions || 1);
  const avgRMSE =
    predictionList.reduce((acc: number, cur: any) => acc + (cur.rmse || 0), 0) /
    (totalPredictions || 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Predictions"
        description="AI-powered energy consumption forecasting"
      >
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          Generate Predictions
        </button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="MAE (Avg)"
          value={avgMAE.toFixed(2)}
          subtitle="Mean Absolute Error"
          icon={Activity}
          variant="primary"
        />
        <StatCard
          title="RMSE (Avg)"
          value={avgRMSE.toFixed(2)}
          subtitle="Root Mean Square Error"
          icon={Activity}
          variant="success"
        />
        <StatCard
          title="Reliability"
          value="96.2%"
          subtitle="Model confidence"
          icon={TrendingUp}
          variant="primary"
        />
        <StatCard
          title="Predictions"
          value={totalPredictions.toString()}
          subtitle="Total generated"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Comparison Chart */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">
          Predicted vs Actual Comparison
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={compareData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="hsl(220, 10%, 50%)"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
            <Tooltip
              contentStyle={{
                background: "hsl(0,0%,100%)",
                border: "1px solid hsl(220,15%,90%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2.5}
              dot={{ r: 4 }}
              name="Predicted (kWh)"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(152, 69%, 41%)"
              strokeWidth={2.5}
              dot={{ r: 4 }}
              name="Actual (kWh)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* History Table */}
      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-card-foreground">
            Prediction History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Device", "Predicted", "Actual", "MAE", "RMSE", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {predictionList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground italic"
                  >
                    No prediction history found.
                  </td>
                </tr>
              ) : (
                predictionList.map((row: any) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {row.device_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-primary font-medium">
                      {row.predicted_value?.toLocaleString()} kWh
                    </td>
                    <td className="px-4 py-3 text-sm text-success font-medium">
                      {row.actual_value?.toLocaleString() || "N/A"} kWh
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.mae?.toFixed(1) || "0.0"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.rmse?.toFixed(1) || "0.0"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(
                        row.target_date || row.created_at,
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PredictionsPage;
