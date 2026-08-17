"use client";

import { useForm } from "react-hook-form";
import { registerRecruiter } from "@/services/authService";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";

export default function RecruiterRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setValue,
    watch
  } = useForm({ mode: "onTouched" });

  const passwordValue = watch("password");

  useEffect(() => {
    reset({
      full_name: "",
      company_name: "",
      email: "",
      password: "",
      confirm_password: ""
    });
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
      };

      await registerRecruiter(payload);
      toast.success("Recruiter Registration Successful!");
      reset();
      router.push("/login");

    } catch (error) {
      if (error.response?.data) {
        Object.keys(error.response.data).forEach(key => {
          // If the backend returns an error for full_name, we map it back 
          // (even though we combined it, it might still throw if blank)
          setError(key, {
            type: "server",
            message: Array.isArray(error.response.data[key]) 
              ? error.response.data[key][0] 
              : error.response.data[key]
          });
        });
      } else {
        toast.error("Registration Failed!");
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
              Recruiter Sign Up
            </h1>
            <p className="text-slate-400 mt-2">Create an account to scan and rank resumes.</p>
          </div>

          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <input
                {...register("full_name", { 
                  required: "Full name is required",
                  pattern: {
                    value: /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
                    message: "Recruiter Name can only contain alphabets and spaces."
                  },
                  onChange: (e) => {
                    const value = e.target.value;
                    let val = value.replace(/\s{2,}/g, ' ');
                    if (val.startsWith(' ')) val = val.trimStart();
                    e.target.value = val;
                    setValue('full_name', val, { shouldValidate: !!errors.full_name });
                  },
                  onBlur: (e) => {
                    const value = e.target.value;
                    let val = value.trim();
                    e.target.value = val;
                    setValue('full_name', val, { shouldValidate: true });
                  }
                })}
                type="text"
                placeholder="Full Name"
                className={`w-full border rounded-xl px-4 py-3.5 outline-none transition-all placeholder-slate-500 ${
                  errors.full_name ? "border-red-500/50 bg-red-500/10" : "border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/5 focus:bg-white/10 text-white"
                }`}
              />
              {errors.full_name && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <input
                {...register("company_name", { 
                  required: "Company name is required",
                  pattern: {
                    value: /^(?!\s*$).+/,
                    message: "Company name cannot be blank"
                  }
                })}
                type="text"
                placeholder="Company Name"
                className={`w-full border rounded-xl px-4 py-3.5 outline-none transition-all placeholder-slate-500 ${
                  errors.company_name ? "border-red-500/50 bg-red-500/10" : "border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/5 focus:bg-white/10 text-white"
                }`}
              />
              {errors.company_name && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.company_name.message}</p>}
            </div>

            <div>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^(?!\d+@)[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                    message: "Invalid email address."
                  }
                })}
                type="email"
                autoComplete="off"
                placeholder="Work Email"
                className={`w-full border rounded-xl px-4 py-3.5 outline-none transition-all placeholder-slate-500 ${
                  errors.email ? "border-red-500/50 bg-red-500/10" : "border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/5 focus:bg-white/10 text-white"
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <input
                {...register("password", { 
                  required: "Password is required",
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                    message: "At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character"
                  }
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
              {errors.password && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.password.message}</p>}
            </div>

            <div className="relative">
              <input
                {...register("confirm_password", { 
                  required: "Please confirm your password",
                  validate: value => value === passwordValue || "Passwords do not match."
                })}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm Password"
                className={`w-full border rounded-xl px-4 py-3.5 pr-12 outline-none transition-all placeholder-slate-500 ${
                  errors.confirm_password ? "border-red-500/50 bg-red-500/10" : "border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/5 focus:bg-white/10 text-white"
                }`}
              />
              <button 
                type="button"
                className="absolute right-4 top-[14px] text-slate-400 hover:text-slate-600 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirm_password && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-blue-500 to-violet-600 hover:shadow-[0_8px_32px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              Log in here
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
