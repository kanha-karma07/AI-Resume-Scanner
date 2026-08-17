"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/dashboard/Navbar";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import ResumeUploadCard from "@/components/dashboard/ResumeUploadCard";
import ResumeList from "@/components/dashboard/ResumeList";
import { getResumes } from "@/services/resumeService";
import { getProfile } from "@/services/profileService";
import StatsCards from "@/components/dashboard/StatsCards";
import { Activity, Zap, CheckCircle, Lightbulb, AlertCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";

const GENERIC_TIPS = [
  "Tailor your resume for each specific job description to significantly boost your ATS match score!",
  "Keep your resume formatting simple and avoid complex tables or images so the ATS can read it easily.",
  "Use strong action verbs like 'Engineered', 'Optimized', and 'Directed' to describe your experience."
];

export default function DashboardPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState(0);
  const [fetchError, setFetchError] = useState(false);
  const [dynamicTip, setDynamicTip] = useState(GENERIC_TIPS[0]);

  const fetchResumes = async () => {
    try {
      setFetchError(false);
      const response = await getResumes();
      setResumes(response.data);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      const profileRes = await getProfile();
      const profile = profileRes.data;
      
      const fields = [
        profile.first_name,
        profile.last_name,
        profile.phone_number,
        profile.location,
        profile.bio,
        profile.linkedin_url,
        profile.github_url,
        profile.portfolio_url
      ];
      
      const filled = fields.filter(f => f && String(f).trim().length > 0).length;
      const percentage = Math.round((filled / fields.length) * 100);
      setCompletion(percentage);
    } catch (error) {
      console.error("Failed to fetch profile data", error);
      setCompletion(0);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchProfileData();
  }, []);

  const latestResume = resumes.length > 0 ? resumes[0] : null;

  useEffect(() => {
    if (latestResume) {
      if (latestResume.missing_skills && latestResume.missing_skills.length > 0) {
        setDynamicTip(`Your last scan showed you're missing '${latestResume.missing_skills[0]}' — consider adding relevant experience or projects.`);
      } else if (latestResume.ats_score && latestResume.ats_score < 60) {
        setDynamicTip(`Your latest ATS score is ${latestResume.ats_score}%. Try focusing on matching exact keywords from the job description to improve it.`);
      } else {
        setDynamicTip("Great job! Your resume looks strong. Keep updating it as you gain new skills.");
      }
    } else {
      // Rotate generic tips if no resume
      const randomTip = GENERIC_TIPS[Math.floor(Math.random() * GENERIC_TIPS.length)];
      setDynamicTip(randomTip);
    }
  }, [latestResume]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-grow space-y-8">
        
        <WelcomeCard />

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {fetchError ? (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                <AlertCircle className="text-red-500 w-12 h-12 mb-4" />
                <h3 className="text-xl font-bold text-red-900 mb-2">We couldn't load your data right now.</h3>
                <p className="text-red-700 mb-6">Please check your connection and try again.</p>
                <button 
                  onClick={() => { setLoading(true); fetchResumes(); fetchProfileData(); }}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition"
                >
                  <RefreshCcw size={18} /> Retry
                </button>
              </div>
            ) : (
              <>
                <StatsCards resumes={resumes} />
                <ResumeUploadCard onUploadSuccess={fetchResumes} />
                <ResumeList resumes={resumes} onDeleteSuccess={fetchResumes} />
              </>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Latest ATS Score / Resume Status */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Latest Scan Status</h3>
              {latestResume ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Status</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      {latestResume.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">ATS Score</span>
                    <span className={`text-lg font-bold ${latestResume.ats_score >= 80 ? 'text-emerald-600' : latestResume.ats_score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                      {latestResume.ats_score}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No resumes scanned yet.</p>
              )}
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-blue-600" size={20} />
                Profile Completion
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${completion}%`, transition: 'width 1s ease-in-out' }}></div>
              </div>
              <p className="text-xs text-gray-500 text-right">{completion}% Completed</p>
              <Link href="/dashboard/profile" className="mt-4 block text-center text-sm text-blue-600 font-semibold hover:underline">
                Complete your profile
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="text-amber-500" size={20} />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link href="/dashboard/premium" className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition">
                  Upgrade to Premium
                </Link>
                <Link href="/dashboard/history" className="block w-full text-center px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                  View Scan History
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="text-emerald-500" size={20} />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {fetchError ? (
                  <p className="text-sm text-red-500">Failed to load activity.</p>
                ) : (
                  <>
                    {resumes.slice(0, 3).map((res) => (
                      <div key={res.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0 border-gray-100">
                        <span className="text-sm font-medium text-gray-800 truncate pr-4 max-w-[150px]">{res.title}</span>
                        <span className="text-xs text-gray-500">{new Date(res.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                    {resumes.length === 0 && <p className="text-sm text-gray-500">No recent activity.</p>}
                  </>
                )}
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-[-10px] right-[-10px] opacity-10">
                <Lightbulb size={100} />
              </div>
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 relative z-10">
                <Lightbulb className="text-blue-600" size={20} />
                Pro Tip
              </h3>
              <p className="text-sm text-blue-800 relative z-10">
                {dynamicTip}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

