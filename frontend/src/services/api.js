import axios from "axios";
import toast from "react-hot-toast";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const API_URL = RAW_API_URL.endsWith('/api') || RAW_API_URL.endsWith('/api/') ? RAW_API_URL : `${RAW_API_URL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    const role = localStorage.getItem("userRole");

    if (config.url.includes("recruiter") && !token && !config.url.includes("login")) {
       console.log("Missing token for protected route. Redirecting to login.");
       window.location.href = "/login";
       return Promise.reject(new Error("No access token found"));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Intercept 500 errors globally
    if (error.response && error.response.status >= 500) {
        toast.error("Unable to process request, please try again.");
    }
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh");
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_URL.replace(/\/api\/?$/, "")}/api/accounts/token/refresh/`, {
              refresh: refreshToken
            });
            
            const newAccessToken = response.data.access;
            localStorage.setItem("access", newAccessToken);
            
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error("Refresh token invalid. Logging out.");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("userRole");
            localStorage.removeItem("isPremium");
            localStorage.removeItem("membershipType");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        } else {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
