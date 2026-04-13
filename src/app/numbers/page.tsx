"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers";
import Link from "next/link";
import {
  Phone,
  Plus,
  Trash2,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

interface WaNumber {
  id: string;
  label: string;
  phoneNumber: string | null;
  status: "disconnected" | "connecting" | "connected";
  apiKey: string;
  createdAt: string;
}

const MAX_NUMBERS = 3;

export default function NumbersPage() {
  const { user } = useAuth();
  const [numbers, setNumbers] = useState<WaNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchNumbers = async () => {
    try {
      const res = await fetch("/api/numbers");
      if (res.ok) {
        const data = await res.json();
        setNumbers(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNumbers();
  }, []);

  const addNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add number");
      } else {
        setNewLabel("");
        fetchNumbers();
      }
    } catch {
      setError("Network error");
    } finally {
      setAdding(false);
    }
  };

  const deleteNumber = async (id: string) => {
    if (!confirm("Delete this WA number? This will disconnect and remove all data.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/numbers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Delete failed (${res.status})`);
      } else {
        await fetchNumbers();
      }
    } catch {
      setError("Network error saat menghapus");
    } finally {
      setDeleting(null);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Global error */}
      {error && !adding && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError("")} className="text-red-400/50 hover:text-red-400 text-xs ml-4">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My WA Numbers</h1>
          <p className="text-white/40 text-sm mt-1">
            {numbers.length} / {MAX_NUMBERS} numbers used
          </p>
        </div>
      </div>

      {/* Add form */}
      {numbers.length < MAX_NUMBERS && (
        <form
          onSubmit={addNumber}
          className="bg-[#0a1628] border border-white/5 rounded-2xl p-5 mb-6"
        >
          <h2 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#25d366]" />
            Add New WA Number
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder='e.g. "Customer Support", "Marketing"'
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#25d366]/50 transition-colors"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={adding || !newLabel.trim()}
              className="flex items-center gap-2 bg-[#25d366] hover:bg-[#1db954] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
        </form>
      )}

      {numbers.length >= MAX_NUMBERS && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4 mb-6">
          <p className="text-yellow-400 text-sm">
            Maximum {MAX_NUMBERS} WA numbers reached. Delete one to add another.
          </p>
        </div>
      )}

      {/* Number list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : numbers.length === 0 ? (
        <div className="text-center py-16 bg-[#0a1628] border border-white/5 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/50 font-medium">No WA numbers yet</p>
          <p className="text-white/30 text-sm mt-1">
            Add a label above to create your first number
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {numbers.map((num) => (
            <div
              key={num.id}
              className="bg-[#0a1628] border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Status icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    num.status === "connected"
                      ? "bg-[#25d366]/10"
                      : "bg-white/5"
                  }`}
                >
                  {num.status === "connected" ? (
                    <CheckCircle2 className="w-5 h-5 text-[#25d366]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-white/30" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold text-sm">{num.label}</p>
                    <StatusBadge status={num.status} />
                  </div>
                  {num.phoneNumber ? (
                    <p className="text-white/40 text-xs font-mono">
                      +{num.phoneNumber}
                    </p>
                  ) : (
                    <p className="text-white/25 text-xs">Not connected</p>
                  )}
                  <p className="text-white/20 text-xs mt-1 font-mono">
                    Key: {num.apiKey}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/numbers/${num.id}`}
                    className="flex items-center gap-1.5 bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/20 text-[#25d366] px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Manage
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => deleteNumber(num.id)}
                    disabled={deleting === num.id}
                    className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    {deleting === num.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
