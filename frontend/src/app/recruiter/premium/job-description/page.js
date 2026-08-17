"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Save, Edit, Trash2, Download, Copy, Plus, X, Loader2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function PremiumJDGenerator() {
  const router = useRouter();
  
  // State for JD list
  const [jds, setJds] = useState([]);
  const [loadingJds, setLoadingJds] = useState(true);
  
  // State for JD generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    location: "",
    salary: "",
    employment_type: "Full Time",
    experience: "",
    skills: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    industry: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Active viewed/edited JD
  const [activeJd, setActiveJd] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  
  // Upload candidate resume state
  const fileInputRef = useRef(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const handleResumeUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Only support PDF, DOC, DOCX
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const file = files[0];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      toast.error("Unsupported file type. Please upload PDF, DOC, or DOCX.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit matching candidate module
      toast.error("File is too large. Maximum size is 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploadingResume(true);
    const formData = new FormData();
    formData.append("files", file); // The backend expects multiple files typically, but we upload 1 here

    try {
      await api.post(`recruiter/job-description/${activeJd.id}/upload-resume/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(`✅ ${file.name} uploaded and analyzed successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to upload resume.");
    } finally {
      setIsUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const isPremium = localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.replace("/recruiter/premium/payment");
      return;
    }
    const fetchJds = async () => {
      try {
        const res = await api.get("recruiter/job-description/");
        setJds(res.data);
      } catch (err) {
        toast.error("Failed to fetch Job Descriptions.");
      } finally {
        setLoadingJds(false);
      }
    };
    fetchJds();
  }, [router]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    
    // Frontend Validation Before AI Call
    const errors = {};
    if (!formData.title || formData.title.length < 3 || /^[\d\W_]+$/.test(formData.title) || !/[A-Za-z]/.test(formData.title)) {
      errors.title = ["Job Title must be at least 3 characters and contain alphabets."];
    }
    if (formData.company_name && (/^[\d\W_]+$/.test(formData.company_name) || formData.company_name.replace(/[^A-Za-z]/g, '').length < 2)) {
      errors.company_name = ["Company Name must contain at least 2 alphabet characters."];
    }
    if (formData.location && (/^[\d\W_]+$/.test(formData.location) || !/[A-Za-z]/.test(formData.location))) {
      errors.location = ["Location must contain alphabetic characters."];
    }
    if (formData.experience) {
      if (!/\d/.test(formData.experience) || /^-\d+/.test(formData.experience)) {
        errors.experience = ["Experience must be a positive number."];
      }
    } else {
      errors.experience = ["Experience is required."];
    }
    if (formData.salary) {
      const salaryStr = formData.salary.trim();
      if (!/^\d+$/.test(salaryStr)) {
        errors.salary = ["Salary must be a valid positive number."];
      } else {
        const salaryVal = parseInt(salaryStr, 10);
        if (salaryVal < 0) {
          errors.salary = ["Salary cannot be negative."];
        } else if (salaryVal > 100000000) {
          errors.salary = ["Salary cannot exceed 100,000,000."];
        }
      }
    }
    if (!formData.skills || /^[\d\W_]+$/.test(formData.skills)) {
      errors.skills = ["Skills must contain at least one valid alphabetical skill."];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the validation errors before generating.");
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Generate AI Content
      const aiRes = await api.post("recruiter/ai-generate-jd/", {
        role: formData.title,
        experience: formData.experience,
        skills: formData.skills,
        industry: formData.industry || "Technology",
        job_type: formData.employment_type
      });

      console.log("Generated Response:", aiRes.data);

      const raw = aiRes.data.raw_data || {};
      
      let descriptionContent = aiRes.data.content;
      if (!descriptionContent) {
        descriptionContent = `## ${formData.title}\n\n`;
        if (raw.summary) descriptionContent += `### Job Summary\n${raw.summary}\n\n`;
        if (raw.responsibilities && Array.isArray(raw.responsibilities)) descriptionContent += `### Responsibilities\n${raw.responsibilities.map(r=>`- ${r}`).join('\n')}\n\n`;
        if (raw.requirements && Array.isArray(raw.requirements)) descriptionContent += `### Requirements\n${raw.requirements.map(r=>`- ${r}`).join('\n')}\n\n`;
      }

      // Auto Fill Form with mapped fields
      const mappedData = {
        ...formData,
        title: raw.jobTitle || raw.title || formData.title,
        company_name: raw.company || raw.company_name || formData.company_name,
        experience: raw.minimumExperience || raw.experience || formData.experience,
        skills: Array.isArray(raw.requiredSkills) ? raw.requiredSkills.join(", ") : 
                (Array.isArray(raw.skills) ? raw.skills.join(", ") : formData.skills),
        requirements: Array.isArray(raw.requirements) ? raw.requirements.join(", ") : "",
        responsibilities: Array.isArray(raw.responsibilities) ? raw.responsibilities.join(", ") : "",
        benefits: Array.isArray(raw.benefits) ? raw.benefits.join(", ") : "",
        description: descriptionContent
      };

      console.log("Mapped Form Data:", mappedData);

      setFormData(mappedData);
      setEditContent(descriptionContent);
      setIsEditing(true);
      
      // Instantly display the generated JD in the editor UI
      setActiveJd({
        ...mappedData,
        id: "temp-ai-generated",
        title: mappedData.title || formData.title || "New Job Description",
        company_name: mappedData.company_name || formData.company_name,
        location: mappedData.location || formData.location,
        employment_type: mappedData.employment_type || formData.employment_type,
        isNew: true
      });
      
      toast.success("✅ AI Job Description generated successfully.");
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Premium subscription required to use AI features.");
      } else {
        toast.error("Unable to generate Job Description. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setFieldErrors({});
    
    const errors = {};

    if (!formData.title?.trim()) {
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

    if (!formData.experience?.trim()) {
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

    if (!formData.skills?.trim()) {
      errors.skills = ["Skills are required."];
    } else if (/^[\d\W_]+$/.test(formData.skills.trim())) {
      errors.skills = ["Skills must contain meaningful text."];
    }

    if (!formData.description?.trim()) {
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
        salary: formData.salary ? parseInt(formData.salary.trim()) : null,
        employment_type: formData.employment_type,
        experience: parseInt(formData.experience.trim()),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        description: formData.description.trim(),
        requirements: formData.requirements ? formData.requirements.split(',').map(s => s.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split(',').map(s => s.trim()).filter(Boolean) : [],
        benefits: formData.benefits ? formData.benefits.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      console.log("SAVE JD PAYLOAD:", payload);

      const saveRes = await api.post("recruiter/job-description/", payload);
      toast.success("✅ Job Description saved successfully.");
      
      setJds([saveRes.data, ...jds]);
      setActiveJd(saveRes.data);
      setEditContent(saveRes.data.description);
      
      // Reset form
      setFormData({
        title: "", company_name: "", location: "", salary: "", employment_type: "Full Time", experience: "", skills: "", industry: "", description: ""
      });
    } catch (err) {
      console.error("SAVE JD ERROR:", err.response?.data || err);
      if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.error) {
        setFieldErrors(err.response.data);
        toast.error("Please fix the validation errors.");
      } else {
        toast.error("Failed to save JD.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === "temp-ai-generated") {
      setActiveJd(null);
      return;
    }
    if (!confirm("Are you sure you want to delete this JD?")) return;
    try {
      await api.delete(`recruiter/job-description/${id}/`);
      setJds(jds.filter(jd => jd.id !== id));
      if (activeJd?.id === id) setActiveJd(null);
      toast.success("Deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await api.put(`recruiter/job-description/${activeJd.id}/`, {
        description: editContent
      });
      setActiveJd(res.data);
      setJds(jds.map(j => j.id === res.data.id ? res.data : j));
      setIsEditing(false);
      toast.success("Updated successfully.");
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeJd.description);
    toast.success("Copied to clipboard!");
  };

  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const parseMarkdownToHTML = (md) => {
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/<\/ul>\s*<ul>/gim, '')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\n/gim, '<br>');
  };

  const handleDownload = (format = 'txt') => {
    setShowDownloadMenu(false);
    const fileName = `${activeJd.title.replace(/\s+/g, '_')}_JD`;
    
    if (format === 'txt') {
      const element = document.createElement("a");
      const file = new Blob([activeJd.description], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${fileName}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Downloaded as TXT");
    } 
    else if (format === 'doc') {
      const htmlContent = parseMarkdownToHTML(activeJd.description);
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Job Description</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">${htmlContent}</div>` + footer;
      
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const element = document.createElement("a");
      element.href = source;
      element.download = `${fileName}.doc`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Downloaded as DOCX/DOC");
    }
    else if (format === 'pdf') {
      const htmlContent = parseMarkdownToHTML(activeJd.description);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html><head><title>${activeJd.title}</title>
        <style>body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }</style>
        </head><body>
        <div style="max-width: 800px; margin: auto;">
          ${htmlContent}
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
        </body></html>
      `);
      printWindow.document.close();
      toast.success("Preparing PDF for printing/saving...");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI JD Generator</h1>
            <p className="text-slate-500">Generate, refine, and manage high-converting job descriptions.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Generator Form & History */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" /> New Job Description
            </h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 ${fieldErrors.title ? 'border-red-500' : ''}`} placeholder="e.g. Senior Frontend Engineer" />
                {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title[0]}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <input type="text" value={formData.company_name} onChange={e=>setFormData({...formData, company_name: e.target.value})} className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 ${fieldErrors.company_name ? 'border-red-500' : ''}`} placeholder="Company Name" />
                  {fieldErrors.company_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.company_name[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input type="text" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 ${fieldErrors.location ? 'border-red-500' : ''}`} placeholder="Remote, NY" />
                  {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location[0]}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Key Skills *</label>
                  <input required type="text" value={formData.skills} onChange={e=>setFormData({...formData, skills: e.target.value})} className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 ${fieldErrors.skills ? 'border-red-500' : ''}`} placeholder="React, Python, AWS..." />
                  {fieldErrors.skills && <p className="text-red-500 text-xs mt-1">{fieldErrors.skills[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                  <input type="number" min="0" onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} value={formData.salary} onChange={e=>setFormData({...formData, salary: e.target.value})} className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 ${fieldErrors.salary ? 'border-red-500' : ''}`} placeholder="e.g. 50000" />
                  {fieldErrors.salary && <p className="text-red-500 text-xs mt-1">{fieldErrors.salary[0]}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience *</label>
                  <input required type="text" value={formData.experience} onChange={e=>setFormData({...formData, experience: e.target.value})} className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 ${fieldErrors.experience ? 'border-red-500' : ''}`} placeholder="e.g. 5+ years" />
                  {fieldErrors.experience && <p className="text-red-500 text-xs mt-1">{fieldErrors.experience[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={formData.employment_type} onChange={e=>setFormData({...formData, employment_type: e.target.value})} className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2">
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Description *</label>
                <textarea 
                  required 
                  value={formData.description} 
                  onChange={e=>setFormData({...formData, description: e.target.value})} 
                  className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3 ${fieldErrors.description ? 'border-red-500' : ''}`} 
                  placeholder="Enter Job Description manually or generate it using AI..."
                  rows={5}
                ></textarea>
                {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description[0]}</p>}
              </div>

              <div className="flex gap-3 mt-4">
                <button disabled={isGenerating || isSaving} type="submit" className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all border border-slate-300">
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {isGenerating ? "Generating AI JD..." : "Generate AI JD"}
                </button>
                <button disabled={isGenerating || isSaving} type="button" onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Save className="w-5 h-5" />}
                  {isSaving ? "Saving..." : "Save JD"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText size={18} className="text-slate-500" /> Saved JDs
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {loadingJds ? (
                <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" /></div>
              ) : jds.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No JDs generated yet.</p>
              ) : (
                jds.map(jd => (
                  <div 
                    key={jd.id} 
                    onClick={() => { setActiveJd(jd); setEditContent(jd.description); setIsEditing(false); }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${activeJd?.id === jd.id ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                  >
                    <div className="font-semibold text-slate-800 truncate text-sm">{jd.title}</div>
                    <div className="text-xs text-slate-500 mt-2 flex justify-between items-center">
                      <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{jd.employment_type}</span>
                      <span>{new Date(jd.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active JD Editor */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px] max-h-[850px]">
          {activeJd ? (
            <>
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{activeJd.title}</h2>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-600 mt-2">
                    {activeJd.company_name && <span className="font-medium bg-white px-2 py-0.5 rounded border shadow-sm">{activeJd.company_name}</span>}
                    {activeJd.location && <span className="bg-white px-2 py-0.5 rounded border shadow-sm">{activeJd.location}</span>}
                    <span className="bg-white px-2 py-0.5 rounded border shadow-sm">{activeJd.employment_type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                  />
                  {activeJd.id !== "temp-ai-generated" && (
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isUploadingResume}
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50" 
                      title="Upload Candidate Resume"
                    >
                      {isUploadingResume ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      <span className="hidden sm:inline">{isUploadingResume ? "Uploading..." : "Upload CV"}</span>
                    </button>
                  )}
                  <button onClick={handleCopy} className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm transition" title="Copy to clipboard"><Copy size={18} /></button>
                  
                  <div className="relative">
                    <button onClick={() => setShowDownloadMenu(!showDownloadMenu)} className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm transition flex items-center gap-1" title="Download">
                      <Download size={18} />
                    </button>
                    {showDownloadMenu && (
                      <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden py-1">
                        <button onClick={() => handleDownload('txt')} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">Download .TXT</button>
                        <button onClick={() => handleDownload('doc')} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors border-t border-slate-50">Download .DOCX</button>
                        <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors border-t border-slate-50">Save as PDF</button>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => handleDelete(activeJd.id)} className="p-2.5 text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg shadow-sm transition" title="Delete JD"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative bg-white">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full min-h-[400px] border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 p-4 resize-none shadow-inner bg-slate-50/50 font-mono text-sm leading-relaxed"
                  />
                ) : (
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {activeJd.description}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                {isEditing ? (
                  <>
                    <button onClick={() => { setIsEditing(false); setEditContent(activeJd.description); }} className="px-5 py-2.5 flex items-center gap-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl font-medium transition shadow-sm">
                      <X size={18} /> Cancel
                    </button>
                    <button onClick={handleUpdate} className="px-5 py-2.5 flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-medium transition shadow-sm">
                      <Save size={18} /> Save Changes
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 rounded-xl font-bold transition shadow-sm">
                    <Edit size={18} /> Edit Description
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                <FileText size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Job Description Selected</h3>
              <p className="max-w-sm text-sm text-slate-500">Select a saved JD from the left menu or generate a new one instantly using AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
