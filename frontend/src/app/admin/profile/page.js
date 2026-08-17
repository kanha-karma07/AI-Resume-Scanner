"use client";

import { useEffect, useState } from "react";
import { getAdminProfile } from "@/services/adminService";
import { Loader2, ShieldCheck, Mail, User, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getAdminProfile();
        setProfile(res.data);
      } catch (error) {
        toast.error("Failed to load admin profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Profile</h1>
        <p className="text-slate-500">Your administrative account details</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="flex justify-between items-end -mt-12 mb-8">
            <div className="w-24 h-24 bg-white rounded-full p-2 shadow-lg">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-blue-600 border border-slate-200">
                <ShieldCheck size={40} />
              </div>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wider rounded-full flex items-center gap-1 mb-2 border border-red-200">
              <ShieldCheck size={14} /> System Admin
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{profile?.full_name || "System Administrator"}</h2>
              <p className="text-slate-500">{profile?.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <User size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Username</p>
                  <p className="font-semibold text-slate-800">{profile?.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="font-semibold text-slate-800">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 md:col-span-2">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Calendar size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Created</p>
                  <p className="font-semibold text-slate-800">{new Date(profile?.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
