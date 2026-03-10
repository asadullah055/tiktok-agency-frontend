import apiClient from "./apiClient";

export const getTelegramIntegrationStatus = async (workspaceKey) => {
  const { data } = await apiClient.get("/telegram/integration/status", {
    params: { workspaceKey }
  });
  return data.data;
};

export const generateTelegramLinkCode = async (workspaceKey) => {
  const { data } = await apiClient.post("/telegram/integration/generate-link-code", {
    workspaceKey
  });
  return data.data;
};

export const unlinkTelegramIntegration = async (workspaceKey) => {
  const { data } = await apiClient.post("/telegram/integration/unlink", {
    workspaceKey
  });
  return data.data;
};
