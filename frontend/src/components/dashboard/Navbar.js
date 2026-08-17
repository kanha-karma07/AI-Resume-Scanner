"use client";

import Link from "next/link";
import { logoutUser } from "@/services/authService";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isPremium, setIsPremium] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isPremium") === "True" || localStorage.getItem("isPremium") === "true";
    }
    return false;
  });

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div className="bg-blue-600 text-white p-5 flex items-center justify-between">

      <h1 className="text-2xl font-bold">
        AI Resume Scanner
      </h1>

      <div className="flex items-center gap-8 ml-auto mr-8">

        <Link
          href="/dashboard/profile"
          className="hover:text-blue-200 transition"
        >
          Profile
        </Link>

        <Link
          href="/dashboard/job-description"
          className="hover:text-blue-200 transition"
        >
          Job Description
        </Link>
        
        {isPremium ? (
          <Link
            href="/dashboard/premium"
            className="flex items-center gap-1 hover:text-yellow-200 text-yellow-300 font-semibold transition"
          >
            <Sparkles size={16} />
            Premium
          </Link>
        ) : (
          <Link
            href="/dashboard/premium/payment"
            className="flex items-center gap-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-3 py-1.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-sm"
          >
            <Sparkles size={14} />
            Upgrade to Premium
          </Link>
        )}

      </div>

      <button
        onClick={handleLogout}  
        className="bg-red-500 px-4 py-2 rounded"
      >
        Logout
      </button>

    </div>
  );
}
