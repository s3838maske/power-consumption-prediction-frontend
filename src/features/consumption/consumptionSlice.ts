import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";

interface ConsumptionRecord {
  id: string;
  device_name: string;
  category: string;
  consumption: number; // kWh
  date: string;
  created_at: string;
}

interface ConsumptionState {
  records: ConsumptionRecord[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: ConsumptionState = {
  records: [],
  loading: false,
  uploading: false,
  error: null,
};

export const fetchConsumptionHistory = createAsyncThunk("consumption/history", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API.consumption.history);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

export const uploadExcel = createAsyncThunk("consumption/upload", async (file: File, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(API.consumption.upload, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Upload failed");
  }
});

const consumptionSlice = createSlice({
  name: "consumption",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConsumptionHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchConsumptionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchConsumptionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadExcel.pending, (state) => { state.uploading = true; })
      .addCase(uploadExcel.fulfilled, (state) => { state.uploading = false; })
      .addCase(uploadExcel.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });
  },
});

export default consumptionSlice.reducer;
