"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, Loader2, HeartPulse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/lib/store/api/authApi";
import { setCredentials } from "@/lib/store/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store/store";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const result = await login(data).unwrap();

      if (result.user.role !== "admin") {
        setServerError("Access denied. Admin credentials required.");
        return;
      }

      dispatch(
        setCredentials({
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          user: result.user,
        })
      );
      router.push("/dashboard");
    } catch (err: any) {
      setServerError(
        err?.data?.message || "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, var(--brand-bg) 0%, var(--brand-surface) 100%)" }}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10" style={{ boxShadow: "0 25px 50px rgba(45,36,32,0.15)" }}>
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "var(--brand-accent)" }}>
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--brand-text-primary)", fontFamily: "var(--font-display)" }}>
              Yasmin Dashboard
            </h1>
            <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>
              Sign in with your admin credentials to continue
            </p>
          </div>

          {/* Error */}
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)", border: "1px solid rgba(192,57,43,0.2)" }}>
              {serverError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--brand-text-secondary)" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--brand-text-muted)" }} />
                <input
                  type="email"
                  id="login-email"
                  placeholder="admin@yasmin.app"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                  })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
                  style={{
                    border: `1.5px solid ${errors.email ? "var(--status-danger)" : "var(--brand-border)"}`,
                    background: "var(--brand-surface)",
                    color: "var(--brand-text-primary)",
                  }}
                />
              </div>
              {errors.email && <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--status-danger)" }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--brand-text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--brand-text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all focus:outline-none"
                  style={{
                    border: `1.5px solid ${errors.password ? "var(--status-danger)" : "var(--brand-border)"}`,
                    background: "var(--brand-surface)",
                    color: "var(--brand-text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--brand-text-muted)" }}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--status-danger)" }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-all mt-2 disabled:opacity-70 cursor-pointer"
              style={{ background: "var(--brand-accent)" }}
              onMouseEnter={(e) => { if (!isLoading) (e.target as HTMLElement).style.background = "var(--brand-accent-hover)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "var(--brand-accent)"; }}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs mt-6" style={{ color: "var(--brand-text-muted)" }}>
            Yasmin HerWellness Admin Panel · Admin access only
          </p>
        </div>
      </div>
    </div>
  );
}
