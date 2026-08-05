"use client";

import { useState } from "react";
import {
  useGetAllPostsQuery,
  useGetAllReportsQuery,
  useDeletePostMutation,
  useDeleteCommentMutation,
  CommunityPost,
  PostComment,
  ReportedPost,
} from "@/lib/store/api/reportsApi";
import { MessageSquare, Heart, Trash2, Eye, Flag, AlertTriangle, Loader2, X, User, Calendar, Tag, ShieldAlert } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const CATEGORIES = [
  { label: "All Categories", value: "all" },
  { label: "General", value: "general" },
  { label: "Tips", value: "tips" },
  { label: "Support", value: "support" },
  { label: "Workout", value: "workout" },
  { label: "Nutrition", value: "nutrition" },
];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: posts = [], isLoading: isLoadingPosts, refetch: refetchPosts } = useGetAllPostsQuery({
    category: selectedCategory,
  });

  const { data: reports = [] } = useGetAllReportsQuery();

  const [deletePost] = useDeletePostMutation();
  const [deleteComment] = useDeleteCommentMutation();

  // Helper map to check reported status
  const getPostReports = (postId: string) => {
    return reports.filter((r) => r.post_id === postId || (r.post && r.post.id === postId));
  };

  const getCommentReports = (commentId: string) => {
    return reports.filter((r) => r.comment_id === commentId || (r.comment && r.comment.id === commentId));
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this community post? All its comments will also be deleted.")) {
      return;
    }
    try {
      setDeletingId(postId);
      await deletePost(postId).unwrap();
      toast.success("Post deleted successfully.");
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete post.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      setDeletingId(commentId);
      await deleteComment(commentId).unwrap();
      toast.success("Comment deleted successfully.");
      if (selectedPost) {
        setSelectedPost({
          ...selectedPost,
          comments: selectedPost.comments.filter((c) => c.id !== commentId),
        });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Community Posts & Moderation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor all member posts, comments, author details, and associated flagged reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchPosts()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
          >
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Filter Category:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.value
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {isLoadingPosts ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">Loading community posts…</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl py-20 bg-white">
          <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
          <p className="font-semibold text-slate-700">No Posts Found</p>
          <p className="text-sm text-slate-500 mt-1">No community posts match the selected category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const postReports = getPostReports(post.id);
            const hasReports = postReports.length > 0;

            return (
              <div
                key={post.id}
                className={`border rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                  hasReports ? "border-amber-300 bg-amber-50/20" : "border-slate-100"
                }`}
              >
                <div className="space-y-3">
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-xs font-semibold capitalize rounded-full bg-slate-100 text-slate-700">
                      {post.category}
                    </span>
                    {hasReports && (
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {postReports.length} {postReports.length === 1 ? "Report" : "Reports"}
                      </span>
                    )}
                  </div>

                  {/* Author Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {(post.author_name || post.created_by || "A")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {post.author_name || "Anonymous Member"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{post.created_by}</p>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed font-normal">
                    {post.content}
                  </p>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1 text-rose-600">
                      <Heart className="w-3.5 h-3.5 fill-rose-600" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {post.comments?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="p-2 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all font-semibold text-xs flex items-center gap-1"
                      title="View Details & Comments"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all font-semibold text-xs"
                      title="Delete Post"
                    >
                      {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="px-2.5 py-0.5 text-xs font-bold capitalize rounded-full bg-slate-200 text-slate-800">
                  {selectedPost.category}
                </span>
                <h2 className="text-xl font-bold text-slate-800 mt-2">Post Details & Discussion</h2>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Author & Meta */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">
                    {(selectedPost.author_name || selectedPost.created_by || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{selectedPost.author_name || "Anonymous Member"}</p>
                    <p className="text-xs text-slate-500">{selectedPost.created_by}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  {format(parseISO(selectedPost.createdAt), "MMM d, yyyy h:mm a")}
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Post Content</p>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-800 text-base leading-relaxed">
                  {selectedPost.content}
                </div>
              </div>

              {/* Reported Flags Section (if any) */}
              {getPostReports(selectedPost.id).length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    Community Reports Flagged ({getPostReports(selectedPost.id).length})
                  </div>
                  {getPostReports(selectedPost.id).map((r) => (
                    <div key={r.id} className="text-xs text-amber-900 bg-amber-100/50 p-2.5 rounded-xl">
                      <span className="font-semibold">Reason:</span> {r.reason || "Unspecified"} •{" "}
                      <span className="font-semibold">Reported by:</span> {r.reporter_email || "Anonymous"}
                    </div>
                  ))}
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Comments ({selectedPost.comments?.length || 0})
                  </h3>
                </div>

                {!selectedPost.comments || selectedPost.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No comments posted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPost.comments.map((comment) => {
                      const commentReports = getCommentReports(comment.id);
                      const isCommentReported = commentReports.length > 0;

                      return (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                            isCommentReported ? "bg-amber-50/40 border-amber-200" : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                {comment.author_name || comment.created_by.split("@")[0]}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {format(parseISO(comment.createdAt), "MMM d, h:mm a")}
                              </span>
                              {isCommentReported && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                                  Flagged Comment
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 leading-normal">{comment.content}</p>
                          </div>

                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingId === comment.id}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100/80 transition-all text-xs flex-shrink-0"
                            title="Delete Comment"
                          >
                            {deletingId === comment.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button
                onClick={() => handleDeletePost(selectedPost.id)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Post & Comments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
