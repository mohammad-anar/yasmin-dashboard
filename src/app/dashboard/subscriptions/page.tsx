"use client";

import { useState } from "react";
import {
  useGetAllSubscriptionsQuery,
  useGrantSubscriptionMutation,
  Subscription,
} from "@/lib/store/api/subscriptionsApi";
import { useGetUsersQuery } from "@/lib/store/api/usersApi";
import { CreditCard, ChevronLeft, ChevronRight, Filter, Plus, X, Loader2, Calendar, CheckCircle, XCircle } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import Link from "next/link";

const TYPE_FILTERS = [
  { label: "All Plans", value: "" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
];

function GrantModal({
  open,
  onClose,
  onGrant,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onGrant: (data: { targetUserId: string; type: string; durationDays?: number }) => void;
  isLoading: boolean;
}) {
  const [targetUserId, setTargetUserId] = useState("");
  const [type, setType] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [customDays, setCustomDays] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const { data: usersData } = useGetUsersQuery({ search: userSearch, limit: 10 }, { skip: userSearch.length < 2 });

  if (!open) return null;

  const selectedUser = usersData?.data?.find((u) => u.id === targetUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-2xl p-6 max-w-md w-full shadow-2xl" style={{ background: "white" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg" style={{ color: "var(--brand-text-primary)" }}>Grant Subscription</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: "var(--brand-text-muted)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* User search */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
              Search User
            </label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Type name or email…"
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
            />
            {usersData?.data && usersData.data.length > 0 && !targetUserId && (
              <div className="mt-1 rounded-xl border overflow-hidden shadow-lg" style={{ borderColor: "var(--brand-border)", background: "white" }}>
                {usersData.data.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { setTargetUserId(u.id); setUserSearch(u.name || u.email || ""); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    style={{ color: "var(--brand-text-primary)" }}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{ background: "var(--brand-accent)" }}>
                      {u.name?.charAt(0) || u.email?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium">{u.name || "—"}</p>
                      <p className="text-xs" style={{ color: "var(--brand-text-muted)" }}>{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedUser && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--status-success-bg)", color: "var(--status-success)" }}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium">Selected: {selectedUser.name || selectedUser.email}</span>
                <button onClick={() => { setTargetUserId(""); setUserSearch(""); }} className="ml-auto">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Plan type */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
              Plan Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["weekly", "monthly", "yearly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                  style={{
                    background: type === t ? "var(--brand-accent)" : "var(--brand-surface)",
                    color: type === t ? "white" : "var(--brand-text-muted)",
                    border: "1px solid var(--brand-border)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom duration */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
              Custom Duration (optional)
            </label>
            <div className="relative">
              <input
                type="number"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="Days (leave blank for default)"
                min={1}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--brand-text-muted)" }}>
              Default: weekly=7d, monthly=30d, yearly=365d
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "var(--brand-surface)", color: "var(--brand-text-primary)", border: "1px solid var(--brand-border)" }}
            >
              Cancel
            </button>
            <button
              id="grant-subscription-submit"
              onClick={() =>
                onGrant({
                  targetUserId,
                  type,
                  ...(customDays ? { durationDays: parseInt(customDays) } : {}),
                })
              }
              disabled={!targetUserId || isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "var(--brand-accent)" }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Grant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "expired">("");
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);

  const { data, isFetching, refetch } = useGetAllSubscriptionsQuery({
    page,
    limit: 15,
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  });

  const [grantSubscription, { isLoading: isGranting }] = useGrantSubscriptionMutation();

  const handleGrant = async (form: { targetUserId: string; type: string; durationDays?: number }) => {
    try {
      await grantSubscription({ targetUserId: form.targetUserId, type: form.type as any, durationDays: form.durationDays }).unwrap();
      setGrantOpen(false);
      setGrantSuccess("Subscription granted successfully!");
      setTimeout(() => setGrantSuccess(null), 3000);
      refetch();
    } catch (e: any) {
      setGrantSuccess(`Error: ${e?.data?.message || "Failed to grant"}`);
    }
  };

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Toast */}
      {grantSuccess && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{
            background: grantSuccess.startsWith("Error") ? "var(--status-danger)" : "var(--brand-accent)",
            color: "white",
          }}
        >
          {grantSuccess}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brand-text-primary)" }}>Subscriptions</h1>
          <p className="text-sm mt-1" style={{ color: "var(--brand-text-muted)" }}>
            {data?.meta.total ?? 0} total subscriptions (in-app purchases)
          </p>
        </div>
        <button
          onClick={() => setGrantOpen(true)}
          id="open-grant-modal"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all self-start sm:self-auto"
          style={{ background: "var(--brand-accent)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-accent-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-accent)"; }}
        >
          <Plus className="w-4 h-4" />
          Grant Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border p-4" style={{ background: "white", borderColor: "var(--brand-border)" }}>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" style={{ color: "var(--brand-text-muted)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--brand-text-muted)" }}>Plan:</span>
          </div>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setPage(1); }}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: typeFilter === f.value ? "var(--brand-accent)" : "var(--brand-surface)",
                color: typeFilter === f.value ? "white" : "var(--brand-text-muted)",
                border: "1px solid var(--brand-border)",
              }}
            >
              {f.label}
            </button>
          ))}
          <div className="w-px mx-2" style={{ background: "var(--brand-border)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--brand-text-muted)" }}>Status:</span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value as any); setPage(1); }}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: statusFilter === f.value ? "var(--brand-accent)" : "var(--brand-surface)",
                color: statusFilter === f.value ? "white" : "var(--brand-text-muted)",
                border: "1px solid var(--brand-border)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--brand-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--brand-surface)" }}>
                {["User", "Plan", "Status", "Start Date", "End Date", "Token", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--brand-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isFetching && !data && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: "var(--brand-accent)" }} />
                  </td>
                </tr>
              )}
              {data?.data?.map((sub) => {
                const active = !isPast(parseISO(sub.endDate));
                const typeColor: Record<string, { bg: string; color: string }> = {
                  weekly: { bg: "#fdf4e7", color: "#D4821A" },
                  monthly: { bg: "#F5F0EA", color: "#5A4D42" },
                  yearly: { bg: "var(--status-success-bg)", color: "var(--status-success)" },
                };
                const tc = typeColor[sub.type] || typeColor.monthly;

                return (
                  <tr
                    key={sub.id}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--brand-border)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                          style={{ background: "var(--brand-accent)" }}
                        >
                          {sub.user.name?.charAt(0) || sub.user.email?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--brand-text-primary)" }}>{sub.user.name || "—"}</p>
                          <p className="text-xs" style={{ color: "var(--brand-text-muted)" }}>{sub.user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Plan */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: tc.bg, color: tc.color }}>
                        {sub.type}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {active ? (
                          <CheckCircle className="w-3.5 h-3.5" style={{ color: "var(--status-success)" }} />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" style={{ color: "var(--status-danger)" }} />
                        )}
                        <span
                          className="text-xs font-semibold"
                          style={{ color: active ? "var(--status-success)" : "var(--status-danger)" }}
                        >
                          {active ? "Active" : "Expired"}
                        </span>
                      </div>
                    </td>
                    {/* Start Date */}
                    <td className="px-5 py-4">
                      <span className="text-xs" style={{ color: "var(--brand-text-muted)" }}>
                        {format(parseISO(sub.startDate), "MMM d, yyyy")}
                      </span>
                    </td>
                    {/* End Date */}
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-medium"
                        style={{ color: active ? "var(--status-success)" : "var(--status-danger)" }}
                      >
                        {format(parseISO(sub.endDate), "MMM d, yyyy")}
                      </span>
                    </td>
                    {/* Token */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: "var(--brand-surface)", color: "var(--brand-text-muted)" }}>
                        {sub.token ? (sub.token.length > 16 ? sub.token.slice(0, 16) + "…" : sub.token) : "—"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/users/${sub.user.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: "var(--brand-surface)", color: "var(--brand-accent)", border: "1px solid var(--brand-border)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-border)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                      >
                        View User
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {data?.data?.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--brand-text-muted)" }} />
                    <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>No subscriptions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: "var(--brand-border)" }}>
            <p className="text-xs" style={{ color: "var(--brand-text-muted)" }}>
              Page {page} of {totalPages} · {data?.meta.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg transition-all disabled:opacity-40"
                style={{ border: "1px solid var(--brand-border)", color: "var(--brand-accent)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg transition-all disabled:opacity-40"
                style={{ border: "1px solid var(--brand-border)", color: "var(--brand-accent)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grant Modal */}
      <GrantModal
        open={grantOpen}
        onClose={() => setGrantOpen(false)}
        onGrant={handleGrant}
        isLoading={isGranting}
      />
    </div>
  );
}
