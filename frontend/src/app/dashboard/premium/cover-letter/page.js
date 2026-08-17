"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Sparkles, Download, Copy, Save } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function CoverLetter() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    jobDescription: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value.trim() !== "" && /^[\d\W_]+$/.test(value.trim())) {
      toast.error("Input must contain alphabetic characters.", { id: 'numeric-error' });
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    for (const [key, value] of Object.entries(formData)) {
      if (value.trim() !== "" && /^[\d\W_]+$/.test(value.trim())) {
        toast.error("Fields cannot contain only numbers or symbols.");
        return;
      }
    }

    const isPremium = localStorage.getItem("isPremium") === "True" || localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.push("/dashboard/premium/payment");
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post("premium/cover-letter/", {
        company_name: formData.companyName,
        role: formData.role,
        job_description: formData.jobDescription
      });
      setCoverLetter(res.data.cover_letter);
      toast.success("Cover Letter Generated!");
    } catch (err) {
      toast.error("Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
            
        <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-grow">
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 print:hidden">
          <div className="flex items-center gap-3">
            <Mail className="text-teal-500" size={32}/>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cover Letter Generator</h1>
              <p className="text-sm text-gray-500">Generate a highly targeted cover letter based on your resume and the job description.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
          
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 print:hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3">Job Details</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Google, Microsoft, Startup Inc..." 
                  className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 border focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Job Title / Role</label>
                <input 
                  type="text" 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Developer" 
                  className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 border focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Job Description (Optional but recommended)</label>
                <textarea 
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  placeholder="Paste the job description here for better targeting..." 
                  className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 border focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none h-48"
                />
              </div>

              <button 
                type="submit" 
                disabled={generating || !formData.companyName || !formData.role}
                className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {generating ? <span className="animate-spin">↻</span> : <Sparkles size={18} />}
                Generate Cover Letter
              </button>
            </form>
          </div>

          {/* Result */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full min-h-[600px] flex flex-col print:border-none print:shadow-none print:block">
            
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center rounded-t-2xl print:hidden">
              <h3 className="font-bold text-gray-700">Preview</h3>
              {coverLetter && (
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 bg-white border text-gray-700 rounded shadow-sm text-sm font-bold hover:bg-gray-50">
                    <Copy size={14}/> Copy
                  </button>
                  <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded shadow-sm text-sm font-bold hover:bg-black">
                    <Download size={14}/> Download PDF
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-8 flex-grow print:p-0">
              {coverLetter ? (
                <textarea 
                  className="w-full h-full min-h-[500px] border-none outline-none resize-none bg-transparent whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans print:overflow-visible print:h-auto"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 print:hidden">
                  <Mail size={48} className="opacity-20" />
                  <p>Your generated cover letter will appear here.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
);
}

