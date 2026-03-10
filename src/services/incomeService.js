import apiClient from "./apiClient";

export const fetchIncomeRecords = async (params = {}) => {
  const { data } = await apiClient.get("/income/records", { params });
  return data.data;
};

export const addIncomeRecord = async (payload) => {
  const { data } = await apiClient.post("/income/records", payload);
  return data.data;
};

export const fetchIncomeSummary = async () => {
  const { data } = await apiClient.get("/income/summary");
  return data.data;
};

export const fetchIncomeSources = async () => {
  const { data } = await apiClient.get("/income/sources");
  return data.data;
};

export const addIncomeSource = async (payload) => {
  const { data } = await apiClient.post("/income/sources", payload);
  return data.data;
};

export const fetchFixedExpenses = async () => {
  const { data } = await apiClient.get("/income/fixed-expenses");
  return data.data;
};

export const addFixedExpense = async (payload) => {
  const { data } = await apiClient.post("/income/fixed-expenses", payload);
  return data.data;
};
