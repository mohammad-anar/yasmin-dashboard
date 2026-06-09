"use client";

import { useState, useCallback } from "react";
import { useGetUsersQuery, useBlockUserMutation, useDeleteUserMutation, User } from "@/lib/store/api/usersApi";
import { Search, Ban, Trash2, Eye, ChevronLeft, ChevronRight, Filter, RefreshCw, UserCheck, RotateCcw } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

const ROLE_FILTERS = [
  { label: "All Users", value: "" },
  { label: "Premium", value: "PREMIUM" },
  { label: "Admin", value: "ADMIN" },
  { label: "Regular", value: "USER" },
];

const STATUS_FILTERS = [
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
  { label: "Deleted", value: "deleted" },
];

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" style={{ background: "white" }}>
        <h3 className="font-bold text-base mb-2" style={{ color: "var(--brand-text-primary)" }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: "var(--brand-text-muted)" }}>{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: confirmColor }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ type: "block" | "delete"; user: User } | null>(null);

  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Build query params
  const queryParams: any = { page, limit: 15, search: debouncedSearch };
  if (roleFilter) queryParams.role = roleFilter;
  if (statusFilter === "blocked") queryParams.isBlocked = true;
  if (statusFilter === "deleted") queryParams.includeDeleted = true;

  const { data, isFetching, refetch } = useGetUsersQuery(queryParams);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    const t = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, []);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "block") await blockUser(confirmAction.user.id).unwrap();
      else await deleteUser(confirmAction.user.id).unwrap();
    } finally {
      setConfirmAction(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      premium: { bg: "#fdf4e7", color: "#D4821A" },
      admin: { bg: "#F5F0EA", color: "#5A4D42" },
      user: { bg: "var(--brand-surface)", color: "var(--brand-text-muted)" },
    };
    return map[role.toLowerCase()] || map.user;
  };

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brand-text-primary)" }}>Users</h1>
          <p className="text-sm mt-1" style={{ color: "var(--brand-text-muted)" }}>
            {data?.meta.total ?? 0} total users registered
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all self-start sm:self-auto"
          style={{ background: "var(--brand-surface)", color: "var(--brand-accent)", border: "1px solid var(--brand-border)" }}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border p-4 flex flex-col gap-3" style={{ background: "white", borderColor: "var(--brand-border)" }}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--brand-text-muted)" }} />
          <input
            type="text"
            id="user-search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email, or username…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" style={{ color: "var(--brand-text-muted)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--brand-text-muted)" }}>Role:</span>
          </div>
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setRoleFilter(f.value); setPage(1); }}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: roleFilter === f.value ? "var(--brand-accent)" : "var(--brand-surface)",
                color: roleFilter === f.value ? "white" : "var(--brand-text-muted)",
                border: "1px solid var(--brand-border)",
              }}
            >
              {f.label}
            </button>
          ))}
          <div className="w-px mx-1" style={{ background: "var(--brand-border)" }} />
          <div className="flex items-center gap-1.5 mr-1">
            <span className="text-xs font-medium" style={{ color: "var(--brand-text-muted)" }}>Status:</span>
          </div>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(statusFilter === f.value ? "" : f.value); setPage(1); }}
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
                {["User", "Role", "Status", "Subscription", "Platform", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--brand-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isFetching && !data && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand-border)", borderTopColor: "var(--brand-accent)" }} />
                      <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>Loading users…</p>
                    </div>
                  </td>
                </tr>
              )}
              {data?.data?.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const isDeleted = !!user.deletedAt;
                const subActive = user.subscription && new Date(user.subscription.endDate) > new Date();
                return (
                  <tr
                    key={user.id}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--brand-border)", opacity: isDeleted ? 0.6 : 1 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                            style={{ background: "var(--brand-accent)" }}
                          >
                            {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--brand-text-primary)" }}>{user.name || "—"}</p>
                          <p className="text-xs" style={{ color: "var(--brand-text-muted)" }}>{user.email}</p>
                          {user.username && <p className="text-xs" style={{ color: "var(--brand-accent)" }}>@{user.username}</p>}
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: roleBadge.bg, color: roleBadge.color }}>
                        {user.role}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: user.isBlocked ? "var(--status-danger-bg)" : isDeleted ? "#f5f5f5" : "var(--status-success-bg)",
                          color: user.isBlocked ? "var(--status-danger)" : isDeleted ? "#999" : "var(--status-success)",
                        }}
                      >
                        {user.isBlocked ? "Blocked" : isDeleted ? "Deleted" : "Active"}
                      </span>
                    </td>
                    {/* Subscription */}
                    <td className="px-5 py-4">
                      {user.subscription ? (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                          style={{
                            background: subActive ? "var(--status-success-bg)" : "var(--status-danger-bg)",
                            color: subActive ? "var(--status-success)" : "var(--status-danger)",
                          }}
                        >
                          {user.subscription.type} {subActive ? "✓" : "✗"}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--brand-text-muted)" }}>Free</span>
                      )}
                    </td>
                    {/* Platform */}
                    <td className="px-5 py-4">
                      <span className="text-xs capitalize" style={{ color: "var(--brand-text-muted)" }}>{user.platform || "—"}</span>
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-4">
                      <span className="text-xs whitespace-nowrap" style={{ color: "var(--brand-text-muted)" }}>
                        {format(parseISO(user.createdAt), "MMM d, yyyy")}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          id={`view-user-${user.id}`}
                          className="p-1.5 rounded-lg transition-all"
                          title="View details"
                          style={{ color: "var(--brand-accent)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmAction({ type: "block", user })}
                          id={`block-user-${user.id}`}
                          className="p-1.5 rounded-lg transition-all"
                          title={user.isBlocked ? "Unblock user" : "Block user"}
                          style={{ color: user.isBlocked ? "var(--status-success)" : "var(--status-warning)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: "delete", user })}
                          id={`delete-user-${user.id}`}
                          className="p-1.5 rounded-lg transition-all"
                          title={isDeleted ? "Restore user" : "Delete user"}
                          style={{ color: isDeleted ? "var(--status-success)" : "var(--status-danger)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {isDeleted ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data?.data?.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-10 h-10 opacity-20" style={{ color: "var(--brand-text-muted)" }} />
                      <p className="text-sm font-medium" style={{ color: "var(--brand-text-muted)" }}>No users found</p>
                      <p className="text-xs" style={{ color: "var(--brand-text-muted)" }}>Try adjusting your filters</p>
                    </div>
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: page === p ? "var(--brand-accent)" : "var(--brand-surface)",
                      color: page === p ? "white" : "var(--brand-text-muted)",
                      border: "1px solid var(--brand-border)",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
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

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          open={true}
          title={
            confirmAction.type === "block"
              ? confirmAction.user.isBlocked ? "Unblock User" : "Block User"
              : confirmAction.user.deletedAt ? "Restore User" : "Soft-Delete User"
          }
          description={
            confirmAction.type === "block"
              ? confirmAction.user.isBlocked
                ? `Are you sure you want to unblock ${confirmAction.user.name || confirmAction.user.email}? They will regain access.`
                : `Are you sure you want to block ${confirmAction.user.name || confirmAction.user.email}? They will be unable to log in.`
              : confirmAction.user.deletedAt
                ? `Restore ${confirmAction.user.name || confirmAction.user.email}? This will make their account active again.`
                : `Soft-delete ${confirmAction.user.name || confirmAction.user.email}? Their data will be preserved.`
          }
          confirmLabel={
            confirmAction.type === "block"
              ? confirmAction.user.isBlocked ? "Unblock" : "Block"
              : confirmAction.user.deletedAt ? "Restore" : "Delete"
          }
          confirmColor={
            confirmAction.type === "block"
              ? confirmAction.user.isBlocked ? "var(--status-success)" : "var(--status-warning)"
              : confirmAction.user.deletedAt ? "var(--status-success)" : "var(--status-danger)"
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
