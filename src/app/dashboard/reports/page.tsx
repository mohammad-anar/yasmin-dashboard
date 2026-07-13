"use client";

import {
  useGetAllReportsQuery,
  useUpdateReportMutation,
  useDeletePostMutation,
  useDeleteCommentMutation,
  ReportedPost,
} from "@/lib/store/api/reportsApi";
import { Flag, Trash2, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

export default function ReportsPage() {
  const { data: reports = [], isLoading, refetch } = useGetAllReportsQuery();
  const [updateReport] = useUpdateReportMutation();
  const [deletePost] = useDeletePostMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleMarkReviewed = async (reportId: string) => {
    try {
      setActionId(reportId);
      await updateReport({ id: reportId, status: "reviewed" }).unwrap();
      toast.success("Report marked as reviewed.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update report status.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteContent = async (report: ReportedPost) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this reported ${report.content_type}? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setActionId(report.id);
      if (report.content_type === "post") {
        if (!report.post_id) throw new Error("Post ID is missing");
        await deletePost(report.post_id).unwrap();
      } else {
        if (!report.comment_id) throw new Error("Comment ID is missing");
        await deleteComment(report.comment_id).unwrap();
      }
      // Also mark report as removed
      await updateReport({ id: report.id, status: "removed" }).unwrap();
      toast.success("Inappropriate content successfully removed.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete reported content.");
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "reviewed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "removed":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Community Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and moderate flagged posts or comments reported by the community.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl py-20 bg-white">
          <Flag className="w-12 h-12 text-slate-300 mb-4" />
          <p className="font-semibold text-slate-700">No Flagged Reports</p>
          <p className="text-sm text-slate-500 mt-1">The community feed is clean and well-behaved!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-5 transition-all hover:shadow-md"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className="px-2.5 py-1 text-xs font-semibold uppercase rounded-full border"
                    style={{ borderColor: "var(--brand-border)" }}
                  >
                    {report.content_type}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold capitalize rounded-full border ${getStatusBadgeClass(report.status)}`}>
                    {report.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {format(parseISO(report.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Flagged Content</p>
                  <blockquote className="bg-slate-50 border-l-4 border-slate-300 pl-4 py-2 text-sm text-slate-700 italic rounded-r-lg font-medium">
                    "{report.reported_content || "Content was already deleted or unavailable."}"
                  </blockquote>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-500 block">Flagged Author:</span>
                    <span className="text-slate-800">{report.reported_author || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Reporter Email:</span>
                    <span className="text-slate-800">{report.reporter_email || "Anonymous"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Reason:</span>
                    <span className="text-slate-800 font-medium text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {report.reason || "Unspecified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {report.status === "pending" && (
                <div className="flex flex-row md:flex-col gap-2 min-w-[140px] justify-end">
                  <button
                    onClick={() => handleMarkReviewed(report.id)}
                    disabled={actionId !== null}
                    className="flex-1 md:w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {actionId === report.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleDeleteContent(report)}
                    disabled={actionId !== null}
                    className="flex-1 md:w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all disabled:opacity-50"
                  >
                    {actionId === report.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete Content
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
