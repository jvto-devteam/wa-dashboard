"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TemplateEditor } from "@/components/template-editor";
import { MediaPicker, type MediaType } from "@/components/media-picker";

function extractVars(text: string): string[] {
  const matches = text.match(/\{([^}]+)\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1, -1).trim()))];
}

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving]           = useState(false);

  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent]         = useState("");
  const [isActive, setIsActive]       = useState(true);

  const [mediaType, setMediaType]         = useState<MediaType | null>(null);
  const [mediaUrl, setMediaUrl]           = useState("");
  const [mediaFilename, setMediaFilename] = useState("");

  const [varMeta, setVarMeta] = useState<Record<string, { description: string; example: string; isRequired: boolean }>>({});

  const variableNames = useMemo(
    () => extractVars([content, mediaUrl, mediaFilename].join("\n")),
    [content, mediaUrl, mediaFilename]
  );

  useEffect(() => {
    if (!id) return;
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? "");
        setDescription(data.description ?? "");
        setContent(data.content ?? "");
        setIsActive(data.isActive ?? true);
        setMediaType(data.mediaType ?? null);
        setMediaUrl(data.mediaUrl ?? "");
        setMediaFilename(data.mediaFilename ?? "");
        const meta: typeof varMeta = {};
        for (const v of data.variables ?? []) {
          meta[v.name] = { description: v.description ?? "", example: v.example ?? "", isRequired: v.isRequired ?? false };
        }
        setVarMeta(meta);
      })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const syncVarMeta = (newVars: string[]) => {
    setVarMeta((prev) => {
      const next: typeof prev = {};
      newVars.forEach((n) => { next[n] = prev[n] ?? { description: "", example: "", isRequired: false }; });
      return next;
    });
  };

  const handleContentChange = (v: string) => {
    setContent(v);
    syncVarMeta(extractVars([v, mediaUrl, mediaFilename].join("\n")));
  };
  const handleMediaUrlChange = (v: string) => {
    setMediaUrl(v);
    syncVarMeta(extractVars([content, v, mediaFilename].join("\n")));
  };
  const handleMediaFilenameChange = (v: string) => {
    setMediaFilename(v);
    syncVarMeta(extractVars([content, mediaUrl, v].join("\n")));
  };

  const setVarField = (varName: string, field: string, value: string | boolean) =>
    setVarMeta((prev) => ({
      ...prev,
      [varName]: { ...(prev[varName] ?? { description: "", example: "", isRequired: false }), [field]: value },
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) {
      alert("Isi pesan atau URL media wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const variables = variableNames.map((n) => ({
        name: n,
        description: varMeta[n]?.description ?? "",
        example: varMeta[n]?.example ?? "",
        isRequired: varMeta[n]?.isRequired ?? false,
      }));

      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, description, content, isActive,
          mediaType: mediaType ?? null,
          mediaUrl: mediaUrl.trim() || null,
          mediaFilename: mediaFilename.trim() || null,
          variables,
        }),
      });

      if (res.ok) {
        router.push("/templates");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error ?? "Gagal menyimpan template");
      }
    } catch {
      alert("Gagal menyimpan template");
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/templates" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Template</h1>
          <p className="text-gray-500 text-sm mt-0.5">{name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name, Description, Active */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Template <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Template aktif</span>
          </label>
        </div>

        {/* Text Editor */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">
              Isi Pesan <span className="text-gray-400 font-normal">(teks / caption)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Gunakan <code className="text-amber-600 font-mono">{"{nama_variable}"}</code> untuk variabel dinamis
            </p>
          </div>
          <TemplateEditor
            value={content}
            onChange={handleContentChange}
            variableNames={variableNames}
          />
        </div>

        {/* Media Picker */}
        <MediaPicker
          mediaType={mediaType}
          mediaUrl={mediaUrl}
          mediaFilename={mediaFilename}
          onMediaTypeChange={setMediaType}
          onMediaUrlChange={handleMediaUrlChange}
          onMediaFilenameChange={handleMediaFilenameChange}
        />

        {/* Variable Metadata */}
        {variableNames.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Definisi Variabel</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Variabel ditemukan di isi pesan{mediaType ? " dan URL media" : ""}
              </p>
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
                        onChange={(e) => setVarField(varName, "isRequired", e.target.checked)}
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
                        onChange={(e) => setVarField(varName, "description", e.target.value)}
                        placeholder="Apa isi variabel ini?"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Contoh nilai</label>
                      <input
                        value={varMeta[varName]?.example ?? ""}
                        onChange={(e) => setVarField(varName, "example", e.target.value)}
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
            disabled={saving || !name.trim() || (!content.trim() && !mediaUrl.trim())}
            className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
