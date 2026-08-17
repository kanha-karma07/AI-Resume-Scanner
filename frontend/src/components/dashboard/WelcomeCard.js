"use client";

import Link from "next/link";

export default function WelcomeCard() {

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  return (

    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-10 mb-8 shadow-xl">

      {/* Background Blur */}

      <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full"></div>

      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full"></div>

      <div className="relative flex flex-col md:flex-row justify-between items-center">

        <div>

          <p className="text-blue-100 text-lg">
            {greeting} 👋
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Welcome Back
          </h1>

          <p className="mt-4 text-blue-100 max-w-xl leading-7">
            Manage your resumes, improve your ATS score and
            track your career growth using AI powered resume analysis.
          </p>

          <div className="mt-6 flex gap-4">

            <Link
              href="/dashboard/profile"
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              View Profile
            </Link>

          </div>

        </div>

        <div className="mt-8 md:mt-0">

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20">

            <p className="text-blue-100">
              Resume Health
            </p>

            <h2 className="text-5xl font-bold mt-2">
              90%
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              Keep improving your ATS score 🚀
            </p>

          </div>

        </div>

      </div>

    </div>

  );

}
