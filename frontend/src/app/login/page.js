"use client";

import { useForm } from "react-hook-form";
import { loginUser } from "@/services/authService";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    reset({
      email: "",
      password: ""
    });
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await loginUser(data);

      // JWT Token Save
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("userRole", response.data.role);
      localStorage.setItem("isPremium", response.data.is_premium);
      localStorage.setItem("membershipType", response.data.membership_type);
      localStorage.setItem("subscriptionStatus", response.data.subscriptionStatus);
      localStorage.setItem("plan", response.data.plan);
      localStorage.setItem("paymentStatus", response.data.paymentStatus);

      // If admin, also store admin specific tokens
      const role = response.data.role;
      if (role === "admin") {
        localStorage.setItem("admin_access", response.data.access);
        localStorage.setItem("admin_refresh", response.data.refresh);
        localStorage.setItem("admin_role", response.data.role);
      }

      console.log("Login Response:", response.data);
      console.log("Stored Access Token:", localStorage.getItem("access"));
      console.log("Stored Refresh Token:", localStorage.getItem("refresh"));

      toast.success("Login Successful!");
      reset();

      // Dashboard routing based on role
      if (role === "candidate") {
        if (response.data.is_premium === true || response.data.is_premium === "True" || response.data.is_premium === "true") {
          router.push("/dashboard/premium");
        } else {
          router.push("/dashboard");
        }
      } else if (role === "recruiter") {
        if (response.data.is_premium === true || response.data.is_premium === "True" || response.data.is_premium === "true") {
          router.push("/recruiter/premium/dashboard");
        } else {
          router.push("/recruiter/dashboard");
        }
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      if (error.response?.data) {
        Object.keys(error.response.data).forEach(key => {
          setError(key, {
            type: "server",
            message: Array.isArray(error.response.data[key]) 
              ? error.response.data[key][0] 
              : error.response.data[key]
          });
        });
      } else {
        toast.error("Invalid Username or Password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="relative min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.3),transparent)]" />
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[150px]" />
          <div className="absolute top-[40%] -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-white/10">
            
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
                  <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Resume<span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">AI</span>
                </span>
              </Link>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-slate-400 mt-2">Please enter your details to sign in.</p>
            </div>

          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email format"
                  }
                })}
                type="email"
                placeholder="Email Address"
                className={`w-full border rounded-xl px-4 py-3.5 outline-none transition-all placeholder-slate-500 ${
                  errors.email ? "border-red-500/50 bg-red-500/10" : "border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/5 focus:bg-white/10 text-white"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is required",
                })}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Password"
                className={`w-full border rounded-xl px-4 py-3.5 pr-12 outline-none transition-all placeholder-slate-500 ${
                  errors.password ? "border-red-500/50 bg-red-500/10" : "border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/5 focus:bg-white/10 text-white"
                }`}
              />
              <button 
                type="button"
                className="absolute right-4 top-[14px] text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-blue-500 to-violet-600 hover:shadow-[0_8px_32px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              Register as Candidate
            </Link>
            {" "}or{" "}
            <Link href="/register/recruiter" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              Recruiter
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
