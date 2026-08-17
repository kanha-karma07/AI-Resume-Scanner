"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, FileText, Briefcase, CheckCircle, XCircle, Clock, 
  TrendingUp, BarChart3, Download, Sparkles, AlertCircle, ChevronRight 
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

import api from "@/services/api";
import KanbanBoard from "@/components/recruiter/KanbanBoard";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="rounded-2xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${color}`} />
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`rounded-xl p-3 text-white shadow-md ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

export default function PremiumDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("recruiter/analytics/");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    }
  };

  useEffect(() => {
    async function checkPremiumStatus() {
      try {
        const profileRes = await api.get('recruiter/profile/');
        const backendIsPremium = profileRes.data.is_premium;
        
        localStorage.setItem("isPremium", backendIsPremium);

        if (!backendIsPremium) {
          toast.error("Premium subscription required");
          router.replace("/recruiter/dashboard"); 
          return;
        }

        await fetchAnalytics();
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.replace("/login");
        } else {
          router.replace("/recruiter/dashboard"); 
        }
      } finally {
        setLoading(false);
      }
    }
    checkPremiumStatus();
  }, [router]);

  const handleGlobalStatusChange = async (resumeIds, targetStatus) => {
    try {
      await api.put("recruiter/resume-status/", {
        resume_ids: resumeIds,
        status: targetStatus
      });
      toast.success(`Status updated to ${targetStatus}`);
      fetchAnalytics();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 shadow-md"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12 overflow-x-hidden md:overflow-visible">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-blue-200 shrink-0" />
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-200 truncate">AI Command Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight break-words">Welcome to Premium Analytics</h1>
          <p className="mt-2 text-blue-100 max-w-full md:max-w-xl break-words">
            Monitor your hiring funnel, view deep AI insights, and manage candidates at a glance.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 mt-2 xl:mt-0 w-full xl:w-auto shrink-0">
          <Link href="/recruiter/premium/job-description" className="px-4 py-2.5 bg-white text-blue-600 rounded-xl font-semibold shadow-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm flex-1 sm:flex-none">
            <FileText size={16} /> Generate JD
          </Link>
          <Link href="/recruiter/premium/candidates" className="px-4 py-2.5 bg-blue-700 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 text-sm border border-blue-500 flex-1 sm:flex-none">
            <Users size={16} /> Candidate Hub
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Candidates" value={stats.total_candidates} icon={Users} color="bg-blue-500" />
        <StatCard title="Active Jobs" value={stats.total_jobs} icon={Briefcase} color="bg-indigo-500" />
        <StatCard title="Average ATS" value={`${Math.round(stats.avg_ats)}%`} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="AI Scans" value={stats.total_candidates} icon={BarChart3} color="bg-rose-500" />
        <StatCard title="Shortlisted" value={stats.shortlisted} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Interviews" value={stats.interviews} icon={Clock} color="bg-amber-500" />
        <StatCard title="Hired" value={stats.hired} icon={Users} color="bg-cyan-500" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-red-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Applications Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 min-w-0">
          <h2 className="mb-6 text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-indigo-500" /> Applications Trend (6 Months)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.applications_trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="applications" stroke="#6366f1" fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hiring Funnel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
          <h2 className="mb-6 text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> Hiring Funnel
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.hiring_funnel} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ATS Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
          <h2 className="mb-6 text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-500" /> ATS Distribution
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.ats_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {stats.ats_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Analytics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 min-w-0">
          <h2 className="mb-6 text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-500" /> Top Candidate Skills
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.skills_distribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Global Kanban Pipeline */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm flex flex-col w-full">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase size={22} className="text-blue-600" /> Active Hiring Pipeline
          </h2>
          <span className="text-sm text-slate-500 font-medium">Global Overview (Recent Active)</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar pb-2 w-full">
          <KanbanBoard resumes={stats.active_resumes || []} onStatusChange={handleGlobalStatusChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Candidates Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-500" /> Top AI Recommended
            </h2>
            <Link href="/recruiter/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Candidate</th>
                  <th className="px-4 py-3">ATS Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.top_candidates?.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{candidate.candidate_name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{candidate.candidate_email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        {candidate.ats_score}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 bg-white shadow-sm">
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link 
                        href={`/recruiter/premium/resume/${candidate.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Insights
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!stats.top_candidates || stats.top_candidates.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                      No candidates analyzed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden flex flex-col">
          <h2 className="mb-6 text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-blue-500" /> Recent Activity
          </h2>
          
          <div className="relative pl-4 border-l border-slate-200 space-y-6 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
            {stats.recent_activity?.map((activity) => (
              <div key={activity.id} className="relative">
                <span className="absolute -left-[21px] flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white" />
                <div className="mb-1 text-sm font-semibold text-slate-900">{activity.action_type}</div>
                <time className="mb-2 block text-xs font-normal leading-none text-slate-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </time>
                <div className="text-sm font-normal text-slate-600">
                  {activity.description}
                </div>
              </div>
            ))}
            {(!stats.recent_activity || stats.recent_activity.length === 0) && (
              <div className="text-sm text-slate-500 text-center py-4">No recent activity</div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
