import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";

export interface Alert {
  id: string;
  device_id: string;
  device_name: string;
  threshold: number;
  current_value: number;
  status: "active" | "resolved" | "disabled";
  created_at: string;
}

interface AlertState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

const initialState: AlertState = {
  alerts: [],
  loading: false,
  error: null,
};

export const fetchAlerts = createAsyncThunk("alerts/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API.alerts.base);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

export const setThreshold = createAsyncThunk("alerts/setThreshold", async (data: { device_id: string; threshold: number }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(API.alerts.setThreshold, data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

const alertSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => { state.loading = true; })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(setThreshold.fulfilled, (state, action) => {
        state.alerts.push(action.payload);
      });
  },
});

export default alertSlice.reducer;
