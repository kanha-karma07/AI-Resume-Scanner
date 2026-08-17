"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function MobileMenu({ onGetStarted }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-300 hover:text-white focus:outline-none"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full w-full bg-[#0a0a1a] border-b border-white/5 shadow-2xl p-4 flex flex-col gap-4 animate-fade-up">
          <a href="#features" onClick={() => setIsOpen(false)} className="text-sm text-slate-300 hover:text-white block px-4 py-2">Features</a>
          <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-sm text-slate-300 hover:text-white block px-4 py-2">How It Works</a>
          <a href="#recruiter" onClick={() => setIsOpen(false)} className="text-sm text-slate-300 hover:text-white block px-4 py-2">For Recruiters</a>
          <a href="#pricing" onClick={() => setIsOpen(false)} className="text-sm text-slate-300 hover:text-white block px-4 py-2">Pricing</a>
          <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Log in
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onGetStarted) onGetStarted();
              }}
              className="btn-primary rounded-lg px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
