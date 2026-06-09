"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { io, Socket } from "socket.io-client";
import { Bell, Trash2, Check, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SocketNotification {
  id: string;
  userName: string;
  userEmail: string;
  avatarUrl: string;
  type: string;
  endDate: string;
  timestamp: string;
  read: boolean;
}

export function SiteHeader() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const [isRinging, setIsRinging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load notifications from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("yd_notifications");
        if (stored) {
          setNotifications(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load notifications:", e);
      }
    }
  }, []);

  // Save notifications to local storage on change
  const saveNotifications = (newNotifs: SocketNotification[]) => {
    setNotifications(newNotifs);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("yd_notifications", JSON.stringify(newNotifs));
      } catch (e) {
        console.error("Failed to save notifications:", e);
      }
    }
  };

  // Socket connection
  useEffect(() => {
    if (!user || !user.id) return;

    const getSocketUrl = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      return apiUrl.replace("/api/v1", "");
    };

    const socketUrl = getSocketUrl();
    console.log(`🔌 Connecting socket to: ${socketUrl}`);
    const socket: Socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected to server!");
      socket.emit("register", user.id);
    });

    socket.on("subscription_created", (data: any) => {
      console.log("📢 Socket received subscription_created:", data);
      
      const newNotif: SocketNotification = {
        id: data.subscription.id || Date.now().toString(),
        userName: data.user.name || "Anonymous User",
        userEmail: data.user.email || "unknown@user.com",
        avatarUrl: data.user.avatarUrl || "",
        type: data.subscription.type || "yearly",
        endDate: data.subscription.endDate 
          ? new Date(data.subscription.endDate).toLocaleDateString()
          : "N/A",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };

      // Trigger bell ringing animation
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 800);

      // Play subtle notification audio if supported
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {}

      // Trigger Sonner toast
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: "var(--brand-accent)" }}>
            <Sparkles size={14} className="text-yellow-600 animate-pulse" /> New Subscription!
          </span>
          <span className="text-xs">
            <strong>{newNotif.userName}</strong> purchased a <strong>{newNotif.type}</strong> plan.
          </span>
        </div>,
        { duration: 5000 }
      );

      setNotifications((prev) => {
        const updated = [newNotif, ...prev].slice(0, 50); // limit to 50
        try {
          localStorage.setItem("yd_notifications", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected.");
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    saveNotifications([]);
    toast.success("Notification log cleared");
  };

  const handleMarkRead = (id: string) => {
    const updated = notifications.map((n) => 
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  // Profile data mapping
  const navUserData = {
    name: user?.name || "Admin",
    email: user?.email || "admin@gmail.com",
    avatar: user?.avatarUrl || "https://i.ibb.co.com/VWkMFBWM/pngtree-user-icon-png-image-1796659.jpg",
  };

  return (
    <>
      <style>{`
        @keyframes tilt-bell {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-15deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          75% { transform: rotate(4deg); }
          85% { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
        .bell-shake {
          animation: tilt-bell 0.75s ease-in-out;
        }
      `}</style>

      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-background/95 backdrop-blur-md sticky top-0 z-30">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1 text-black cursor-pointer" />
          
          <h1 className="text-base font-semibold tracking-wide ml-2" style={{ color: "var(--brand-text-primary)" }}>
            Overview
          </h1>

          <div className="ml-auto flex items-center gap-4">
            {/* Realtime Notification Bell */}
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger className="focus:outline-none relative p-2 rounded-full hover:bg-muted/65 transition-colors cursor-pointer" asChild>
                <button className="relative">
                  <Bell 
                    size={21} 
                    className={`transition-colors duration-200 ${unreadCount > 0 ? "text-yellow-600" : "text-muted-foreground"} ${isRinging ? "bell-shake" : ""}`} 
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-background animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 sm:w-96 rounded-xl shadow-lg border border-border bg-card/95 backdrop-blur-md p-0" align="end">
                <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 text-sm font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead} 
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-0.5"
                      >
                        <Check size={13} /> Read All
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleClearAll} 
                        className="text-xs text-destructive hover:text-red-700 transition-colors flex items-center gap-0.5"
                      >
                        <Trash2 size={13} /> Clear
                      </button>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <AlertCircle className="w-8 h-8 text-muted-foreground/60 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                      <p className="text-xs text-muted-foreground/80 mt-1">Real-time subscription notifications will appear here.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleMarkRead(notif.id)}
                        className={`flex gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/40 transition-colors cursor-pointer relative ${!notif.read ? "bg-muted/15" : ""}`}
                      >
                        {!notif.read && (
                          <span className="absolute top-4 left-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        )}
                        <Avatar className="w-9 h-9 border border-border flex-shrink-0">
                          <AvatarImage src={notif.avatarUrl} alt={notif.userName} />
                          <AvatarFallback className="text-xs font-bold bg-muted">
                            {notif.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground float-right">{notif.timestamp}</p>
                          <p className="text-sm font-semibold truncate pr-10">{notif.userName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.userEmail}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {notif.type}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Ends: {notif.endDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <NavUser user={navUserData} />
          </div>
        </div>
      </header>
    </>
  );
}
