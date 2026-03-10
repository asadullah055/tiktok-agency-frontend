import apiClient from "./apiClient";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getIdealUsers = async () => {
  const { data } = await apiClient.get("/tiktok/ideal-users");
  return data.data;
};

export const addIdealUser = async (values) => {
  const payload = {
    name: String(values.name || "").trim(),
    username: String(values.username || "").trim().replace(/^@/, ""),
    daysCount: toNumber(values.daysCount),
    totalIncome: toNumber(values.totalIncome),
    totalDiamonds: toNumber(values.totalDiamonds),
    days: Array.isArray(values.days)
      ? values.days.map((day) => ({
          date: String(day?.date || "").trim(),
          income: toNumber(day?.income),
          diamonds: toNumber(day?.diamonds)
        }))
      : []
  };

  const { data } = await apiClient.post("/tiktok/ideal-users", payload);
  return data.data;
};
