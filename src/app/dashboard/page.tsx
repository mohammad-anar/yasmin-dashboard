"use client";

import { useGetAdminStatsQuery, useGetUsersQuery } from "@/lib/store/api/usersApi";
import { Users, Crown, Ban, Trash2, CreditCard, TrendingUp, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import Link from "next/link";
import { format, parseISO, subDays } from "date-fns";

const PIE_COLORS = ["#5A4D42", "#D4821A", "#1E8A4A", "#7B3FA8", "#C0392B"];

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
  change,
  href,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  change?: string;
  href?: string;
}) {
  const content = (
    <div
      className="rounded-2xl p-6 border flex flex-col gap-4 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
      style={{ background: "white", borderColor: "var(--brand-border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {change && (
          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" style={{ background: "var(--status-success-bg)", color: "var(--status-success)" }}>
            <ArrowUpRight className="w-3 h-3" />
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ color: "var(--brand-text-primary)" }}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm mt-0.5" style={{ color: "var(--brand-text-muted)" }}>{title}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function buildDailyData(recentUsers: { createdAt: string }[]) {
  const days: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "MMM dd");
    days[d] = 0;
  }
  recentUsers.forEach((u) => {
    try {
      const d = format(parseISO(u.createdAt), "MMM dd");
      if (d in days) days[d]++;
    } catch {}
  });
  return Object.entries(days).map(([date, count]) => ({ date, count }));
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();
  const { data: recentUsersData } = useGetUsersQuery({ page: 1, limit: 5 });

  const dailyData = stats ? buildDailyData(stats.recentUsers) : [];
  const pieData = stats?.subscriptionBreakdown || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand-border)", borderTopColor: "var(--brand-accent)" }} />
          <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--brand-text-primary)" }}>Dashboard Overview</h1>
        <p className="text-sm mt-1" style={{ color: "var(--brand-text-muted)" }}>
          Welcome back! Here's what's happening with Yasmin today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="#5A4D42"
          bg="#F5F0EA"
          href="/dashboard/users"
        />
        <StatCard
          title="Premium Members"
          value={stats?.premiumUsers ?? 0}
          icon={Crown}
          color="#D4821A"
          bg="#fdf4e7"
          href="/dashboard/users?role=PREMIUM"
        />
        <StatCard
          title="Blocked Users"
          value={stats?.blockedUsers ?? 0}
          icon={Ban}
          color="#C0392B"
          bg="#fdf0ee"
          href="/dashboard/users?isBlocked=true"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions ?? 0}
          icon={CreditCard}
          color="#1E8A4A"
          bg="#e8f5ee"
          href="/dashboard/subscriptions?status=active"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="xl:col-span-2 rounded-2xl border p-6" style={{ background: "white", borderColor: "var(--brand-border)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-base" style={{ color: "var(--brand-text-primary)" }}>User Registrations</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--brand-text-muted)" }}>Last 30 days</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: "var(--brand-surface)", color: "var(--brand-accent)" }}>
              <TrendingUp className="w-3.5 h-3.5" />
              {stats?.recentUsers?.length ?? 0} new users
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5A4D42" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#5A4D42" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--brand-text-muted)" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "var(--brand-text-muted)" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid var(--brand-border)", fontSize: 12, background: "white" }}
                itemStyle={{ color: "var(--brand-accent)" }}
              />
              <Area type="monotone" dataKey="count" stroke="#5A4D42" strokeWidth={2} fill="url(#grad1)" name="New Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="rounded-2xl border p-6" style={{ background: "white", borderColor: "var(--brand-border)" }}>
          <div className="mb-4">
            <h2 className="font-semibold text-base" style={{ color: "var(--brand-text-primary)" }}>Subscription Plans</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--brand-text-muted)" }}>Breakdown by type</p>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" outerRadius={75} dataKey="count" nameKey="type">
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--brand-border)", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>No subscription data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--brand-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--brand-border)" }}>
          <h2 className="font-semibold text-base" style={{ color: "var(--brand-text-primary)" }}>Recent Users</h2>
          <Link href="/dashboard/users" className="text-xs font-medium hover:underline" style={{ color: "var(--brand-accent)" }}>
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--brand-surface)" }}>
                {["User", "Role", "Status", "Platform", "Joined"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold" style={{ color: "var(--brand-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsersData?.data?.map((user, i) => (
                <tr
                  key={user.id}
                  className="border-t transition-colors hover:bg-opacity-50"
                  style={{ borderColor: "var(--brand-border)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      >
                        {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--brand-text-primary)" }}>{user.name || "—"}</p>
                        <p className="text-xs" style={{ color: "var(--brand-text-muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                      style={{
                        background: user.role === "premium" ? "#fdf4e7" : user.role === "admin" ? "#F5F0EA" : "var(--brand-surface)",
                        color: user.role === "premium" ? "#D4821A" : user.role === "admin" ? "#5A4D42" : "var(--brand-text-muted)",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: user.isBlocked ? "var(--status-danger-bg)" : user.deletedAt ? "#f5f5f5" : "var(--status-success-bg)",
                        color: user.isBlocked ? "var(--status-danger)" : user.deletedAt ? "#999" : "var(--status-success)",
                      }}
                    >
                      {user.isBlocked ? "Blocked" : user.deletedAt ? "Deleted" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs capitalize" style={{ color: "var(--brand-text-muted)" }}>{user.platform || "—"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs" style={{ color: "var(--brand-text-muted)" }}>
                      {format(parseISO(user.createdAt), "MMM d, yyyy")}
                    </span>
                  </td>
                </tr>
              ))}
              {!recentUsersData?.data?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: "var(--brand-text-muted)" }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
