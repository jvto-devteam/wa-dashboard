"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { TemplateEditor } from "@/components/template-editor";

function extractVars(content: string): string[] {
  const matches = content.match(/\{([^}]+)\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1, -1).trim()))];
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [varMeta, setVarMeta] = useState<Record<string, { description: string; example: string; isRequired: boolean }>>({});

  const variableNames = useMemo(() => extractVars(content), [content]);

  // When content changes, sync varMeta keys
  const handleContentChange = (v: string) => {
    setContent(v);
    const vars = extractVars(v);
    setVarMeta((prev) => {
      const next: typeof prev = {};
      vars.forEach((name) => {
        next[name] = prev[name] ?? { description: "", example: "", isRequired: false };
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { alert("Isi pesan wajib diisi"); return; }
    setLoading(true);
    try {
      const variables = variableNames.map((n) => ({
        name: n,
        description: varMeta[n]?.description ?? "",
        example: varMeta[n]?.example ?? "",
        isRequired: varMeta[n]?.isRequired ?? false,
      }));

      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, content, variables }),
      });

      if (res.ok) {
        router.push("/templates");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error ?? "Gagal membuat template");
      }
    } catch {
      alert("Gagal membuat template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/templates" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Buat Template Baru</h1>
          <p className="text-gray-500 text-sm mt-0.5">Template pesan WhatsApp dengan variabel dinamis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name & Description */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Template <span className="text-red-500">*</span></label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Notif Booking Bali"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Singkat tentang kegunaan template ini"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Isi Pesan <span className="text-red-500">*</span></h2>
            <p className="text-xs text-gray-400 mt-0.5">Gunakan <code className="text-amber-600 font-mono">{"{nama_variable}"}</code> untuk variabel dinamis</p>
          </div>
          <div className="p-0">
            <TemplateEditor
              value={content}
              onChange={handleContentChange}
              variableNames={variableNames}
            />
          </div>
        </div>

        {/* Variable Metadata */}
        {variableNames.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Definisi Variabel</h2>
              <p className="text-xs text-gray-400 mt-0.5">Isi keterangan untuk setiap variabel yang ditemukan</p>
            </div>
            <div className="divide-y divide-gray-100">
              {variableNames.map((varName) => (
                <div key={varName} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <code className="text-sm bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-mono">
                      {`{${varName}}`}
                    </code>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={varMeta[varName]?.isRequired ?? false}
                        onChange={(e) => setVarMeta((prev) => ({
                          ...prev,
                          [varName]: { ...(prev[varName] ?? {}), isRequired: e.target.checked, description: prev[varName]?.description ?? "", example: prev[varName]?.example ?? "" },
                        }))}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      Wajib diisi
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Keterangan</label>
                      <input
                        value={varMeta[varName]?.description ?? ""}
                        onChange={(e) => setVarMeta((prev) => ({
                          ...prev,
                          [varName]: { ...(prev[varName] ?? {}), description: e.target.value, example: prev[varName]?.example ?? "", isRequired: prev[varName]?.isRequired ?? false },
                        }))}
                        placeholder="Apa isi variabel ini?"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Contoh nilai</label>
                      <input
                        value={varMeta[varName]?.example ?? ""}
                        onChange={(e) => setVarMeta((prev) => ({
                          ...prev,
                          [varName]: { ...(prev[varName] ?? {}), example: e.target.value, description: prev[varName]?.description ?? "", isRequired: prev[varName]?.isRequired ?? false },
                        }))}
                        placeholder="Nilai contoh untuk referensi"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-8">
          <Link href="/templates" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || !name.trim() || !content.trim()}
            className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Menyimpan…" : "Buat Template"}
          </button>
        </div>
      </form>
    </div>
  );
}
