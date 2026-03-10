import apiClient from "./apiClient";

export const fetchCreators = async () => {
  const { data } = await apiClient.get("/tiktok/creators");
  return data.data;
};

export const saveCreator = async (payload) => {
  const { data } = await apiClient.post("/tiktok/creators", payload);
  return data.data;
};

export const fetchDailyData = async (params = {}) => {
  const { data } = await apiClient.get("/tiktok/daily-data", { params });
  return data.data;
};

export const saveDailyData = async (payload) => {
  const { data } = await apiClient.post("/tiktok/daily-data", payload);
  return data.data;
};

export const fetchMessages = async (params = {}) => {
  const { data } = await apiClient.get("/tiktok/messages", { params });
  return data.data;
};

export const sendMessage = async (payload) => {
  const { data } = await apiClient.post("/tiktok/messages", payload);
  return data.data;
};

export const fetchMessageStats = async () => {
  const { data } = await apiClient.get("/tiktok/messages/stats");
  return data.data;
};
