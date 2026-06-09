import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export interface Subscription {
  id: string;
  userId: string;
  type: string;
  startDate: string;
  endDate: string;
  token: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
    role: string;
  };
}

export interface SubscriptionsQuery {
  page?: number;
  limit?: number;
  type?: string;
  status?: "active" | "expired";
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

export interface GrantSubscriptionRequest {
  targetUserId: string;
  type: "weekly" | "monthly" | "yearly";
  durationDays?: number;
}

export const subscriptionsApi = createApi({
  reducerPath: "subscriptionsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Subscriptions"],
  endpoints: (builder) => ({
    getAllSubscriptions: builder.query<PaginatedResponse<Subscription>, SubscriptionsQuery>({
      query: ({ page = 1, limit = 20, type, status } = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (type) params.set("type", type);
        if (status) params.set("status", status);
        return `/subscription/admin/all?${params.toString()}`;
      },
      providesTags: [{ type: "Subscriptions", id: "LIST" }],
    }),
    grantSubscription: builder.mutation<{ success: boolean; subscription: Subscription }, GrantSubscriptionRequest>({
      query: (body) => ({
        url: "/subscription/admin-grant",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Subscriptions", id: "LIST" }],
    }),
  }),
});

export const { useGetAllSubscriptionsQuery, useGrantSubscriptionMutation } = subscriptionsApi;
