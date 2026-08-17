"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { deleteResume } from "@/services/resumeService";
import { Search, Filter } from "lucide-react";

export default function ResumeList({ resumes, onDeleteSuccess }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("Newest");

  const handleDelete = async (id) => {
    try {
      await deleteResume(id);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Failed to delete resume", error);
    }
  };

  const filteredAndSortedResumes = useMemo(() => {
    let result = resumes.filter((r) => 
      r.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortOption === "Newest") return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      if (sortOption === "Oldest") return new Date(a.uploaded_at) - new Date(b.uploaded_at);
      if (sortOption === "Highest ATS") return b.ats_score - a.ats_score;
      if (sortOption === "Lowest ATS") return a.ats_score - b.ats_score;
      return 0;
    });

    return result;
  }, [resumes, searchTerm, sortOption]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">
          My Resumes
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search resumes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="Highest ATS">Highest ATS</option>
              <option value="Lowest ATS">Lowest ATS</option>
            </select>
          </div>
        </div>
      </div>

      {resumes.length === 0 ? (

        <p className="text-gray-500">
          No Resume Uploaded
        </p>

      ) : (

        <div className="space-y-6">

          {filteredAndSortedResumes.map((resume) => (

            <div
              key={resume.id}
              className="border rounded-xl p-6 hover:shadow-lg transition duration-300"
            >

              {/* Header */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <h3 className="text-2xl font-bold text-slate-800">
                      {resume.title}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      Uploaded on{" "}
                      {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>

                  </div>

                  <span
                    className={`px-5 py-2 rounded-full text-sm font-semibold shadow-sm ${
                      resume.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {resume.status}
                  </span>

                </div>

              {/* ATS */}

                <div className="mt-6">

                  <div className="flex justify-between items-center mb-2">

                    <h4 className="font-semibold text-slate-700">
                      ATS Score
                    </h4>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        resume.ats_score >= 80
                          ? "bg-green-100 text-green-700"
                          : resume.ats_score >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {resume.ats_score}%
                    </span>

                  </div>

                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

                    <div
                      className={`h-4 rounded-full transition-all duration-700 ${
                        resume.ats_score >= 80
                          ? "bg-green-500"
                          : resume.ats_score >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${resume.ats_score}%`,
                      }}
                    ></div>

                  </div>

                </div>

              {/* Skills */}

              <div className="mt-6">

                <p className="font-semibold mb-3">
                  Skills
                </p>

                <div className="flex flex-wrap gap-2">

                  {resume.skills?.length ? (

                    resume.skills.map((skill, index) => (

                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>

                    ))

                  ) : (

                    <span>No Skills Found</span>

                  )}

                </div>

              </div>

              {/* Education */}

              <div className="grid md:grid-cols-2 gap-6 mt-6">

                <div>

                  <p className="font-semibold mb-2">
                    Education
                  </p>

                  {Array.isArray(resume.education_data) && resume.education_data.length > 0 ? (
                    <div className="space-y-3">
                      {resume.education_data.map((edu, idx) => (
                        <div key={idx}>
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-sm text-gray-600">{edu.college}</p>
                          <p className="text-sm text-gray-500">{edu.start_year} - {edu.end_year}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>N/A</p>
                  )}

                </div>

                <div>

                  <p className="font-semibold mb-2">
                    Experience
                  </p>

                  {Array.isArray(resume.experience_data) && resume.experience_data.length > 0 ? (
                    <div className="space-y-3">
                      {resume.experience_data.map((exp, idx) => (
                        <div key={idx}>
                          {exp.type && <p className="text-xs font-semibold text-blue-600 mb-1">{exp.type}</p>}
                          <p className="font-medium">{exp.role}</p>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.start_date} - {exp.end_date}</p>
                          {exp.duration && <p className="text-xs text-gray-400">{exp.duration}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Fresher</p>
                  )}

                </div>

              </div>

              {/* Projects */}

              <div className="mt-6">

                <p className="font-semibold mb-3">
                  Projects
                </p>

                {Array.isArray(resume.projects) && resume.projects.length > 0 ? (
                  <div className="space-y-4">
                    {resume.projects.map((proj, idx) => (
                      <div key={idx} className="text-sm bg-gray-50 p-3 rounded">
                        <p className="font-medium mb-1">{proj.title || "Untitled Project"}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <p className="text-xs text-gray-500 mb-2 font-mono">
                            Tech: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                          </p>
                        )}
                        <p className="text-gray-700">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">No Projects</p>
                )}
              </div>

              {/* Suggestions */}

              <div className="mt-6">

                <p className="font-semibold mb-2">
                  Suggestions
                </p>

                {resume.suggestions?.length ? (

                  <ul className="list-disc ml-6 space-y-1">

                    {resume.suggestions.map((item, index) => (

                      <li key={index}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No Suggestions</p>
                )}
              </div>

              {/* Buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                  <Link
                    href={`/dashboard/resume/${resume.id}`}
                    className="flex-1 text-center bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 shadow-sm"
                  >
                    👁 View Details
                  </Link>

                  <Link
                    href={`/dashboard/premium/resume-editor?id=${resume.id}`}
                    className="flex-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 shadow-md"
                  >
                    ✨ Edit in AI Editor
                  </Link>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    🗑 Delete Resume
                  </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
