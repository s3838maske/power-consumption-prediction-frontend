import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import deviceReducer from "../features/devices/deviceSlice";
import consumptionReducer from "../features/consumption/consumptionSlice";
import predictionReducer from "../features/prediction/predictionSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import alertReducer from "../features/alerts/alertSlice";
import reportReducer from "../features/reports/reportSlice";
import adminReducer from "../features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    devices: deviceReducer,
    consumption: consumptionReducer,
    prediction: predictionReducer,
    dashboard: dashboardReducer,
    alerts: alertReducer,
    reports: reportReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
