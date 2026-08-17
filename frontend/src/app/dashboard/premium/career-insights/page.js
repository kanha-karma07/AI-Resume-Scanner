"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Compass, Award, Briefcase, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function CareerInsights() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    const isPremium = localStorage.getItem("isPremium") === "True" || localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.push("/dashboard/premium/payment");
      return;
    }

    try {
      const res = await api.get("premium/career-insights/");
      setInsights(res.data);
    } catch (err) {
      toast.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
                <div className="flex items-center justify-center p-20 animate-pulse text-gray-500">
          Generating Career Insights...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
            
        <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-grow">
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3">
            <Lightbulb className="text-amber-500" size={32}/>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Career Insights</h1>
              <p className="text-sm text-gray-500">Discover personalized recommendations based on your profile.</p>
            </div>
          </div>
        </div>

        {insights ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                 <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Briefcase size={24}/></div>
                 <div>
                   <p className="text-sm text-gray-500 font-medium">Estimated Career Level</p>
                   <p className="text-xl font-bold text-gray-900">{insights.career_level}</p>
                 </div>
               </div>
               <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                 <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Compass size={24}/></div>
                 <div>
                   <p className="text-sm text-gray-500 font-medium">Industry Readiness</p>
                   <p className="text-xl font-bold text-gray-900">{insights.industry_readiness}</p>
                 </div>
               </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Award size={20} className="text-blue-500"/> Skill Assessment</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Top Identified Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.top_skills?.map((skill, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Missing Critical Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.missing_skills?.map((skill, i) => (
                      <span key={i} className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-md text-sm font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Roadmap */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><BookOpen size={20} className="text-amber-500"/> Recommended Learning Roadmap</h3>
              
              <div className="space-y-4">
                {insights.learning_roadmap?.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      {index < insights.learning_roadmap.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                      )}
                    </div>
                    <div className="pb-4 pt-1">
                      <p className="text-gray-800 font-medium">{step}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Suggested Certifications</h4>
                <ul className="space-y-2">
                  {insights.certifications?.map((cert, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <Award size={14} className="text-amber-500"/> {cert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center p-12 text-gray-500">No Insights available. Upload a resume first.</div>
        )}
      </div>
    </div>
);
}

