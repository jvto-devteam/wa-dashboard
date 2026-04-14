"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, Users, Phone, Wifi, WifiOff,
  Loader2, RefreshCw, Activity,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { ConnectionStatus } from "@/lib/wa-client";

interface OverviewData {
  stats: {
    totalUsers: number;
    totalNumbers: number;
    connectedNumbers: number;
  };
  numbers: {
    id: string;
    label: string;
    phoneNumber: string | null;
    status: ConnectionStatus;
    apiKey: string;
    user: { name: string; email: string };
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
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-sm">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
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
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#25d366]" />
            System Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time monitoring of all connections</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={data.stats.totalUsers} icon={Users} accent="bg-blue-50" />
        <StatCard label="WA Numbers" value={data.stats.totalNumbers} icon={Phone} accent="bg-green-50" />
        <StatCard label="Connected" value={data.stats.connectedNumbers} icon={Wifi} accent="bg-purple-50" />
      </div>

      {/* Numbers table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-gray-800 font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#25d366]" />
            All WA Numbers
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {data.numbers.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No WA numbers yet</div>
          ) : (
            data.numbers.map((n) => (
              <div key={n.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  {n.status === "connected" ? (
                    <Wifi className="w-4 h-4 text-[#25d366]" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-800 text-sm font-medium">{n.label}</p>
                    <StatusBadge status={n.status} />
                  </div>
                  <p className="text-gray-500 text-xs">
                    Owner: {n.user.name} ({n.user.email})
                    {n.phoneNumber && ` · +${n.phoneNumber}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
