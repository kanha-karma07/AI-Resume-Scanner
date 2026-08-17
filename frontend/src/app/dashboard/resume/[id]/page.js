"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BarChart2, Target, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { getResumeById } from "@/services/resumeService";

export default function ResumeDetailPage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);

  const handleSelectResume = async (id) => {
    try {
      const response = await getResumeById(id);
      setResume(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) handleSelectResume(id);
  }, [id]);

  if (!resume) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  // Parse breakdown string like "15/30" into percentage score
  const getScorePct = (key, maxScore) => {
    const val = resume.ats_breakdown?.[key] || `0/${maxScore}`;
    try {
      const num = parseFloat(val.split("/")[0]);
      return parseInt((num / maxScore) * 100);
    } catch {
      return 0;
    }
  };

  const atsData = {
    overall_score: resume.ats_score,
    skills_score: getScorePct("Skills", 30),
    formatting_score: getScorePct("Structure", 10),
    experience_score: getScorePct("Experience", 20),
    education_score: getScorePct("Education", 15),
    matched_keywords: resume.skills?.slice(0, 5) || [],
    missing_keywords: [],
    suggestions: resume.suggestions || [],
    skills: resume.skills || [],
    projects: resume.projects || [],
    experience: resume.experience_data || [],
    education: resume.education_data || [],
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-6 text-blue-600 font-semibold hover:underline"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                <Target className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{resume.title}</h1>
                <p className="text-gray-500 mt-1">Detailed ATS Analysis</p>
              </div>
            </div>
        </div>

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

          {/* Suggestions */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 md:col-span-3">
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

      </div>
    </div>
  );
}