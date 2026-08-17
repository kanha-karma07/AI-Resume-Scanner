export const PRICING_PLANS = {
  FREE: {
    id: "free",
    name: "Free Plan",
    price: "Free",
    period: "",
    desc: "Perfect for trying the scanner",
    features: [
      "Resume Upload",
      "ATS Score",
      "Resume Suggestions",
      "Resume History"
    ],
    cta: "Get Started",
    highlight: false,
    href: "/register"
  },
  CANDIDATE_PREMIUM: {
    id: "candidate_premium",
    name: "Premium Plan",
    price: "$15",
    period: "/mo",
    desc: "For active job seekers",
    badge: "Best Value",
    features: [
      "AI Resume Builder",
      "AI Resume Editor",
      "Resume Rewrite",
      "Advanced ATS Analysis",
      "Resume Comparison",
      "AI Career Insights",
      "Cover Letter Generator",
      "Interview Preparation",
      "Unlimited Resume Analysis"
    ],
    cta: "Upgrade to Premium",
    highlight: true,
    href: "/dashboard/premium/payment"
  },
  RECRUITER_PREMIUM: {
    id: "recruiter_premium",
    name: "Recruiter Plan",
    price: "$49",
    period: "/mo",
    desc: "Built for hiring teams",
    features: [
      "Bulk resume screening",
      "Candidate ranking",
      "AI Job Description Generation",
      "Team dashboard",
      "Custom job pipelines",
      "Unlimited Job Descriptions"
    ],
    cta: "Get Recruiter Access",
    highlight: false,
    href: "/register/recruiter"
  }
};

export const PRICING_ARRAY = [
  PRICING_PLANS.FREE,
  PRICING_PLANS.CANDIDATE_PREMIUM,
  PRICING_PLANS.RECRUITER_PREMIUM
];
