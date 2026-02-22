import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AdminState {
  users: AdminUser[];
  logs: any[];
  categories: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  logs: [],
  categories: [],
  loading: false,
  error: null,
};

export const fetchAdminUsers = createAsyncThunk("admin/users", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API.admin.users);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

export const fetchAdminLogs = createAsyncThunk("admin/logs", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(API.admin.logs);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
      });
  },
});

export default adminSlice.reducer;
