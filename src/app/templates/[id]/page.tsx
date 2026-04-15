"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Copy, Check } from "lucide-react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variables: Array<{
    id: string;
    name: string;
    description?: string;
    example?: string;
    isRequired: boolean;
  }>;
  user: { id: string; name: string; email: string };
}

// Render WA formatting for preview
function renderPreview(text: string): string {
  let s = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  s = s
    .replace(/```([\s\S]*?)```/g, '<code class="font-mono text-xs bg-gray-100 rounded px-0.5">$1</code>')
    .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
    .replace(/~([^~\n]+)~/g, "<del>$1</del>")
    .replace(/\{([^}]+)\}/g, '<span class="inline-block bg-amber-100 text-amber-700 font-mono text-xs rounded px-1 mx-0.5">{$1}</span>')
    .replace(/\n/g, "<br/>");
  return s;
}

export default function TemplateDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then(setTemplate)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const deleteTemplate = async () => {
    if (!confirm("Hapus template ini?")) return;
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/templates");
    else alert("Gagal menghapus template");
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">Template tidak ditemukan</p>
        <Link href="/templates" className="text-green-600 hover:text-green-700 text-sm mt-2 inline-block">
          ← Kembali ke Templates
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/templates" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 truncate">{template.name}</h1>
            {!template.isActive && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium flex-shrink-0">Nonaktif</span>
            )}
          </div>
          {template.description && <p className="text-gray-500 text-sm mt-0.5 truncate">{template.description}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link href={`/templates/${id}/edit`} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </Link>
          <button onClick={deleteTemplate} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">

        {/* Meta */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Template ID", template.id, true],
              ["Dibuat oleh", template.user.name, false],
              ["Dibuat", new Date(template.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }), false],
              ["Diperbarui", new Date(template.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }), false],
            ].map(([label, val, mono]) => (
              <div key={label as string}>
                <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                <p className={`text-gray-800 truncate ${mono ? "font-mono text-xs" : ""}`}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Isi Pesan</h2>
            <button
              onClick={() => copy(template.content)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Tersalin!" : "Salin"}
            </button>
          </div>
          {/* Raw */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-2">Raw</p>
            <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap bg-gray-50 rounded-xl px-4 py-3">
              {template.content}
            </pre>
          </div>
          {/* Preview */}
          <div className="px-5 py-4">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-3">Preview</p>
            <div className="bg-[#dcf8c6] rounded-xl rounded-tl-none px-4 py-3 max-w-sm text-sm text-gray-800 shadow-sm">
              <div
                dangerouslySetInnerHTML={{ __html: renderPreview(template.content) }}
                className="leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Variables */}
        {template.variables.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Variabel ({template.variables.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {template.variables.map((v) => (
                <div key={v.id} className="px-5 py-4 flex items-start gap-4">
                  <code className="text-sm bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-mono flex-shrink-0 mt-0.5">
                    {`{${v.name}}`}
                  </code>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {v.isRequired && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Wajib</span>
                      )}
                      {v.description && <span className="text-sm text-gray-700">{v.description}</span>}
                    </div>
                    {v.example && (
                      <p className="text-xs text-gray-400">Contoh: <span className="text-gray-600 font-mono">{v.example}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Usage */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Gunakan via API</h2>
            <p className="text-xs text-gray-400 mt-0.5">POST /api/v1/send_template</p>
          </div>
          <div className="px-5 py-4">
            <pre className="text-xs font-mono bg-gray-50 rounded-xl px-4 py-3 overflow-auto whitespace-pre text-gray-700">{
`{
  "api_key": "YOUR-API-KEY",
  "number_key": "YOUR-NUMBER-KEY",
  "phone_no": "628123456789",
  "template_id": "${template.id}",
  "variables": {
${template.variables.map((v) => `    "${v.name}": "${v.example ?? "value"}"`).join(",\n")}
  }
}`}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
