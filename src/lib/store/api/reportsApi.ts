import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export interface PostComment {
  id: string;
  post_id: string;
  content: string;
  author_name: string | null;
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  content: string;
  author_name: string | null;
  likes: number;
  category: string;
  image_url?: string | null;
  created_by: string;
  createdAt: string;
  updatedAt: string;
  comments: PostComment[];
}

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
  post?: CommunityPost | null;
  comment?: PostComment | null;
}

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Reports", "Posts"],
  endpoints: (builder) => ({
    getAllReports: builder.query<ReportedPost[], void>({
      query: () => "/community/reports",
      providesTags: [{ type: "Reports", id: "LIST" }],
    }),
    getAllPosts: builder.query<CommunityPost[], { category?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.category && params.category !== "all") {
          queryParams.set("category", params.category);
        }
        return `/community/posts${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      },
      providesTags: [{ type: "Posts", id: "LIST" }],
    }),
    getPostById: builder.query<CommunityPost, string>({
      query: (id) => `/community/posts/${id}`,
      providesTags: (_, __, id) => [{ type: "Posts", id }],
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
      invalidatesTags: [{ type: "Reports", id: "LIST" }, { type: "Posts", id: "LIST" }],
    }),
    deleteComment: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/community/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }, { type: "Posts", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllReportsQuery,
  useGetAllPostsQuery,
  useGetPostByIdQuery,
  useUpdateReportMutation,
  useDeletePostMutation,
  useDeleteCommentMutation,
} = reportsApi;
