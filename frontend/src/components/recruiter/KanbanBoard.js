"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const STAGES = ["Applied", "Pending Review", "Shortlisted", "Interview", "Selected", "Offer Sent", "Hired", "Rejected"];

export default function KanbanBoard({ resumes, onStatusChange }) {
  const [draggingId, setDraggingId] = useState(null);

  const handleDragStart = (e, resumeId) => {
    setDraggingId(resumeId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", resumeId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (draggingId) {
      onStatusChange([draggingId], targetStatus);
      setDraggingId(null);
    }
  };

  const resumesByStatus = STAGES.reduce((acc, status) => {
    acc[status] = resumes.filter(r => r.status === status);
    return acc;
  }, {});

  return (
    <div className="flex gap-4 w-full snap-x pt-2">
      {STAGES.map(status => (
        <div 
          key={status}
          className="shrink-0 w-[280px] md:w-[300px] bg-gray-50 rounded-xl shadow-sm border border-gray-200 flex flex-col snap-start h-[500px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="p-3 border-b border-gray-200 bg-gray-100/50 rounded-t-xl flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-sm">{status}</h3>
            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-gray-500 shadow-sm border border-gray-200">
              {resumesByStatus[status].length}
            </span>
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {resumesByStatus[status].map(resume => (
              <div 
                key={resume.id}
                draggable
                onDragStart={(e) => handleDragStart(e, resume.id)}
                className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${draggingId === resume.id ? 'opacity-50' : 'opacity-100'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{resume.candidate_name}</h4>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${resume.ats_score >= 75 ? 'bg-green-100 text-green-700' : resume.ats_score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {resume.ats_score}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 truncate">{resume.candidate_email}</p>
                {resume.risk_level && (
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${resume.risk_level === 'High' ? 'text-red-500' : resume.risk_level === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>
                    {resume.risk_level} RISK
                  </span>
                )}
              </div>
            ))}
            {resumesByStatus[status].length === 0 && (
              <div className="h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                Drop here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
