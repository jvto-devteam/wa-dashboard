"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, QrCode, RefreshCw, LogOut, CheckCircle2,
  Send, Webhook, Key, Copy, Check, Loader2,
  MessageSquare, Image as ImageIcon, Video, FileText, Users,
  Play, Music, Archive, File,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/wa-client";

type Tab = "connection" | "send" | "groups" | "webhook" | "api";

interface NumberInfo {
  id: string;
  label: string;
  apiKey: string;
  userApiKey?: string | null;
  webhookUrl: string | null;
  phoneNumber: string | null;
  status: ConnectionStatus;
  user?: { id: string; name: string; email: string };
  qr?: string | null;
  stats?: { sent: number; received: number };
}

interface Message {
  id: string;
  direction: "IN" | "OUT";
  toFrom: string;
  content: string | null;
  mediaType: string | null;
  createdAt: string;
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-gray-400 hover:text-gray-600 transition-colors">
      {copied ? <Check className="w-4 h-4 text-[#25d366]" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

// ─── Connection Tab ───────────────────────────────────────────────────────────
function ConnectionTab({
  numberId, info, reload, onConnect,
}: {
  numberId: string;
  info: NumberInfo;
  reload: () => void;
  onConnect: () => void;
}) {
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Clear spinner once QR or connected state arrives via SSE
  useEffect(() => {
    if (info.qr || info.status === "connected" || info.status === "disconnected") {
      setConnecting(false);
    }
  }, [info.qr, info.status]);

  const connect = async () => {
    setConnecting(true);
    // POST to start the connection, then SSE will stream QR/status updates.
    // onConnect() also reopens SSE in case it was closed.
    onConnect();
    await fetch(`/api/numbers/${numberId}/connect`, { method: "POST" }).catch(() => {});
  };

  const disconnect = async () => {
    if (!confirm("Disconnect this number? You'll need to scan QR again.")) return;
    setDisconnecting(true);
    await fetch(`/api/numbers/${numberId}/disconnect`, { method: "POST" });
    reload();
    setDisconnecting(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <span className="text-gray-500 text-sm">Connection Status</span>
          <StatusBadge status={info.status} />
        </div>

        <div className="p-8 flex flex-col items-center">
          {info.status === "connected" ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#25d366]" />
              </div>
              <div className="text-center">
                <p className="text-gray-900 text-xl font-bold">Connected!</p>
                {info.phoneNumber && (
                  <p className="text-gray-500 text-sm mt-1">+{info.phoneNumber}</p>
                )}
              </div>
              <button
                onClick={disconnect}
                disabled={disconnecting}
                className="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          ) : info.status === "connecting" && !info.qr ? (
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="w-16 h-16 rounded-full bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-yellow-600 animate-spin" />
              </div>
              <p className="text-gray-900 font-semibold">Initializing...</p>
            </div>
          ) : info.qr ? (
            <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <Image src={info.qr} alt="QR Code" width={260} height={260} unoptimized />
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-semibold">Scan this QR code</p>
                <p className="text-gray-400 text-xs mt-1">
                  WhatsApp → More options → Linked devices → Link a device
                </p>
              </div>
              <button
                onClick={connect}
                disabled={connecting}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${connecting ? "animate-spin" : ""}`} />
                Refresh QR
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-gray-900 font-semibold">Not Connected</p>
                <p className="text-gray-500 text-sm mt-1">
                  Click below to generate a QR code
                </p>
              </div>
              <button
                onClick={connect}
                disabled={connecting}
                className="flex items-center gap-2 bg-[#25d366] hover:bg-[#22c55e] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#25d366]/20 disabled:opacity-60"
              >
                <QrCode className="w-4 h-4" />
                {connecting ? "Generating..." : "Generate QR Code"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── WA preview renderer ──────────────────────────────────────────────────────
function renderWAPreview(text: string, vars: Record<string, string> = {}): string {
  let s = text.replace(/\{([^}]+)\}/g, (_, name) => {
    const val = vars[name.trim()];
    return val
      ? `<span>${val.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</span>`
      : `<span class="inline-block bg-amber-100 text-amber-700 font-mono text-xs rounded px-1 mx-0.5">{${name}}</span>`;
  });
  s = s
    .replace(/```([\s\S]*?)```/g, "<code class=\"font-mono text-xs bg-black/10 rounded px-0.5\">$1</code>")
    .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
    .replace(/~([^~\n]+)~/g, "<del>$1</del>")
    .replace(/\n/g, "<br/>");
  return s;
}

// ─── WA media preview bubble ──────────────────────────────────────────────────
function getFileIcon(filename?: string | null) {
  const ext = filename?.split(".").pop()?.toLowerCase() ?? "";
  if (["mp3","wav","ogg","m4a","aac"].includes(ext)) return <Music className="w-7 h-7 text-[#54656f]" />;
  if (["zip","rar","7z","tar","gz"].includes(ext))   return <Archive className="w-7 h-7 text-[#54656f]" />;
  return <File className="w-7 h-7 text-[#54656f]" />;
}

function WAMediaPreview({
  mediaType, mediaUrl, filename,
}: {
  mediaType: string;
  mediaUrl: string | null;
  filename?: string | null;
}) {
  const [imgError, setImgError] = useState(false);

  if (mediaType === "image") {
    const src = mediaUrl?.trim();
    if (src && !imgError) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="preview"
          className="w-full max-h-52 object-cover rounded-lg mb-1"
          onError={() => setImgError(true)}
        />
      );
    }
    return (
      <div className="w-full h-36 rounded-lg bg-gray-200 flex flex-col items-center justify-center mb-1 gap-1">
        <ImageIcon className="w-8 h-8 text-gray-400" />
        {!src && <p className="text-gray-400 text-xs">Image URL not set</p>}
        {imgError && <p className="text-gray-400 text-xs">Could not load image</p>}
      </div>
    );
  }

  if (mediaType === "video") {
    return (
      <div className="w-full h-36 rounded-lg bg-gray-900 flex flex-col items-center justify-center mb-1 gap-2 relative overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <Play className="w-6 h-6 text-white ml-0.5" />
        </div>
        <p className="text-white/60 text-xs">Video</p>
      </div>
    );
  }

  if (mediaType === "file") {
    const ext = filename?.split(".").pop()?.toUpperCase() ?? "FILE";
    return (
      <div className="flex items-center gap-3 bg-black/5 rounded-lg px-3 py-2.5 mb-1">
        {getFileIcon(filename)}
        <div className="min-w-0">
          <p className="text-[#111b21] text-sm font-medium truncate">{filename || "document"}</p>
          <p className="text-[#54656f] text-xs">{ext} · Document</p>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Send Tab ────────────────────────────────────────────────────────────────
interface TemplateDetail {
  id: string;
  name: string;
  content: string;
  description?: string | null;
  mediaType?: string | null;
  mediaUrl?: string | null;
  mediaFilename?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: Array<{ name: string; isRequired: boolean; description?: string | null; example?: string | null }>;
}

function SendTab({ numberId, connected, initialTo = "" }: { numberId: string; connected: boolean; initialTo?: string }) {
  type MsgType = "text" | "image" | "video" | "document" | "template";
  const [msgType, setMsgType] = useState<MsgType>("text");
  const [to, setTo] = useState(initialTo);

  useEffect(() => {
    if (initialTo) setTo(initialTo);
  }, [initialTo]);

  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [filename, setFilename] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetail | null>(null);
  const [loadingTpl, setLoadingTpl] = useState(false);

  // Fetch template list when tab opened
  useEffect(() => {
    if (msgType === "template" && templates.length === 0) {
      fetch("/api/templates")
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setTemplates(data) : null)
        .catch(() => {});
    }
  }, [msgType, templates.length]);

  // Fetch full template details when selection changes
  useEffect(() => {
    if (!templateId) { setSelectedTemplate(null); return; }
    setLoadingTpl(true);
    fetch(`/api/templates/${templateId}`)
      .then(res => res.json())
      .then((data: TemplateDetail) => {
        setSelectedTemplate(data);
        // Reset variables to empty map
        setTemplateVariables({});
      })
      .catch(() => {})
      .finally(() => setLoadingTpl(false));
  }, [templateId]);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSend = async () => {
    if (!to.trim()) return;
    setSending(true);
    setResult(null);
    try {
      let res;
      if (msgType === "text") {
        res = await fetch(`/api/numbers/${numberId}/send/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: to.trim(), text }),
        });
      } else if (msgType === "template") {
        if (!templateId) {
          setResult({ ok: false, msg: "Please select a template" });
          setSending(false);
          return;
        }
        res = await fetch(`/api/numbers/${numberId}/send/template`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: to.trim(), templateId, variables: templateVariables }),
        });
      } else {
        res = await fetch(`/api/numbers/${numberId}/send/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: to.trim(), url, type: msgType, caption, filename }),
        });
      }
      const data = await res!.json();
      setResult({ ok: res!.ok, msg: res!.ok ? "Message sent successfully!" : (data.error ?? "Failed") });
    } catch {
      setResult({ ok: false, msg: "Network error" });
    } finally {
      setSending(false);
    }
  };

  const tabs: { type: MsgType; icon: React.ElementType; label: string }[] = [
    { type: "text", icon: MessageSquare, label: "Text" },
    { type: "image", icon: ImageIcon, label: "Image" },
    { type: "video", icon: Video, label: "Video" },
    { type: "document", icon: FileText, label: "Document" },
    { type: "template", icon: FileText, label: "Template" },
  ];

  const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#25d366] focus:ring-2 focus:ring-[#25d366]/10 transition-colors";

  // Resolve preview values
  const resolveVars = (s: string) =>
    s.replace(/\{([^}]+)\}/g, (_, n) => templateVariables[n.trim()] || "");

  const previewText = msgType === "template"
    ? (selectedTemplate?.content ?? "")
    : msgType === "text" ? text : "";

  const resolvedMediaUrl = selectedTemplate?.mediaUrl
    ? resolveVars(selectedTemplate.mediaUrl) || selectedTemplate.mediaUrl
    : null;

  const resolvedFilename = selectedTemplate?.mediaFilename
    ? resolveVars(selectedTemplate.mediaFilename) || selectedTemplate.mediaFilename
    : null;

  const showPreview = (msgType === "text" && text.trim()) ||
    (msgType === "template" && !!selectedTemplate);

  const previewVars = msgType === "template" ? templateVariables : {};

  return (
    <div className="space-y-4">
      {!connected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <p className="text-amber-700 text-sm">Connect your WhatsApp first to send messages.</p>
        </div>
      )}

      <div className={cn("gap-4", showPreview ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col max-w-xl mx-auto w-full")}>
        {/* ── Form ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          {/* Type tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
            {tabs.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setMsgType(type)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  msgType === type ? "bg-[#25d366] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* To */}
          <div className="mb-4">
            <label className="text-gray-500 text-xs font-medium block mb-1.5">Penerima</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="628123456789 atau 120363xxxxxx@g.us"
              className={inputCls}
            />
          </div>

          {/* Text */}
          {msgType === "text" && (
            <div className="mb-4">
              <label className="text-gray-500 text-xs font-medium block mb-1.5">Pesan</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Ketik pesan..."
                className={inputCls + " resize-none"}
              />
            </div>
          )}

          {/* Template */}
          {msgType === "template" && (
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-gray-500 text-xs font-medium block mb-1.5">Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className={inputCls + " cursor-pointer"}
                >
                  <option value="">— Pilih template —</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {loadingTpl && (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading...
                </div>
              )}

              {selectedTemplate && !loadingTpl && (
                <>
                  {selectedTemplate.description && (
                    <p className="text-gray-400 text-xs bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      {selectedTemplate.description}
                    </p>
                  )}
                  {selectedTemplate.variables.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Variabel</p>
                      {selectedTemplate.variables.map(v => (
                        <div key={v.name}>
                          <label className="flex items-center gap-1.5 text-gray-600 text-xs mb-1.5">
                            <code className="bg-gray-100 text-gray-700 rounded px-1.5 py-0.5 font-mono">{`{${v.name}}`}</code>
                            {v.isRequired && <span className="text-red-400 font-medium">*</span>}
                            {v.description && <span className="text-gray-400">· {v.description}</span>}
                          </label>
                          <input
                            value={templateVariables[v.name] ?? ""}
                            onChange={(e) => setTemplateVariables(prev => ({ ...prev, [v.name]: e.target.value }))}
                            placeholder={v.example ?? `Isi ${v.name}...`}
                            className={inputCls}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Media URL */}
          {msgType !== "text" && msgType !== "template" && (
            <>
              <div className="mb-3">
                <label className="text-gray-500 text-xs font-medium block mb-1.5">
                  URL {msgType === "image" ? "Gambar" : msgType === "video" ? "Video" : "File"}
                </label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={inputCls} />
              </div>
              <div className="mb-3">
                <label className="text-gray-500 text-xs font-medium block mb-1.5">Caption (opsional)</label>
                <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption..." className={inputCls} />
              </div>
              {msgType === "document" && (
                <div className="mb-3">
                  <label className="text-gray-500 text-xs font-medium block mb-1.5">Nama File (opsional)</label>
                  <input value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="dokumen.pdf" className={inputCls} />
                </div>
              )}
            </>
          )}

          {result && (
            <div className={cn(
              "rounded-xl px-4 py-3 mb-4 flex items-center gap-2",
              result.ok ? "bg-[#25d366]/10 border border-[#25d366]/20" : "bg-red-50 border border-red-200"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", result.ok ? "bg-[#25d366]" : "bg-red-500")} />
              <p className={result.ok ? "text-[#128C7E] text-sm font-medium" : "text-red-600 text-sm"}>
                {result.msg}
              </p>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!connected || sending}
            className="w-full flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#22c55e] text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-sm shadow-[#25d366]/20"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Mengirim..." : "Kirim Pesan"}
          </button>
        </div>

        {/* ── WA Preview ── */}
        {showPreview && (
          <div className="flex flex-col">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2 px-0.5">Preview WhatsApp</p>
            {/* Phone frame */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-1">
              {/* WA chat header */}
              <div className="bg-[#128C7E] px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{to.trim() || "Penerima"}</p>
                  <p className="text-white/60 text-xs">online</p>
                </div>
              </div>
              {/* Chat area */}
              <div
                className="p-4 min-h-[200px]"
                style={{ backgroundColor: "#e5ddd5" }}
              >
                <div className="flex justify-end">
                  <div className="bg-[#d9fdd3] rounded-xl rounded-tr-sm px-3 py-2 max-w-[85%] shadow-sm min-w-[120px]">
                    {/* Media preview */}
                    {selectedTemplate?.mediaType && (
                      <WAMediaPreview
                        mediaType={selectedTemplate.mediaType}
                        mediaUrl={resolvedMediaUrl}
                        filename={resolvedFilename}
                      />
                    )}
                    {/* Text */}
                    {previewText && (
                      <p
                        className="text-[#111b21] text-sm leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: renderWAPreview(previewText, previewVars) }}
                      />
                    )}
                    {/* Timestamp */}
                    <p className="text-[#54656f] text-[10px] text-right mt-1">
                      {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      {" ✓✓"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Webhook Tab ─────────────────────────────────────────────────────────────
function WebhookTab({ numberId, initialUrl }: { numberId: string; initialUrl: string | null }) {
  const [webhookUrl, setWebhookUrl] = useState(initialUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetch(`/api/numbers/${numberId}/status`)
      .then((r) => r.json())
      .then((d) => setWebhookUrl(d.webhookUrl ?? ""));
  }, [numberId]);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/numbers/${numberId}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = "flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 transition-colors";

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-gray-800 font-medium text-sm mb-4 flex items-center gap-2">
          <Webhook className="w-4 h-4 text-[#25d366]" />
          Webhook URL
        </h2>
        <div className="flex gap-3">
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-server.com/webhook"
            className={inputCls}
          />
          <button
            onClick={save}
            disabled={saving}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              saved
                ? "bg-[#25d366] text-white"
                : "bg-gray-900 hover:bg-gray-700 text-white"
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? "Saved!" : "Save"}
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">
          Incoming messages will be forwarded as POST to this URL.
        </p>

        <div className="mt-4 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-gray-500 text-xs font-mono mb-1">Teks (<code className="text-gray-700">conversation</code>)</p>
            <pre className="text-green-700 text-xs font-mono overflow-x-auto">{`{ "event": "message", "data": {
  "from": "628xxx@s.whatsapp.net", "fromMe": false,
  "type": "conversation", "text": "Halo!", "timestamp": 1234567890
}}`}</pre>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-gray-500 text-xs font-mono mb-1">Gambar / Video / Stiker</p>
            <pre className="text-green-700 text-xs font-mono overflow-x-auto">{`{ "event": "message", "data": {
  "from": "628xxx@s.whatsapp.net", "type": "imageMessage",
  "text": "caption jika ada",
  "media": { "url": "https://mmg.whatsapp.net/...",
    "mimetype": "image/jpeg", "fileSize": 123456 }
}}`}</pre>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-gray-500 text-xs font-mono mb-1">Audio / Voice note</p>
            <pre className="text-green-700 text-xs font-mono overflow-x-auto">{`{ "event": "message", "data": {
  "type": "audioMessage",
  "media": { "url": "...", "mimetype": "audio/ogg; codecs=opus",
    "seconds": 12, "ptt": true }
}}`}</pre>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-gray-500 text-xs font-mono mb-1">Dokumen / File</p>
            <pre className="text-green-700 text-xs font-mono overflow-x-auto">{`{ "event": "message", "data": {
  "type": "documentMessage",
  "media": { "url": "...", "mimetype": "application/pdf",
    "filename": "dokumen.pdf", "fileSize": 204800 }
}}`}</pre>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-gray-500 text-xs font-mono mb-1">Lokasi / Maps</p>
            <pre className="text-green-700 text-xs font-mono overflow-x-auto">{`{ "event": "message", "data": {
  "type": "locationMessage",
  "location": { "latitude": -6.2088, "longitude": 106.8456,
    "name": "Jakarta", "address": "..." }
}}`}</pre>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-gray-500 text-xs font-mono mb-1">Kontak</p>
            <pre className="text-green-700 text-xs font-mono overflow-x-auto">{`{ "event": "message", "data": {
  "type": "contactMessage",
  "contact": { "displayName": "John Doe", "vcard": "BEGIN:VCARD..." }
}}`}</pre>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-gray-800 font-medium text-sm mb-3">Incoming Messages</h2>
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs font-mono">{msg.toFrom}</span>
                  <span className="text-gray-400 text-xs">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
                {msg.content && <p className="text-gray-700 text-sm mt-1">{msg.content}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Groups Tab ───────────────────────────────────────────────────────────────
interface Group {
  id: string;
  name: string;
  participantCount: number;
  description: string | null;
}

function GroupsTab({ numberId, connected, onSendTo }: { numberId: string; connected: boolean; onSendTo: (jid: string) => void }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/numbers/${numberId}/groups`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to fetch groups"); return; }
      setGroups(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyJid = (jid: string) => {
    navigator.clipboard.writeText(jid);
    setCopied(jid);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {!connected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <p className="text-yellow-700 text-sm">Connect your WhatsApp first to view groups.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          {groups.length > 0 ? `${groups.length} groups found` : "Click refresh to load groups"}
        </p>
        <button
          onClick={fetchGroups}
          disabled={!connected || loading}
          className="flex items-center gap-1.5 bg-[#25d366] hover:bg-[#22c55e] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Load Groups"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {groups.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-sm">
          {groups.map((g) => (
            <div key={g.id} className="px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#25d366]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium text-sm">{g.name}</p>
                {g.description && (
                  <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{g.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-gray-400 text-xs font-mono truncate">{g.id}</code>
                  <button
                    onClick={() => copyJid(g.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    {copied === g.id ? <Check className="w-3.5 h-3.5 text-[#25d366]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-0.5">{g.participantCount} members</p>
              </div>
              <button
                onClick={() => onSendTo(g.id)}
                className="flex items-center gap-1.5 bg-[#25d366] hover:bg-[#22c55e] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </div>
          ))}
        </div>
      )}

      {groups.length === 0 && !loading && !error && connected && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 font-medium">No groups loaded</p>
          <p className="text-gray-400 text-sm mt-1">Click &quot;Load Groups&quot; to fetch your WhatsApp groups</p>
        </div>
      )}
    </div>
  );
}

// ─── API Tab ─────────────────────────────────────────────────────────────────
function ApiTab({ numberId, apiKey: initialKey, userApiKey: initialUserKey }: {
  numberId: string;
  apiKey: string;
  userApiKey: string | null;
}) {
  const [apiKey, setApiKey] = useState(initialKey);           // number_key
  const [userApiKey, setUserApiKey] = useState(initialUserKey ?? ""); // api_key
  const [regenerating, setRegen] = useState(false);
  const [regenUser, setRegenUser] = useState(false);

  const regen = async () => {
    setRegen(true);
    const res = await fetch(`/api/numbers/${numberId}/apikey`, { method: "POST" });
    const data = await res.json();
    if (data.apiKey) setApiKey(data.apiKey);
    setRegen(false);
  };

  const regenUserKey = async () => {
    setRegenUser(true);
    const res = await fetch("/api/user/apikey", { method: "POST" });
    const data = await res.json();
    if (data.apiKey) setUserApiKey(data.apiKey);
    setRegenUser(false);
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* api_key — User level */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-gray-800 font-medium text-sm mb-1 flex items-center gap-2">
          <Key className="w-4 h-4 text-[#25d366]" />
          API Key
        </h2>
        <p className="text-gray-400 text-xs mb-3">Milik akun kamu — sama untuk semua nomor WA</p>
        {userApiKey ? (
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 mb-2">
            <code className="text-green-600 text-sm font-mono flex-1 truncate">{userApiKey}</code>
            <CopyButton text={userApiKey} />
          </div>
        ) : (
          <p className="text-yellow-600 text-xs mb-2">Belum ada — klik Generate di bawah</p>
        )}
        <button
          onClick={regenUserKey}
          disabled={regenUser}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-xs transition-colors mt-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenUser ? "animate-spin" : ""}`} />
          {userApiKey ? "Regenerate" : "Generate"}
        </button>
      </div>

      {/* number_key — per WaNumber */}
      <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-gray-800 font-medium text-sm mb-1 flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-500" />
          Number Key
        </h2>
        <p className="text-gray-400 text-xs mb-3">Khusus untuk nomor WA ini saja</p>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 mb-2">
          <code className="text-blue-600 text-sm font-mono flex-1 truncate">{apiKey}</code>
          <CopyButton text={apiKey} />
        </div>
        <button
          onClick={regen}
          disabled={regenerating}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-xs transition-colors mt-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {/* PHP Example */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-gray-800 font-medium text-sm mb-3">Contoh PHP</h2>
        <pre className="text-gray-700 text-xs font-mono overflow-x-auto whitespace-pre-wrap bg-gray-50 rounded-xl p-3 border border-gray-200">{`$data = [
  "api_key"    => "${userApiKey || "YOUR-API-KEY"}",
  "number_key" => "${apiKey}",
  "phone_no"   => "628123456789",
  "message"    => "Halo!",
];
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL            => '${baseUrl}/api/v1/send_message',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => 'POST',
  CURLOPT_POSTFIELDS     => json_encode($data),
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);
$response = json_decode(curl_exec($curl));
curl_close($curl);`}</pre>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NumberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("connection");
  const [sendTo, setSendTo] = useState("");
  const [info, setInfo] = useState<NumberInfo | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref pattern: always points to the latest openSSE closure (avoids stale captures)
  const openSSERef = useRef<() => void>(() => {});

  const handleSendToGroup = (jid: string) => {
    setSendTo(jid);
    setActiveTab("send");
  };

  const fetchInfo = useCallback(async () => {
    try {
      const res = await fetch(`/api/numbers/${id}/status`);
      if (!res.ok) { router.push("/numbers"); return; }
      const data = await res.json();
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      setInfo({ ...data, userApiKey: meData.apiKey ?? null });
    } catch { /* ignore */ }
  }, [id, router]);

  // Keep ref up to date with latest closures on every render
  openSSERef.current = () => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    esRef.current?.close();

    const es = new EventSource(`/api/numbers/${id}/sse`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setInfo((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: data.status ?? prev.status,
            qr: data.qr !== undefined ? data.qr : prev.qr,
            stats: data.stats ?? prev.stats,
            webhookUrl: data.webhookUrl !== undefined ? data.webhookUrl : prev.webhookUrl,
          };
        });
      } catch { /* ignore */ }
    };

    es.onerror = () => {
      es.close();
      // Auto-reconnect after 3 s — handles Vercel's maxDuration timeout
      // so QR scanning continues even if the SSE connection cycles.
      reconnectTimerRef.current = setTimeout(() => openSSERef.current(), 3000);
    };
  };

  // SSE for real-time updates
  useEffect(() => {
    fetchInfo();
    openSSERef.current();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      esRef.current?.close();
    };
  }, [id, fetchInfo]);

  if (!info) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "connection", icon: QrCode, label: "Connection" },
    { id: "send", icon: Send, label: "Send" },
    { id: "groups", icon: Users, label: "Groups" },
    { id: "webhook", icon: Webhook, label: "Webhook" },
    { id: "api", icon: Key, label: "API" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/numbers")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Semua Nomor
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                info.status === "connected" ? "bg-[#25d366]/10" : "bg-gray-100"
              )}>
                <MessageSquare className={cn("w-6 h-6", info.status === "connected" ? "text-[#25d366]" : "text-gray-400")} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{info.label}</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  {info.phoneNumber ? `+${info.phoneNumber}` : "Belum terhubung"}
                </p>
              </div>
            </div>
            <StatusBadge status={info.status} />
          </div>

          {info.stats && (
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#25d366]" />
                <span className="text-gray-500 text-xs">{info.stats.sent.toLocaleString()} terkirim</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-gray-500 text-xs">{info.stats.received.toLocaleString()} diterima</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1.5 mb-6 shadow-sm">
        <div className="flex gap-1">
          {tabs.map(({ id: tabId, icon: Icon, label }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === tabId
                  ? "bg-[#25d366] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "connection" && (
        <ConnectionTab numberId={id} info={info} reload={fetchInfo} onConnect={() => openSSERef.current()} />
      )}
      {activeTab === "send" && (
        <SendTab numberId={id} connected={info.status === "connected"} initialTo={sendTo} />
      )}
      {activeTab === "groups" && (
        <GroupsTab numberId={id} connected={info.status === "connected"} onSendTo={handleSendToGroup} />
      )}
      {activeTab === "webhook" && (
        <WebhookTab numberId={id} initialUrl={info.webhookUrl} />
      )}
      {activeTab === "api" && (
        <ApiTab numberId={id} apiKey={info.apiKey} userApiKey={info.userApiKey ?? null} />
      )}
    </div>
  );
}
