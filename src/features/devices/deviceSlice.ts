import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";

export interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "active" | "inactive";
  power_rating: number;
  created_at: string;
}

interface DeviceState {
  devices: Device[];
  loading: boolean;
  error: string | null;
}

const initialState: DeviceState = {
  devices: [],
  loading: false,
  error: null,
};

export const fetchDevices = createAsyncThunk("devices/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API.devices.base);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch devices");
  }
});

export const createDevice = createAsyncThunk("devices/create", async (data: Partial<Device>, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(API.devices.base, data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to create device");
  }
});

export const deleteDevice = createAsyncThunk("devices/delete", async (id: string, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(API.devices.byId(id));
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete device");
  }
});

const deviceSlice = createSlice({
  name: "devices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevices.pending, (state) => { state.loading = true; })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createDevice.fulfilled, (state, action) => {
        state.devices.push(action.payload);
      })
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.devices = state.devices.filter((d) => d.id !== action.payload);
      });
  },
});

export default deviceSlice.reducer;
