"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, FileText, Search, Eye } from "lucide-react";

interface TemplateVar {
  id: string;
  name: string;
  description?: string;
  example?: string;
  isRequired: boolean;
}

interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  variables: TemplateVar[];
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) setTemplates(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Hapus template ini?")) return;
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    if (res.ok) setTemplates((prev) => prev.filter((t) => t.id !== id));
    else alert("Gagal menghapus template");
  };

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 text-sm mt-0.5">Buat dan kelola template pesan WhatsApp dengan variabel dinamis</p>
        </div>
        <Link
          href="/templates/new"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Template Baru
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cari template…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {searchTerm ? "Template tidak ditemukan" : "Belum ada template"}
          </p>
          {!searchTerm && (
            <Link href="/templates/new" className="text-green-600 hover:text-green-700 text-sm mt-2 inline-block">
              Buat template pertama →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{t.name}</h3>
                    {!t.isActive && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Nonaktif</span>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-gray-500 text-xs mb-2">{t.description}</p>
                  )}

                  {/* Content preview */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mb-3">
                    <p className="text-gray-700 text-xs font-mono whitespace-pre-wrap line-clamp-3">{t.content}</p>
                  </div>

                  {/* Footer meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {t.variables.length > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        {t.variables.length} variabel
                      </span>
                    )}
                    <span>·</span>
                    <span>{new Date(t.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    {t.variables.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex flex-wrap gap-1">
                          {t.variables.map((v) => (
                            <code key={v.id} className="bg-amber-50 text-amber-600 px-1 rounded font-mono">{`{${v.name}}`}</code>
                          ))}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link href={`/templates/${t.id}`} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Detail">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link href={`/templates/${t.id}/edit`} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
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
