import apiClient from "./apiClient";

export const fetchAppointments = async (params = {}) => {
  const { data } = await apiClient.get("/ai-receptionist/appointments", { params });
  return data.data;
};

export const createAppointment = async (payload) => {
  const { data } = await apiClient.post("/ai-receptionist/appointments", payload);
  return data.data;
};

export const fetchConversationHistory = async () => {
  const { data } = await apiClient.get("/ai-receptionist/conversation-history");
  return data.data;
};

export const addConversation = async (payload) => {
  const { data } = await apiClient.post("/ai-receptionist/conversation-history", payload);
  return data.data;
};

export const fetchFailedCalls = async () => {
  const { data } = await apiClient.get("/ai-receptionist/failed-calls");
  return data.data;
};

export const askAi = async (prompt) => {
  const { data } = await apiClient.post("/ai-receptionist/ask", { prompt });
  return data.data;
};

export const getGoogleCalendarConnectUrl = async (connectionKey) => {
  const { data } = await apiClient.get("/ai-receptionist/google-calendar/connect-url", {
    params: { connectionKey }
  });
  return data.data?.url;
};

export const getGoogleCalendarStatus = async (connectionKey) => {
  const { data } = await apiClient.get("/ai-receptionist/google-calendar/status", {
    params: { connectionKey }
  });
  return data.data;
};

export const fetchGoogleCalendarAppointments = async (connectionKey, params = {}) => {
  const { data } = await apiClient.get("/ai-receptionist/google-calendar/appointments", {
    params: { connectionKey, ...params }
  });
  return data.data;
};

export const disconnectGoogleCalendar = async (connectionKey) => {
  const { data } = await apiClient.post("/ai-receptionist/google-calendar/disconnect", { connectionKey });
  return data.data;
};
