"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Target, CheckCircle, XCircle, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import ResumeUploadCard from "@/components/dashboard/ResumeUploadCard";

export default function AdvancedATS() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [atsData, setAtsData] = useState(null);

  useEffect(() => {
    fetchATSData();
  }, []);

  const fetchATSData = async () => {
    const isPremium = localStorage.getItem("isPremium") === "True" || localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.push("/dashboard/premium/payment");
      return;
    }

    try {
      const res = await api.get("premium/advanced-ats/");
      setAtsData(res.data);
    } catch (err) {
      toast.error("Failed to load ATS analysis");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
                <div className="flex items-center justify-center p-20 animate-pulse text-gray-500">
          Analyzing Resume...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
<div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
            <Target className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Advanced ATS Analysis</h1>
            <p className="text-gray-500 mt-1">Deep dive into how Applicant Tracking Systems view your resume</p>
          </div>
        </div>

        <ResumeUploadCard onUploadSuccess={async () => {
          setLoading(true);
          await fetchATSData();
        }} />

        {atsData ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            
            {/* Overall Score */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Overall ATS Score</h3>
              <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-red-100">
                <span className="text-5xl font-bold text-red-600">{atsData.overall_score}</span>
              </div>
              <p className="mt-4 text-sm text-gray-500">Target score is 80+</p>
            </div>

            {/* Breakdown */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                <BarChart2 size={20} className="text-gray-400" /> Score Breakdown
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
                    <span>Skills Match</span>
                    <span>{atsData.skills_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${atsData.skills_score}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
                    <span>Formatting</span>
                    <span>{atsData.formatting_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${atsData.formatting_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
                    <span>Experience Depth</span>
                    <span>{atsData.experience_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${atsData.experience_score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <CheckCircle size={18} /> Found Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {atsData.matched_keywords?.map((kw, i) => (
                    <span key={i} className="bg-white px-3 py-1 rounded-full text-sm border border-emerald-200 text-emerald-700">{kw}</span>
                  ))}
                </div>
              </div>
              
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <h4 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <XCircle size={18} /> Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {atsData.missing_keywords?.map((kw, i) => (
                    <span key={i} className="bg-white px-3 py-1 rounded-full text-sm border border-red-200 text-red-700">{kw}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 md:col-span-1">
              <h4 className="font-bold text-blue-900 mb-4">Improvement Suggestions</h4>
              <ul className="space-y-3">
                {atsData.suggestions?.map((s, i) => (
                  <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="font-bold mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
          
          {/* Detailed Data Sections */}
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-800 mb-4 text-lg">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {atsData.skills?.length ? (
                  atsData.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No Skills Found</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-800 mb-4 text-lg">Education</h4>
              {atsData.education?.length ? (
                atsData.education.map((edu, i) => (
                  <div key={i} className="mb-4 last:mb-0 border-b last:border-0 pb-4 last:pb-0">
                    <p className="font-bold text-gray-800">{edu.degree || "Degree N/A"}</p>
                    <p className="text-gray-600 text-sm">{edu.college || "College N/A"}</p>
                    <p className="text-gray-500 text-xs mt-1">{edu.passing_year || "Year N/A"}</p>
                  </div>
                ))
              ) : (
                <div className="text-sm">
                  <p className="font-medium text-gray-700">{atsData.education?.degree || "N/A"}</p>
                  <p className="text-gray-500">{atsData.education?.passing_year || "N/A"}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-800 mb-4 text-lg">Experience</h4>
              {Array.isArray(atsData.experience) && atsData.experience.length ? (
                atsData.experience.map((exp, i) => (
                  <div key={i} className="mb-4 last:mb-0 border-b last:border-0 pb-4 last:pb-0">
                    <p className="font-bold text-gray-800">{exp.role || "Role N/A"}</p>
                    <p className="text-gray-600 text-sm">{exp.company || "Company N/A"}</p>
                    <p className="text-gray-500 text-xs mt-1">{exp.duration || "Duration N/A"}</p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-700">
                  <p>{atsData.experience?.is_fresher ? "Fresher" : "Experienced"}</p>
                  <p>{atsData.experience?.total_experience || "0 Years"}</p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-800 mb-4 text-lg">Projects</h4>
              {atsData.projects?.length ? (
                atsData.projects.map((proj, i) => (
                  <div key={i} className="mb-4 last:mb-0 border-b last:border-0 pb-4 last:pb-0">
                    <p className="font-bold text-gray-800">{proj.title || "Project Title N/A"}</p>
                    <p className="text-gray-600 text-sm mt-1">{proj.description ? proj.description.substring(0, 100) + '...' : "No description"}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No Projects Found</p>
              )}
            </div>
          </div>
          </>
        ) : (
          <div className="text-center p-12 text-gray-500">No ATS data found. Upload a resume first.</div>
        )}
      </div>
    </div>
  );
}

