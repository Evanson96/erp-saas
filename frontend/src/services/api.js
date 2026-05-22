import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const customerToken = localStorage.getItem("erp_customer_token");
  const staffToken = localStorage.getItem("erp_token");
  const isCustomerPortalRequest = config.url?.startsWith("/api/customer-portal");
  const token = isCustomerPortalRequest ? customerToken : staffToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_user");
    }

    return Promise.reject(error);
  }
);

export default api;
