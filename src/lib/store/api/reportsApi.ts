import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export interface ReportedPost {
  id: string;
  post_id: string | null;
  comment_id: string | null;
  content_type: "post" | "comment";
  reported_content: string | null;
  reported_author: string | null;
  reporter_email: string | null;
  reason: string | null;
  status: "pending" | "reviewed" | "removed";
  createdAt: string;
  updatedAt: string;
}

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Reports"],
  endpoints: (builder) => ({
    getAllReports: builder.query<ReportedPost[], void>({
      query: () => "/community/reports",
      providesTags: [{ type: "Reports", id: "LIST" }],
    }),
    updateReport: builder.mutation<ReportedPost, { id: string; status: "reviewed" | "removed" }>({
      query: ({ id, status }) => ({
        url: `/community/reports/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),
    deletePost: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/community/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),
    deleteComment: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/community/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllReportsQuery,
  useUpdateReportMutation,
  useDeletePostMutation,
  useDeleteCommentMutation,
} = reportsApi;
