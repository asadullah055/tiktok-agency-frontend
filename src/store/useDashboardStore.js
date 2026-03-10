import { create } from "zustand";
import { fetchDashboardOverview } from "../services/dashboardService";

const useDashboardStore = create((set) => ({
  overview: null,
  timeseries: [],
  recentActivity: [],
  loading: false,
  error: null,
  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchDashboardOverview();
      set({
        overview: data.overview,
        timeseries: data.timeseries,
        recentActivity: data.recentActivity,
        loading: false
      });
    } catch (error) {
      set({
        loading: false,
        error: error?.message || "Failed to load dashboard"
      });
    }
  }
}));

export default useDashboardStore;
