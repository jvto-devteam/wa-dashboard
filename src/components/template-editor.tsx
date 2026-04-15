"use client";

import { useRef, useState, useCallback } from "react";
import { Bold, Italic, Strikethrough, Code, Smile, ChevronDown, ChevronUp } from "lucide-react";

// ─── WhatsApp emoji set ───────────────────────────────────────────────────────
const EMOJIS = [
  "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
  "🙂","😉","😌","😍","🥰","😘","😎","🤩","🥳","😢",
  "😭","😡","🤔","💭","✅","❌","⚠️","💯","🔥","⭐",
  "🌟","💫","✨","🎉","🎊","🎯","👋","🤝","🙏","👍",
  "👎","💪","❤️","💚","💛","🧡","🚗","✈️","🏠","📱",
  "💻","📊","📈","📋","📌","💰","💳","📦","🎁","🔑",
  "🔒","💡","🔔","📢","📞","📧","💬","📅","🗓️","⏰",
  "⌛","⏳","🌍","🌱","🌺","☕","🍕","🛒","🟢","🔴",
];

// ─── Preview renderer ─────────────────────────────────────────────────────────
function renderPreview(text: string): string {
  let s = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  s = s
    .replace(/```([\s\S]*?)```/g, "<code class=\"font-mono text-xs bg-gray-100 rounded px-0.5\">$1</code>")
    .replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
    .replace(/~([^~\n]+)~/g, "<del>$1</del>")
    .replace(/\{([^}]+)\}/g, "<span class=\"inline-block bg-amber-100 text-amber-700 font-mono text-xs rounded px-1 mx-0.5\">{$1}</span>")
    .replace(/\n/g, "<br/>");

  return s;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  value: string;
  onChange: (v: string) => void;
  variableNames?: string[];
  rows?: number;
  placeholder?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function TemplateEditor({ value, onChange, variableNames = [], rows = 8, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Insert text at cursor / replace selection
  const insertAt = useCallback((before: string, after = "") => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end);
    const next = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length;
      el.setSelectionRange(cursor, cursor);
    });
  }, [onChange]);

  const wrapFormat = useCallback((prefix: string, suffix: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end);
    const next = el.value.slice(0, start) + prefix + selected + suffix + el.value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  }, [onChange]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200">

        {/* Format buttons */}
        <div className="flex items-center gap-0.5 pr-2 mr-1 border-r border-gray-200">
          <ToolBtn title="Bold (*text*)" onClick={() => wrapFormat("*", "*")}>
            <Bold className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Italic (_text_)" onClick={() => wrapFormat("_", "_")}>
            <Italic className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Strikethrough (~text~)" onClick={() => wrapFormat("~", "~")}>
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolBtn>
          <ToolBtn title="Monospace (```text```)" onClick={() => wrapFormat("```", "```")}>
            <Code className="w-3.5 h-3.5" />
          </ToolBtn>
        </div>

        {/* Variable chips */}
        {variableNames.length > 0 && (
          <div className="flex items-center gap-1 pr-2 mr-1 border-r border-gray-200">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Var:</span>
            {variableNames.map((v) => (
              <button
                key={v}
                type="button"
                title={`Insert {${v}}`}
                onClick={() => insertAt(`{${v}}`)}
                className="text-[11px] font-mono bg-amber-100 hover:bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded transition-colors"
              >
                {`{${v}}`}
              </button>
            ))}
          </div>
        )}

        {/* Emoji toggle */}
        <div className="relative ml-auto">
          <ToolBtn title="Emoji" onClick={() => setShowEmoji(!showEmoji)}>
            <Smile className="w-3.5 h-3.5" />
          </ToolBtn>
          {showEmoji && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-2 w-72">
              <div className="grid grid-cols-10 gap-0.5">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => { insertAt(em); setShowEmoji(false); }}
                    className="text-lg hover:bg-gray-100 rounded p-0.5 leading-none transition-colors"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Textarea ── */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder ?? "Tulis pesan template…\nContoh: Halo {nama}! Pesanan {kode_pesanan} sudah siap. 🎉"}
        className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-400 font-mono resize-y focus:outline-none bg-white"
        onClick={() => setShowEmoji(false)}
      />

      {/* ── Format hint ── */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-3">
        <span className="text-[11px] text-gray-400">Format WA:</span>
        {[["*bold*","font-bold"],["_italic_","italic"],["~coret~","line-through"],["```mono```","font-mono text-xs"]].map(([ex, cls]) => (
          <span key={ex} className={`text-[11px] text-gray-500 ${cls}`}>{ex}</span>
        ))}
        <span className="text-[11px] text-gray-400 ml-auto">Variabel: <code className="text-amber-600">{"{nama_variable}"}</code></span>
      </div>

      {/* ── Preview ── */}
      <div className="border-t border-gray-200">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span>Preview</span>
          {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showPreview && (
          <div className="px-4 pb-4">
            {value.trim() ? (
              <div className="bg-[#dcf8c6] rounded-xl rounded-tl-none px-4 py-3 max-w-sm text-sm text-gray-800 shadow-sm">
                <div
                  dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
                  className="leading-relaxed"
                />
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic">Tulis pesan untuk melihat preview…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-1.5 rounded text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
    >
      {children}
    </button>
  );
}
