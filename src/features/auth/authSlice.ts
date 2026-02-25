import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance";
import { API } from "../../services/apiEndpoints";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "user" | "admin";
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("access_token"),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(API.auth.login, credentials);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: { first_name: string; last_name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(API.auth.register, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.response?.data || "Registration failed");
    }
  }
);

export const loginAdmin = createAsyncThunk(
  "auth/adminLogin",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(API.auth.adminLogin, credentials);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Admin login failed");
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/profile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(API.auth.profile);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      await axiosInstance.post(API.auth.logout, { refresh: refreshToken });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(logout());
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: AuthState) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state: AuthState, action: any) => {
      state.loading = false;
      const payload = action.payload;
      if (typeof payload === 'object' && payload !== null) {
        state.error = Object.entries(payload)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      } else {
        state.error = payload as string || "An unexpected error occurred";
      }
    };

    builder
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("access_token", action.payload.token);
        if (action.payload.refresh) {
          localStorage.setItem("refresh_token", action.payload.refresh);
        }
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, handleRejected)
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, handleRejected)
      .addCase(loginAdmin.pending, handlePending)
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("access_token", action.payload.token);
        if (action.payload.refresh) {
          localStorage.setItem("refresh_token", action.payload.refresh);
        }
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginAdmin.rejected, handleRejected)
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
