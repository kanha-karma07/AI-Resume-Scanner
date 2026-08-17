"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/services/profileService";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Edit2, Camera, User, Briefcase, GraduationCap, MapPin, Link as LinkIcon, Code2, Loader2, Phone, Calendar, Users, Home } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    address: "",
    college: "",
    degree: "",
    experience: "",
    linkedin: "",
    github: "",
    portfolio: "",
    bio: "",
  });
  const [initialFormData, setInitialFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [backLink, setBackLink] = useState("/dashboard");
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  useEffect(() => {
    fetchProfile();
    const isPremium = localStorage.getItem("isPremium");
    if (isPremium === "true" || isPremium === "True") {
      setBackLink("/dashboard/premium");
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      const fetchedData = {
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        email: response.data.email || "",
        phone_number: response.data.phone_number || "",
        date_of_birth: response.data.date_of_birth || "",
        gender: response.data.gender || "",
        address: response.data.address || "",
        college: response.data.college || "",
        degree: response.data.degree || "",
        experience: response.data.experience !== null && response.data.experience !== undefined ? response.data.experience : "",
        linkedin: response.data.linkedin || "",
        github: response.data.github || "",
        portfolio: response.data.portfolio || "",
        bio: response.data.bio || "",
      };
      setFormData(fetchedData);
      setInitialFormData(fetchedData);
      setErrors({});
    } catch (error) {
      toast.error("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WebP images are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      if (errors.profile_image) {
        setErrors({ ...errors, profile_image: null });
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors({});

      const validationErrors = {};
      if (formData.college && /^[\d\W_]+$/.test(formData.college.trim())) {
        validationErrors.college = "College cannot contain only numbers or symbols.";
      }
      if (formData.degree && /^[\d\W_]+$/.test(formData.degree.trim())) {
        validationErrors.degree = "Degree cannot contain only numbers or symbols.";
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error("Please fix the validation errors");
        setIsSaving(false);
        return;
      }

      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (initialFormData && formData[key] !== initialFormData[key]) {
          const value = typeof formData[key] === "string" ? formData[key].trim() : formData[key];
          if (value !== "") {
            data.append(key, value);
          }
        }
      });

      if (selectedImage) {
        data.append("profile_image", selectedImage);
      }

      await updateProfile(data);
      toast.success("Profile Updated Successfully");
      setIsEditing(false);
      setSelectedImage(null);
      setImageTimestamp(Date.now());
      await fetchProfile();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        setErrors(errorData);
        toast.error("Please fix the validation errors");
      } else {
        toast.error("Profile Update Failed");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return <LoadingSpinner message="Loading Profile..." fullScreen />;
  }

  const renderInputError = (field) => {
    if (!errors[field]) return null;
    return <p className="text-red-500 text-sm mt-1">{Array.isArray(errors[field]) ? errors[field][0] : errors[field]}</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-grow">
        <div className="flex items-center justify-between">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium bg-white px-4 py-2 rounded-xl shadow-sm"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <button
            onClick={() => {
              if (isEditing) {
                fetchProfile();
                setSelectedImage(null);
              }
              setIsEditing(!isEditing);
            }}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditing 
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 shadow-md"
            }`}
          >
            {isEditing ? "Cancel Edit" : <><Edit2 size={18} /> Edit Profile</>}
          </button>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100 mt-6">
          <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex flex-col items-center -mt-24 mb-6">
              <div className="relative group">
                <img
                  src={
                    selectedImage
                      ? URL.createObjectURL(selectedImage)
                      : profile.profile_image
                        ? (profile.profile_image.startsWith('/') 
                            ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '')}${profile.profile_image}`
                            : profile.profile_image) + `?t=${imageTimestamp}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.first_name || profile.username)}&background=0D8ABC&color=fff`
                  }
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-lg bg-white"
                />
                {isEditing && (
                  <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg hover:scale-105 transition-all">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              {renderInputError("profile_image")}
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {(profile.first_name || profile.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : profile.username}
              </h1>
              <p className="text-gray-500 mt-1 flex items-center justify-center gap-2">
                <User size={16} /> {profile.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="text-blue-600" /> Personal Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  {isEditing ? (
                    <div>
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                      {renderInputError("first_name")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.first_name || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  {isEditing ? (
                    <div>
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                      {renderInputError("last_name")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.last_name || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">Email</label>
                  {isEditing ? (
                    <div>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                      {renderInputError("email")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.email || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1"><Phone size={14}/> Phone Number</label>
                  {isEditing ? (
                    <div>
                      <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="10 digits" />
                      {renderInputError("phone_number")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.phone_number || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1"><Calendar size={14}/> Date of Birth</label>
                  {isEditing ? (
                    <div>
                      <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                      {renderInputError("date_of_birth")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.date_of_birth || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1"><Users size={14}/> Gender</label>
                  {isEditing ? (
                    <div>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {renderInputError("gender")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.gender || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1"><Home size={14}/> Address</label>
                  {isEditing ? (
                    <div>
                      <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none" />
                      {renderInputError("address")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.address || "Not specified"}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <GraduationCap className="text-blue-600" /> Education & Experience
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">College/University</label>
                  {isEditing ? (
                    <div>
                      <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                      {renderInputError("college")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.college || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Degree</label>
                  {isEditing ? (
                    <div>
                      <input type="text" name="degree" value={formData.degree} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                      {renderInputError("degree")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.degree || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1"><Briefcase size={14}/> Experience (Years)</label>
                  {isEditing ? (
                    <div>
                      <input type="number" min="0" name="experience" value={formData.experience} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                      {renderInputError("experience")}
                    </div>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.experience !== null && profile.experience !== undefined && profile.experience !== "" ? `${profile.experience} Years` : "Not specified"}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="text-blue-600" /> Professional Bio
              </h3>
              
              {isEditing ? (
                <div>
                  <textarea rows={4} name="bio" value={formData.bio} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none" placeholder="Tell us about yourself..." />
                  {renderInputError("bio")}
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-2xl">{profile.bio || "No bio added yet."}</p>
              )}
            </div>
            
            {isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-75 disabled:scale-100"
                >
                  {isSaving ? <><Loader2 className="animate-spin" size={20}/> Saving...</> : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Social Links</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2"><LinkIcon size={14} className="text-blue-600"/> LinkedIn</label>
                  {isEditing ? (
                    <div>
                      <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
                      {renderInputError("linkedin")}
                    </div>
                  ) : (
                    <a href={profile.linkedin || "#"} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                      {profile.linkedin || "Not provided"}
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2"><Code2 size={14} className="text-gray-800"/> GitHub</label>
                  {isEditing ? (
                    <div>
                      <input type="url" name="github" value={formData.github} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all outline-none" />
                      {renderInputError("github")}
                    </div>
                  ) : (
                    <a href={profile.github || "#"} target="_blank" rel="noreferrer" className="text-gray-800 hover:underline font-medium break-all">
                      {profile.github || "Not provided"}
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2"><MapPin size={14} className="text-purple-600"/> Portfolio</label>
                  {isEditing ? (
                    <div>
                      <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none" />
                      {renderInputError("portfolio")}
                    </div>
                  ) : (
                    <a href={profile.portfolio || "#"} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline font-medium break-all">
                      {profile.portfolio || "Not provided"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
