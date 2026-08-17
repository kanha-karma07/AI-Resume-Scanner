"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileText, Edit, RefreshCw, 
  Target, CopyPlus, Lightbulb, Mail, Mic, 
  History, User, CreditCard
} from "lucide-react";

export default function PremiumSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard/premium", icon: <LayoutDashboard size={20} /> },
    { name: "Resume Builder", href: "/dashboard/premium/resume-builder", icon: <FileText size={20} /> },
    { name: "Resume Editor", href: "/dashboard/premium/resume-editor", icon: <Edit size={20} /> },
    { name: "ATS Analysis", href: "/dashboard/premium/advanced-ats", icon: <Target size={20} /> },
    { name: "Resume Comparison", href: "/dashboard/premium/resume-comparison", icon: <CopyPlus size={20} /> },
    { name: "Career Insights", href: "/dashboard/premium/career-insights", icon: <Lightbulb size={20} /> },
    { name: "Cover Letter", href: "/dashboard/premium/cover-letter", icon: <Mail size={20} /> },
    { name: "Interview Prep", href: "/dashboard/premium/interview-prep", icon: <Mic size={20} /> },
    { name: "Payment History", href: "/dashboard/premium/payment-history", icon: <CreditCard size={20} /> },
    { name: "History", href: "/dashboard/history", icon: <History size={20} /> },
    { name: "Profile", href: "/dashboard/profile", icon: <User size={20} /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full min-h-[calc(100vh-76px)] flex flex-col hidden lg:flex print:hidden sticky top-[76px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Premium Tools</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
              }`}
            >
              <div className={isActive ? "text-blue-600" : "text-gray-400"}>
                {item.icon}
              </div>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
