import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    avatarUrl: string | null;
    role: string;
    isVerified: boolean;
    isBlocked: boolean;
  };
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refreshToken: builder.mutation<RefreshResponse, { refresh_token: string }>({
      query: (body) => ({
        url: "/auth/refresh-token",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<AuthResponse["user"], void>({
      query: () => "/auth/me",
    }),
    forgotPassword: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<{ success: boolean; message: string; resetToken: string }, { email: string; otp: string }>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<{ success: boolean; message: string }, { resetToken: string; newPassword: string }>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    updateMe: builder.mutation<AuthResponse["user"], Partial<AuthResponse["user"]> & { password?: string }>({
      query: (body) => ({
        url: "/auth/me",
        method: "PUT",
        body,
      }),
    }),
    uploadAvatar: builder.mutation<{ file_url: string }, FormData>({
      query: (formData) => ({
        url: "/integration/files/upload",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useUpdateMeMutation,
  useUploadAvatarMutation,
} = authApi;
