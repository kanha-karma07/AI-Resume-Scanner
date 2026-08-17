"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Crown, Zap, Star, Activity, FileText, Edit, RefreshCw, Clock } from "lucide-react";
import api from "@/services/api";
import { getResumes } from "@/services/resumeService";
import ResumeUploadCard from "@/components/dashboard/ResumeUploadCard";
import ResumeList from "@/components/dashboard/ResumeList";
import StatsCards from "@/components/dashboard/StatsCards";

export default function PremiumDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [membershipData, setMembershipData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentResumes, setRecentResumes] = useState([]);
  
  // State for Free components
  const [resumes, setResumes] = useState([]);

  const fetchResumes = async () => {
    try {
      const response = await getResumes();
      setResumes(response.data);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("premium/status/");
        const data = res.data;
        
        localStorage.setItem("isPremium", data.is_premium);
        localStorage.setItem("subscriptionStatus", data.subscription_status);
        localStorage.setItem("plan", data.plan);
        
        if (data.is_premium) {
          setMembershipData({
            type: "PREMIUM",
            startDate: data.membership_start_date,
            endDate: data.membership_end_date,
            scansLeft: "Unlimited",
            aiTokens: 500
          });
        } else {
          setMembershipData({
            type: "FREE",
            startDate: new Date().toISOString(),
            endDate: null,
            scansLeft: 3,
            aiTokens: 0
          });
        }
      } catch (error) {
        const isPremium = localStorage.getItem("isPremium") === "True" || localStorage.getItem("isPremium") === "true";
        if (isPremium) {
          setMembershipData({
            type: "PREMIUM",
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            scansLeft: "Unlimited",
            aiTokens: 500
          });
        } else {
          setMembershipData({
            type: "FREE",
            startDate: new Date().toISOString(),
            endDate: null,
            scansLeft: 3,
            aiTokens: 0
          });
        }
      } finally {
        setRecentActivity([
          { id: 1, action: "Resume Rewritten (Backend Developer)", time: "2 hours ago" },
          { id: 2, action: "AI Resume Edit (Professional Summary)", time: "1 day ago" }
        ]);
        setRecentResumes([
          { id: 101, title: "Backend_Developer_Resume.pdf", date: "Oct 24, 2023" },
          { id: 102, title: "Tech_Lead_Draft.pdf", date: "Oct 22, 2023" }
        ]);
        
        await fetchResumes();
        setLoading(false);
      }
    };
    
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-8 animate-pulse space-y-8">
          <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  const isPremium = membershipData?.type === "PREMIUM";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
            
      <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-grow space-y-8">
        
        {/* Header / Premium Badge & Membership Status */}
        <div className={`rounded-3xl p-8 text-white shadow-xl relative overflow-hidden ${isPremium ? 'bg-gradient-to-r from-gray-900 to-blue-900' : 'bg-gradient-to-r from-gray-700 to-gray-900'}`}>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20">
            <Crown size={200} />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              {isPremium ? 'Premium Badge' : 'Free Member'}
            </div>
            <h1 className="text-3xl font-extrabold">{isPremium ? 'Premium Dashboard' : 'AI Tools Dashboard'}</h1>
            <p className="text-blue-200 max-w-xl">
              {isPremium 
                ? `Membership Status: Active until ${new Date(membershipData.endDate).toLocaleDateString()}`
                : "You are currently on the Free plan. Upgrade to unlock all premium AI features."}
            </p>
          </div>
        </div>

        {/* Free Dashboard Components merged in */}
        <StatsCards resumes={resumes} />
        
        {/* Upload Resume Section with automatic refresh callback */}
        <ResumeUploadCard 
          onUploadSuccess={async () => {
            await fetchResumes();
            router.push("/dashboard/premium/advanced-ats");
          }} 
        />

        <ResumeList resumes={resumes} />

        {/* Quick Actions / AI Tools */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="text-violet-600" />
            Premium Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            <Link href="/dashboard/premium/resume-builder" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-all block">
              <FileText className="text-blue-600 mb-4" size={32} />
              <h3 className="font-bold text-gray-900 text-lg mb-2">AI Resume Builder</h3>
              <p className="text-sm text-gray-500">Generate a tailored professional resume from scratch using AI.</p>
            </Link>

            <Link href="/dashboard/premium/resume-editor" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-all block">
              <Edit className="text-violet-600 mb-4" size={32} />
              <h3 className="font-bold text-gray-900 text-lg mb-2">AI Resume Editor</h3>
              <p className="text-sm text-gray-500">Select an existing resume and improve its tone, formatting, and impact.</p>
            </Link>

          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent AI Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="text-blue-600" />
              Recent AI Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.length === 0 && <p className="text-sm text-gray-500">No recent activity.</p>}
              {recentActivity.map(act => (
                <div key={act.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0 border-gray-100">
                  <div className="text-sm font-medium text-gray-800">{act.action}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/>{act.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Generated Resumes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Recent Generated Resumes
            </h2>
            <div className="space-y-4">
              {recentResumes.length === 0 && <p className="text-sm text-gray-500">No generated resumes yet.</p>}
              {recentResumes.map(res => (
                <div key={res.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0 border-gray-100">
                  <div className="text-sm font-medium text-gray-800">{res.title}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/>{res.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

