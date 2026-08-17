"use client";

export default function MatchResultCard({ result }) {

  if (!result) return null;

  return (
    <div className="mt-8 rounded-2xl border bg-white p-6 shadow-lg">

      <h2 className="text-2xl font-bold mb-5">
        AI Match Result
      </h2>

      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 p-6 text-white shadow-xl">

    <div className="flex items-center justify-between">

        <div>

        <p className="text-sm uppercase tracking-widest opacity-80">
            AI Resume Match
        </p>

        <h3 className="text-3xl font-bold mt-2">
            {result.match_percentage}% Match
        </h3>

        </div>
        <div className="mt-3">

  {result.match_percentage >= 80 ? (

    <span className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white">
      🟢 Excellent Match
    </span>

  ) : result.match_percentage >= 60 ? (

    <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black">
      🟡 Good Match
    </span>

  ) : (

    <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white">
      🔴 Poor Match
    </span>

  )}

</div>

        <div className="text-5xl">
        🤖
        </div>

    </div>

    <div className="mt-5 w-full h-3 rounded-full bg-white/30 overflow-hidden">

        <div
        className="h-full rounded-full bg-white transition-all duration-700"
        style={{
            width: `${result.match_percentage}%`,
        }}
        />

    </div>

    <p className="mt-4 text-sm opacity-90">
        AI analyzed your resume against the selected Job Description.
    </p>

    </div>

        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

  <div className="rounded-2xl bg-white border shadow-sm p-5">

    <p className="text-sm text-gray-500">
      Matched Skills
    </p>

    <h2 className="text-3xl font-bold text-green-600 mt-2">
      {result.matched_skills?.length || 0}
    </h2>

  </div>

  <div className="rounded-2xl bg-white border shadow-sm p-5">

    <p className="text-sm text-gray-500">
      Missing Skills
    </p>

    <h2 className="text-3xl font-bold text-red-500 mt-2">
      {result.missing_skills?.length || 0}
    </h2>

  </div>

  <div className="rounded-2xl bg-white border shadow-sm p-5">

    <p className="text-sm text-gray-500">
      Status
    </p>

    <h2 className="text-xl font-bold mt-2">

      {result.match_percentage >= 80
        ? "Excellent"
        : result.match_percentage >= 60
        ? "Good"
        : "Needs Work"}

    </h2>

  </div>

</div>

  <div className="flex items-center gap-2 mb-4">

    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-lg">

      ✓

    </div>

    <div>

      <h3 className="font-bold text-lg text-green-700">
        Matched Skills
      </h3>

      <p className="text-sm text-gray-500">
        Skills successfully found in your resume
      </p>

    </div>

  </div>

  <div className="flex flex-wrap gap-3">

    {result.matched_skills?.length ? (

      result.matched_skills.map((skill, index) => (

        <span
          key={index}
          className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow"
        >
          {skill}
        </span>

      ))

    ) : (

      <p className="text-gray-500">
        No matched skills found.
      </p>

    )}

  </div>

</div>

      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">

  <div className="flex items-center gap-2 mb-4">

    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white text-lg">
      ✕
    </div>

    <div>

      <h3 className="font-bold text-lg text-red-700">
        Missing Skills
      </h3>

      <p className="text-sm text-gray-500">
        Skills missing from your resume
      </p>

    </div>

  </div>

  <div className="flex flex-wrap gap-3">

    {result.missing_skills?.length ? (

      result.missing_skills.map((skill, index) => (

        <span
          key={index}
          className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow"
        >
          {skill}
        </span>

      ))

    ) : (

      <p className="text-green-600 font-medium">
        🎉 No Missing Skills
      </p>

    )}

  </div>

</div>


        <div className="mt-8 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6">

  <div className="flex items-center gap-3 mb-4">

    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl text-white">
      🤖
    </div>

    <div>

      <h3 className="text-xl font-bold text-blue-700">
        AI Recommendation
      </h3>

      <p className="text-sm text-gray-500">
        Generated based on Resume & Job Description analysis
      </p>

    </div>

  </div>

  {result.match_percentage >= 80 ? (

    <div className="rounded-xl bg-green-100 border border-green-300 p-4">

      <h4 className="font-bold text-green-700">
        Excellent Match
      </h4>

      <p className="text-gray-700 mt-2">
        Your resume is highly compatible with this Job Description.
        You have a strong chance of passing the ATS screening.
      </p>

    </div>

  ) : result.match_percentage >= 60 ? (

    <div className="rounded-xl bg-yellow-100 border border-yellow-300 p-4">

      <h4 className="font-bold text-yellow-700">
        Good Match
      </h4>

      <p className="text-gray-700 mt-2">
        Your resume matches most of the required skills.
        Consider adding the missing skills to improve your chances.
      </p>

    </div>

  ) : (

    <div className="rounded-xl bg-red-100 border border-red-300 p-4">

      <h4 className="font-bold text-red-700">
        Needs Improvement
      </h4>

      <p className="text-gray-700 mt-2">
        Your resume is missing several important skills.
        Update your resume before applying for this role.
      </p>

    </div>

  )}

</div>

    </div>
  );
}
