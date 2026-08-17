"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, Download, Check, Save, Edit3, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function ResumeBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  
  // Structured generated resume
  const [generatedData, setGeneratedData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    personalDetails: "",
    summary: "",
    education: "",
    experience: "",
    projects: "",
    skills: "",
    certifications: "",
    languages: ""
  });

  const previewRef = useRef(null);

  useEffect(() => {
    // Premium check
    const isPremium = localStorage.getItem("isPremium") === "True" || localStorage.getItem("isPremium") === "true";
    if (!isPremium) {
      router.push("/dashboard/premium/payment");
      return;
    }

    const savedDraft = localStorage.getItem("resumeBuilderDraft");
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (e) {}
    }
    const savedGenerated = localStorage.getItem("resumeBuilderData");
    if (savedGenerated) {
      try {
        setGeneratedData(JSON.parse(savedGenerated));
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (value.trim() !== "" && /^[\d\W_]+$/.test(value.trim())) {
      toast.error(`${name} must contain alphabetic characters.`, { id: 'numeric-error' });
    }
    
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    localStorage.setItem("resumeBuilderDraft", JSON.stringify(updatedData));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    for (const [key, value] of Object.entries(formData)) {
      if (value.trim() !== "" && /^[\d\W_]+$/.test(value.trim())) {
        toast.error(`${key} cannot contain only numbers or symbols.`);
        return;
      }
    }
    
    setBuilding(true);
    
    try {
      // Send raw unstructured input to the new JSON backend
      const res = await api.post("candidate/resume/build/", formData);
      
      const structuredResume = res.data.resume_data;
      setGeneratedData(structuredResume);
      localStorage.setItem("resumeBuilderData", JSON.stringify(structuredResume));
      toast.success("Professional Resume Built Successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "AI Build failed. Please try again.");
    } finally {
      setBuilding(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadDOCX = () => {
    if (!previewRef.current) return;
    
    // Create DOCX formatted HTML
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
            
    // For DOCX we simplify the HTML to standard tags
    const htmlContent = document.getElementById("resume-content").innerHTML;
    const footer = "</body></html>";
    const sourceHTML = header + htmlContent + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
    });
    
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    downloadLink.href = url;
    downloadLink.download = 'Professional_Resume.doc';
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("DOCX Downloaded");
  };

  const handleDataChange = (section, index, field, value) => {
    setGeneratedData(prev => {
      const newData = { ...prev };
      if (index !== null) {
        if (field) {
          newData[section][index][field] = value;
        } else {
          newData[section][index] = value;
        }
      } else {
        if (field) {
          newData[section][field] = value;
        } else {
          newData[section] = value;
        }
      }
      localStorage.setItem("resumeBuilderData", JSON.stringify(newData));
      return newData;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-20 animate-pulse text-gray-500">
        Loading AI Builder...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Hide on print via CSS class .print:hidden */}
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

      <div className="max-w-7xl mx-auto p-4 md:p-8 w-full flex-grow no-print">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={32}/>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Resume Builder</h1>
              <p className="text-sm text-gray-500">Provide your details, and our AI will craft a stunning, ATS-friendly resume instantly.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: Form (5 cols) */}
          <div className="xl:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
              <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><Check size={16}/></span>
              Enter Your Information
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Personal Details</label>
                <textarea 
                  name="personalDetails"
                  value={formData.personalDetails}
                  onChange={handleChange}
                  placeholder="Name, Phone, Email, Location, LinkedIn URL, GitHub" 
                  className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 border focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none h-20 text-sm"
                  required
                />
              </div>

              {[
                { name: 'summary', placeholder: "Brief summary or target role...", label: "Summary & Objective" },
                { name: 'experience', placeholder: "Companies, roles, dates, and responsibilities...", label: "Experience" },
                { name: 'projects', placeholder: "Project names, tech stack, and what you built...", label: "Projects" },
                { name: 'education', placeholder: "Degrees, universities, and graduation years...", label: "Education" },
                { name: 'skills', placeholder: "List all your technical and soft skills...", label: "Skills" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{field.label}</label>
                  <textarea 
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder} 
                    className="w-full border-gray-300 rounded-lg p-3 bg-gray-50 border focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Certifications</label>
                  <textarea 
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleChange}
                    placeholder="AWS, GCP, etc." 
                    className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 border focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none h-20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Languages</label>
                  <textarea 
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder="English, Spanish..." 
                    className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 border focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none h-20 text-sm"
                  />
                </div>
              </div>
            </form>
            
            <button 
              onClick={handleGenerate}
              disabled={building}
              className="w-full mt-6 bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {building ? (
                <><span className="animate-spin">↻</span> Analyzing & Building...</>
              ) : (
                <><Sparkles size={18} /> Build ATS Resume</>
              )}
            </button>
          </div>

          {/* Right Column: Live Preview (8 cols) */}
          <div className="xl:col-span-8 bg-gray-300 rounded-2xl shadow-inner p-4 md:p-8 flex flex-col items-center overflow-x-auto">
            
            <div className="w-full max-w-[210mm] flex justify-between items-center mb-4 px-2">
              <h3 className="font-bold text-gray-700">Live Preview</h3>
              {generatedData && (
                <div className="flex gap-2">
                  <button onClick={handleDownloadDOCX} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm text-sm font-bold hover:bg-gray-50 transition-colors">
                    <Download size={16}/> DOCX
                  </button>
                  <button onClick={handlePrintPDF} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm text-sm font-bold hover:bg-blue-700 transition-colors">
                    <Download size={16}/> PDF
                  </button>
                </div>
              )}
            </div>
            
            {/* Resume A4 Paper */}
            <div 
              id="resume-preview-container"
              ref={previewRef}
              className={`bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] text-gray-900 mx-auto ${generatedData ? '' : 'flex items-center justify-center'}`}
              style={{ boxSizing: 'border-box' }}
            >
              {generatedData ? (
                <div id="resume-content" className="w-full h-full text-[11pt] leading-snug font-sans group">
                  
                  {/* Header / Personal Details */}
                  <div className="text-center mb-6 border-b-2 border-gray-900 pb-4">
                    <EditableField 
                       value={generatedData.personalDetails?.name} 
                       onChange={(v) => handleDataChange('personalDetails', null, 'name', v)}
                       className="text-3xl font-black uppercase tracking-wider mb-2 text-black"
                    />
                    <div className="text-sm text-gray-700 flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {['email', 'phone', 'location', 'linkedin', 'github', 'portfolio'].map(field => (
                         generatedData.personalDetails?.[field] ? (
                           <span key={field} className="flex items-center">
                             <EditableField 
                               value={generatedData.personalDetails[field]} 
                               onChange={(v) => handleDataChange('personalDetails', null, field, v)}
                             />
                           </span>
                         ) : null
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  {(generatedData.summary || generatedData.objective) && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 text-gray-900">Professional Summary</h2>
                      <EditableField 
                        value={generatedData.summary || generatedData.objective} 
                        onChange={(v) => handleDataChange('summary', null, null, v)}
                        className="text-justify text-gray-800"
                        multiline
                      />
                    </div>
                  )}

                  {/* Skills */}
                  {generatedData.skills && Object.keys(generatedData.skills).length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 text-gray-900">Technical Skills</h2>
                      <div className="grid grid-cols-1 gap-1 text-sm">
                        {Object.entries(generatedData.skills).map(([category, skillsList]) => {
                          if (!skillsList || skillsList.length === 0) return null;
                          return (
                            <div key={category} className="flex text-gray-800">
                              <span className="font-bold w-[30%]">{category}:</span>
                              <span className="w-[70%]">
                                <EditableField 
                                  value={skillsList.join(", ")} 
                                  onChange={(v) => handleDataChange('skills', null, category, v.split(",").map(s => s.trim()))}
                                />
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {generatedData.experience && generatedData.experience.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3 text-gray-900">Experience</h2>
                      {generatedData.experience.map((exp, idx) => (
                        <div key={idx} className="mb-4">
                          <div className="flex justify-between items-baseline font-bold text-gray-900">
                            <div className="text-[12pt]">
                              <EditableField value={exp.title} onChange={(v) => handleDataChange('experience', idx, 'title', v)} />
                            </div>
                            <div className="text-sm text-gray-600">
                              <EditableField value={exp.date} onChange={(v) => handleDataChange('experience', idx, 'date', v)} />
                            </div>
                          </div>
                          <div className="text-gray-800 font-semibold mb-1 italic">
                            <EditableField value={exp.company} onChange={(v) => handleDataChange('experience', idx, 'company', v)} />
                          </div>
                          <ul className="list-disc list-outside ml-5 text-gray-800 space-y-1">
                            {exp.description && exp.description.map((desc, dIdx) => (
                               <li key={dIdx}>
                                 <EditableField 
                                   value={desc} 
                                   onChange={(v) => {
                                     const newDesc = [...exp.description];
                                     newDesc[dIdx] = v;
                                     handleDataChange('experience', idx, 'description', newDesc);
                                   }}
                                   multiline
                                 />
                               </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {generatedData.projects && generatedData.projects.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3 text-gray-900">Projects</h2>
                      {generatedData.projects.map((proj, idx) => (
                        <div key={idx} className="mb-3">
                          <div className="flex justify-between items-baseline font-bold text-gray-900">
                            <div className="text-[12pt] flex gap-2">
                              <EditableField value={proj.title} onChange={(v) => handleDataChange('projects', idx, 'title', v)} />
                              <span className="font-normal text-gray-600">
                                | <EditableField value={proj.technologies} onChange={(v) => handleDataChange('projects', idx, 'technologies', v)} />
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <EditableField value={proj.date} onChange={(v) => handleDataChange('projects', idx, 'date', v)} />
                            </div>
                          </div>
                          <ul className="list-disc list-outside ml-5 mt-1 text-gray-800 space-y-1">
                            {proj.description && proj.description.map((desc, dIdx) => (
                               <li key={dIdx}>
                                 <EditableField 
                                   value={desc} 
                                   onChange={(v) => {
                                     const newDesc = [...proj.description];
                                     newDesc[dIdx] = v;
                                     handleDataChange('projects', idx, 'description', newDesc);
                                   }}
                                   multiline
                                 />
                               </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {generatedData.education && generatedData.education.length > 0 && (
                    <div className="mb-5">
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3 text-gray-900">Education</h2>
                      {generatedData.education.map((edu, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="flex justify-between items-baseline font-bold text-gray-900">
                            <div><EditableField value={edu.degree} onChange={(v) => handleDataChange('education', idx, 'degree', v)} /></div>
                            <div className="text-sm text-gray-600"><EditableField value={edu.date} onChange={(v) => handleDataChange('education', idx, 'date', v)} /></div>
                          </div>
                          <div className="text-gray-800 italic">
                            <EditableField value={edu.institution} onChange={(v) => handleDataChange('education', idx, 'institution', v)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Footer Sections */}
                  <div className="grid grid-cols-2 gap-4">
                     {/* Certifications */}
                     {generatedData.certifications && generatedData.certifications.length > 0 && (
                       <div>
                         <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 text-gray-900">Certifications</h2>
                         <ul className="list-disc list-outside ml-5 text-gray-800">
                           {generatedData.certifications.map((cert, idx) => (
                             <li key={idx}>
                               <span className="font-semibold"><EditableField value={cert.name} onChange={(v) => handleDataChange('certifications', idx, 'name', v)} /></span>
                               {cert.issuer && <span> - <EditableField value={cert.issuer} onChange={(v) => handleDataChange('certifications', idx, 'issuer', v)} /></span>}
                             </li>
                           ))}
                         </ul>
                       </div>
                     )}
                     
                     {/* Languages */}
                     {generatedData.languages && generatedData.languages.length > 0 && (
                       <div>
                         <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 text-gray-900">Languages</h2>
                         <ul className="list-disc list-outside ml-5 text-gray-800">
                           {generatedData.languages.map((lang, idx) => (
                             <li key={idx}><EditableField value={lang} onChange={(v) => handleDataChange('languages', idx, null, v)} /></li>
                           ))}
                         </ul>
                       </div>
                     )}
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 no-print min-h-[500px]">
                  <FileText size={48} className="opacity-20" />
                  <p>Fill out the form and click Build ATS Resume to generate.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// Inline Editable Field Component
function EditableField({ value, onChange, className = "", multiline = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");

  useEffect(() => {
    setTempValue(value || "");
  }, [value]);

  if (isEditing) {
    return (
      <div className={`relative inline-block w-full min-w-[50px] ${className}`}>
        {multiline ? (
           <textarea 
             className="w-full bg-yellow-50 border border-yellow-400 p-1 rounded outline-none shadow-sm text-inherit font-inherit"
             value={tempValue}
             onChange={(e) => setTempValue(e.target.value)}
             autoFocus
             onBlur={() => { setIsEditing(false); onChange(tempValue); }}
             onKeyDown={(e) => { if (e.key === 'Escape') setIsEditing(false); }}
             rows={3}
           />
        ) : (
           <input 
             className="w-full bg-yellow-50 border border-yellow-400 p-0.5 rounded outline-none shadow-sm text-inherit font-inherit"
             value={tempValue}
             onChange={(e) => setTempValue(e.target.value)}
             autoFocus
             onBlur={() => { setIsEditing(false); onChange(tempValue); }}
             onKeyDown={(e) => { if (e.key === 'Enter') { setIsEditing(false); onChange(tempValue); } else if (e.key === 'Escape') setIsEditing(false); }}
           />
        )}
      </div>
    );
  }

  return (
    <span 
      className={`group-hover:hover:bg-blue-50 group-hover:hover:ring-1 ring-blue-300 rounded cursor-text transition-colors duration-200 ${className} ${!value ? 'bg-red-50 text-red-300 px-2 italic' : ''}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || "[Empty]"}
    </span>
  );
}

