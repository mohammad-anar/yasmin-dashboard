"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HeartPulse } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user?.role !== "admin") {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{ background: "var(--brand-surface)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse" style={{ background: "var(--brand-accent)" }}>
          <HeartPulse className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--brand-text-muted)" }}>Loading dashboard…</p>
      </div>
    );
  }

  return <>{children}</>;
}
