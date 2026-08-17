"use client";

import { useEffect, useState } from "react";
import { getAnalytics } from "@/services/adminService";
import { Loader2, Users, FileText, BarChart3, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics();
        setData(res.data);
      } catch (error) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Derived values from the backend response
  const rolesMap = data?.user_analytics?.reduce((acc, curr) => {
    acc[curr.role] = curr.count;
    return acc;
  }, {}) || {};

  const pipelineMap = data?.pipeline_analytics?.reduce((acc, curr) => {
    acc[curr.status] = curr.count;
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Platform Analytics</h1>
        <p className="text-slate-500">Detailed metrics across candidates and recruiters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            User Roles Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-600">Candidates</span>
              <span className="font-bold text-slate-800 text-lg">{rolesMap.candidate || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-600">Recruiters</span>
              <span className="font-bold text-slate-800 text-lg">{rolesMap.recruiter || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-red-100">
              <span className="font-medium text-red-600">Admins</span>
              <span className="font-bold text-red-600 text-lg">{rolesMap.admin || 0}</span>
            </div>
          </div>
        </div>

        {/* Resume Processing Metrics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-teal-600" />
            Resume Processing
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-teal-50 rounded-xl">
              <p className="text-sm font-medium text-teal-600 mb-1">Total Uploads</p>
              <h4 className="text-2xl font-bold text-teal-800">{data?.resume_analytics?.total || 0}</h4>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl">
              <p className="text-sm font-medium text-indigo-600 mb-1">Avg ATS Score</p>
              <h4 className="text-2xl font-bold text-indigo-800">{data?.resume_analytics?.avg_ats || 0}%</h4>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-sm font-medium text-emerald-600 mb-1">Success</p>
              <h4 className="text-2xl font-bold text-emerald-800">{data?.resume_analytics?.success || 0}</h4>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-sm font-medium text-red-600 mb-1">Failed</p>
              <h4 className="text-2xl font-bold text-red-800">{data?.resume_analytics?.failed || 0}</h4>
            </div>
          </div>
        </div>

        {/* Recruiter Pipeline Analytics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            Recruiter Active Hiring Funnel
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Applied', 'Pending Review', 'Shortlisted', 'Interview', 'Selected', 'Hired', 'Rejected'].map((status) => (
              <div key={status} className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <p className="text-xs font-medium text-slate-500 mb-2 truncate" title={status}>{status}</p>
                <h4 className="text-xl font-bold text-slate-800">{pipelineMap[status] || 0}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
