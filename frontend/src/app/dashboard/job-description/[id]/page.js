"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getJobDescriptions, matchResume } from "@/services/jobDescriptionService";
import { getResumes } from "@/services/resumeService";

import MatchResultCard from "@/components/job-description/MatchResultCard";
import ResumeDropdown from "@/components/job-description/ResumeDropdown";
import toast from "react-hot-toast";

export default function MatchPage() {

  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    loadData();
  }, []);


  const handleMatch = async () => {

  if (!selectedResume) {
    toast.error("Please select a resume");
    return;
  }

  try {

    setLoading(true);

    const response = await matchResume(
      selectedResume,
      id
    );

    setMatchResult(response.data);

  } catch (error) {

  } finally {

    setLoading(false);

  }

};

  const loadData = async () => {

    try {

      const jobsResponse = await getJobDescriptions();
      const resumesResponse = await getResumes();

      const selectedJob = jobsResponse.data.find(
        (item) => item.id == id
      );

      setJob(selectedJob);
      setResumes(resumesResponse.data);

    } catch (error) {

    } finally {

      setLoading(false);

    }

 

  };

  if (loading) {

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white px-8 py-6 rounded-3xl shadow-xl">

        Loading...

      </div>

    </div>

  );

}

return (

  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-white">

    <div className="max-w-7xl mx-auto p-8">

      {/* Header */}

      <div className="mb-8">

        <h1 className="text-4xl font-bold text-slate-800">

          Resume Matching

        </h1>

        <p className="text-slate-500 mt-2">

          Compare your uploaded resume with this Job Description.

        </p>

      </div>

      {/* Job Card */}

      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">

        <h2 className="text-2xl font-bold">

          {job?.title}

        </h2>

        <p className="text-gray-500 mt-2">

          {job?.description}

        </p>

        <div className="flex flex-wrap gap-2 mt-6">

          {job?.skills?.map((skill, index) => (

            <span
              key={index}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
            >

              {skill}

            </span>

          ))}

        </div>

      </div>

      {/* Resume Selection */}

      <div className="bg-white rounded-3xl shadow-lg p-8">

        <h2 className="text-2xl font-bold mb-6">

          Select Resume

        </h2>

        <ResumeDropdown
          resumes={resumes}
          selectedResume={selectedResume}
          setSelectedResume={setSelectedResume}
        />

        <button
          onClick={handleMatch}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
        >

          Match Resume

        </button>

      </div>

      {/* Match Result */}

      {matchResult && (

        <div className="mt-8">

          <MatchResultCard
            result={matchResult}
          />

        </div>

      )}

    </div>

  </div>

);

}