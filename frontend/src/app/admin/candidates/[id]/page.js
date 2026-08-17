"use client";

import { useEffect, useState } from "react";
import { getCandidateDetail } from "@/services/adminService";
import { Loader2, ArrowLeft, Download, Eye, MapPin, Briefcase, GraduationCap, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getCandidateDetail(id);
        setCandidate(res.data);
      } catch (error) {
        toast.error("Failed to load candidate details");
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

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Candidate not found.</p>
        <Link href="/admin/candidates" className="text-blue-600 hover:underline mt-4 inline-block">Back to list</Link>
      </div>
    );
  }

  const { user } = candidate;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/candidates" className="p-2 hover:bg-white rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{user.full_name || "Candidate Details"}</h1>
          <p className="text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Personal Information</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Phone</span>
                <span className="font-medium text-slate-800">{user.phone_number || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Date of Birth</span>
                <span className="font-medium text-slate-800">{candidate.date_of_birth || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Gender</span>
                <span className="font-medium text-slate-800">{candidate.gender || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Address</span>
                <span className="font-medium text-slate-800">{candidate.address || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Subscription</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Plan</span>
                <span className={`px-2 py-1 rounded-md font-medium inline-block ${user.is_premium ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                  {user.plan}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Status</span>
                <span className="font-medium text-slate-800">{user.subscription_status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Academic & Resumes */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Academic & Professional</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{candidate.degree || "Degree not specified"}</p>
                  <p className="text-xs text-slate-500">{candidate.college || "College not specified"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{candidate.experience} Years</p>
                  <p className="text-xs text-slate-500">Total Experience</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Uploaded Resumes ({candidate.resume_count})</h3>
            </div>
            
            <div className="p-0">
              {/* To fully implement resumes, we need resume data included in candidate detail API, or fetch separately. */}
              {/* The current candidate serializer doesn't serialize full resumes, just count. So let's tell user. */}
              <div className="p-6 text-center text-sm text-slate-500">
                To view detailed resumes, navigate to the <Link href={`/admin/resumes?search=${user.email}`} className="text-blue-600 hover:underline">Resumes Module</Link> and filter by this candidate.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
