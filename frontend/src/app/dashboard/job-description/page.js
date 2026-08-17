"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, FileText, CheckCircle, XCircle, AlertCircle, Briefcase, GraduationCap, Zap, Lock } from "lucide-react";
import { getResumes, uploadResume } from "@/services/resumeService";
import { analyzeJobMatch } from "@/services/jobDescriptionService";
import toast from "react-hot-toast";

// SVG Circular Progress Component
const CircularProgress = ({ value, colorClass }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-slate-200"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={colorClass}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: "stroke-dashoffset 1s ease-in-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-800">{value}%</span>
      </div>
    </div>
  );
};

export default function JobMatchAnalyzerPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await getResumes();
      setResumes(response.data);
    } catch (error) {
      toast.error("Failed to load resumes.");
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF, DOC, or DOCX file.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }
      setFile(selectedFile);
      
      const formData = new FormData();
      formData.append("resume_file", selectedFile);
      formData.append("title", selectedFile.name);
      
      setIsUploading(true);
      try {
        const response = await uploadResume(formData);
        toast.success("Resume uploaded successfully!");
        await fetchResumes(); // Refresh list
        setSelectedResumeId(response.data.id);
        
        // Auto-trigger analysis if job description is present
        if (jobDescription.trim()) {
           await runAnalysis(response.data.id, jobDescription);
        }
      } catch (error) {
        toast.error("Failed to upload resume.");
      } finally {
        setIsUploading(false);
        setFile(null); // Clear file selection after upload
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const runAnalysis = async (resumeId, jdText) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await analyzeJobMatch(resumeId, jdText);
      setAnalysisResult(response.data);
      toast.success("Analysis Complete!");
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.error || "Free limit reached. Upgrade to Premium.");
      } else {
        toast.error("Analysis failed. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    if (!selectedResumeId) {
      toast.error("Please select or upload a resume.");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description.");
      return;
    }
    runAnalysis(selectedResumeId, jobDescription);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "stroke-green-500 text-green-500";
    if (score >= 60) return "stroke-yellow-500 text-yellow-500";
    return "stroke-red-500 text-red-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-6 font-medium">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">AI Job Match Analyzer</h1>
            <p className="text-slate-500 mt-2 text-lg">Compare your resume against any job description instantly.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100">
            <Lock size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">3 free scans / day</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input Panel */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm h-fit">
          <div className="space-y-6">
            
            {/* Step 1: Resume */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                Select Resume
              </h2>
              
              <div className="space-y-4">
                <select 
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={isUploading}
                >
                  <option value="">-- Choose an existing resume --</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-400">OR</span>
                  </div>
                </div>

                <div 
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isUploading ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'}`}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  <UploadCloud className={`mx-auto h-12 w-12 ${isUploading ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
                  <p className="mt-4 text-sm font-medium text-slate-700">
                    {isUploading ? "Uploading & Parsing..." : "Click to upload a new resume (PDF)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: JD */}
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">2</span>
                Job Description
              </h2>
              <textarea 
                placeholder="Paste the target job description here..."
                rows={10}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none shadow-inner"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedResumeId || !jobDescription.trim() || isAnalyzing || isUploading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Match...
                </span>
              ) : "Analyze Match"}
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {!analysisResult && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 border border-slate-200 border-dashed rounded-3xl">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Zap className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Analyze</h3>
              <p className="text-slate-500 max-w-sm">Provide your resume and job description to get instant, AI-driven insights on your match probability.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-sm">
               <div className="relative w-24 h-24">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
               </div>
               <h3 className="text-xl font-bold text-slate-800 mt-6 animate-pulse">Running AI Analysis...</h3>
               <p className="text-slate-500 mt-2">Extracting skills, comparing experience, and generating suggestions.</p>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Score Card */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-8">
                 <CircularProgress value={analysisResult.match_score} colorClass={getScoreColor(analysisResult.match_score)} />
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800">Match Score</h3>
                    <p className="text-slate-500 mt-1">
                      {analysisResult.match_score >= 80 ? "Excellent Match! You are highly qualified." : 
                       analysisResult.match_score >= 60 ? "Good Match. A few tweaks needed." : 
                       "Low Match. Significant updates recommended."}
                    </p>
                 </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Matched Skills */}
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-4">
                      <CheckCircle size={18} /> Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.skills_match?.length > 0 ? (
                        analysisResult.skills_match.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100">{s}</span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 italic">No exact matches found.</span>
                      )}
                    </div>
                 </div>

                 {/* Missing Skills */}
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-4">
                      <XCircle size={18} /> Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missing_skills?.length > 0 ? (
                        analysisResult.missing_skills.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">{s}</span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 italic">No missing skills detected!</span>
                      )}
                    </div>
                 </div>
              </div>

              {/* Analysis Cards */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Section Analysis</h3>
                  <div className="space-y-4">
                     
                     <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <Briefcase className="w-6 h-6 text-indigo-500 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-slate-800">Experience</h5>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">{analysisResult.experience_analysis?.status}</span>
                          </div>
                          <p className="text-slate-600 text-sm mt-1">{analysisResult.experience_analysis?.details}</p>
                        </div>
                     </div>

                     <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <GraduationCap className="w-6 h-6 text-indigo-500 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-slate-800">Education</h5>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">{analysisResult.education_analysis?.status}</span>
                          </div>
                          <p className="text-slate-600 text-sm mt-1">{analysisResult.education_analysis?.details}</p>
                        </div>
                     </div>

                  </div>
              </div>

              {/* Suggestions */}
              {analysisResult.resume_improvements?.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100">
                   <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      <AlertCircle size={20} className="text-indigo-600" />
                      Actionable Improvements
                   </h3>
                   <ul className="space-y-3">
                     {analysisResult.resume_improvements.map((sug, i) => (
                       <li key={i} className="flex items-start gap-3 text-indigo-800">
                         <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold mt-0.5">{i+1}</span>
                         <span className="text-sm leading-relaxed">{sug}</span>
                       </li>
                     ))}
                   </ul>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
