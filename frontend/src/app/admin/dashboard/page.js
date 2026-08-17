"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/adminService";
import { Loader2, Users, Briefcase, FileText, CreditCard, Activity, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (error) {
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats?.total_users, icon: Users, color: "bg-blue-500" },
    { label: "Total Candidates", value: stats?.total_candidates, icon: Users, color: "bg-indigo-500" },
    { label: "Total Recruiters", value: stats?.total_recruiters, icon: Briefcase, color: "bg-violet-500" },
    { label: "Premium Candidates", value: stats?.premium_candidates, icon: CreditCard, color: "bg-purple-500" },
    { label: "Premium Recruiters", value: stats?.premium_recruiters, icon: CreditCard, color: "bg-fuchsia-500" },
    { label: "Active Subscriptions", value: stats?.active_subscriptions, icon: Activity, color: "bg-emerald-500" },
    { label: "Total Resumes", value: stats?.total_resumes, icon: FileText, color: "bg-teal-500" },
    { label: "Total Job Descriptions", value: stats?.total_jds, icon: FileText, color: "bg-cyan-500" },
    { label: "Active Hiring Pipelines", value: stats?.active_hiring, icon: TrendingUp, color: "bg-sky-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500">Overview of system metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${card.color} shadow-sm`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
