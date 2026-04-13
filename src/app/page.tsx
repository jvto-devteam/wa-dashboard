"use client";

import { useAuth } from "@/components/providers";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Phone,
  Users,
  BarChart3,
  BookOpen,
  ArrowUpRight,
  Wifi,
  Shield,
} from "lucide-react";

function QuickCard({
  href,
  icon: Icon,
  label,
  description,
  accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className="bg-[#0a1628] border border-white/5 hover:border-[#25d366]/30 rounded-2xl p-5 flex items-start gap-4 transition-all group"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:opacity-90 transition-opacity ${accent ?? "bg-[#25d366]/10"}`}
      >
        <Icon className="w-5 h-5 text-[#25d366]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{label}</p>
        <p className="text-white/40 text-xs mt-0.5">{description}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-[#25d366] transition-colors mt-0.5" />
    </Link>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="bg-[#0a1628] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/50 text-sm">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ?? "bg-white/5"}`}>
          <Icon className="w-4 h-4 text-white/60" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, connected: 0 });

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      fetch("/api/numbers")
        .then((r) => r.json())
        .then((data: { status: string }[]) => {
          if (Array.isArray(data)) {
            setStats({
              total: data.length,
              connected: data.filter((n) => n.status === "connected").length,
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#25d366] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role === "ADMIN") {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#25d366]" />
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-white/40 text-sm">
            Welcome back, <span className="text-white/70">{user.name}</span> —
            Manage users and monitor the system
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickCard
            href="/admin/users"
            icon={Users}
            label="User Management"
            description="Create, edit, and manage user accounts"
            accent="bg-blue-500/10"
          />
          <QuickCard
            href="/admin/overview"
            icon={BarChart3}
            label="System Overview"
            description="Monitor all WA numbers and connections"
            accent="bg-purple-500/10"
          />
          <QuickCard
            href="/api-docs"
            icon={BookOpen}
            label="API Documentation"
            description="REST API reference and testing"
            accent="bg-orange-500/10"
          />
        </div>
      </div>
    );
  }

  // Regular user view
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">
          Welcome back, <span className="text-white/70">{user.name}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          label="WA Numbers"
          value={`${stats.total} / 3`}
          icon={Phone}
          accent="bg-[#25d366]/10"
        />
        <StatCard
          label="Connected"
          value={stats.connected}
          icon={Wifi}
          accent="bg-purple-500/10"
        />
      </div>

      <div>
        <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickCard
            href="/numbers"
            icon={Phone}
            label="My WA Numbers"
            description="Manage your WhatsApp connections (max 3)"
          />
          <QuickCard
            href="/api-docs"
            icon={BookOpen}
            label="API Documentation"
            description="Learn how to send messages via API"
            accent="bg-orange-500/10"
          />
        </div>
      </div>
    </div>
  );
}
