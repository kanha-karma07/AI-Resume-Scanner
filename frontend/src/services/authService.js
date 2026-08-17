import axios from "axios";

export const registerUser = async (data) => {
  return axios.post(
    "http://127.0.0.1:8000/api/accounts/register/",
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
    "http://127.0.0.1:8000/api/accounts/register/recruiter/",
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
    "http://127.0.0.1:8000/api/accounts/login/",
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

