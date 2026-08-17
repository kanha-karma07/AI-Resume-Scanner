import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  FileSearch,
  Sparkles,
  Target,
  Upload,
  User,
  Users,
  Zap,
  ChevronDown,
  Star,
  Quote
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { PRICING_ARRAY } from "@/constants/pricing";

export const metadata = {
  title: "ResumeAI — AI Resume Scanner & ATS Score Analyzer",
  description:
    "Upload your resume for instant ATS scoring, AI skill extraction, and tailored improvement suggestions. Beat applicant tracking systems and land more interviews.",
};

// --- DATA CONSTANTS ---

const features = [
  {
    icon: Target,
    title: "ATS Score Analysis",
    desc: "Instant compatibility score against applicant tracking systems used by top employers.",
  },
  {
    icon: Sparkles,
    title: "AI Skill Extraction",
    desc: "Automatically detect hard and soft skills, tools, and certifications from your resume.",
  },
  {
    icon: FileSearch,
    title: "Smart Suggestions",
    desc: "Actionable recommendations to strengthen wording, structure, and keyword density.",
  },
  {
    icon: BarChart3,
    title: "Job Match Insights",
    desc: "Compare your resume against job descriptions and see exactly where you stand.",
  },
];

const candidateSteps = [
  { num: "01", title: "Upload Resume", desc: "Drop your PDF or DOCX — our AI parses it in seconds." },
  { num: "02", title: "AI Analysis", desc: "Deep scan for ATS compatibility, skills, and gaps." },
  { num: "03", title: "Get Results", desc: "Review your score, extracted skills, and improvement tips." },
];

const recruiterSteps = [
  { num: "01", title: "Create Job", desc: "Define role requirements, skills, and experience." },
  { num: "02", title: "Upload Resumes", desc: "Bulk upload candidate resumes for automated screening." },
  { num: "03", title: "AI Match", desc: "Instantly rank candidates by ATS compatibility score." },
];

const testimonials = [
  {
    quote: "ResumeAI transformed my job search. The ATS score analysis helped me fix critical formatting issues I didn't even know I had.",
    author: "Sarah J.",
    role: "Product Manager"
  },
  {
    quote: "As a recruiter, the bulk resume screening is a game changer. It saves our team hours of manual review every single week.",
    author: "Michael T.",
    role: "Talent Acquisition Lead"
  },
  {
    quote: "The AI suggestions were spot on. I rewrote my resume based on the feedback and landed three interviews in one week.",
    author: "David K.",
    role: "Software Engineer"
  }
];

const faqs = [
  {
    question: "How accurate is the ATS scoring?",
    answer: "Our ATS scoring algorithm is modeled after the top 5 enterprise applicant tracking systems, providing highly accurate parsing and keyword matching."
  },
  {
    question: "Is my resume data kept private?",
    answer: "Yes. We use industry-standard encryption and never sell your personal data. Your resumes are strictly used to provide your analysis."
  },
  {
    question: "Can I use ResumeAI for free?",
    answer: "Yes, our Free Plan allows you to upload resumes, get an ATS score, and view basic suggestions at no cost."
  }
];

// --- COMPONENTS ---

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

function ATSScoreCard() {
  const score = 87;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="animate-float glass-card w-full max-w-xs rounded-2xl p-5 shadow-2xl relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ATS Score</span>
        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
          Excellent
        </span>
      </div>
      <div className="relative mx-auto mb-4 flex h-36 w-36 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute text-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="block text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {[
          { label: "Keywords", val: 92 },
          { label: "Formatting", val: 85 },
          { label: "Sections", val: 78 },
        ].map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-400">{item.label}</span>
              <span className="font-medium text-white">{item.val}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                style={{ width: `${item.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadMockup() {
  return (
    <div className="animate-float-delayed glass-card w-full max-w-sm rounded-2xl p-6 shadow-2xl relative z-10">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
          <Upload className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Upload Resume</p>
          <p className="text-xs text-slate-400">PDF, DOCX up to 5MB</p>
        </div>
      </div>
      <div className="mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/5 px-6 py-10 transition-colors">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20">
          <Upload className="h-6 w-6 text-blue-400" />
        </div>
        <p className="text-sm font-medium text-white">Drop your resume here</p>
        <p className="mt-1 text-xs text-slate-400">or click to browse</p>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-xs font-bold text-red-400">
          PDF
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">krishna_karma_Resume.pdf</p>
          <p className="text-xs text-slate-400">248 KB · Analyzing...</p>
        </div>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {["React", "TypeScript", "Node.js", "AWS", "Agile"].map((skill) => (
          <span key={skill} className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs text-violet-300">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scoreRing {
          from { stroke-dashoffset: 339.292; }
          to { stroke-dashoffset: 44.108; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 1.5s infinite; }
        .animate-fade-up { animation: fadeUp 0.8s ease-out forwards; }
        .animate-fade-up-delay { animation: fadeUp 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-fade-up-delay-2 { animation: fadeUp 0.8s ease-out 0.4s forwards; opacity: 0; }
        .animate-fade-in { animation: fadeUp 0.3s ease-out forwards; }
        .score-ring { animation: scoreRing 1.5s ease-out forwards; }
        .glass-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-glow {
          background: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59,130,246,0.3), transparent);
        }
        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #7c3aed);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          box-shadow: 0 8px 32px rgba(59,130,246,0.4);
          transform: translateY(-1px);
        }
        .shimmer-border {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="relative min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-glow absolute inset-0" />
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[150px]" />
          <div className="absolute top-[40%] -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Navbar */}
        <Navbar />
        <div style={{ height: '80px' }} className="w-full" />

        {/* 1. Hero Section */}
        <section className="relative px-6 pb-24 pt-12 lg:px-8 lg:pt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
                <Zap className="h-3.5 w-3.5 text-blue-400" />
                AI-Powered Resume Intelligence
              </div>
              <h1 className="animate-fade-up-delay text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
                Scan Your Resume.
                <br />
                <span className="gradient-text">Beat the ATS.</span>
                <br />
                Get Hired.
              </h1>
              <p className="animate-fade-up-delay-2 mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
                Join thousands of candidates and modern hiring teams using AI to match the perfect resume with the perfect job.
              </p>
              
              <div className="animate-fade-up-delay-2 mt-10 flex flex-col sm:flex-row items-center gap-4">
                <a
                  href="#pricing"
                  className="btn-primary w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-lg"
                >
                  View Pricing
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  See How It Works
                </a>
              </div>
              
              <div className="animate-fade-up-delay-2 mt-10 border-t border-white/10 pt-6 flex items-center gap-8">
                <div>
                  <div className="flex -space-x-2">
                    <img className="w-8 h-8 rounded-full border-2 border-[#0a0a1a]" src="https://i.pravatar.cc/100?img=1" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-[#0a0a1a]" src="https://i.pravatar.cc/100?img=2" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-[#0a0a1a]" src="https://i.pravatar.cc/100?img=3" alt="User" />
                    <img className="w-8 h-8 rounded-full border-2 border-[#0a0a1a]" src="https://i.pravatar.cc/100?img=4" alt="User" />
                    <div className="w-8 h-8 rounded-full border-2 border-[#0a0a1a] bg-blue-600 flex items-center justify-center text-[10px] font-bold">+10k</div>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">Trusted by professionals</p>
                </div>
                <div>
                  <div className="flex gap-1 text-yellow-400 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-sm text-slate-400">4.9/5 Average Rating</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative flex items-center justify-center gap-4 lg:gap-6">
              <div className="hidden sm:block">
                <UploadMockup />
              </div>
              <div className="sm:-mt-16">
                <ATSScoreCard />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Features */}
        <section id="features" className="relative scroll-mt-24 px-6 py-24 lg:px-8 border-t border-white/5 bg-white/[0.01]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-400">Features</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to optimize your resume
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-400">
                Our AI engine analyzes every section of your resume and delivers insights that help you
                stand out to recruiters and pass automated screening.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="glass-card group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.08]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="mb-2 font-bold text-white text-lg">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. How It Works */}
        <section id="how-it-works" className="relative scroll-mt-24 px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-400">How It Works</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tailored for Candidates & Recruiters</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Candidate Flow */}
              <div className="glass-card rounded-3xl p-8 lg:p-12 border-blue-500/20">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold">For Candidates</h3>
                </div>
                <div className="space-y-8">
                  {candidateSteps.map((step, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== candidateSteps.length - 1 && (
                        <div className="absolute left-6 top-14 bottom-[-2rem] w-px bg-white/10" />
                      )}
                      <div className="w-12 h-12 rounded-full bg-[#1a1a2e] border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 shrink-0 z-10">
                        {step.num}
                      </div>
                      <div className="pt-2">
                        <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                        <p className="text-slate-400 text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recruiter Flow */}
              <div id="recruiter" className="scroll-mt-24 glass-card rounded-3xl p-8 lg:p-12 border-violet-500/20">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-violet-500/20 rounded-xl">
                    <Briefcase className="w-6 h-6 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold">For Recruiters</h3>
                </div>
                <div className="space-y-8">
                  {recruiterSteps.map((step, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== recruiterSteps.length - 1 && (
                        <div className="absolute left-6 top-14 bottom-[-2rem] w-px bg-white/10" />
                      )}
                      <div className="w-12 h-12 rounded-full bg-[#1a1a2e] border border-violet-500/30 flex items-center justify-center font-bold text-violet-400 shrink-0 z-10">
                        {step.num}
                      </div>
                      <div className="pt-2">
                        <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                        <p className="text-slate-400 text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Pricing */}
        <section id="pricing" className="relative scroll-mt-24 px-6 py-24 lg:px-8 border-t border-white/5 bg-white/[0.01]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-400">Pricing</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent plans</h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-400">
                Start free and upgrade when you need more power. No hidden fees.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
              {PRICING_ARRAY.map((plan) => (
                <div
                  key={plan.name}
                  className={`glass-card relative flex flex-col rounded-3xl p-8 transition-transform hover:-translate-y-2 ${
                    plan.highlight
                      ? "border-blue-500/40 shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/30"
                      : "border-white/10"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <span className="rounded-full bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-400">{plan.desc}</p>
                  </div>
                  
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                    <span className="text-slate-400 font-medium">{plan.period}</span>
                  </div>
                  
                  <ul className="mb-8 flex-1 space-y-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={plan.href}
                    className={`block w-full rounded-xl py-4 text-center text-sm font-bold transition-all ${
                      plan.highlight
                        ? "btn-primary text-white"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Testimonials */}
        <section className="relative px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Job Seekers & Hiring Managers</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-8 relative">
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5" />
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                  <div>
                    <p className="font-bold text-white">{t.author}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section id="faq" className="relative scroll-mt-24 px-6 py-24 lg:px-8 border-t border-white/5 bg-white/[0.01]">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group glass-card rounded-2xl cursor-pointer">
                  <summary className="flex items-center justify-between p-6 font-semibold list-none">
                    {faq.question}
                    <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative px-6 pb-24 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-16 text-center shadow-2xl shadow-blue-500/20 border border-blue-400/30">
              <div className="shimmer-border absolute inset-0 opacity-50" />
              <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Ready to optimize your hiring process or job search?
              </h2>
              <p className="relative mx-auto max-w-lg text-blue-100 mb-8">
                Join thousands of users leveraging AI to make better career and hiring decisions.
              </p>
              <div className="relative flex justify-center">
                <a
                  href="#pricing"
                  className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-xl transition-transform hover:scale-105"
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-black/40 px-6 py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-4 lg:gap-12">
              <div className="md:col-span-1">
                <Logo />
                <p className="mt-4 text-xs text-slate-400 leading-relaxed max-w-xs">
                  ResumeAI leverages cutting-edge artificial intelligence to analyze, score, and optimize resumes for ATS compatibility.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                  <li><a href="#how-it-works" className="hover:text-blue-400 transition-colors">How it works</a></li>
                  <li><a href="#recruiter" className="hover:text-blue-400 transition-colors">Recruiter Portal</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                  <li><a href="#faq" className="hover:text-blue-400 transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 text-sm text-slate-500">
              <p>© {new Date().getFullYear()} ResumeAI Scanner. All rights reserved.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-white transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
