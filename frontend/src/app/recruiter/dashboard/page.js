"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Briefcase, 
  PlusCircle, 
  Sparkles,
  Trash2,
  Eye,
  Upload,
  Edit,
  Loader2,
  AlertCircle,
  RefreshCcw
} from "lucide-react";
import toast from "react-hot-toast";

export default function RecruiterDashboard() {
  const router = useRouter();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    location: "",
    experience: "",
    skills: "",
    description: "",
    employment_type: "Full Time",
    salary: ""
  });

  const [checkingAuth, setCheckingAuth] = useState(true);

  const fetchJobs = async () => {
    try {
      setFetchError(false);
      const res = await api.get("recruiter/job-description/");
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setFetchError(true);
    }
  };

  useEffect(() => {
    const checkAuthAndFetchJobs = async () => {
      try {
        // 1. Fetch user profile from backend to determine actual subscription status
        const profileRes = await api.get('recruiter/profile/');
        const backendIsPremium = profileRes.data.is_premium;
        
        // 2. Safely sync local storage with true backend status
        localStorage.setItem("isPremium", backendIsPremium);
        setIsPremium(backendIsPremium);

        // If user is actually Premium, redirect them to the Premium Dashboard
        if (backendIsPremium) {
          router.replace("/recruiter/premium/dashboard");
          return;
        }

        // 3. Fetch recruiter's jobs
        await fetchJobs();
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("isPremium");
          localStorage.removeItem("role");
          router.replace("/login");
        } else {
          setFetchError(true);
          toast.error("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
        setCheckingAuth(false);
      }
    };

    checkAuthAndFetchJobs();
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = ["Job Title is required."];
    } else if (/^[\d\W_]+$/.test(formData.title.trim()) || !/[A-Za-z]/.test(formData.title)) {
      errors.title = ["Job Title must contain valid alphabetical characters."];
    }

    if (formData.company_name && /^[\d\W_]+$/.test(formData.company_name.trim())) {
      errors.company_name = ["Company Name must contain letters."];
    }

    if (formData.location && (/^[\d\W_]+$/.test(formData.location.trim()) || !/[A-Za-z]/.test(formData.location))) {
      errors.location = ["Location must contain alphabetic characters."];
    }

    if (!formData.experience.trim()) {
      errors.experience = ["Experience is required."];
    } else if (!/^\d+$/.test(formData.experience.trim()) || parseInt(formData.experience.trim()) < 0) {
      errors.experience = ["Experience must be a positive number."];
    }

    if (formData.salary) {
      const salaryStr = formData.salary.trim();
      if (!/^\d+$/.test(salaryStr)) {
        errors.salary = ["Salary must be a valid positive number."];
      } else {
        const salaryVal = parseInt(salaryStr, 10);
        if (salaryVal < 0) {
          errors.salary = ["Salary must be a valid positive number."];
        } else if (salaryVal > 100000000) {
          errors.salary = ["Salary cannot exceed 100,000,000."];
        }
      }
    }

    if (!formData.skills.trim()) {
      errors.skills = ["Skills are required."];
    } else if (/^[\d\W_]+$/.test(formData.skills.trim())) {
      errors.skills = ["Skills must contain meaningful text."];
    }

    if (!formData.description.trim()) {
      errors.description = ["Job Description is required."];
    } else if (/^[\d\W_]+$/.test(formData.description.trim()) || formData.description.trim().length < 10) {
      errors.description = ["Job Description must contain meaningful text."];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setIsSaving(true);
    
    try {
      const payload = {
        title: formData.title.trim(),
        company_name: formData.company_name.trim(),
        location: formData.location.trim(),
        experience: parseInt(formData.experience.trim()),
        employment_type: formData.employment_type,
        salary: formData.salary ? parseInt(formData.salary.trim()) : null,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        description: formData.description.trim()
      };
      
      console.log("SAVE JD PAYLOAD:", payload);

      if (editingJob) {
        await api.put(`recruiter/job-description/${editingJob}/`, payload);
        toast.success("Job Description updated successfully");
      } else {
        const response = await api.post('recruiter/job-description/', payload);
        console.log("SAVE JD RESPONSE:", response.data);
        toast.success("Job Description saved successfully.");
      }
      
      setFormData({
        title: "", company_name: "", location: "", experience: "", 
        skills: "", description: "", employment_type: "Full Time", salary: ""
      });
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      console.error("SAVE JD ERROR:", err.response?.data || err);
      if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.error) {
        setFieldErrors(err.response.data);
        toast.error("Please fix the validation errors.");
      } else {
        toast.error(editingJob ? "Failed to update Job Description" : "Failed to save Job Description");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job description?")) return;
    try {
      await api.delete(`recruiter/job-description/${id}/`);
      toast.success("Deleted successfully");
      if (editingJob === id) {
        setEditingJob(null);
        setFormData({
          title: "", company_name: "", location: "", experience: "", 
          skills: "", description: "", employment_type: "Full Time", salary: ""
        });
      }
      fetchJobs();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleEditClick = (job) => {
    setEditingJob(job.id);
    setFormData({
      title: job.title || "",
      company_name: job.company_name || "",
      location: job.location || "",
      experience: job.experience || "",
      skills: job.skills ? job.skills.join(", ") : "",
      description: job.description || "",
      employment_type: job.employment_type || "Full Time",
      salary: job.salary || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 shadow-md"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage your job descriptions and match candidates.</p>
      </div>

      {!isPremium && (
        <div className="mb-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Sparkles className="w-6 h-6" /> Upgrade to Premium</h2>
            <p className="text-violet-100 mb-2">Unlock powerful AI features to speed up your hiring process:</p>
            <ul className="list-disc list-inside text-sm text-violet-50">
              <li>Generate Job Descriptions instantly with AI</li>
              <li>Advanced AI Resume Matching & Skill Gap Analysis</li>
              <li>Comprehensive Analytics & Bulk Candidate Actions</li>
            </ul>
          </div>
          <button onClick={() => router.push("/recruiter/premium/payment")} className="mt-6 md:mt-0 bg-white text-violet-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-xl shadow-sm transition-all whitespace-nowrap">
            Upgrade Now
          </button>
        </div>
      )}

      {/* CREATE JD SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {editingJob ? (
              <><Edit className="text-blue-600" /> Edit Job Description</>
            ) : (
              <><PlusCircle className="text-blue-600" /> Create Job Description</>
            )}
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input required name="title" value={formData.title} onChange={handleChange} className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border ${fieldErrors.title ? 'border-red-500 bg-red-50' : ''}`} />
                {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input name="company_name" value={formData.company_name} onChange={handleChange} className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border ${fieldErrors.company_name ? 'border-red-500 bg-red-50' : ''}`} />
                {fieldErrors.company_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.company_name[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input name="location" value={formData.location} onChange={handleChange} className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border ${fieldErrors.location ? 'border-red-500 bg-red-50' : ''}`} />
                {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) *</label>
                <input required name="experience" value={formData.experience} onChange={handleChange} className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border ${fieldErrors.experience ? 'border-red-500 bg-red-50' : ''}`} placeholder="e.g. 3" />
                {fieldErrors.experience && <p className="text-red-500 text-xs mt-1">{fieldErrors.experience[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                <select name="employment_type" value={formData.employment_type} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border">
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Optional)</label>
                <input type="number" min="0" onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} name="salary" value={formData.salary} onChange={handleChange} className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border ${fieldErrors.salary ? 'border-red-500 bg-red-50' : ''}`} placeholder="e.g. 100000" />
                {fieldErrors.salary && <p className="text-red-500 text-xs mt-1">{fieldErrors.salary[0]}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated) *</label>
              <input required name="skills" value={formData.skills} onChange={handleChange} className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border ${fieldErrors.skills ? 'border-red-500 bg-red-50' : ''}`} placeholder="React, Python, AWS" />
              {fieldErrors.skills && <p className="text-red-500 text-xs mt-1">{fieldErrors.skills[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={6} className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border ${fieldErrors.description ? 'border-red-500 bg-red-50' : ''}`}></textarea>
              {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description[0]}</p>}
            </div>

            <div className="flex justify-end gap-3">
              {editingJob && (
                <button 
                  type="button" 
                  disabled={isSaving}
                  onClick={() => {
                    setEditingJob(null);
                    setFieldErrors({});
                    setFormData({
                      title: "", company_name: "", location: "", experience: "", 
                      skills: "", description: "", employment_type: "Full Time", salary: ""
                    });
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button disabled={isSaving} type="submit" className="bg-blue-600 flex items-center justify-center gap-2 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? "Saving..." : (editingJob ? "Update Job Description" : "Save Job Description")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* JOB DESCRIPTION LIST */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Briefcase className="text-blue-600" /> Active Job Descriptions
        </h2>
        
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
        ) : fetchError ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
            <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">We couldn't load your data right now.</h3>
            <p className="text-red-700 mb-6">Please check your connection and try again.</p>
            <button 
              onClick={() => { setLoading(true); fetchJobs(); }}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
            >
              <RefreshCcw size={18} /> Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-2xl border border-gray-200">
            <p className="text-gray-500">No job descriptions found. Create one above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex-1 mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={job.title}>{job.title}</h3>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{job.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{job.company_name || 'No Company'}</p>
                  <p className="text-xs text-gray-500 flex flex-wrap gap-2 mt-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">{job.location || 'Remote'}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{job.employment_type}</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button onClick={() => router.push(`/recruiter/job-description/${job.id}`)} className="flex items-center justify-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Eye size={16} /> View
                  </button>
                  <button onClick={() => router.push(`/recruiter/job-description/${job.id}`)} className="flex items-center justify-center gap-1 bg-violet-50 text-violet-600 hover:bg-violet-100 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Upload size={16} /> Upload
                  </button>
                  <button onClick={() => handleEditClick(job)} className="flex items-center justify-center gap-1 bg-gray-50 text-gray-600 hover:bg-gray-100 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Edit size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(job.id)} className="flex items-center justify-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
