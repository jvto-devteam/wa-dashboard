"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, Users, Phone, MessageSquare, Wifi, WifiOff,
  Loader2, RefreshCw, Activity,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { ConnectionStatus } from "@/lib/wa-client";

interface OverviewData {
  stats: {
    totalUsers: number;
    totalNumbers: number;
    connectedNumbers: number;
    totalMessages: number;
  };
  numbers: {
    id: string;
    label: string;
    phoneNumber: string | null;
    status: ConnectionStatus;
    apiKey: string;
    _count: { messages: number };
    user: { name: string; email: string };
  }[];
  recentMessages: {
    id: string;
    direction: "IN" | "OUT";
    toFrom: string;
    content: string | null;
    mediaType: string | null;
    createdAt: string;
    number: {
      label: string;
      phoneNumber: string | null;
      user: { name: string };
    };
  }[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="bg-[#0a1628] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/50 text-sm">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4 text-white/70" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/overview");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#25d366]" />
            System Overview
          </h1>
          <p className="text-white/40 text-sm mt-1">Real-time monitoring of all connections</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <StatCard label="Total Users" value={data.stats.totalUsers} icon={Users} accent="bg-blue-500/10" />
        <StatCard label="WA Numbers" value={data.stats.totalNumbers} icon={Phone} accent="bg-[#25d366]/10" />
        <StatCard label="Connected" value={data.stats.connectedNumbers} icon={Wifi} accent="bg-purple-500/10" />
        <StatCard label="Total Messages" value={data.stats.totalMessages} icon={MessageSquare} accent="bg-orange-500/10" />
      </div>

      {/* Numbers table */}
      <div className="bg-[#0a1628] border border-white/5 rounded-2xl mb-6">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#25d366]" />
            All WA Numbers
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {data.numbers.length === 0 ? (
            <div className="py-10 text-center text-white/30 text-sm">No WA numbers yet</div>
          ) : (
            data.numbers.map((n) => (
              <div key={n.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  {n.status === "connected" ? (
                    <Wifi className="w-4 h-4 text-[#25d366]" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{n.label}</p>
                    <StatusBadge status={n.status} />
                  </div>
                  <p className="text-white/40 text-xs">
                    Owner: {n.user.name} ({n.user.email})
                    {n.phoneNumber && ` · +${n.phoneNumber}`}
                  </p>
                </div>
                <div className="text-right text-xs text-white/30">
                  <p>{n._count.messages} messages</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent messages */}
      <div className="bg-[#0a1628] border border-white/5 rounded-2xl">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Recent Messages</h2>
        </div>
        <div className="divide-y divide-white/5">
          {data.recentMessages.length === 0 ? (
            <div className="py-10 text-center text-white/30 text-sm">No messages yet</div>
          ) : (
            data.recentMessages.map((msg) => (
              <div key={msg.id} className="px-6 py-3 flex items-start gap-3">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${
                    msg.direction === "IN"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-[#25d366]/20 text-[#25d366]"
                  }`}
                >
                  {msg.direction}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm truncate">
                    {msg.content ?? `[${msg.mediaType ?? "media"}]`}
                  </p>
                  <p className="text-white/30 text-xs">
                    {msg.number.label} · {msg.number.user.name} ·{" "}
                    {msg.direction === "IN" ? `from ${msg.toFrom}` : `to ${msg.toFrom}`}
                  </p>
                </div>
                <span className="text-white/20 text-xs flex-shrink-0">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
