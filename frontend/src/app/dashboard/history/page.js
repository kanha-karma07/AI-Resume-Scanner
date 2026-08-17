"use client";

import { useEffect, useState } from "react";
import { History, FileText } from "lucide-react";
import api from "@/services/api";
import ResumeList from "@/components/dashboard/ResumeList";

export default function HistoryPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get("candidate/resume/");
      setResumes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
<div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
            <History className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Resume History</h1>
            <p className="text-gray-500 mt-1">View, search, and sort all your uploaded resumes</p>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100 flex flex-col items-center">
            <FileText className="text-gray-300 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Resumes Found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Upload a resume to see it appear in your history.</p>
          </div>
        ) : (
          <ResumeList resumes={resumes} />
        )}
      </div>
    </div>
  );
}
