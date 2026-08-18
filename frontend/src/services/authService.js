import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/api\/?$/, "");

export const registerUser = async (data) => {
  return axios.post(
    `${API_URL}/api/accounts/register/`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const registerRecruiter = async (data) => {
  return axios.post(
    `${API_URL}/api/accounts/register/recruiter/`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const loginUser = async (data) => {
  return axios.post(
    `${API_URL}/api/accounts/login/`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const logoutUser = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/';
};