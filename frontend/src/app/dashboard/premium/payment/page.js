"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { PRICING_PLANS } from "@/constants/pricing";
import toast from "react-hot-toast";

export default function PremiumPaymentPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [processingStep, setProcessingStep] = useState("");
    const [success, setSuccess] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState("Credit Card");
    const [userProfile, setUserProfile] = useState(null);

    const plan = PRICING_PLANS.CANDIDATE_PREMIUM;

    useEffect(() => {
        const token = localStorage.getItem("access");
        const isPremium = localStorage.getItem("isPremium") === "true" || localStorage.getItem("isPremium") === "True";
        
        if (!token) {
            router.push("/login");
        } else if (isPremium) {
            router.push("/dashboard/premium");
        } else {
            api.get('candidate/profile/').then(res => setUserProfile(res.data.user)).catch(() => {});
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
            setProcessingStep("Activating Premium...");
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
                    
                    // Update user context with new premium status if needed by recalling profile
                    localStorage.setItem("isPremium", "true");
                    localStorage.setItem("plan", "PREMIUM");

                    setTimeout(() => {
                        router.push("/dashboard/premium");
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
                    <p className="text-green-600 font-semibold mb-6">Premium Activated Successfully</p>
                    
                    <div className="bg-gray-50 rounded-xl p-4 text-left mb-8 space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between"><span>Transaction ID</span><span className="font-mono text-gray-900">{paymentDetails.txnId}</span></div>
                        <div className="flex justify-between"><span>Order ID</span><span className="font-mono text-gray-900">{paymentDetails.orderId}</span></div>
                        <div className="flex justify-between"><span>Date</span><span className="text-gray-900">{paymentDetails.date}</span></div>
                        <div className="flex justify-between"><span>Amount</span><span className="text-gray-900">{plan.price}</span></div>
                    </div>
                    
                    <div className="animate-pulse text-sm text-gray-500">Redirecting to Premium Dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.push('/dashboard')} className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                    {/* Left: Summary */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 md:w-2/5 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Order Summary</h2>
                            <p className="text-blue-100 mb-8">{plan.name}</p>
                            
                            <div className="space-y-4 mb-8">
                                {plan.features.map((benefit, i) => (
                                    <div key={i} className="flex items-center text-sm">
                                        <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="border-t border-blue-500/50 pt-6 mt-8">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total (USD)</span>
                                <span>{plan.price}{plan.period}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Method */}
                    <div className="p-8 md:w-3/5">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Demo Payment</h3>
                            <p className="text-sm text-gray-500">Select a payment method to simulate the transaction</p>
                        </div>
                        
                        <div className="space-y-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                <input type="text" disabled value={userProfile?.full_name || userProfile?.username || "Guest User"} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                                <input type="text" disabled value={userProfile?.email || ""} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 focus:outline-none" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                            <div className="grid grid-cols-2 gap-4">
                                {["Credit Card", "UPI", "Net Banking", "Wallet"].map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => setSelectedMethod(method)}
                                        disabled={loading}
                                        className={`px-4 py-3 border rounded-xl flex items-center justify-center transition-all ${selectedMethod === method ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50'}`}
                                    >
                                        <span className="text-sm font-medium">{method}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleDemoPayment}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    {processingStep}
                                </>
                            ) : (
                                "Pay Now"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
