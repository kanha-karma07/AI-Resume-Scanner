"use client";

import { useEffect, useState } from "react";
import { getRecruiterDetail } from "@/services/adminService";
import { Loader2, ArrowLeft, Building2, CreditCard, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RecruiterDetail() {
  const { id } = useParams();
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getRecruiterDetail(id);
        setRecruiter(res.data);
      } catch (error) {
        toast.error("Failed to load recruiter details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!recruiter) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Recruiter not found.</p>
        <Link href="/admin/recruiters" className="text-blue-600 hover:underline mt-4 inline-block">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/recruiters" className="p-2 hover:bg-white rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{recruiter.full_name || "Recruiter Details"}</h1>
          <p className="text-slate-500">{recruiter.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Profile info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              Company Information
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Company Name</span>
                <span className="font-medium text-slate-800">{recruiter.company_name || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Phone Number</span>
                <span className="font-medium text-slate-800">{recruiter.phone_number || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Joined Date</span>
                <span className="font-medium text-slate-800">{new Date(recruiter.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Subscription & Metrics */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-purple-600" />
              Subscription Status
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Plan</span>
                <span className={`px-2 py-1 rounded-md font-medium inline-block ${recruiter.is_premium ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                  {recruiter.plan}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Status</span>
                <span className="font-medium text-slate-800">{recruiter.subscription_status}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <LinkIcon size={18} className="text-teal-600" />
              Quick Links
            </h3>
            <div className="flex flex-col gap-3">
              <Link 
                href={`/admin/job-descriptions?search=${recruiter.full_name}`}
                className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                View all Job Descriptions by this recruiter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
