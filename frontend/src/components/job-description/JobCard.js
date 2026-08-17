"use client";

import { useRouter } from "next/navigation";

export default function JobCard({ job }) {
  const router = useRouter();

  return (
    <div className="group bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">

      {/* Top Gradient */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400" />

      <div className="p-6">

        {/* Header */}

        <div className="flex items-start justify-between">

          <div>

            <h2 className="text-2xl font-bold text-slate-800">
              {job.title}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Uploaded on{" "}
              {new Date(job.created_at).toLocaleDateString()}
            </p>

          </div>

          <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            AI Ready
          </span>

        </div>

        {/* Description */}

        <div className="mt-6">

          <p className="text-slate-600 leading-7 line-clamp-4">
            {job.description}
          </p>

        </div>

        {/* Skills */}

        <div className="mt-8">

          <h3 className="font-semibold text-slate-800 mb-4">
            Required Skills
          </h3>

          <div className="flex flex-wrap gap-2">

            {job.skills?.length ? (

              job.skills.map((skill, index) => (

                <span
                  key={index}
                  className="px-3 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium"
                >
                  {skill}
                </span>

              ))

            ) : (

              <span className="text-gray-400">
                No Skills Found
              </span>

            )}

          </div>

        </div>

        {/* Footer */}

        <div className="mt-8 border-t pt-6">

          <button
            onClick={() =>
              router.push(`/dashboard/job-description/${job.id}`)
            }
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            🚀 Match Resume
          </button>

        </div>

      </div>

    </div>
  );
}
