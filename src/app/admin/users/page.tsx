"use client";

import { useEffect, useState } from "react";
import {
  Users, Plus, Trash2, Loader2, Eye, EyeOff, Shield, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  _count: { waNumbers: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFormError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to create user");
      } else {
        setName(""); setEmail(""); setPassword(""); setRole("USER");
        setShowForm(false);
        fetchUsers();
      }
    } catch {
      setFormError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (id: string, userName: string) => {
    if (!confirm(`Delete user "${userName}"? All their WA numbers will be removed.`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#25d366]" />
            User Management
          </h1>
          <p className="text-white/40 text-sm mt-1">{users.length} user{users.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#25d366] hover:bg-[#1db954] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          New User
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={createUser}
          className="bg-[#0a1628] border border-white/5 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-white font-semibold mb-4">Create New User</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#25d366]/50"
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#25d366]/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 pr-10 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#25d366]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs font-medium block mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#25d366]/50"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {formError && (
            <p className="text-red-400 text-sm mb-3">{formError}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 bg-[#25d366] hover:bg-[#1db954] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl text-sm text-white/50 hover:text-white border border-white/10 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* User list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-white/30" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-[#0a1628] border border-white/5 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                u.role === "ADMIN" ? "bg-[#25d366]/10" : "bg-blue-500/10"
              )}>
                {u.role === "ADMIN" ? (
                  <Shield className="w-5 h-5 text-[#25d366]" />
                ) : (
                  <User className="w-5 h-5 text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm">{u.name}</p>
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                    u.role === "ADMIN"
                      ? "bg-[#25d366]/20 text-[#25d366]"
                      : "bg-blue-500/20 text-blue-400"
                  )}>
                    {u.role}
                  </span>
                </div>
                <p className="text-white/40 text-xs">{u.email}</p>
                <p className="text-white/25 text-xs mt-0.5">
                  {u._count.waNumbers} WA number{u._count.waNumbers !== 1 ? "s" : ""} ·
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => deleteUser(u.id, u.name)}
                disabled={deleting === u.id}
                className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
              >
                {deleting === u.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
