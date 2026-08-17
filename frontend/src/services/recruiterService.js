import api from "./api";

export const getJobCandidates = async (jobId) => {
  return await api.get(`/recruiter/job-description/${jobId}/candidates/`);
};

export const getApplicationDetails = async (appId) => {
  return await api.get(`/recruiter/application/${appId}/`);
};

export const updateApplicationStatus = async (appId, status) => {
  return await api.put(`/recruiter/application/${appId}/status/`, { status });
};

export const getRecruiterAnalytics = async () => {
  return await api.get(`/recruiter/analytics/`);
};

export const getGlobalCandidates = async () => {
  return await api.get(`/recruiter/candidates/`);
};

export const getRecentActivity = async () => {
  return await api.get(`/recruiter/recent-activity/`);
};

