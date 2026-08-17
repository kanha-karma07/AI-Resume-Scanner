"use client";

import JobCard from "./JobCard";

export default function JobList({ jobs, resumes }) {

  return (

    <div className="mt-10">

      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Recent Job Descriptions
      </h2>

      <p className="text-gray-500 mb-8">
        Select a resume and compare it with any Job Description using AI.
      </p>

      {jobs.length === 0 ? (

        <div className="bg-white rounded-3xl p-12 text-center shadow-lg">

          <h3 className="text-2xl font-bold">
            No Job Description Uploaded
          </h3>

          <p className="text-gray-500 mt-3">
            Upload your first Job Description to start AI Matching.
          </p>

        </div>

      ) : (

        <div className="grid lg:grid-cols-2 gap-8">

          {jobs.map((job) => (

            <JobCard
              key={job.id}
              job={job}
              resumes={resumes}
            />

          ))}

        </div>

      )}

    </div>

  );

}
