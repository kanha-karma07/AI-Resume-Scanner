"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Users, Download, Mail, CheckCircle, XCircle, Trash2, ChevronRight, Briefcase, Star, Loader2, GitCompare, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function PremiumCandidateHub() {
  const router = useRouter();
  
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minAts, setMinAts] = useState("");
  const [sortBy, setSortBy] = useState("-ats_score");

  // Comparison Modal
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const isPremium = localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.replace("/recruiter/premium/payment");
      return;
    }
    
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (searchQuery) query.append("search", searchQuery);
        if (statusFilter) query.append("status", statusFilter);
        if (minAts) query.append("min_ats", minAts);
        if (sortBy) query.append("sort_by", sortBy);

        const res = await api.get(`recruiter/resumes/?${query.toString()}`);
        setCandidates(res.data);
      } catch (err) {
        toast.error("Failed to fetch candidates.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [searchQuery, statusFilter, minAts, sortBy, router]);

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map(c => c.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} candidates?`)) return;

    try {
      if (action === "Delete") {
        await api.post("recruiter/bulk-action/", { action: "Delete", resume_ids: selectedIds });
        setCandidates(candidates.filter(c => !selectedIds.includes(c.id)));
      } else {
        await api.put("recruiter/resume-status/", { status: action, resume_ids: selectedIds });
        setCandidates(candidates.map(c => selectedIds.includes(c.id) ? { ...c, status: action } : c));
      }
      setSelectedIds([]);
      toast.success(`Successfully applied ${action}.`);
    } catch (err) {
      toast.error("Bulk action failed.");
    }
  };

  const selectedCandidates = candidates.filter(c => selectedIds.includes(c.id));

  return (
    <div className="p-6 max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Candidate Hub</h1>
            <p className="text-slate-500">Manage, filter, and compare all applicants across your jobs.</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2.5 px-4 border border-slate-300 rounded-xl focus:ring-indigo-500 text-sm bg-slate-50 min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>

          <select 
            value={minAts} 
            onChange={(e) => setMinAts(e.target.value)}
            className="py-2.5 px-4 border border-slate-300 rounded-xl focus:ring-indigo-500 text-sm bg-slate-50 min-w-[140px]"
          >
            <option value="">Any ATS Score</option>
            <option value="90">90+ ATS</option>
            <option value="80">80+ ATS</option>
            <option value="70">70+ ATS</option>
            <option value="50">50+ ATS</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2.5 px-4 border border-slate-300 rounded-xl focus:ring-indigo-500 text-sm bg-slate-50 min-w-[140px]"
          >
            <option value="-ats_score">Highest ATS</option>
            <option value="ats_score">Lowest ATS</option>
            <option value="-uploaded_at">Newest First</option>
            <option value="uploaded_at">Oldest First</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 w-full xl:w-auto p-2 bg-indigo-50 rounded-xl border border-indigo-100 animate-in fade-in zoom-in duration-200">
            <span className="text-sm font-semibold text-indigo-800 px-2">{selectedIds.length} Selected</span>
            
            <button onClick={() => {
              if (selectedIds.length < 2 || selectedIds.length > 3) {
                toast.error("Please select 2 or 3 candidates to compare.");
                return;
              }
              setShowCompare(true);
            }} className="p-2 bg-white text-indigo-600 hover:bg-indigo-100 rounded-lg shadow-sm transition tooltip-trigger flex items-center gap-1 text-sm font-medium">
              <GitCompare size={16} /> Compare
            </button>
            <div className="w-px h-6 bg-indigo-200 mx-1"></div>
            <button onClick={() => handleBulkAction("Shortlisted")} className="p-2 bg-white text-green-600 hover:bg-green-50 rounded-lg shadow-sm transition" title="Shortlist"><CheckCircle size={18} /></button>
            <button onClick={() => handleBulkAction("Rejected")} className="p-2 bg-white text-orange-600 hover:bg-orange-50 rounded-lg shadow-sm transition" title="Reject"><XCircle size={18} /></button>
            <button onClick={() => handleBulkAction("Delete")} className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-lg shadow-sm transition" title="Delete"><Trash2 size={18} /></button>
          </div>
        )}
      </div>

      {/* Candidate Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" onChange={handleSelectAll} checked={candidates.length > 0 && selectedIds.length === candidates.length} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied For</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">ATS Match</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-300 mx-auto" /></td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-slate-500">No candidates found matching your criteria.</td></tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 text-center">
                      <input type="checkbox" checked={selectedIds.includes(candidate.id)} onChange={() => handleSelect(candidate.id)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{candidate.candidate_name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Mail size={12}/> {candidate.candidate_email || "N/A"}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Briefcase size={14} className="text-slate-400"/> Job ID: {candidate.job}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center justify-center">
                        <div className={`text-lg font-bold ${candidate.ats_score >= 80 ? 'text-emerald-600' : candidate.ats_score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {candidate.ats_score}%
                        </div>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${candidate.ats_score >= 80 ? 'bg-emerald-500' : candidate.ats_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${candidate.ats_score}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        candidate.status === 'Hired' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        candidate.status === 'Shortlisted' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        candidate.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        candidate.status === 'Interview' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(candidate.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/recruiter/premium/resume/${candidate.id}`} className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <ChevronRight size={20} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Modal */}
      {showCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <GitCompare className="text-indigo-600" /> Compare Candidates
              </h2>
              <button onClick={() => setShowCompare(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><XCircle className="w-6 h-6 text-slate-500" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCandidates.map(c => (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                    {/* Header */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div className="flex items-start justify-between mb-4 mt-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{c.candidate_name}</h3>
                        <p className="text-sm text-slate-500">{c.candidate_email}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-indigo-50 bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {c.ats_score}
                      </div>
                    </div>
                    
                    {/* Insights Summary */}
                    <div className="mb-4">
                      <p className="text-sm text-slate-600 line-clamp-3 italic">&quot;{c.ai_summary || "No AI summary generated yet."}&quot;</p>
                    </div>

                    <div className="space-y-4 flex-1">
                      {/* Skills */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Matched Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {c.matched_skills?.slice(0,6).map((s,i) => (
                            <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-100">{s}</span>
                          ))}
                          {c.matched_skills?.length > 6 && <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs rounded-md">+{c.matched_skills.length - 6} more</span>}
                        </div>
                      </div>

                      {/* Missing */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Missing Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {c.missing_skills?.slice(0,4).map((s,i) => (
                            <span key={i} className="px-2 py-1 bg-rose-50 text-rose-700 text-xs rounded-md border border-rose-100">{s}</span>
                          ))}
                          {c.missing_skills?.length === 0 && <span className="text-xs text-slate-400">None missing!</span>}
                        </div>
                      </div>

                      {/* Strengths */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Strengths</h4>
                        <ul className="text-sm text-slate-700 space-y-1">
                          {c.strengths?.slice(0,3).map((s,i) => <li key={i} className="flex items-start gap-2"><Star size={14} className="text-amber-500 mt-0.5 flex-shrink-0" /> {s}</li>)}
                        </ul>
                      </div>
                    </div>

                    <Link href={`/recruiter/premium/resume/${c.id}`} className="mt-6 w-full py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-medium transition text-center text-sm">
                      View Full Profile
                    </Link>
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
