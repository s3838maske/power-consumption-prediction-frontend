import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";

interface ReportState {
  data: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchReport = createAsyncThunk(
  "reports/fetch",
  async (type: "daily" | "weekly" | "monthly", { rejectWithValue }) => {
    try {
      const url = type === "daily" ? API.reports.daily : type === "weekly" ? API.reports.weekly : API.reports.monthly;
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => { state.loading = true; })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default reportSlice.reducer;
