import api from "./api";

// Upload Job Description (Recruiter only)
export const uploadJobDescription = async (data) => {
  return await api.post("/recruiter/job-description/", data);
};

// Get All Job Descriptions (Candidate reads active, Recruiter reads their own)
export const getJobDescriptions = async (isRecruiter = false) => {
  const endpoint = isRecruiter ? "/recruiter/job-description/" : "/candidate/job-description/";
  return await api.get(endpoint);
};

export const matchResume = async (resumeId, jobId) => {
  return await api.get(
    `/candidate/resume/${resumeId}/match/${jobId}/`
  );
};

export const updateJobDescription = async (id, data) => {
  return await api.put(`/recruiter/job-description/${id}/`, data);
};

export const deleteJobDescription = async (id) => {
  return await api.delete(`/recruiter/job-description/${id}/`);
};

export const analyzeJobMatch = async (resumeId, jobDescription) => {
  return await api.post("/candidate/job-match/", {
    resume_id: resumeId,
    job_description: jobDescription
  });
};
