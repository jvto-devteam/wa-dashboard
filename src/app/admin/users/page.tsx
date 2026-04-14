"use client";

import { useEffect, useState } from "react";
import {
  Users, Plus, Trash2, Loader2, Eye, EyeOff, Shield, User, Pencil, X, Check,
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

  // Create form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"USER" | "ADMIN">("USER");
  const [editShowPass, setEditShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

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

  const startEdit = (u: UserRecord) => {
    setEditId(u.id);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword("");
    setEditRole(u.role);
    setEditError("");
    setEditShowPass(false);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setEditError("");
    try {
      const body: Record<string, string> = {
        name: editName,
        email: editEmail,
        role: editRole,
      };
      if (editPassword.trim()) body.password = editPassword;

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? "Failed to save");
      } else {
        setEditId(null);
        fetchUsers();
      }
    } catch {
      setEditError("Network error");
    } finally {
      setSaving(false);
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

  const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#25d366]" />
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} user{users.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#25d366] hover:bg-[#22c55e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          New User
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createUser} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-gray-900 font-semibold mb-4">Create New User</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" className={inputCls} />
            </div>
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="user@example.com" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className={inputCls + " pr-10"} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as "USER" | "ADMIN")} className={inputCls}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="flex items-center gap-2 bg-[#25d366] hover:bg-[#22c55e] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* User list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* User row */}
              <div className="p-5 flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", u.role === "ADMIN" ? "bg-green-50" : "bg-blue-50")}>
                  {u.role === "ADMIN" ? <Shield className="w-5 h-5 text-green-700" /> : <User className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-semibold text-sm">{u.name}</p>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", u.role === "ADMIN" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-600")}>
                      {u.role}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">{u.email}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {u._count.waNumbers} WA number{u._count.waNumbers !== 1 ? "s" : ""} · Joined {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => editId === u.id ? setEditId(null) : startEdit(u)}
                    className={cn("p-2 rounded-lg transition-all", editId === u.id ? "bg-green-50 text-green-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50")}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteUser(u.id, u.name)}
                    disabled={deleting === u.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    {deleting === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Inline edit form */}
              {editId === u.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Edit User</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">Name</label>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">Email</label>
                      <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">New Password <span className="text-gray-400">(kosongkan jika tidak diubah)</span></label>
                      <div className="relative">
                        <input type={editShowPass ? "text" : "password"} value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="••••••••" className={inputCls + " pr-10"} />
                        <button type="button" onClick={() => setEditShowPass(!editShowPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {editShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs block mb-1">Role</label>
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value as "USER" | "ADMIN")} className={inputCls}>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                  {editError && <p className="text-red-600 text-xs mb-2">{editError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(u.id)} disabled={saving} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Save
                    </button>
                    <button onClick={() => setEditId(null)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-100 transition-all">
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
