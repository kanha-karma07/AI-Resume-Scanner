import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/api\/?$/, "");
const ADMIN_API_URL = `${API_URL}/api/admin/`;

// Create Axios instance with Auth Header
const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Admin Login
export const loginAdmin = async (credentials) => {
  const response = await adminApi.post("login/", credentials);
  return response;
};

// Dashboard
export const getDashboardStats = async () => {
  const response = await adminApi.get("dashboard/");
  return response;
};

// Candidates
export const getCandidates = async (params = {}) => {
  const response = await adminApi.get("candidates/", { params });
  return response;
};
export const getCandidateDetail = async (id) => {
  const response = await adminApi.get(`candidates/${id}/`);
  return response;
};

// Recruiters
export const getRecruiters = async (params = {}) => {
  const response = await adminApi.get("recruiters/", { params });
  return response;
};
export const getRecruiterDetail = async (id) => {
  const response = await adminApi.get(`recruiters/${id}/`);
  return response;
};

// Users
export const getUsers = async (params = {}) => {
  const response = await adminApi.get("users/", { params });
  return response;
};

// Resumes
export const getResumes = async (params = {}) => {
  const response = await adminApi.get("resumes/", { params });
  return response;
};

// Job Descriptions
export const getJobDescriptions = async (params = {}) => {
  const response = await adminApi.get("job-descriptions/", { params });
  return response;
};

// Subscriptions
export const getSubscriptions = async (params = {}) => {
  const response = await adminApi.get("subscriptions/", { params });
  return response;
};

// Analytics
export const getAnalytics = async () => {
  const response = await adminApi.get("analytics/");
  return response;
};

// Profile
export const getAdminProfile = async () => {
  const response = await adminApi.get("profile/");
  return response;
};
