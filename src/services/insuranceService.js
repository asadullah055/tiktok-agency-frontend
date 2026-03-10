import apiClient from "./apiClient";

export const fetchInsuranceCustomers = async (params = {}) => {
  const { data } = await apiClient.get("/insurance/customers", { params });
  return data.data;
};

export const saveInsuranceCustomer = async (payload) => {
  const { data } = await apiClient.post("/insurance/customers", payload);
  return data.data;
};

export const updateInsuranceCustomer = async (id, payload) => {
  const { data } = await apiClient.put(`/insurance/customers/${id}`, payload);
  return data.data;
};

export const removeInsuranceCustomerModule = async (id) => {
  const { data } = await apiClient.delete(`/insurance/customers/${id}`);
  return data;
};

export const fetchInsurancePolicies = async () => {
  const { data } = await apiClient.get("/insurance/policies");
  return data.data;
};

export const saveInsurancePolicy = async (payload) => {
  const { data } = await apiClient.post("/insurance/policies", payload);
  return data.data;
};

export const fetchInsuranceClaims = async () => {
  const { data } = await apiClient.get("/insurance/claims");
  return data.data;
};

export const saveInsuranceClaim = async (payload) => {
  const { data } = await apiClient.post("/insurance/claims", payload);
  return data.data;
};

export const fetchInsurancePayments = async () => {
  const { data } = await apiClient.get("/insurance/payments");
  return data.data;
};

export const saveInsurancePayment = async (payload) => {
  const { data } = await apiClient.post("/insurance/payments", payload);
  return data.data;
};
