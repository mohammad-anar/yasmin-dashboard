"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconSettings,
  IconUsers,
  IconCreditCard,
  IconLogout,
  IconHeartbeat,
  IconList,
  IconBarbell,
  IconApple,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store/store";
import { logout } from "@/lib/store/authSlice";
import { useRouter } from "next/navigation";

export const data = {
  documents: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      name: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
    },
    {
      name: "Subscriptions",
      url: "/dashboard/subscriptions",
      icon: IconCreditCard,
    },
    {
      name: "Onboarding Config",
      url: "/dashboard/onboarding",
      icon: IconList,
    },
    {
      name: "Workouts",
      url: "/dashboard/workouts",
      icon: IconBarbell,
    },
    {
      name: "Nutrition",
      url: "/dashboard/nutrition",
      icon: IconApple,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-4 py-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--brand-accent)" }}
                >
                  <IconHeartbeat size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight" style={{ color: "var(--brand-text-primary)" }}>
                    Yasmin
                  </p>
                  <p className="text-xs" style={{ color: "var(--brand-text-muted)" }}>
                    Admin Dashboard
                  </p>
                </div>
              </Link>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t" style={{ borderColor: "var(--brand-border)" }}>
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                style={{ background: "var(--brand-accent)" }}
              >
                {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--brand-text-primary)" }}>
                  {user.name || "Admin"}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--brand-text-muted)" }}>
                  {user.email}
                </p>
              </div>
            </div>
          )}
          {/* Logout */}
          <button
            onClick={handleLogout}
            id="sidebar-logout"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={{ color: "var(--status-danger)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--status-danger-bg)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <IconLogout size={16} />
            Sign Out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
