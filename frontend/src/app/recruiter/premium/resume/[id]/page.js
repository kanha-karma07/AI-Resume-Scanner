"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  ArrowLeft, FileText, CheckCircle, XCircle, Brain, History, MessageSquare, 
  Mail, Loader2, Star, TrendingUp, AlertTriangle, Lightbulb
} from "lucide-react";
import toast from "react-hot-toast";

export default function CandidatePremiumView({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Data tabs
  const [activeTab, setActiveTab] = useState("insights"); // insights, match, questions, notes, timeline, email
  
  // Tab specific data
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const isPremium = localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.replace("/recruiter/premium/payment");
      return;
    }

    const fetchNotes = async () => {
      try {
        const res = await api.get(`recruiter/resume/${id}/notes/`);
        setNotes(res.data);
      } catch(e) {}
    };

    const fetchTimeline = async () => {
      try {
        const res = await api.get(`recruiter/resume/${id}/timeline/`);
        setTimeline(res.data);
      } catch(e) {}
    };

    const fetchData = async () => {
      try {
        const res = await api.get(`recruiter/resume/${id}/`);
        setResume(res.data);
        
        fetchNotes();
        fetchTimeline();
      } catch (err) {
        toast.error("Failed to load candidate.");
        router.push("/recruiter/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.post(`recruiter/resume/${id}/notes/`, { content: newNote });
      setNewNote("");
      toast.success("Note added");
      fetchNotes();
      fetchTimeline();
    } catch (err) { toast.error("Failed to add note"); }
  };

  const toggleFavorite = async () => {
    try {
      const res = await api.post(`recruiter/resume/${id}/favorite/`);
      setResume(prev => ({...prev, is_bookmarked: res.data.is_bookmarked}));
      toast.success(res.data.is_bookmarked ? "Added to favorites" : "Removed from favorites");
    } catch(e) { toast.error("Failed"); }
  };

  const handleGenerateQuestions = async () => {
    if (interviewQuestions.length > 0) return;
    setLoadingQuestions(true);
    try {
      const res = await api.post(`recruiter/resume/${id}/interview-questions/`);
      setInterviewQuestions(res.data.questions || []);
    } catch (err) {
      toast.error("Failed to generate questions");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const changeStatus = async (newStatus, reason = "") => {
    try {
      await api.put('recruiter/resume-status/', {
        resume_ids: [id],
        status: newStatus,
        rejection_reason: reason
      });
      setResume(prev => ({...prev, status: newStatus}));
      toast.success(`Status updated to ${newStatus}`);
      if (newStatus === "Rejected") {
        setRejectModalOpen(false);
        setRejectionReason("");
      }
      fetchTimeline();
    } catch(e) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  if (!resume) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{resume.candidate_name}</h1>
            <button onClick={toggleFavorite}>
              <Star className={`w-6 h-6 ${resume.is_bookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`} />
            </button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
            <span>{resume.candidate_email}</span>
            {resume.phone_number && <span>{resume.phone_number}</span>}
            {resume.location && <span>{resume.location}</span>}
          </div>
          <div className="mt-3 inline-flex items-center gap-2">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{resume.status}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${resume.ats_score >= 75 ? 'bg-green-100 text-green-700' : resume.ats_score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              {resume.ats_score}% ATS
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {resume.status !== 'Shortlisted' && resume.status !== 'Hired' && resume.status !== 'Rejected' && (
            <button onClick={() => changeStatus('Shortlisted')} className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-semibold transition shadow-sm border border-blue-100">
              Shortlist
            </button>
          )}
          {resume.status !== 'Interview' && resume.status !== 'Hired' && resume.status !== 'Rejected' && (
            <button onClick={() => changeStatus('Interview')} className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-semibold transition shadow-sm border border-purple-100">
              Move to Interview
            </button>
          )}
          {resume.status !== 'Selected' && resume.status !== 'Hired' && resume.status !== 'Rejected' && (
            <button onClick={() => changeStatus('Selected')} className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-semibold transition shadow-sm border border-green-100">
              Select
            </button>
          )}
          {resume.status === 'Selected' && (
            <button onClick={() => changeStatus('Hired')} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-semibold transition shadow-sm">
              Hire
            </button>
          )}
          {resume.status !== 'Rejected' ? (
             <button onClick={() => setRejectModalOpen(true)} className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-semibold transition shadow-sm border border-red-100">
               Reject
             </button>
          ) : (
             <button onClick={() => changeStatus('Pending Review')} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-semibold transition shadow-sm border border-gray-200">
               Restore Candidate
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Tabs */}
        <div className="lg:col-span-1 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 custom-scrollbar hide-scrollbar-mobile">
          <button onClick={() => setActiveTab('insights')} className={`flex-shrink-0 text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'insights' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
            <Brain size={18} /> <span className="hidden sm:inline lg:inline">AI Insights</span>
          </button>
          <button onClick={() => setActiveTab('match')} className={`flex-shrink-0 text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'match' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
            <TrendingUp size={18} /> <span className="hidden sm:inline lg:inline">Skill Gap</span>
          </button>
          <button onClick={() => { setActiveTab('questions'); handleGenerateQuestions(); }} className={`flex-shrink-0 text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
            <Lightbulb size={18} /> <span className="hidden sm:inline lg:inline">AI Interview</span>
          </button>
          <button onClick={() => setActiveTab('notes')} className={`flex-shrink-0 text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'notes' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
            <MessageSquare size={18} /> <span className="hidden sm:inline lg:inline">Notes</span>
          </button>
          <button onClick={() => setActiveTab('timeline')} className={`flex-shrink-0 text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'timeline' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
            <History size={18} /> <span className="hidden sm:inline lg:inline">Timeline</span>
          </button>
          <button onClick={() => setActiveTab('email')} className={`flex-shrink-0 text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-3 ${activeTab === 'email' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
            <Mail size={18} /> <span className="hidden sm:inline lg:inline">Email</span>
          </button>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[500px]">
          
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">AI Candidate Insights</h2>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Executive Summary</h3>
                <p className="text-gray-600 italic bg-gray-50 p-4 rounded-lg">{resume.ai_summary || "No summary generated."}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2"><CheckCircle size={16}/> Strengths</h3>
                  <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                    {resume.strengths?.map((s,i)=><li key={i}>{s}</li>) || <li>None recorded</li>}
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Weaknesses</h3>
                  <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                    {resume.weaknesses?.map((s,i)=><li key={i}>{s}</li>) || <li>None recorded</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'match' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Skill Gap Analysis</h2>
              
              {/* Match Score Card */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-2xl shadow-md text-white flex flex-col md:flex-row items-center justify-between">
                <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                  <span className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Overall Match Score</span>
                  <div className="text-5xl font-black mt-1 flex items-baseline">
                    {resume.match_percentage} <span className="text-2xl font-bold text-blue-200 ml-1">%</span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl max-w-sm">
                  <h4 className="font-bold mb-1 flex items-center gap-2">
                    <TrendingUp size={18} /> Recommendation
                  </h4>
                  <p className="text-blue-50 text-sm leading-relaxed">
                    {resume.recommendation || (resume.match_percentage >= 75 ? "Highly recommended for this role." : resume.match_percentage >= 50 ? "Considerable potential, but some skill gaps exist." : "Significant skill gaps. Not recommended for immediate technical roles without further screening.")}
                  </p>
                </div>
              </div>

              {/* Skills Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                
                {/* Matched Skills */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <CheckCircle className="text-green-500" size={20} /> Matched Skills
                  </h3>
                  {resume.matched_skills && resume.matched_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {resume.matched_skills.map((s,i) => (
                        <span key={i} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm flex items-center gap-1">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm italic py-4 text-center bg-gray-50 rounded-lg">No matching skills found.</div>
                  )}
                </div>

                {/* Missing Skills */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <XCircle className="text-red-500" size={20} /> Missing Skills
                  </h3>
                  {resume.missing_skills && resume.missing_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {resume.missing_skills.map((s,i) => (
                        <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm flex items-center gap-1">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm italic py-4 text-center bg-gray-50 rounded-lg">No missing skills detected!</div>
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {resume.suggestions && resume.suggestions.length > 0 && (
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mt-6">
                  <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2 border-b border-amber-200 pb-2">
                    <Lightbulb className="text-amber-500" size={20} /> ATS & Skill Suggestions
                  </h3>
                  <ul className="space-y-3">
                    {resume.suggestions.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-amber-800">
                        <span className="bg-amber-200 text-amber-800 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i+1}</span>
                        <span className="leading-relaxed mt-0.5">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">AI Interview Questions</h2>
              {loadingQuestions ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500">Analyzing resume and generating custom technical questions...</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {interviewQuestions.map((q, i) => (
                    <li key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <strong className="text-blue-600 mr-2">Q{i+1}:</strong> 
                      <span className="text-gray-800">{q}</span>
                    </li>
                  ))}
                  {interviewQuestions.length === 0 && <p className="text-gray-500">No questions generated.</p>}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Recruiter Notes</h2>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input required value={newNote} onChange={e=>setNewNote(e.target.value)} type="text" placeholder="Add a note about this candidate..." className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-4 py-2 border"/>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">Add</button>
              </form>
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-800">{note.content}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>By: {note.recruiter_name}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {notes.length === 0 && <p className="text-gray-500 text-center py-4">No notes added yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Activity Timeline</h2>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {timeline.map(activity => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                      <History size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900">{activity.action_type}</div>
                        <time className="font-medium text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</time>
                      </div>
                      <div className="text-sm text-slate-600">{activity.description}</div>
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && <p className="text-gray-500 text-center py-4">No activity recorded.</p>}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Send Email</h2>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-gray-600 mb-4">Email integration is currently simulated. Emails sent here would go to <strong>{resume.candidate_email}</strong>.</p>
                <div className="space-y-4">
                  <input type="text" placeholder="Subject" className="w-full border-gray-300 rounded-lg px-4 py-2 border"/>
                  <textarea rows={6} placeholder="Message body..." className="w-full border-gray-300 rounded-lg px-4 py-2 border"></textarea>
                  <button onClick={() => toast.success("Email sent! (Simulated)")} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Send Email</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Reject Candidate</h3>
            <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting {resume.candidate_name}. This helps maintain clear hiring records.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Lack of relevant experience..."
              className="w-full border border-slate-200 rounded-xl p-3 h-28 resize-none focus:ring-red-500 focus:border-red-500 text-sm mb-4"
            ></textarea>
            <div className="flex gap-3 justify-end">
              <button onClick={() => {setRejectModalOpen(false); setRejectionReason("");}} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition">
                Cancel
              </button>
              <button onClick={() => changeStatus('Rejected', rejectionReason)} className="px-4 py-2 font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-sm">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
