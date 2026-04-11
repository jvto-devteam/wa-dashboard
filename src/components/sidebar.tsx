"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Phone,
  BookOpen,
  MessageSquare,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers";

const userNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/numbers", label: "My Numbers", icon: Phone },
  { href: "/api-docs", label: "API Docs", icon: BookOpen },
];

const adminNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/overview", label: "System Overview", icon: BarChart3 },
  { href: "/api-docs", label: "API Docs", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const navItems = user?.role === "ADMIN" ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a1628] border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#25d366] flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">WA Dashboard</p>
            <p className="text-white/40 text-xs">Multi-User</p>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-white/[0.03] border border-white/5">
          <p className="text-white text-sm font-medium truncate">{user.name}</p>
          <p className="text-white/40 text-xs truncate">{user.email}</p>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 inline-block",
              user.role === "ADMIN"
                ? "bg-[#25d366]/20 text-[#25d366]"
                : "bg-blue-500/20 text-blue-400"
            )}
          >
            {user.role}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#25d366]/10 text-[#25d366] border border-[#25d366]/20"
                  : "text-white/50 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-[#25d366]" : ""
                )}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#25d366]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
        <p className="text-white/20 text-xs text-center mt-2">Powered by Baileys</p>
      </div>
    </aside>
  );
}
