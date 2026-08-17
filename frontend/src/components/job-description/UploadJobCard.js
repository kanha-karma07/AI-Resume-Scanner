"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { uploadJobDescription } from "@/services/jobDescriptionService";
import { Loader2, Briefcase } from "lucide-react";

export default function UploadJobCard({ refreshJobs }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleUpload = async () => {
    if (!title || !description) {
      toast.error("Please fill all fields");
      return;
    }
    
    setProcessing(true);
    try {
      await uploadJobDescription({ title, description });
      toast.success("Job Description Uploaded");
      setTitle("");
      setDescription("");
      if (refreshJobs) refreshJobs();
    } catch (error) {
      toast.error("Upload Failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Briefcase className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upload Job Description</h2>
          <p className="text-gray-500 text-sm">Add a job description to match candidates against.</p>
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="e.g. Senior Frontend Engineer"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl p-4 outline-none transition-all bg-gray-50 focus:bg-white"
        />

        <textarea
          rows={6}
          placeholder="Paste the full job description here..."
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="w-full border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl p-4 outline-none transition-all bg-gray-50 focus:bg-white resize-y"
        />

        <button
          onClick={handleUpload}
          disabled={processing || !title || !description}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
        >
          {processing ? (
            <><Loader2 size={18} className="animate-spin" /> Uploading...</>
          ) : (
            "Upload Job Description"
          )}
        </button>
      </div>
    </div>
  );
}
