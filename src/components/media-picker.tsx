"use client";

import { Image, FileText, Video, X } from "lucide-react";

export type MediaType = "image" | "file" | "video";

interface Props {
  mediaType: MediaType | null;
  mediaUrl: string;
  mediaFilename: string;
  onMediaTypeChange: (v: MediaType | null) => void;
  onMediaUrlChange: (v: string) => void;
  onMediaFilenameChange: (v: string) => void;
}

const TYPES: { value: MediaType; label: string; icon: React.ElementType; accept: string }[] = [
  { value: "image", label: "Gambar",  icon: Image,    accept: "jpg, png, gif, webp" },
  { value: "file",  label: "File",    icon: FileText, accept: "pdf, docx, xlsx, dll" },
  { value: "video", label: "Video",   icon: Video,    accept: "mp4, mkv, mov" },
];

export function MediaPicker({
  mediaType, mediaUrl, mediaFilename,
  onMediaTypeChange, onMediaUrlChange, onMediaFilenameChange,
}: Props) {
  const current = TYPES.find((t) => t.value === mediaType) ?? null;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Lampiran Media</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            URL bisa static atau pakai variabel: <code className="text-amber-600 font-mono">{"{pdf_url}"}</code>
          </p>
        </div>
        {mediaType && (
          <button
            type="button"
            onClick={() => { onMediaTypeChange(null); onMediaUrlChange(""); onMediaFilenameChange(""); }}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Hapus lampiran"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Type selector */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex gap-2">
          {/* No media */}
          <button
            type="button"
            onClick={() => { onMediaTypeChange(null); onMediaUrlChange(""); onMediaFilenameChange(""); }}
            className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              !mediaType
                ? "border-gray-400 bg-gray-100 text-gray-800"
                : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
            }`}
          >
            Teks saja
          </button>

          {TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onMediaTypeChange(value)}
              className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mediaType === value
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* URL + Filename inputs (shown when a media type is selected) */}
      {mediaType && (
        <div className="px-5 py-4 space-y-3 bg-white">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              URL {current?.label}
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => onMediaUrlChange(e.target.value)}
              placeholder={`https://example.com/file.${mediaType === "image" ? "jpg" : mediaType === "video" ? "mp4" : "pdf"} atau {url_variable}`}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Format: <code className="text-amber-600">{"{nama_variable}"}</code> untuk URL dinamis per pengiriman
            </p>
          </div>

          {(mediaType === "file" || mediaType === "video") && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Nama file <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                value={mediaFilename}
                onChange={(e) => onMediaFilenameChange(e.target.value)}
                placeholder={`Laporan.pdf atau {filename_variable}`}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>
          )}

          {/* Preview hint */}
          <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 text-sm ${
            mediaType === "image" ? "bg-purple-50 border-purple-100 text-purple-700"
            : mediaType === "video" ? "bg-pink-50 border-pink-100 text-pink-700"
            : "bg-orange-50 border-orange-100 text-orange-700"
          }`}>
            {current && <current.icon className="w-5 h-5 flex-shrink-0" />}
            <div>
              <p className="font-medium text-xs">
                {mediaType === "image" && "Gambar akan dikirim dengan caption dari isi pesan"}
                {mediaType === "video" && "Video akan dikirim dengan caption dari isi pesan"}
                {mediaType === "file"  && "File akan dikirim sebagai dokumen dengan caption dari isi pesan"}
              </p>
              <p className="text-[11px] opacity-70 mt-0.5">
                Format yang didukung: {current?.accept}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
