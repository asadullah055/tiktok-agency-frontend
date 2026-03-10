import apiClient from "./apiClient";

export const fetchDashboardOverview = async () => {
  const { data } = await apiClient.get("/dashboard/overview");
  return data.data;
};
