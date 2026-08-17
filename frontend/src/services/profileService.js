import api from "./api";

// Get Profile
export const getProfile = async () => {
  return await api.get("candidate/profile/");
};


// Update Profile
export const updateProfile = async (formData) => {
  return await api.put("candidate/profile/", formData);
};
