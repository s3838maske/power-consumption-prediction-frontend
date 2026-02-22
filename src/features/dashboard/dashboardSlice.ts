import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";

interface DashboardSummary {
  totalConsumption: number;
  predictedConsumption: number;
  totalDevices: number;
  activeAlerts: number;
  peakHours: { hour: string; value: number }[];
  monthlyComparison: { month: string; actual: number; predicted: number }[];
  deviceUsage: { name: string; value: number }[];
}

interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
};

export const fetchUserSummary = createAsyncThunk("dashboard/userSummary", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API.dashboard.userSummary);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSummary.pending, (state) => { state.loading = true; })
      .addCase(fetchUserSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchUserSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
