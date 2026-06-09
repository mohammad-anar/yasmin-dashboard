"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useResetPasswordMutation } from "@/lib/store/api/authApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get("token") || "";
      setToken(tokenParam);
      if (!tokenParam) {
        toast.error("Password reset token is missing. Please request a new code.");
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error("Missing reset token. Please request another OTP.");
      return;
    }

    try {
      const response = await resetPassword({
        resetToken: token,
        newPassword: data.newPassword,
      }).unwrap();

      toast.success(response.message || "Password reset successfully!");
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to reset password. The link may have expired.");
    }
  };

  return (
    <div className="w-full max-w-md px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Create New Password
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your new password must be different from
          <br />
          previous passwords.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* New Password Field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ring"
              size={20}
            />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="enter your password"
              {...register("newPassword", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-input/30"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ring hover:opacity-70"
            >
              {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-destructive text-xs mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ring"
              size={20}
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="enter your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring bg-input/30"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ring hover:opacity-70"
            >
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Button */}
        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "#c9a227" }}
        >
          {isLoading ? "Resetting..." : "Confirm"}
        </button>
      </form>

      {/* Back to Login Link */}
      <div className="text-center mt-6">
        <Link
          href="/login"
          className="text-accent text-sm font-medium hover:underline"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
