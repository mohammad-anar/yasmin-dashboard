"use client";

import { use } from "react";
import { useGetUserQuery, useBlockUserMutation, useDeleteUserMutation } from "@/lib/store/api/usersApi";
import { ArrowLeft, Ban, Trash2, UserCheck, RotateCcw, User, Activity, CreditCard, Loader2, Calendar, Globe, Smartphone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useState } from "react";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between py-3 border-b last:border-0" style={{ borderColor: "var(--brand-border)" }}>
      <span className="text-sm" style={{ color: "var(--brand-text-muted)" }}>{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]" style={{ color: "var(--brand-text-primary)" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--brand-border)" }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-accent)" }}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-semibold" style={{ color: "var(--brand-text-primary)" }}>{title}</h2>
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: user, isLoading, isError } = useGetUserQuery(id);
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBlock = async () => {
    try {
      const res = await blockUser(id).unwrap();
      showToast(res.message);
    } catch { showToast("Action failed"); }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteUser(id).unwrap();
      showToast(res.message);
    } catch { showToast("Action failed"); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand-accent)" }} />
          <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>Loading user details…</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-lg font-semibold" style={{ color: "var(--brand-text-primary)" }}>User not found</p>
        <Link href="/dashboard/users" className="text-sm font-medium" style={{ color: "var(--brand-accent)" }}>
          ← Back to users
        </Link>
      </div>
    );
  }

  const isDeleted = !!user.deletedAt;
  const subActive = user.subscription && new Date(user.subscription.endDate) > new Date();

  const getRoleBadge = (role: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      premium: { bg: "#fdf4e7", color: "#D4821A" },
      admin: { bg: "#F5F0EA", color: "#5A4D42" },
      user: { bg: "var(--brand-surface)", color: "var(--brand-text-muted)" },
    };
    return map[role.toLowerCase()] || map.user;
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background: "var(--brand-accent)", color: "white" }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/users"
          className="p-2 rounded-xl transition-all"
          style={{ border: "1px solid var(--brand-border)", color: "var(--brand-accent)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brand-text-primary)" }}>User Details</h1>
          <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>ID: {user.id}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border p-6" style={{ background: "white", borderColor: "var(--brand-border)" }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
              style={{ background: "var(--brand-accent)" }}
            >
              {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold" style={{ color: "var(--brand-text-primary)" }}>{user.name || "Unnamed User"}</h2>
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full capitalize" style={{ background: roleBadge.bg, color: roleBadge.color }}>
                {user.role}
              </span>
              <span
                className="text-sm font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  background: user.isBlocked ? "var(--status-danger-bg)" : isDeleted ? "#f5f5f5" : "var(--status-success-bg)",
                  color: user.isBlocked ? "var(--status-danger)" : isDeleted ? "#999" : "var(--status-success)",
                }}
              >
                {user.isBlocked ? "Blocked" : isDeleted ? "Deleted" : "Active"}
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>@{user.username || "no-username"} · {user.email}</p>
            <p className="text-xs mt-1" style={{ color: "var(--brand-text-muted)" }}>
              Joined {format(parseISO(user.createdAt), "MMMM d, yyyy")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleBlock}
              id="user-detail-block"
              disabled={isBlocking}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              style={{
                background: user.isBlocked ? "var(--status-success-bg)" : "var(--status-warning-bg)",
                color: user.isBlocked ? "var(--status-success)" : "var(--status-warning)",
                border: `1px solid ${user.isBlocked ? "rgba(30,138,74,0.3)" : "rgba(212,130,26,0.3)"}`,
              }}
            >
              {isBlocking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : user.isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
              {user.isBlocked ? "Unblock" : "Block"}
            </button>
            <button
              onClick={handleDelete}
              id="user-detail-delete"
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              style={{
                background: isDeleted ? "var(--status-success-bg)" : "var(--status-danger-bg)",
                color: isDeleted ? "var(--status-success)" : "var(--status-danger)",
                border: `1px solid ${isDeleted ? "rgba(30,138,74,0.3)" : "rgba(192,57,43,0.3)"}`,
              }}
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isDeleted ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
              {isDeleted ? "Restore" : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Account Info */}
        <Section title="Account Information" icon={User}>
          <InfoRow label="Full Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Username" value={user.username ? `@${user.username}` : null} />
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow label="Role" value={user.role} />
          <InfoRow label="Verified" value={user.isVerified ? "Yes ✓" : "No"} />
          <InfoRow label="Language" value={user.language} />
          <InfoRow label="Created" value={format(parseISO(user.createdAt), "PPpp")} />
          <InfoRow label="Last Updated" value={format(parseISO(user.updatedAt), "PPpp")} />
          {user.deletedAt && <InfoRow label="Deleted At" value={format(parseISO(user.deletedAt), "PPpp")} />}
        </Section>

        {/* Device Info */}
        <Section title="Device & Platform" icon={Smartphone}>
          <InfoRow label="Platform" value={user.platform} />
          <InfoRow label="Device Platform (Profile)" value={user.userProfile?.device_platform} />
          <InfoRow label="Device Token" value={user.userProfile?.device_token ? "••••••••" : null} />
          <InfoRow label="FCM Token" value={(user as any).fcmToken ? "Set ✓" : "Not set"} />
        </Section>
      </div>

      {/* User Profile */}
      <Section title="Health Profile" icon={Activity}>
        {user.userProfile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <InfoRow label="Age" value={user.userProfile.age ? `${user.userProfile.age} years` : null} />
              <InfoRow label="Height" value={user.userProfile.height_cm ? `${user.userProfile.height_cm} cm` : null} />
              <InfoRow label="Weight" value={user.userProfile.weight_kg ? `${user.userProfile.weight_kg} kg` : null} />
              <InfoRow label="Activity Level" value={user.userProfile.activity_level?.replace(/_/g, " ")} />
            </div>
            <div>
              <InfoRow label="Dietary Preferences" value={user.userProfile.dietary_preferences} />
              <InfoRow label="Injuries" value={user.userProfile.injuries?.join(", ") || "None"} />
              <InfoRow label="Exercise Dislikes" value={user.userProfile.exercise_dislikes?.join(", ") || "None"} />
              <InfoRow label="Profile Created" value={format(parseISO(user.userProfile.createdAt), "PP")} />
            </div>
          </div>
        ) : (
          <div className="py-10 text-center">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--brand-text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>No health profile created yet</p>
          </div>
        )}
      </Section>

      {/* Subscription */}
      <Section title="Subscription" icon={CreditCard}>
        {user.subscription ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <InfoRow label="Plan Type" value={user.subscription.type} />
              <InfoRow label="Start Date" value={format(parseISO(user.subscription.startDate), "PPpp")} />
              <InfoRow label="End Date" value={format(parseISO(user.subscription.endDate), "PPpp")} />
            </div>
            <div>
              <InfoRow label="Status" value={subActive ? "Active ✓" : "Expired ✗"} />
              <InfoRow label="Token" value={user.subscription.token || "—"} />
              <InfoRow label="Created" value={format(parseISO(user.subscription.createdAt), "PP")} />
            </div>
            {/* Status Banner */}
            <div className="col-span-2 mt-2 mb-4 px-4 py-3 rounded-xl flex items-center gap-3" style={{
              background: subActive ? "var(--status-success-bg)" : "var(--status-danger-bg)",
              color: subActive ? "var(--status-success)" : "var(--status-danger)",
            }}>
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold">
                {subActive
                  ? `Subscription active · Expires ${format(parseISO(user.subscription.endDate), "PP")}`
                  : `Subscription expired on ${format(parseISO(user.subscription.endDate), "PP")}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--brand-text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>No subscription found for this user</p>
            <p className="text-xs mt-1" style={{ color: "var(--brand-text-muted)" }}>User is on the free plan</p>
          </div>
        )}
      </Section>
    </div>
  );
}
