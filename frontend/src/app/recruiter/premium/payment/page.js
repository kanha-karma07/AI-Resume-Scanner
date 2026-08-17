"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { CheckCircle, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { PRICING_PLANS } from "@/constants/pricing";

export default function RecruiterPremiumPaymentPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [processingStep, setProcessingStep] = useState("");
    const [success, setSuccess] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);

    const plan = PRICING_PLANS.RECRUITER_PREMIUM;

    useEffect(() => {
        const token = localStorage.getItem("access");
        const role = localStorage.getItem("userRole");
        const isPremium = localStorage.getItem("isPremium") === "true" || localStorage.getItem("isPremium") === "True";
        
        if (!token || role !== "recruiter") {
            router.push("/login");
        } else if (isPremium) {
            router.push("/recruiter/premium/dashboard");
        }
    }, [router]);

    const handleDemoPayment = async () => {
        setLoading(true);
        setProcessingStep("Processing Payment...");
        
        // Simulate processing steps
        setTimeout(() => {
            setProcessingStep("Verifying...");
        }, 1000);

        setTimeout(() => {
            setProcessingStep("Activating Recruiter Premium...");
        }, 2000);

        setTimeout(async () => {
            try {
                // Call actual backend to activate
                const txnId = `TXN-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
                const orderId = `DEMO-ORDER-${Math.floor(10000 + Math.random() * 90000)}`;

                const response = await api.post("premium/demo-payment/", {
                    transaction_id: txnId,
                    order_id: orderId
                });

                if (response.status === 200) {
                    setSuccess(true);
                    setPaymentDetails({ txnId, orderId, date: new Date().toLocaleDateString() });
                    
                    localStorage.setItem("isPremium", "true");
                    localStorage.setItem("plan", "PREMIUM_RECRUITER");

                    setTimeout(() => {
                        router.push("/recruiter/premium/dashboard");
                    }, 3000);
                }
            } catch (error) {
                console.error("Payment error", error);
                toast.error("Something went wrong during demo payment.");
                setLoading(false);
            }
        }, 3000);
    };

    if (success && paymentDetails) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-8">Welcome to Recruiter Premium. You have unlocked AI Job Generation and Bulk Resume Matching.</p>
                    
                    <div className="bg-gray-50 rounded-2xl p-6 text-sm text-left space-y-4 mb-8 border border-gray-100">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Transaction ID</span>
                            <span className="font-semibold text-gray-900">{paymentDetails.txnId}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500">Date</span>
                            <span className="font-semibold text-gray-900">{paymentDetails.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="font-semibold text-gray-900">{plan.price}</span>
                        </div>
                    </div>

                    <button 
                        disabled
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 opacity-80 cursor-not-allowed"
                    >
                        <Loader2 className="animate-spin" size={20} />
                        Redirecting to Dashboard...
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <Toaster position="top-right" />
            <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row border border-gray-100">
                {/* Left Side: Summary */}
                <div className="md:w-5/12 bg-gray-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                        <p className="text-gray-400 text-sm mb-8">{plan.desc}</p>
                        
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subscription</span>
                                <span>Monthly Plan</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal</span>
                                <span>{plan.price}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-700 pt-4 mt-4">
                                <span className="text-lg">Total</span>
                                <span className="text-2xl font-bold">{plan.price}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Demo Payment */}
                <div className="md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Demo Payment</h3>
                    <p className="text-gray-600 mb-8">
                        This is a simulated payment gateway. No real charges will be made. Click below to simulate a successful transaction and upgrade your account instantly.
                    </p>

                    <button 
                        onClick={handleDemoPayment}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                {processingStep}
                            </>
                        ) : (
                            `Pay ${plan.price} (Demo)`
                        )}
                    </button>
                    <p className="text-center text-gray-500 text-sm mt-4">
                        Secure 256-bit encryption simulated.
                    </p>
                </div>
            </div>
        </div>
    );
}
