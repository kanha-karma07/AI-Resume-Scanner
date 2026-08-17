"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import MobileMenu from "./MobileMenu";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
        <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
      </div>
      <span className="text-lg font-bold tracking-tight text-white">
        Resume<span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">AI</span>
      </span>
    </Link>
  );
}

function NavLink({ href, children }) {
  return (
    <a href={href} className="text-sm text-slate-300 transition-colors hover:text-white">
      {children}
    </a>
  );
}

import { User, Briefcase, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    // Check immediately in case of route change or reload
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Also listen to hashchange for anchor links
    window.addEventListener("hashchange", handleScroll);
    
    // Fallback polling for the first 500ms after a click/route change
    const interval = setInterval(handleScroll, 100);
    setTimeout(() => clearInterval(interval), 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleScroll);
      clearInterval(interval);
    };
  }, [pathname]);

  return (
    <>
      <header 
        className={`fixed w-full top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? "bg-[#0a0a1a]/80 backdrop-blur-md border-b border-white/10 shadow-lg" 
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#recruiter">Recruiters</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white sm:block"
            >
              Log in
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary hidden rounded-lg px-5 py-2.5 text-sm font-semibold text-white sm:block"
            >
              Get Started
            </button>
            <MobileMenu onGetStarted={() => setShowModal(true)} />
          </div>
        </div>
      </header>

      {/* Role Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111122] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-8 mt-2">
              <h3 className="text-2xl font-bold text-white mb-2">Join ResumeAI</h3>
              <p className="text-slate-400 text-sm">Select how you want to use our platform</p>
            </div>

            <div className="space-y-4">
              <Link 
                href="/register"
                onClick={() => setShowModal(false)}
                className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <User className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Candidate</h4>
                  <p className="text-sm text-slate-400">Scan my resume, get ATS scores, and improve my matches.</p>
                </div>
              </Link>

              <Link 
                href="/register/recruiter"
                onClick={() => setShowModal(false)}
                className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all group"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
                  <Briefcase className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Recruiter</h4>
                  <p className="text-sm text-slate-400">Screen candidates, create job descriptions, and match resumes.</p>
                </div>
              </Link>
            </div>
            
            <div className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
