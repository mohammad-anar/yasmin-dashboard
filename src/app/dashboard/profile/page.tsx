"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import { setCredentials } from "@/lib/store/authSlice";
import { useUpdateMeMutation, useUploadAvatarMutation } from "@/lib/store/api/authApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Camera, 
  Loader2, 
  ShieldAlert, 
  Eye, 
  EyeOff 
} from "lucide-react";

interface ProfileFormValues {
  name: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const { user } = authState;

  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || "",
      phone: (user as any)?.phone || "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchPassword = watch("password");

  // Handle image selection & upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadAvatar(formData).unwrap();
      setAvatarPreview(res.file_url);
      toast.success("Profile image uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.data?.message || "Failed to upload image. Please try again.");
    }
  };

  const onFormSubmit = async (data: ProfileFormValues) => {
    try {
      const payload: any = {
        name: data.name,
        phone: data.phone,
        avatarUrl: avatarPreview,
      };

      if (data.password) {
        payload.password = data.password;
      }

      const updatedUser = await updateMe(payload).unwrap();

      // Update local storage and Redux store state
      if (authState.accessToken && authState.refreshToken) {
        dispatch(
          setCredentials({
            accessToken: authState.accessToken,
            refreshToken: authState.refreshToken,
            user: {
              ...user,
              ...updatedUser,
              role: updatedUser.role.toLowerCase(),
            } as any,
          })
        );
      }

      toast.success("Profile updated successfully!");
      // Reset password fields
      reset({
        name: data.name,
        phone: data.phone,
        password: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Update profile error:", err);
      toast.error(err?.data?.message || "Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="container py-8 max-w-4xl" style={{ color: "var(--brand-text-primary)" }}>
      {/* Page Title */}
      <div className="mb-8 border-b pb-4 border-border">
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account profile details, profile picture, and credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Quick Info */}
        <div className="md:col-span-1 flex flex-col items-center p-6 rounded-2xl border border-border bg-card shadow-sm h-fit">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="w-32 h-32 border-4 border-background shadow-md">
              <AvatarImage src={avatarPreview} alt={user?.name || "Admin"} />
              <AvatarFallback className="text-2xl font-bold bg-muted">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-lg font-bold">{user?.name || "Administrator"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize px-2 py-0.5 rounded-full inline-block bg-muted">
              {user?.role || "Admin"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{user?.email}</p>
          </div>

          <p className="text-[11px] text-muted-foreground text-center mt-6 border-t pt-4 w-full">
            Click on the photo to upload a new profile picture. Max 2MB.
          </p>
        </div>

        {/* Right Column - Profile Settings Form */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2 border-border mb-4">Account Information</h3>

            {/* Email Field (READ ONLY) */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Mail size={16} /> Email Address (Read-Only)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted/65 text-muted-foreground cursor-not-allowed focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
                <ShieldAlert size={12} /> Email address cannot be changed for security reasons.
              </p>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <User size={16} /> Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Phone size={16} /> Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter phone number"
                {...register("phone")}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 border-border pt-4 mb-4">Change Password</h3>

            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Lock size={16} /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a new password"
                  {...register("password", {
                    minLength: watchPassword ? { value: 8, message: "Password must be at least 8 characters" } : undefined
                  })}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ring hover:opacity-75"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Lock size={16} /> Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  {...register("confirmPassword", {
                    validate: (value) => {
                      if (watchPassword && !value) return "Please confirm your password";
                      if (watchPassword && value !== watchPassword) return "Passwords do not match";
                      return true;
                    }
                  })}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ring hover:opacity-75"
                >
                  {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full md:w-auto px-8 py-5 text-base font-semibold"
                style={{ backgroundColor: "var(--brand-accent)" }}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
