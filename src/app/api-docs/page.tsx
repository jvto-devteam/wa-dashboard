"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Copy, Check, BookOpen, Key, Phone, ArrowUpRight } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-white/30 hover:text-white transition-colors">
      {copied ? <Check className="w-4 h-4 text-[#25d366]" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="relative bg-black/40 rounded-xl p-4 border border-white/5">
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
      <pre className="text-[#25d366] text-xs font-mono overflow-x-auto pr-6">{code}</pre>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Endpoint({
  method,
  path,
  description,
  auth,
  body,
  response,
}: {
  method: string;
  path: string;
  description: string;
  auth?: string;
  body?: string;
  response?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#0a1628] border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${
            method === "GET"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-green-500/20 text-green-400"
          }`}
        >
          {method}
        </span>
        <code className="text-white/70 text-sm font-mono">{path}</code>
        <span className="text-white/30 text-xs ml-2">{description}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
          {auth && (
            <div>
              <p className="text-white/40 text-xs mb-1">Authentication</p>
              <code className="text-yellow-400 text-xs">{auth}</code>
            </div>
          )}
          {body && (
            <div>
              <p className="text-white/40 text-xs mb-1">Request Body</p>
              <CodeBlock code={body} lang="json" />
            </div>
          )}
          {response && (
            <div>
              <p className="text-white/40 text-xs mb-1">Response</p>
              <CodeBlock code={response} lang="json" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  const [baseUrl, setBaseUrl] = useState("https://your-domain.com");
  useEffect(() => { setBaseUrl(window.location.origin); }, []);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#25d366]" />
          API Documentation
        </h1>
        <p className="text-white/40 text-sm mt-1">
          REST API for sending WhatsApp messages via your connected numbers
        </p>
      </div>

      {/* API Key note */}
      <div className="bg-[#25d366]/5 border border-[#25d366]/20 rounded-2xl p-5 mb-8 flex items-start gap-3">
        <Key className="w-5 h-5 text-[#25d366] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-medium text-sm">Per-Number API Keys</p>
          <p className="text-white/50 text-xs mt-1">
            Each WA number has its own API key. Go to{" "}
            <Link href="/numbers" className="text-[#25d366] hover:underline">
              My Numbers
            </Link>
            {" "}→ Manage → API tab to find your keys.
          </p>
          <Link
            href="/numbers"
            className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#25d366] hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            View My Numbers
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Base URL */}
      <Section title="Base URL">
        <div className="bg-[#0a1628] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <code className="text-white font-mono text-sm flex-1">{baseUrl}</code>
            <CopyButton text={baseUrl} />
          </div>
        </div>
      </Section>

      {/* Authentication */}
      <Section title="Authentication">
        <div className="bg-[#0a1628] border border-white/5 rounded-2xl p-5 space-y-3">
          <p className="text-white/60 text-sm">
            All v1 API calls require a <code className="text-[#25d366]">Bearer</code> token using the number&apos;s API key:
          </p>
          <CodeBlock code={`Authorization: Bearer YOUR_NUMBER_API_KEY`} />
          <p className="text-white/30 text-xs">
            Each WA number has a unique API key. This key identifies which phone number will be used to send the message.
          </p>
        </div>
      </Section>

      {/* Send endpoints */}
      <Section title="Public API v1">
        <div className="space-y-2">
          <Endpoint
            method="GET"
            path="/api/v1/groups"
            description="Get all groups the number is in"
            auth="Authorization: Bearer <your_number_api_key>"
            response={`[
  {
    "id": "120363xxxxxx@g.us",
    "name": "Group Name",
    "participantCount": 42,
    "description": "Group description"
  }
]`}
          />
          <Endpoint
            method="POST"
            path="/api/v1/send/text"
            description="Send a text message (to person or group)"
            auth="Authorization: Bearer <your_number_api_key>"
            body={`{
  "to": "628123456789",
  "text": "Hello from WA Dashboard!"
}

// Send to group — use group JID:
{
  "to": "120363xxxxxx@g.us",
  "text": "Hello group!"
}`}
            response={`{
  "success": true,
  "to": "628123456789@s.whatsapp.net",
  "numberId": "clx...",
  "label": "Customer Support"
}`}
          />
          <Endpoint
            method="POST"
            path="/api/v1/send/media"
            description="Send image, video, or document"
            auth="Authorization: Bearer <your_number_api_key>"
            body={`{
  "to": "628123456789",
  "url": "https://example.com/image.jpg",
  "type": "image",
  "caption": "Check this out!"
}

// type: "image" | "video" | "document"
// For document: add "filename": "report.pdf"`}
            response={`{
  "success": true,
  "to": "628123456789@s.whatsapp.net"
}`}
          />
        </div>
      </Section>

      {/* cURL examples */}
      <Section title="cURL Examples">
        <div className="space-y-4">
          <div>
            <p className="text-white/50 text-xs mb-2">Send text message:</p>
            <CodeBlock
              code={`curl -X POST ${baseUrl}/api/v1/send/text \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"to": "628123456789", "text": "Hello!"}'`}
            />
          </div>
          <div>
            <p className="text-white/50 text-xs mb-2">Send image:</p>
            <CodeBlock
              code={`curl -X POST ${baseUrl}/api/v1/send/media \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"to": "628123456789", "url": "https://example.com/photo.jpg", "type": "image", "caption": "Hi"}'`}
            />
          </div>
        </div>
      </Section>

      {/* Webhook */}
      <Section title="Webhook (Incoming Messages)">
        <div className="bg-[#0a1628] border border-white/5 rounded-2xl p-5 space-y-3">
          <p className="text-white/60 text-sm">
            Configure a webhook URL per number to receive incoming messages.
            Go to a number&apos;s <strong className="text-white/80">Webhook</strong> tab to set it up.
          </p>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Payload sent to your webhook:</p>
          <CodeBlock
            code={`POST https://your-server.com/webhook
Content-Type: application/json

// Text message
{
  "event": "message",
  "data": {
    "from": "628123456789@s.whatsapp.net",
    "fromMe": false,
    "id": "msg-id",
    "timestamp": 1234567890,
    "type": "conversation",
    "text": "Hello!"
  }
}

// Image / Video / Sticker
{
  "event": "message",
  "data": {
    "type": "imageMessage",
    "text": "caption here or null",
    "media": {
      "url": "https://mmg.whatsapp.net/...",
      "mimetype": "image/jpeg",
      "fileSize": 123456
    }
  }
}

// Audio / Voice note (ptt: true = voice note)
{
  "event": "message",
  "data": {
    "type": "audioMessage",
    "media": { "url": "...", "mimetype": "audio/ogg; codecs=opus", "seconds": 12, "ptt": true }
  }
}

// Document / File
{
  "event": "message",
  "data": {
    "type": "documentMessage",
    "media": { "url": "...", "mimetype": "application/pdf", "filename": "report.pdf", "fileSize": 204800 }
  }
}

// Location / Maps
{
  "event": "message",
  "data": {
    "type": "locationMessage",
    "location": { "latitude": -6.2088, "longitude": 106.8456, "name": "Jakarta", "address": "..." }
  }
}

// Contact card
{
  "event": "message",
  "data": {
    "type": "contactMessage",
    "contact": { "displayName": "John Doe", "vcard": "BEGIN:VCARD..." }
  }
}`}
          />
        </div>
      </Section>

      {/* Error format */}
      <Section title="Error Responses">
        <div className="bg-[#0a1628] border border-white/5 rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/40 text-xs mb-2">Success (200)</p>
              <CodeBlock code={`{ "success": true, "to": "628...@s.whatsapp.net" }`} />
            </div>
            <div>
              <p className="text-white/40 text-xs mb-2">Error (4xx/5xx)</p>
              <CodeBlock code={`{ "error": "WhatsApp is not connected" }`} />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
