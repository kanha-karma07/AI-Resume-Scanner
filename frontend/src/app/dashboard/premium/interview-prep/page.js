"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, MessageSquare, Terminal, Users, Play, Info } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function InterviewPrep() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState(null);
  const [activeTab, setActiveTab] = useState("technical"); // technical, behavioral, hr

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const isPremium = localStorage.getItem("isPremium") === "True" || localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.push("/dashboard/premium/payment");
      return;
    }

    try {
      const res = await api.get("premium/interview-prep/");
      setQuestions(res.data);
    } catch (err) {
      toast.error("Failed to load interview questions");
    } finally {
      setLoading(false);
    }
  };

  const getIconForTab = (tab) => {
    if (tab === "technical") return <Terminal size={18} />;
    if (tab === "behavioral") return <Users size={18} />;
    return <MessageSquare size={18} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
                <div className="flex items-center justify-center p-20 animate-pulse text-gray-500">
          Generating personalized interview questions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
            
        <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-grow">
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3">
            <Mic className="text-indigo-500" size={32}/>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Interview Preparation</h1>
              <p className="text-sm text-gray-500">Practice with questions automatically tailored to your resume.</p>
            </div>
          </div>
        </div>

        {questions ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row border-b border-gray-200">
              {['technical', 'behavioral', 'hr'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-bold text-sm transition-colors
                    ${activeTab === tab 
                      ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                >
                  {getIconForTab(tab)}
                  <span className="capitalize">{tab} Questions</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-3 text-blue-800 text-sm">
                <Info size={20} className="flex-shrink-0 mt-0.5" />
                <p>These questions are generated based on the skills and experiences found in your latest resume. Practice answering them out loud using the STAR method (Situation, Task, Action, Result) for behavioral questions.</p>
              </div>

              <div className="space-y-6">
                {questions[activeTab]?.map((q, i) => (
                  <div key={i} className="group relative bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 p-6 rounded-xl transition-colors">
                    <div className="flex gap-4 items-start">
                      <div className="bg-white border text-gray-500 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 group-hover:text-indigo-600 group-hover:border-indigo-300">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium text-lg leading-snug">{q}</h3>
                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs flex items-center gap-1 font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                            <Play size={12} /> Practice Answer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center p-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-200">
            No interview questions generated. Upload a resume first.
          </div>
        )}
      </div>
    </div>
);
}

