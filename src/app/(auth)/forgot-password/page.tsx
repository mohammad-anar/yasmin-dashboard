"use client";

import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useForgotPasswordMutation, useVerifyOtpMutation } from "@/lib/store/api/authApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ForgotPasswordForm {
  email: string;
}

interface OtpForm {
  otp: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
  } = useForm<OtpForm>({
    defaultValues: {
      otp: "",
    },
  });

  const onEmailSubmit = async (data: ForgotPasswordForm) => {
    try {
      const response = await forgotPassword({ email: data.email }).unwrap();
      toast.success(response.message || "OTP code sent to your email!");
      setSubmittedEmail(data.email);
      setStep("otp");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to send OTP code. Please try again.");
    }
  };

  const onOtpSubmit = async (data: OtpForm) => {
    try {
      const response = await verifyOtp({ email: submittedEmail, otp: data.otp }).unwrap();
      toast.success(response.message || "OTP verified successfully!");
      // Redirect to reset-password with the token and email
      router.push(`/reset-password?token=${response.resetToken}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Invalid or expired OTP. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md px-8">
      {step === "email" ? (
        <>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Forgot Password
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enter the email of your account and we&apos;ll
              <br />
              send a code to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ring"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  {...registerEmail("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input/30 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {emailErrors.email && (
                <p className="text-destructive text-xs mt-1">
                  {emailErrors.email.message}
                </p>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isSendingOtp}
              className="w-full !bg-my-primary py-6 rounded-lg text-lg font-semibold text-white hover:bg-my-primary/90 transition-colors"
            >
              {isSendingOtp ? "Sending..." : "Send OTP"}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-my-green font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Verify OTP
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We sent a 6-digit code to
              <br />
              <strong className="text-foreground">{submittedEmail}</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="space-y-6">
            {/* OTP Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Verification Code
              </label>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ring"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  {...registerOtp("otp", {
                    required: "OTP code is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "OTP must be exactly 6 digits",
                    },
                  })}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input/30 tracking-[0.2em] font-mono text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {otpErrors.otp && (
                <p className="text-destructive text-xs mt-1">
                  {otpErrors.otp.message}
                </p>
              )}
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={isVerifyingOtp}
              className="w-full !bg-my-primary py-6 rounded-lg text-lg font-semibold text-white hover:bg-my-primary/90 transition-colors"
            >
              {isVerifyingOtp ? "Verifying..." : "Verify Code"}
            </Button>
          </form>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} /> Use a different email
            </button>
            <p className="text-muted-foreground text-sm">
              Didn&apos;t get code?{" "}
              <button
                type="button"
                onClick={() => onEmailSubmit({ email: submittedEmail })}
                className="text-my-green font-medium hover:underline"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
