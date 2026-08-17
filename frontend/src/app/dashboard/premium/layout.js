"use client";
import Navbar from "@/components/dashboard/Navbar";
import PremiumSidebar from "@/components/dashboard/PremiumSidebar";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

export default function PremiumLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check local storage
    const isPremium = localStorage.getItem("isPremium") === "true" || localStorage.getItem("isPremium") === "True";
    
    setIsAuthorized(isPremium);
    setIsReady(true);
  }, [pathname]);

  if (!isReady) {
    return null; // Wait for hydration
  }

  // If not premium, and they are trying to access a tool (not the payment page)
  const isPaymentPage = pathname === "/dashboard/premium/payment";
  const showUpgradePrompt = !isAuthorized && !isPaymentPage;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="print:hidden sticky top-0 z-50">
        <Navbar />
      </div>
      <div className="flex flex-1">
        <PremiumSidebar />
        <div className="flex-1 overflow-x-hidden relative">
          {showUpgradePrompt ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 p-6">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Required</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">This feature is exclusive to Premium users. Upgrade now to unlock advanced AI Resume scanning, building, and career insights.</p>
                    <button 
                        onClick={() => router.push('/dashboard/premium/payment')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                        <span>Upgrade Now - ₹499/month</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="mt-6 text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                        Return to Free Dashboard
                    </button>
                </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

