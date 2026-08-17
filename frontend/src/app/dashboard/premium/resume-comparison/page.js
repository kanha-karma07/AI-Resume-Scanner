"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CopyPlus, Sparkles, Check, AlertTriangle, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function ResumeComparison() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [resumeA, setResumeA] = useState("");
  const [resumeB, setResumeB] = useState("");
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    const isPremium = localStorage.getItem("isPremium") === "True" || localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.push("/dashboard/premium/payment");
      return;
    }

    try {
      const res = await api.get("candidate/resume/");
      setResumes(res.data);
    } catch (err) {
      toast.error("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!resumeA || !resumeB) {
      toast.error("Please select two resumes to compare");
      return;
    }
    if (resumeA === resumeB) {
      toast.error("Please select two different resumes");
      return;
    }

    setComparing(true);
    try {
      const res = await api.post("premium/compare/", {
        resume_a_id: resumeA,
        resume_b_id: resumeB
      });
      setComparison(res.data);
      toast.success("Comparison complete!");
    } catch (err) {
      toast.error("Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
                <div className="flex items-center justify-center p-20 animate-pulse text-gray-500">
          Loading AI Resume Comparison...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="max-w-6xl mx-auto p-4 md:p-8 w-full flex-grow">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CopyPlus className="text-orange-500" size={32}/>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Resume Comparison</h1>
                <p className="text-sm text-gray-500">Compare two resumes side-by-side to see which performs better for ATS.</p>
              </div>
            </div>
            
            <button 
              onClick={handleCompare}
              disabled={comparing || !resumeA || !resumeB}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-all disabled:opacity-70 h-[42px]"
            >
              {comparing ? <span className="animate-spin">↻</span> : <Sparkles size={18} />}
              Compare Resumes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Resume A Selector */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Resume A</label>
            <select 
              className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={resumeA}
              onChange={(e) => setResumeA(e.target.value)}
            >
              <option value="">-- Select First Resume --</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          {/* Resume B Selector */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">Select Resume B</label>
            <select 
              className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
              value={resumeB}
              onChange={(e) => setResumeB(e.target.value)}
            >
              <option value="">-- Select Second Resume --</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
        </div>

        {comparison && (
          <div className="space-y-6">
            
            {/* Winner Banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
                <TrendingUp size={32} className="text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Winner: <span className="text-orange-600">{comparison.winner}</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{comparison.overall_suggestion}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Resume A Results */}
              <div className={`p-6 rounded-2xl border-2 ${comparison.winner === 'Resume A' ? 'border-orange-500 bg-white shadow-md' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Resume A</h3>
                <div className="flex justify-center mb-6">
                  <div className="text-4xl font-bold text-gray-800">{comparison.resume_a.ats_score}<span className="text-xl text-gray-500 font-normal">/100</span></div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-emerald-700 mb-2 flex items-center gap-2"><Check size={16}/> Strengths</h4>
                    <ul className="space-y-2">
                      {comparison.resume_a.strengths.map((s, i) => <li key={i} className="text-sm text-gray-600 pl-6 relative"><span className="absolute left-2 top-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Weaknesses</h4>
                    <ul className="space-y-2">
                      {comparison.resume_a.weaknesses.map((s, i) => <li key={i} className="text-sm text-gray-600 pl-6 relative"><span className="absolute left-2 top-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Resume B Results */}
              <div className={`p-6 rounded-2xl border-2 ${comparison.winner === 'Resume B' ? 'border-orange-500 bg-white shadow-md' : 'border-gray-200 bg-gray-50'}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Resume B</h3>
                <div className="flex justify-center mb-6">
                  <div className="text-4xl font-bold text-gray-800">{comparison.resume_b.ats_score}<span className="text-xl text-gray-500 font-normal">/100</span></div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-emerald-700 mb-2 flex items-center gap-2"><Check size={16}/> Strengths</h4>
                    <ul className="space-y-2">
                      {comparison.resume_b.strengths.map((s, i) => <li key={i} className="text-sm text-gray-600 pl-6 relative"><span className="absolute left-2 top-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Weaknesses</h4>
                    <ul className="space-y-2">
                      {comparison.resume_b.weaknesses.map((s, i) => <li key={i} className="text-sm text-gray-600 pl-6 relative"><span className="absolute left-2 top-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

