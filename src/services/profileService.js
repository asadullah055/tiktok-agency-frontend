import apiClient from "./apiClient";

export const fetchProfiles = async (params = {}) => {
  const { data } = await apiClient.get("/profiles", { params });
  return data;
};
