import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";

interface PredictionRecord {
  id: string;
  device_id: string;
  device_name: string;
  predicted_value: number;
  actual_value: number | null;
  mae: number | null;
  rmse: number | null;
  created_at: string;
}

interface PredictionState {
  predictions: PredictionRecord[];
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const initialState: PredictionState = {
  predictions: [],
  loading: false,
  generating: false,
  error: null,
};

export const generatePrediction = createAsyncThunk("prediction/generate", async (deviceId: string, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(API.prediction.generate, { device_id: deviceId });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Prediction failed");
  }
});

export const fetchPredictionHistory = createAsyncThunk("prediction/history", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API.prediction.history);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

const predictionSlice = createSlice({
  name: "prediction",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generatePrediction.pending, (state) => { state.generating = true; })
      .addCase(generatePrediction.fulfilled, (state, action) => {
        state.generating = false;
        state.predictions.unshift(action.payload);
      })
      .addCase(generatePrediction.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPredictionHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchPredictionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.predictions = action.payload;
      })
      .addCase(fetchPredictionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default predictionSlice.reducer;
