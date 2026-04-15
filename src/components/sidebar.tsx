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
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers";

const userNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/numbers", label: "My Numbers", icon: Phone },
  { href: "/templates", label: "Templates", icon: FileText },
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
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 flex flex-col z-40">

      {/* Logo */}
      <div className="px-5 h-14 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
        <div className="w-7 h-7 rounded-md bg-[#25d366] flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <span className="text-gray-900 font-bold text-sm tracking-tight">WA Dashboard</span>
      </div>

      {/* User info */}
      {user && (
        <div className="px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <p className="text-gray-900 text-sm font-semibold truncate leading-tight">{user.name}</p>
          <p className="text-gray-400 text-xs truncate mt-0.5">{user.email}</p>
          <span className={cn(
            "inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm",
            user.role === "ADMIN"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-blue-50 text-blue-600 border border-blue-200"
          )}>
            {user.role}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-2 space-y-0.5">
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
                  "flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors rounded-md relative",
                  isActive
                    ? "bg-[#25d366]/10 text-[#128C7E]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#25d366] rounded-full" />
                )}
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#25d366]" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
        <p className="text-gray-300 text-[10px] text-center mt-2 font-mono">Powered by Baileys</p>
      </div>
    </aside>
  );
}
