"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Save, Check, Undo, Redo, Download, Edit, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { uploadResume } from "@/services/resumeService";
import { normalizeResumeData } from "@/utils/resumeNormalizer";

export default function ResumeEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSwitchingResume, setIsSwitchingResume] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  
  const [activeAccordion, setActiveAccordion] = useState("Personal");
  const [aiInstructions, setAiInstructions] = useState({});
  
  // History State for Undo/Redo
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const previewRef = useRef(null);

  useEffect(() => {
    // Premium check
    const isPremium = localStorage.getItem("isPremium") === "True" || localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.push("/dashboard/premium/payment");
      return;
    }
    fetchResumes();
  }, []);

  useEffect(() => {
    if (autoId && resumes.length > 0 && selectedResumeId !== autoId) {
      handleSelectResume(autoId);
    }
  }, [autoId, resumes]);

  const fetchResumes = async () => {
    try {
      const res = await api.get("candidate/resume/");
      setResumes(res.data);
    } catch (err) {
      toast.error("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = async (id) => {
    setSelectedResumeId(id);
    
    if (!id) {
      setHistory([]);
      setCurrentIndex(-1);
      return;
    }
    
    setIsSwitchingResume(true);
    try {
      const res = await api.get(`candidate/resume/${id}/detail/`);
      let parsedData = res.data.parsed_text;
      
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch(e) {
          toast.error("This resume is not in JSON format. Please use a resume built with the AI Builder.");
          setSelectedResumeId("");
          setIsSwitchingResume(false);
          return;
        }
      }
      
      const normalizedData = normalizeResumeData(parsedData);
      setHistory([normalizedData]);
      setCurrentIndex(0);
    } catch (err) {
      toast.error("Failed to load resume details");
      setSelectedResumeId("");
    } finally {
      setIsSwitchingResume(false);
    }
  };

  const handleInlineUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("resume_file", file);
    
    try {
      const res = await uploadResume(formData);
      toast.success("Resume uploaded and parsed successfully!");
      // Fetch latest list
      const listRes = await api.get("candidate/resume/");
      setResumes(listRes.data);
      // Select the new resume automatically
      if (res.data && res.data.id) {
         handleSelectResume(res.data.id);
      }
    } catch (err) {
      toast.error("Failed to upload resume.");
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  const handleManualEdit = (sectionName, field, value, index = null, arrayField = null) => {
    const effectiveField = arrayField || field || sectionName;
    const stringValue = Array.isArray(value) ? value.join(" ") : String(value);

    if (effectiveField === 'phone') {
      if (/[A-Za-z]/.test(stringValue)) {
        toast.error("Phone number cannot contain alphabets.", { id: 'phone-alpha' });
        return;
      }
      if (stringValue.trim().startsWith("2")) {
        toast.error("Phone number cannot start with '2'.", { id: 'phone-start' });
        return;
      }
    } else if (effectiveField !== 'date' && effectiveField !== 'email' && effectiveField !== 'linkedin' && effectiveField !== 'github' && effectiveField !== 'portfolio') {
      if (stringValue.trim() !== "" && /^[\d\W_]+$/.test(stringValue.trim())) {
        toast.error("Text fields must contain alphabetic characters.", { id: 'text-numeric' });
        return;
      }
    }

    const newData = JSON.parse(JSON.stringify(history[currentIndex]));
    
    if (index !== null) {
      if (arrayField) {
        if (!newData[sectionName][index]) newData[sectionName][index] = {};
        newData[sectionName][index][arrayField] = value;
      } else {
        newData[sectionName][index] = value;
      }
    } else {
      if (sectionName === 'personalDetails') {
        if (!newData.personalDetails) newData.personalDetails = {};
        newData.personalDetails[field] = value;
      } else if (field) {
        newData[sectionName] = value;
      } else {
        newData[sectionName] = value;
      }
    }
    
    const newHistory = [...history];
    newHistory[currentIndex] = newData;
    setHistory(newHistory);
  };

  const handleEnhance = async (targetSection, customInstruction) => {
    if (!selectedResumeId || currentIndex === -1) return;
    
    setProcessing(true);
    try {
      const res = await api.post(`candidate/resume/${selectedResumeId}/edit/`, {
        section: targetSection.toLowerCase(),
        instruction: customInstruction
      });
      
      const newResumeData = res.data.improved_text;
      const normalizedData = normalizeResumeData(newResumeData);
      
      // Update history (slice to remove any redos if we branched)
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(normalizedData);
      
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      toast.success(`AI Analysis Complete! ${targetSection} updated.`);
    } catch (err) {
      toast.error(err.response?.data?.error || "AI Enhancement failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const currentData = history[currentIndex];
      const res = await api.post(`candidate/resume/${selectedResumeId}/confirm-update/`, {
        updated_text: currentData
      });
      toast.success("Resume updated and saved to history!");
      fetchResumes(); // Refresh to show new AI Updated resume in dropdown
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save updates");
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadDOCX = () => {
    if (!previewRef.current) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>Export HTML to Word Document</title>" +
            "<style>" +
            "body { font-family: 'Arial', sans-serif; font-size: 11pt; color: #333; line-height: 1.5; }" +
            "h1 { font-size: 20pt; margin-bottom: 5px; color: #111; text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }" +
            "h2 { font-size: 14pt; color: #111; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 15px; margin-bottom: 10px; text-transform: uppercase; }" +
            "h3 { font-size: 12pt; font-weight: bold; margin-bottom: 2px; color: #222; }" +
            "p { margin: 0 0 5px 0; }" +
            "ul { margin-top: 5px; margin-bottom: 10px; padding-left: 20px; }" +
            "li { margin-bottom: 4px; }" +
            ".contact-info { text-align: center; margin-bottom: 20px; font-size: 10pt; color: #555; }" +
            ".flex-between { display: flex; justify-content: space-between; }" +
            "</style>" +
            "</head><body>";
            
    const htmlContent = document.getElementById("resume-content").innerHTML;
    const footer = "</body></html>";
    const sourceHTML = header + htmlContent + footer;
    
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    downloadLink.href = url;
    downloadLink.download = 'Professional_Resume.doc';
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("DOCX Downloaded");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-20 animate-pulse text-gray-500">
        Loading AI Editor...
      </div>
    );
  }

  const generatedData = history[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Print Styles for A4 PDF Export */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #resume-preview-container, #resume-preview-container * { visibility: visible; }
          #resume-preview-container { 
            position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; margin: 0 !important;
            border: none !important; box-shadow: none !important; background: white;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="max-w-[1600px] mx-auto p-4 md:p-8 w-full flex-grow no-print">
        
        {/* Top Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 pr-4 lg:border-r border-gray-200">
              <Edit className="text-violet-600" size={24}/>
              <h1 className="text-lg font-bold text-gray-900 hidden sm:block">AI Editor</h1>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select 
                className="w-full sm:w-64 border border-gray-300 rounded-lg p-2.5 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-violet-500"
                value={selectedResumeId}
                onChange={(e) => handleSelectResume(e.target.value)}
                disabled={uploading || isSwitchingResume}
              >
                <option value="">-- Select a Resume --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
              
              <label className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${uploading ? 'bg-gray-200 text-gray-500' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}>
                {uploading ? (
                  <><span className="animate-spin">↻</span> Uploading...</>
                ) : (
                  <><Upload size={18} /> Upload Resume</>
                )}
                <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleInlineUpload} disabled={uploading || isSwitchingResume} />
              </label>
            </div>
          </div>

          {selectedResumeId && generatedData && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
               <button onClick={handleUndo} disabled={currentIndex <= 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700" title="Undo"><Undo size={20}/></button>
               <button onClick={handleRedo} disabled={currentIndex >= history.length - 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 text-gray-700 mr-2" title="Redo"><Redo size={20}/></button>
               
               <button onClick={handleDownloadDOCX} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm text-sm font-bold hover:bg-gray-50 transition-colors whitespace-nowrap">
                 <Download size={16}/> DOCX
               </button>
               <button onClick={handlePrintPDF} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg shadow-sm text-sm font-bold hover:bg-violet-700 transition-colors whitespace-nowrap">
                 <Download size={16}/> PDF
               </button>
            </div>
          )}
        </div>

        {selectedResumeId && isSwitchingResume ? (
          <div className="flex items-center justify-center p-20 animate-pulse text-gray-500 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner">
            Loading Resume Data...
          </div>
        ) : selectedResumeId && generatedData ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column: Live Preview (8 cols) */}
            <div className="xl:col-span-8 bg-gray-300 rounded-2xl shadow-inner p-4 md:p-8 flex flex-col items-center overflow-x-auto relative">
              
              <div className="w-full max-w-[210mm] flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-gray-700">Live Preview</h3>
                  {history.length > 1 && (
                    <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-1 rounded">
                      Unsaved Edits ({currentIndex})
                    </span>
                  )}
                </div>
              </div>
              
              {/* ATS A4 Paper */}
              <div 
                id="resume-preview-container"
                ref={previewRef}
                className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-[15mm] text-gray-900 mx-auto transition-all"
                style={{ boxSizing: 'border-box' }}
              >
                <div id="resume-content" className="w-full h-full text-[11pt] leading-snug font-sans group">
                  
                  {/* Header / Personal Details */}
                  <div className="text-center mb-6 border-b-2 border-gray-900 pb-4">
                    <div className="text-3xl font-black uppercase tracking-wider mb-2 text-black">
                      {generatedData.personalDetails?.name || "YOUR NAME"}
                    </div>
                    <div className="text-sm text-gray-700 flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {['email', 'phone', 'location', 'linkedin', 'github', 'portfolio'].map(field => (
                         generatedData.personalDetails?.[field] && (
                           <span key={field}>{generatedData.personalDetails[field]}</span>
                         )
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {(generatedData.summary || generatedData.objective) && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 text-gray-900">Professional Summary</h2>
                      <div className="text-justify text-gray-800 whitespace-pre-wrap">
                        {generatedData.summary || generatedData.objective}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {generatedData.skills && generatedData.skills.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 text-gray-900">Technical Skills</h2>
                      <div className="text-sm text-gray-800 leading-relaxed font-semibold">
                        {Array.isArray(generatedData.skills) ? generatedData.skills.join(" • ") : String(generatedData.skills)}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {generatedData.experience && Array.isArray(generatedData.experience) && generatedData.experience.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3 text-gray-900">Experience</h2>
                      {generatedData.experience.map((exp, idx) => (
                        <div key={idx} className="mb-4">
                          <div className="flex justify-between items-baseline font-bold text-gray-900">
                            <div className="text-[12pt]">{exp.title}</div>
                            <div className="text-sm text-gray-600">{exp.date}</div>
                          </div>
                          <div className="text-gray-800 font-semibold mb-1 italic">{exp.company}</div>
                          <ul className="list-disc list-outside ml-5 text-gray-800 space-y-1">
                            {Array.isArray(exp.description) ? exp.description.map((desc, dIdx) => (
                               <li key={dIdx}>{desc}</li>
                            )) : <li>{exp.description}</li>}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {generatedData.projects && Array.isArray(generatedData.projects) && generatedData.projects.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3 text-gray-900">Projects</h2>
                      {generatedData.projects.map((proj, idx) => (
                        <div key={idx} className="mb-3">
                          <div className="flex justify-between items-baseline font-bold text-gray-900">
                            <div className="text-[12pt] flex gap-2">
                              {proj.title}
                              <span className="font-normal text-gray-600">| {proj.technologies}</span>
                            </div>
                            <div className="text-sm text-gray-600">{proj.date}</div>
                          </div>
                          <ul className="list-disc list-outside ml-5 mt-1 text-gray-800 space-y-1">
                            {Array.isArray(proj.description) ? proj.description.map((desc, dIdx) => (
                               <li key={dIdx}>{desc}</li>
                            )) : <li>{proj.description}</li>}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {generatedData.education && Array.isArray(generatedData.education) && generatedData.education.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3 text-gray-900">Education</h2>
                      {generatedData.education.map((edu, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="flex justify-between items-baseline font-bold text-gray-900">
                            <div>{edu.degree}</div>
                            <div className="text-sm text-gray-600">{edu.date}</div>
                          </div>
                          <div className="text-gray-800 italic">{edu.institution}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                     {/* Certifications */}
                     {generatedData.certifications && Array.isArray(generatedData.certifications) && generatedData.certifications.length > 0 && (
                       <div>
                         <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 text-gray-900">Certifications</h2>
                         <ul className="list-disc list-outside ml-5 text-gray-800">
                           {generatedData.certifications.map((cert, idx) => (
                             <li key={idx}>
                               <span className="font-semibold">{cert.name}</span>
                               {cert.issuer && <span> - {cert.issuer}</span>}
                             </li>
                           ))}
                         </ul>
                       </div>
                     )}
                     
                     {/* Languages */}
                     {generatedData.languages && Array.isArray(generatedData.languages) && generatedData.languages.length > 0 && (
                       <div>
                         <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 text-gray-900">Languages</h2>
                         <ul className="list-disc list-outside ml-5 text-gray-800">
                           {generatedData.languages.map((lang, idx) => (
                             <li key={idx}>{lang}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column: Editor Panel (4 cols) */}
            <div className="xl:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-200 h-[calc(100vh-140px)] sticky top-6 overflow-hidden flex flex-col">
              
              <div className="p-4 border-b bg-gray-50 flex flex-col items-center justify-center text-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit className="text-violet-600" size={20}/>
                  Manual & AI Editor
                </h2>
                <p className="text-xs text-violet-700 mt-1">Edit fields manually or use AI to rewrite sections.</p>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-100">
                {/* Accordion Items */}
                
                {/* Personal Details */}
                <div className="border-b border-gray-200">
                  <button onClick={() => setActiveAccordion(activeAccordion === "Personal" ? null : "Personal")} className="w-full flex justify-between p-4 bg-white hover:bg-gray-50 font-bold text-gray-800">
                    Personal Details <span className="text-gray-400">{activeAccordion === "Personal" ? '▼' : '▶'}</span>
                  </button>
                  {activeAccordion === "Personal" && (
                    <div className="p-4 bg-gray-50 space-y-3 border-t border-gray-100">
                       <input placeholder="Name" className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-violet-500" value={generatedData.personalDetails?.name || ""} onChange={(e) => handleManualEdit('personalDetails', 'name', e.target.value)} />
                       <input placeholder="Email" className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-violet-500" value={generatedData.personalDetails?.email || ""} onChange={(e) => handleManualEdit('personalDetails', 'email', e.target.value)} />
                       <input placeholder="Phone" className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-violet-500" value={generatedData.personalDetails?.phone || ""} onChange={(e) => handleManualEdit('personalDetails', 'phone', e.target.value)} />
                       <input placeholder="Location" className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-violet-500" value={generatedData.personalDetails?.location || ""} onChange={(e) => handleManualEdit('personalDetails', 'location', e.target.value)} />
                       <input placeholder="LinkedIn URL" className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-violet-500" value={generatedData.personalDetails?.linkedin || ""} onChange={(e) => handleManualEdit('personalDetails', 'linkedin', e.target.value)} />
                       <input placeholder="GitHub URL" className="w-full p-2 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-violet-500" value={generatedData.personalDetails?.github || ""} onChange={(e) => handleManualEdit('personalDetails', 'github', e.target.value)} />
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="border-b border-gray-200">
                  <button onClick={() => setActiveAccordion(activeAccordion === "Summary" ? null : "Summary")} className="w-full flex justify-between p-4 bg-white hover:bg-gray-50 font-bold text-gray-800">
                    Professional Summary <span className="text-gray-400">{activeAccordion === "Summary" ? '▼' : '▶'}</span>
                  </button>
                  {activeAccordion === "Summary" && (
                    <div className="p-4 bg-gray-50 space-y-3 border-t border-gray-100">
                       <textarea rows={5} className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={generatedData.summary || generatedData.objective || ""} onChange={(e) => handleManualEdit('summary', null, e.target.value)} />
                       
                       <div className="mt-2 p-3 bg-violet-50 rounded-lg border border-violet-100">
                         <label className="text-xs font-bold text-violet-800 mb-1 block">✨ AI Improve Summary</label>
                         <div className="flex gap-2">
                           <input type="text" placeholder="e.g. Make it more impactful" className="flex-1 text-sm border-gray-300 rounded p-2 outline-none focus:ring-1 focus:ring-violet-500" onChange={e => setAiInstructions({...aiInstructions, summary: e.target.value})} />
                           <button onClick={() => handleEnhance("summary", aiInstructions.summary || "Improve professional tone")} disabled={processing} className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded text-sm font-bold shadow transition-colors whitespace-nowrap">AI Rewrite</button>
                         </div>
                       </div>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="border-b border-gray-200">
                  <button onClick={() => setActiveAccordion(activeAccordion === "Skills" ? null : "Skills")} className="w-full flex justify-between p-4 bg-white hover:bg-gray-50 font-bold text-gray-800">
                    Technical Skills <span className="text-gray-400">{activeAccordion === "Skills" ? '▼' : '▶'}</span>
                  </button>
                  {activeAccordion === "Skills" && (
                    <div className="p-4 bg-gray-50 space-y-3 border-t border-gray-100">
                       <textarea rows={4} placeholder="Comma separated skills" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={generatedData.skills ? generatedData.skills.join(", ") : ""} onChange={(e) => handleManualEdit('skills', null, e.target.value.split(',').map(s=>s.trim()))} />
                       
                       <div className="mt-2 p-3 bg-violet-50 rounded-lg border border-violet-100">
                         <label className="text-xs font-bold text-violet-800 mb-1 block">✨ AI Improve Skills</label>
                         <div className="flex gap-2">
                           <input type="text" placeholder="e.g. Optimize for ATS keywords" className="flex-1 text-sm border-gray-300 rounded p-2 outline-none focus:ring-1 focus:ring-violet-500" onChange={e => setAiInstructions({...aiInstructions, skills: e.target.value})} />
                           <button onClick={() => handleEnhance("skills", aiInstructions.skills || "Optimize skills for ATS")} disabled={processing} className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded text-sm font-bold shadow transition-colors whitespace-nowrap">AI Rewrite</button>
                         </div>
                       </div>
                    </div>
                  )}
                </div>

                {/* Experience */}
                <div className="border-b border-gray-200">
                  <button onClick={() => setActiveAccordion(activeAccordion === "Experience" ? null : "Experience")} className="w-full flex justify-between p-4 bg-white hover:bg-gray-50 font-bold text-gray-800">
                    Experience <span className="text-gray-400">{activeAccordion === "Experience" ? '▼' : '▶'}</span>
                  </button>
                  {activeAccordion === "Experience" && (
                    <div className="p-4 bg-gray-50 space-y-4 border-t border-gray-100">
                       {generatedData.experience?.map((exp, idx) => (
                         <div key={idx} className="p-3 bg-white rounded border border-gray-200 shadow-sm space-y-2">
                            <input placeholder="Job Title" className="w-full p-2 border border-gray-300 rounded text-sm font-bold outline-none focus:ring-1 focus:ring-violet-500" value={exp.title || ""} onChange={(e) => handleManualEdit('experience', null, e.target.value, idx, 'title')} />
                            <div className="flex gap-2">
                              <input placeholder="Company" className="flex-1 p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={exp.company || ""} onChange={(e) => handleManualEdit('experience', null, e.target.value, idx, 'company')} />
                              <input placeholder="Date" className="w-32 p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={exp.date || ""} onChange={(e) => handleManualEdit('experience', null, e.target.value, idx, 'date')} />
                            </div>
                            <textarea rows={4} placeholder="Description (one bullet point per line)" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={exp.description ? (Array.isArray(exp.description) ? exp.description.join("\n") : exp.description) : ""} onChange={(e) => handleManualEdit('experience', null, e.target.value.split('\n'), idx, 'description')} />
                         </div>
                       ))}
                       
                       <div className="mt-2 p-3 bg-violet-50 rounded-lg border border-violet-100">
                         <label className="text-xs font-bold text-violet-800 mb-1 block">✨ AI Improve Experience</label>
                         <div className="flex gap-2">
                           <input type="text" placeholder="e.g. Add impactful metrics" className="flex-1 text-sm border-gray-300 rounded p-2 outline-none focus:ring-1 focus:ring-violet-500" onChange={e => setAiInstructions({...aiInstructions, experience: e.target.value})} />
                           <button onClick={() => handleEnhance("experience", aiInstructions.experience || "Make experience bullet points more impactful and metric-driven")} disabled={processing} className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded text-sm font-bold shadow transition-colors whitespace-nowrap">AI Rewrite</button>
                         </div>
                       </div>
                    </div>
                  )}
                </div>
                
                {/* Projects */}
                <div className="border-b border-gray-200">
                  <button onClick={() => setActiveAccordion(activeAccordion === "Projects" ? null : "Projects")} className="w-full flex justify-between p-4 bg-white hover:bg-gray-50 font-bold text-gray-800">
                    Projects <span className="text-gray-400">{activeAccordion === "Projects" ? '▼' : '▶'}</span>
                  </button>
                  {activeAccordion === "Projects" && (
                    <div className="p-4 bg-gray-50 space-y-4 border-t border-gray-100">
                       {generatedData.projects?.map((proj, idx) => (
                         <div key={idx} className="p-3 bg-white rounded border border-gray-200 shadow-sm space-y-2">
                            <input placeholder="Project Title" className="w-full p-2 border border-gray-300 rounded text-sm font-bold outline-none focus:ring-1 focus:ring-violet-500" value={proj.title || ""} onChange={(e) => handleManualEdit('projects', null, e.target.value, idx, 'title')} />
                            <div className="flex gap-2">
                              <input placeholder="Technologies used" className="flex-1 p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={proj.technologies || ""} onChange={(e) => handleManualEdit('projects', null, e.target.value, idx, 'technologies')} />
                              <input placeholder="Date" className="w-32 p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={proj.date || ""} onChange={(e) => handleManualEdit('projects', null, e.target.value, idx, 'date')} />
                            </div>
                            <textarea rows={4} placeholder="Description (one bullet point per line)" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={proj.description ? (Array.isArray(proj.description) ? proj.description.join("\n") : proj.description) : ""} onChange={(e) => handleManualEdit('projects', null, e.target.value.split('\n'), idx, 'description')} />
                         </div>
                       ))}
                       
                       <div className="mt-2 p-3 bg-violet-50 rounded-lg border border-violet-100">
                         <label className="text-xs font-bold text-violet-800 mb-1 block">✨ AI Improve Projects</label>
                         <div className="flex gap-2">
                           <input type="text" placeholder="e.g. Highlight technical depth" className="flex-1 text-sm border-gray-300 rounded p-2 outline-none focus:ring-1 focus:ring-violet-500" onChange={e => setAiInstructions({...aiInstructions, projects: e.target.value})} />
                           <button onClick={() => handleEnhance("projects", aiInstructions.projects || "Enhance project descriptions with measurable outcomes")} disabled={processing} className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded text-sm font-bold shadow transition-colors whitespace-nowrap">AI Rewrite</button>
                         </div>
                       </div>
                    </div>
                  )}
                </div>

                {/* Education */}
                <div className="border-b border-gray-200">
                  <button onClick={() => setActiveAccordion(activeAccordion === "Education" ? null : "Education")} className="w-full flex justify-between p-4 bg-white hover:bg-gray-50 font-bold text-gray-800">
                    Education <span className="text-gray-400">{activeAccordion === "Education" ? '▼' : '▶'}</span>
                  </button>
                  {activeAccordion === "Education" && (
                    <div className="p-4 bg-gray-50 space-y-4 border-t border-gray-100">
                       {generatedData.education?.map((edu, idx) => (
                         <div key={idx} className="p-3 bg-white rounded border border-gray-200 shadow-sm space-y-2">
                            <input placeholder="Degree" className="w-full p-2 border border-gray-300 rounded text-sm font-bold outline-none focus:ring-1 focus:ring-violet-500" value={edu.degree || ""} onChange={(e) => handleManualEdit('education', null, e.target.value, idx, 'degree')} />
                            <div className="flex gap-2">
                              <input placeholder="Institution" className="flex-1 p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={edu.institution || ""} onChange={(e) => handleManualEdit('education', null, e.target.value, idx, 'institution')} />
                              <input placeholder="Date" className="w-32 p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-violet-500" value={edu.date || ""} onChange={(e) => handleManualEdit('education', null, e.target.value, idx, 'date')} />
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="p-4 border-t bg-white">
                <button 
                  onClick={handleAccept}
                  disabled={processing || history.length <= 1}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Check size={16}/> Save Changes to Database
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center mt-8 no-print">
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-violet-100 text-violet-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit size={40} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Select a Resume</h2>
              <p className="text-gray-500">Choose one of your AI-built resumes from the dropdown above to begin surgical AI-powered editing.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

