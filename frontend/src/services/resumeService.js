import api from "./api";

export const uploadResume = async (formData) => {
  const token = localStorage.getItem("access");

  return await api.post(
    "candidate/resume/upload/",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


export const getResumes = async () => {
  return await api.get("candidate/resume/");
};

export const deleteResume = async (id) => {
  return await api.delete(`candidate/resume/${id}/`);
};
export const getResumeById = async (id) => {
  return await api.get(`candidate/resume/${id}/detail/`);
};
