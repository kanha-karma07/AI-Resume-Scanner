"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Users, UserSquare2, FileText, 
  Briefcase, CreditCard, BarChart3, Settings, LogOut, Loader2 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsAuthorized(true);
      return;
    }

    const token = localStorage.getItem("admin_access");
    const role = localStorage.getItem("admin_role");

    if (!token || role !== "admin") {
      toast.error("Unauthorized. Admin access required.");
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_access");
    localStorage.removeItem("admin_refresh");
    localStorage.removeItem("admin_role");
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Candidates", icon: Users, href: "/admin/candidates" },
    { name: "Recruiters", icon: UserSquare2, href: "/admin/recruiters" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Resumes", icon: FileText, href: "/admin/resumes" },
    { name: "Job Descriptions", icon: Briefcase, href: "/admin/job-descriptions" },
    { name: "Subscriptions", icon: CreditCard, href: "/admin/subscriptions" },
    { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { name: "Profile", icon: Settings, href: "/admin/profile" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex z-10 shadow-sm">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Admin Portal
            </span>
          </div>
          
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                    isActive 
                      ? "bg-blue-50 text-blue-700 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Mobile Menu Toggle & Breadcrumbs */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm z-10 shrink-0">
           <h2 className="text-lg font-semibold capitalize text-slate-800">
             {pathname.split("/").filter(Boolean).pop()?.replace("-", " ") || "Dashboard"}
           </h2>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
