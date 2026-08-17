"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { ArrowLeft, UploadCloud, FileText, Trash2, CheckCircle, XCircle, 
  Loader2, Download, Search, Filter, SortAsc, Users, UserPlus, FileSpreadsheet, Eye, LayoutList, LayoutGrid
} from "lucide-react";
import toast from "react-hot-toast";
import KanbanBoard from "@/components/recruiter/KanbanBoard";

export default function JobDescriptionDetail({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [viewMode, setViewMode] = useState("list"); // "list" or "kanban"


  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Premium Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minAts, setMinAts] = useState("");
  const [sortBy, setSortBy] = useState("-ats_score");

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isPremium, setIsPremium] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isPremium") === "true" || localStorage.getItem("isPremium") === "True";
    }
    return false;
  });
  const [showCompare, setShowCompare] = useState(false);

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const LOADING_MESSAGES = [
    "Reading the job description...",
    "Comparing it with your resume...",
    "Identifying skill gaps...",
    "Finalizing your match report..."
  ];

  useEffect(() => {
    let interval;
    if (uploading) {
      setLoadingMsgIdx(0);
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [uploading]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await api.get(`recruiter/job-description/${id}/`);
        setJob(res.data);
      } catch (err) {
        toast.error("Failed to load job details");
        router.push("/recruiter/dashboard");
      }
    };

    const fetchResumes = async () => {
      try {
        let url = `recruiter/job-description/${id}/resumes/?`;
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (statusFilter) params.append("status", statusFilter);
        if (minAts) params.append("min_ats", minAts);
        if (sortBy) params.append("sort_by", sortBy);
        
        url += params.toString();
        
        const res = await api.get(url);
        setResumes(res.data);
      } catch (err) {
        toast.error("Failed to load resumes");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
    fetchResumes();
  }, [id, search, statusFilter, minAts, sortBy, router]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!isPremium && files.length > 1) {
      toast.error("Free tier allows 1 upload. Upgrade to Premium for bulk upload.");
      router.push("/recruiter/premium/payment");
      return;
    }

    const formData = new FormData();
    files.forEach(f => formData.append("files", f));

    setUploading(true);
    try {
      const res = await api.post(`recruiter/job-description/${id}/upload-resume/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || "Resumes uploaded!");
      fetchResumes();
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("We couldn't read the text in this PDF. Try re-saving it as a standard text-based PDF and upload again.");
      } else {
        toast.error(err.response?.data?.error || "Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleBulkAction = async (action) => {
    try {
      await api.post('recruiter/bulk-action/', {
        resume_ids: Array.from(selectedIds),
        action: action
      });
      toast.success(`Action ${action} completed`);
      setSelectedIds(new Set());
      fetchResumes();
    } catch (err) {
      toast.error("Failed bulk action");
    }
  };

  const handleStatusChange = async (resumeIds, newStatus) => {
    try {
      await api.put('recruiter/resume-status/', {
        resume_ids: resumeIds,
        status: newStatus
      });
      toast.success("Status updated");
      fetchResumes();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleExportCSV = () => {
    if (selectedIds.size === 0) return toast.error("Select candidates first");
    const selected = resumes.filter(r => selectedIds.has(r.id));
    let csvContent = "data:text/csv;charset=utf-8,Name,Email,Phone,ATS Score,Status\n";
    selected.forEach(r => {
      csvContent += `"${r.candidate_name}","${r.candidate_email}","${r.phone_number}","${r.ats_score}","${r.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "candidates_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(resumes.map(r => r.id)));
    else setSelectedIds(new Set());
  };

  const toggleSelectOne = (resumeId) => {
    const next = new Set(selectedIds);
    if (next.has(resumeId)) next.delete(resumeId);
    else next.add(resumeId);
    setSelectedIds(next);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  if (!job) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <button onClick={() => router.push('/recruiter/dashboard')} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
            <span><strong>Company:</strong> {job.company_name || 'N/A'}</span>
            <span><strong>Location:</strong> {job.location || 'N/A'}</span>
            <span><strong>Exp:</strong> {job.experience}</span>
          </div>
        </div>
        {isPremium && (
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
              <LayoutList size={16} /> List
            </button>
            <button onClick={() => setViewMode("kanban")} className={`px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
              <LayoutGrid size={16} /> Kanban
            </button>
          </div>
        )}
      </div>

      {/* Uploader */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-dashed border-blue-300 text-center flex flex-col items-center">
        <UploadCloud className="w-10 h-10 text-blue-500 mb-2" />
        <h2 className="text-lg font-bold text-gray-900">Upload Candidate Resumes</h2>
        <p className="text-sm text-gray-500 mb-4">{isPremium ? "Bulk upload supported (PDF)" : "Free tier: 1 resume at a time"}</p>
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold transition-colors inline-flex items-center gap-2">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {uploading ? LOADING_MESSAGES[loadingMsgIdx] : "Select Files"}
          <input type="file" accept="application/pdf" multiple={isPremium} onChange={handleFileUpload} className="hidden" disabled={uploading}/>
        </label>
      </div>

      {/* Filters (Premium) */}
      {isPremium && viewMode === 'list' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="flex bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 items-center flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              className="bg-transparent outline-none text-sm w-full" 
              placeholder="Search name, email..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select value={minAts} onChange={(e)=>setMinAts(e.target.value)} className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="">Any ATS Score</option>
            <option value="90">ATS &gt; 90%</option>
            <option value="80">ATS &gt; 80%</option>
            <option value="70">ATS &gt; 70%</option>
            <option value="50">ATS &gt; 50%</option>
          </select>
          <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm outline-none">
            <option value="-ats_score">Highest ATS</option>
            <option value="-uploaded_at">Newest First</option>
            <option value="uploaded_at">Oldest First</option>
            <option value="candidate_name">Name (A-Z)</option>
          </select>
        </div>
      )}

      {/* Bulk Actions */}
      {isPremium && viewMode === 'list' && selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <span className="font-semibold text-blue-800">{selectedIds.size} Candidates Selected</span>
          <div className="flex gap-2">
            <button onClick={() => setShowCompare(true)} disabled={selectedIds.size < 2} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
              <Users size={16} /> Compare
            </button>
            <button onClick={() => handleBulkAction("Shortlist")} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1">
              <CheckCircle size={16} /> Shortlist
            </button>
            <button onClick={() => handleBulkAction("Reject")} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-1">
              <XCircle size={16} /> Reject
            </button>
            <button onClick={handleExportCSV} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-1">
              <FileSpreadsheet size={16} /> Export CSV
            </button>
            <button onClick={() => handleBulkAction("Delete")} className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-900 flex items-center gap-1">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area (Table or Kanban) */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                <tr>
                  {isPremium && <th className="p-4 w-10"><input type="checkbox" checked={selectedIds.size === resumes.length && resumes.length > 0} onChange={toggleSelectAll} className="rounded" /></th>}
                  <th className="p-4">Rank / ATS</th>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Risk / Recommendation</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {resumes.map((resume, idx) => (
                  <tr key={resume.id} className="hover:bg-gray-50">
                    {isPremium && <td className="p-4"><input type="checkbox" checked={selectedIds.has(resume.id)} onChange={() => toggleSelectOne(resume.id)} className="rounded" /></td>}
                    <td className="p-4">
                      <div className="font-bold text-gray-900">#{idx + 1}</div>
                      <div className="text-blue-600 font-bold">{resume.ats_score}%</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{resume.candidate_name}</div>
                      <div className="text-xs text-gray-500">{resume.candidate_email}</div>
                      {isPremium && resume.ai_summary && <div className="text-xs text-gray-500 mt-1 line-clamp-1 italic">{resume.ai_summary}</div>}
                    </td>
                    <td className="p-4">
                      {isPremium && (
                        <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${resume.risk_level === 'High' ? 'bg-red-100 text-red-700' : resume.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {resume.risk_level} Risk
                        </span>
                      )}
                      <span className="text-xs font-semibold">{resume.recommendation}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{resume.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => router.push(`/recruiter/premium/resume/${resume.id}`)} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-end w-full gap-1">
                        <Eye size={16} /> View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <KanbanBoard resumes={resumes} onStatusChange={handleStatusChange} />
      )}

      {/* Compare Modal */}
      {showCompare && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg text-gray-900">Compare Candidates</h2>
              <button onClick={() => setShowCompare(false)} className="text-gray-500 hover:text-red-500"><XCircle /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-gray-100">
              <div className="flex gap-4">
                {resumes.filter(r => selectedIds.has(r.id)).map(r => (
                  <div key={r.id} className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-w-[300px]">
                    <h3 className="font-bold text-xl text-gray-900">{r.candidate_name}</h3>
                    <div className="text-blue-600 font-bold text-2xl mt-2">{r.ats_score}% ATS</div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Strengths</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {r.strengths?.map((s,i)=><li key={i}>{s}</li>)}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Weaknesses</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {r.weaknesses?.map((s,i)=><li key={i}>{s}</li>)}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Top Skills</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.skills?.slice(0, 10).map((s,i) => <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{s}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
