"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Mail, Shield, Phone, Edit, Settings, Check, X } from "lucide-react";
import api from "../../../services/api";
import { toast } from "react-hot-toast";

export default function RecruiterProfilePage() {
  const [profile, setProfile] = useState({
    name: "Loading...",
    email: "Loading...",
    role: "recruiter",
    phone: "",
    company_name: "",
    is_premium: false
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    company_name: ""
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("recruiter/profile/");
      setProfile({
        name: res.data.full_name || "Recruiter",
        email: res.data.email || "",
        role: res.data.role || "recruiter",
        phone: res.data.phone_number || "",
        company_name: res.data.company_name || "",
        is_premium: res.data.is_premium
      });
      setFormData({
        name: res.data.full_name || "",
        phone: res.data.phone_number || "",
        company_name: res.data.company_name || ""
      });
    } catch (err) {
      toast.error("Failed to load profile");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchProfile();
    })();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Recruiter Name is required.");
        return;
      }
      if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(formData.name.trim())) {
        toast.error("Recruiter Name can only contain alphabets and spaces.");
        return;
      }
      
      const payload = {
        full_name: formData.name,
        phone_number: formData.phone
      };
      
      if (formData.company_name !== undefined) {
          if (!formData.company_name.trim()) {
            toast.error("Company Name is required.");
            return;
          }
          if (/^[\d\W_]+$/.test(formData.company_name.trim())) {
             toast.error("Company Name cannot contain only numbers or symbols.");
             return;
          }
          payload.company_name = formData.company_name;
      }

      await api.put("recruiter/profile/", payload);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-grow">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-2">Manage your account and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-violet-600"></div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl">
                {profile.name.charAt(0)}
              </div>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-2">
                <Edit size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-2">
                  <X size={16} /> Cancel
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                  <Check size={16} /> Save
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent w-full max-w-sm pb-1"
                  placeholder="Enter full name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              )}
              <p className="text-gray-500 capitalize">{profile.role}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact Information</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      className="border-b border-gray-300 focus:border-blue-500 outline-none w-full max-w-xs"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <span>{profile.phone || "Not provided"}</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Account Settings</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span>Role: {profile.role} ({profile.is_premium ? "Premium Access" : "Free Tier"})</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Settings className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.company_name} 
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                      className="border-b border-gray-300 focus:border-blue-500 outline-none w-full max-w-xs"
                      placeholder="Company Name"
                    />
                  ) : (
                    <span>{profile.company_name || "Company Not Provided"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
