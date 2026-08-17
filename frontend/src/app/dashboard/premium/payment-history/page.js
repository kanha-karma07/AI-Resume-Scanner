"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function PaymentHistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access");
        const premStatus = localStorage.getItem("isPremium") === "true" || localStorage.getItem("isPremium") === "True";
        setIsPremium(premStatus);

        if (!token) {
            router.push("/login");
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await api.get("premium/payment-history/");
                setHistory(response.data);
            } catch (err) {
                console.error("Failed to fetch payment history", err);
                setError("Failed to load payment history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [router]);

    return (
        <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-sm text-gray-500 mt-1">View your past transactions and subscription payments</p>
                </div>
                <button
                    onClick={() => router.push(isPremium ? "/dashboard/premium" : "/dashboard")}
                    className="flex items-center text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <svg className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500">Loading history...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    {error}
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                    <p className="text-gray-500 mt-1">You haven't made any payments yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Transaction ID</th>
                                    <th className="p-4">Plan</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {history.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-600 whitespace-nowrap">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-mono text-gray-500 text-xs">
                                            {tx.order_id || 'N/A'}
                                        </td>
                                        <td className="p-4 font-mono text-gray-500 text-xs">
                                            {tx.payment_id || 'N/A'}
                                        </td>
                                        <td className="p-4 text-gray-900 font-medium">
                                            {tx.plan}
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {tx.payment_type}
                                        </td>
                                        <td className="p-4 text-gray-900 font-medium">
                                            ₹{tx.amount}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${tx.status.toLowerCase() === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {tx.status.toLowerCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
