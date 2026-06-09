import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  platform: string | null;
  language: string;
  subscription?: {
    type: string;
    endDate: string;
  } | null;
}

export interface UserDetail extends User {
  phone?: string | null;
  userProfile: {
    id: string;
    height_cm: number | null;
    weight_kg: number | null;
    age: number | null;
    activity_level: string;
    injuries: string[];
    exercise_dislikes: string[];
    dietary_preferences: string;
    device_token: string | null;
    device_platform: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  subscription: {
    id: string;
    userId: string;
    type: string;
    startDate: string;
    endDate: string;
    token: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isBlocked?: boolean;
  includeDeleted?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  blockedUsers: number;
  deletedUsers: number;
  activeSubscriptions: number;
  recentUsers: { createdAt: string }[];
  subscriptionBreakdown: { type: string; count: number }[];
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Users", "User", "Stats"],
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => "/auth/admin/stats",
      providesTags: ["Stats"],
    }),
    getUsers: builder.query<PaginatedResponse<User>, UsersQuery>({
      query: ({ page = 1, limit = 20, search, role, isBlocked, includeDeleted } = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (search) params.set("search", search);
        if (role) params.set("role", role);
        if (isBlocked !== undefined) params.set("isBlocked", String(isBlocked));
        if (includeDeleted) params.set("includeDeleted", "true");
        return `/auth/admin/users?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),
    getUser: builder.query<UserDetail, string>({
      query: (id) => `/auth/admin/users/${id}`,
      providesTags: (_, __, id) => [{ type: "User", id }],
    }),
    blockUser: builder.mutation<{ success: boolean; isBlocked: boolean; message: string }, string>({
      query: (id) => ({
        url: `/auth/admin/users/${id}/block`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Users", id: "LIST" },
        { type: "User", id },
        "Stats",
      ],
    }),
    deleteUser: builder.mutation<{ success: boolean; deleted: boolean; message: string }, string>({
      query: (id) => ({
        url: `/auth/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Users", id: "LIST" },
        { type: "User", id },
        "Stats",
      ],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useBlockUserMutation,
  useDeleteUserMutation,
} = usersApi;
