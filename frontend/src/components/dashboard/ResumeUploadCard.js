"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { uploadResume } from "@/services/resumeService";

const LOADING_MESSAGES = [
  "Extracting text from your resume...",
  "Analyzing skills and experience...",
  "Calculating your ATS score...",
  "Almost done..."
];

export default function ResumeUploadCard({ onUploadSuccess }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    let interval;
    if (processing) {
      setLoadingMsgIdx(0);
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [processing]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a resume");
      return;
    }
    setProcessing(true);

    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("resume_file", file);

    try {
      const res = await uploadResume(formData);
      toast.success("Resume Uploaded Successfully");
      setFile(null);
      if (onUploadSuccess) {
        await onUploadSuccess(res.data);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("We couldn't read the text in this PDF. Try re-saving it as a standard text-based PDF and upload again.");
      } else {
        toast.error("Upload Failed. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Upload className="text-blue-600" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Upload Resume</h2>
          <p className="text-gray-500">Upload your latest resume and let AI analyze it.</p>
        </div>
      </div>

      <label className="border-2 border-dashed border-blue-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
        <Upload size={50} className="text-blue-600 mb-4" />
        <p className="text-lg font-semibold">Drag & Drop Resume Here</p>
        <p className="text-gray-500 mt-2">or click to browse</p>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>

      {file && (
        <div className="mt-6 bg-gray-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" />
            <span className="font-medium truncate max-w-[200px] md:max-w-md">{file.name}</span>
          </div>
          <span className="text-emerald-600 font-semibold text-sm">Ready</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || processing}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:scale-100 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
      >
        {processing ? (
          <>
            <span className="animate-spin text-xl">↻</span> 
            <span>{LOADING_MESSAGES[loadingMsgIdx]}</span>
          </>
        ) : (
          <><Sparkles size={20} /> Analyze Resume with AI</>
        )}
      </button>
    </div>
  );
}
