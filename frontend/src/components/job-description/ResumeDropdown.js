"use client";

export default function ResumeDropdown({
  resumes,
  selectedResume,
  setSelectedResume,
}) {
  return (
    <div className="mt-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Select Resume
      </label>

      <select
        value={selectedResume}
        onChange={(e) => setSelectedResume(e.target.value)}
        className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">
          -- Select Resume --
        </option>

        {resumes.map((resume) => (
          <option
            key={resume.id}
            value={resume.id}
          >
            {resume.title}
          </option>
        ))}
      </select>
    </div>
  );
}
