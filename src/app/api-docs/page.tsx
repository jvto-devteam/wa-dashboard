"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Copy, Check, BookOpen, Key, Phone, ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";

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

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
      <pre className="text-green-700 text-xs font-mono overflow-x-auto pr-6 whitespace-pre-wrap break-all">{code}</pre>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Badge({ code, label }: { code: string; label?: string }) {
  const isSuccess = code === "200";
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${isSuccess ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
        {code}
      </span>
      {label && <span className="text-gray-400 text-xs">{label}</span>}
    </span>
  );
}

function Endpoint({
  method,
  path,
  description,
  body,
  response,
  phpExample,
  note,
}: {
  method: string;
  path: string;
  description: string;
  body?: string;
  response?: string;
  phpExample?: string;
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"body" | "php" | "curl">("body");

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${
            method === "GET"
              ? "bg-blue-50 text-blue-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {method}
        </span>
        <code className="text-gray-700 text-sm font-mono">{path}</code>
        <span className="text-gray-400 text-xs ml-2 flex-1">{description}</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
          {note && (
            <p className="text-yellow-700 text-xs bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              {note}
            </p>
          )}
          {(body || phpExample) && (
            <div>
              <div className="flex gap-2 mb-2">
                {body && (
                  <button
                    onClick={() => setTab("body")}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${tab === "body" ? "border-green-400 text-green-700 bg-green-50" : "border-gray-200 text-gray-400 hover:text-gray-600"}`}
                  >
                    JSON Body
                  </button>
                )}
                {phpExample && (
                  <button
                    onClick={() => setTab("php")}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${tab === "php" ? "border-green-400 text-green-700 bg-green-50" : "border-gray-200 text-gray-400 hover:text-gray-600"}`}
                  >
                    PHP
                  </button>
                )}
                {body && (
                  <button
                    onClick={() => setTab("curl")}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${tab === "curl" ? "border-green-400 text-green-700 bg-green-50" : "border-gray-200 text-gray-400 hover:text-gray-600"}`}
                  >
                    cURL
                  </button>
                )}
              </div>
              {tab === "body" && body && <CodeBlock code={body} />}
              {tab === "php" && phpExample && <CodeBlock code={phpExample} />}
              {tab === "curl" && body && (
                <p className="text-gray-400 text-xs italic">See cURL Examples section below.</p>
              )}
            </div>
          )}
          {response && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Response</p>
              <CodeBlock code={response} />
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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#25d366]" />
          API Documentation
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          REST API kompatibel dengan WatZap WABA Unofficial — format request &amp; response sama persis
        </p>
      </div>

      {/* Migration note */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8">
        <p className="text-gray-900 font-medium text-sm mb-1">Migrasi dari WatZap?</p>
        <p className="text-gray-500 text-xs leading-relaxed">
          Ganti hanya <strong className="text-gray-700">3 hal</strong> di config aplikasimu:
        </p>
        <ul className="mt-2 space-y-1">
          <li className="text-gray-500 text-xs flex gap-2">
            <span className="text-[#25d366]">1.</span>
            <span><code className="text-gray-700">url</code> → <code className="text-green-700">{baseUrl}/api/v1/...</code></span>
          </li>
          <li className="text-gray-500 text-xs flex gap-2">
            <span className="text-[#25d366]">2.</span>
            <span><code className="text-gray-700">api_key</code> → isi bebas (atau samakan dengan number_key)</span>
          </li>
          <li className="text-gray-500 text-xs flex gap-2">
            <span className="text-[#25d366]">3.</span>
            <span><code className="text-gray-700">number_key</code> → API Key dari halaman Numbers di dashboard ini</span>
          </li>
        </ul>
        <Link
          href="/numbers"
          className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#25d366] hover:underline"
        >
          <Phone className="w-3.5 h-3.5" />
          Lihat API Key Nomor Saya
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Base URL */}
      <Section title="Base URL">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <code className="text-gray-900 font-mono text-sm flex-1">{baseUrl}/api/v1</code>
            <CopyButton text={`${baseUrl}/api/v1`} />
          </div>
        </div>
      </Section>

      {/* Authentication */}
      <Section title="Autentikasi">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
          <p className="text-gray-600 text-sm">
            Semua request menggunakan <code className="text-green-700">api_key</code> dan{" "}
            <code className="text-green-700">number_key</code> di <strong className="text-gray-800">request body</strong> (bukan header).
          </p>
          <CodeBlock code={`{
  "api_key":    "isi bebas atau samakan dengan number_key",
  "number_key": "XXXXXX-YYYYYY-ZZZZZZ"  ← ambil dari tab API di halaman Numbers
}`} />
          <div className="flex items-start gap-2 pt-1">
            <Key className="w-3.5 h-3.5 text-[#25d366] flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs">
              <code className="text-gray-600">number_key</code> menentukan nomor WA mana yang digunakan untuk mengirim.
              Setiap nomor WA memiliki key yang berbeda.
            </p>
          </div>
        </div>
      </Section>

      {/* Error Codes */}
      <Section title="Kode Error">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="space-y-2">
            {[
              { code: "200", label: "Success", desc: "Pesan berhasil dikirim" },
              { code: "1002", label: "Invalid API Key", desc: "api_key tidak ditemukan" },
              { code: "1003", label: "Invalid Number Key", desc: "number_key tidak valid" },
              { code: "1004", label: "Not Connected", desc: "WhatsApp belum terkoneksi" },
              { code: "1005", label: "Fatal Error", desc: "Gagal kirim, periksa detail pesan error" },
              { code: "1006", label: "Other Error", desc: "Field tidak lengkap atau error lainnya" },
            ].map((e) => (
              <div key={e.code} className="flex items-center gap-3">
                <Badge code={e.code} />
                <span className="text-gray-600 text-xs w-32 flex-shrink-0">{e.label}</span>
                <span className="text-gray-400 text-xs">{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Endpoints */}
      <Section title="Endpoint API v1">
        <div className="space-y-2">

          {/* checking_key */}
          <Endpoint
            method="POST"
            path="/api/v1/checking_key"
            description="Cek validitas API key"
            body={`{
  "api_key": "XXXXXX-YYYYYY-ZZZZZZ"
}`}
            phpExample={`$data = ["api_key" => config('wa.wa_api_key')];
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL            => '${baseUrl}/api/v1/checking_key',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => 'POST',
  CURLOPT_POSTFIELDS     => json_encode($data),
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);
$response = json_decode(curl_exec($curl));
curl_close($curl);`}
            response={`{
  "status": true,
  "message": "Successfully",
  "data": {
    "id": "user-id",
    "name": "Nama User",
    "email": "email@domain.com",
    "licenses_key": [
      {
        "id": "number-id",
        "key": "XXXXXX-YYYYYY-ZZZZZZ",
        "wa_number": "628123456789",
        "is_connected": true
      }
    ]
  }
}`}
          />

          {/* send_message */}
          <Endpoint
            method="POST"
            path="/api/v1/send_message"
            description="Kirim pesan teks"
            body={`{
  "api_key":    "XXXXXX-YYYYYY-ZZZZZZ",
  "number_key": "XXXXXX-YYYYYY-ZZZZZZ",
  "phone_no":   "628123456789",
  "message":    "Halo dari WA Dashboard!"
}`}
            phpExample={`$data = [
  "api_key"    => config('wa.wa_api_key'),
  "number_key" => config('wa.wa_number_key'),
  "phone_no"   => "628123456789",
  "message"    => "Halo dari WA Dashboard!",
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
curl_close($curl);`}
            response={`{
  "status": "200",
  "message": "Message sent successfully",
  "ack": "successfully",
  "phone_number": "628123456789",
  "message_sent": "Halo dari WA Dashboard!"
}`}
          />

          {/* send_image_url */}
          <Endpoint
            method="POST"
            path="/api/v1/send_image_url"
            description="Kirim gambar dengan URL"
            body={`{
  "api_key":          "XXXXXX-YYYYYY-ZZZZZZ",
  "number_key":       "XXXXXX-YYYYYY-ZZZZZZ",
  "phone_no":         "628123456789",
  "url":              "https://example.com/foto.jpg",
  "message":          "Caption gambar (opsional)",
  "separate_caption": "0"
}

// separate_caption:
//   "0" = caption langsung di gambar (default)
//   "1" = kirim gambar dulu, lalu teks terpisah`}
            phpExample={`$data = [
  "api_key"          => config('wa.wa_api_key'),
  "number_key"       => config('wa.wa_number_key'),
  "phone_no"         => "628123456789",
  "url"              => "https://example.com/foto.jpg",
  "message"          => "Caption gambar",
  "separate_caption" => "0",
];
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL            => '${baseUrl}/api/v1/send_image_url',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => 'POST',
  CURLOPT_POSTFIELDS     => json_encode($data),
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);
$response = json_decode(curl_exec($curl));
curl_close($curl);`}
            response={`{
  "status": "200",
  "message": "Successfully",
  "ack": "successfully"
}`}
          />

          {/* send_file_url */}
          <Endpoint
            method="POST"
            path="/api/v1/send_file_url"
            description="Kirim file / dokumen / video"
            note="Tipe file dideteksi otomatis dari ekstensi URL. Video (mp4/mkv/avi/mov/webm) → video, selainnya → document."
            body={`{
  "api_key":    "XXXXXX-YYYYYY-ZZZZZZ",
  "number_key": "XXXXXX-YYYYYY-ZZZZZZ",
  "phone_no":   "628123456789",
  "url":        "https://example.com/laporan.pdf",
  "filename":   "Laporan.pdf"
}

// filename opsional — jika tidak diisi, diambil dari URL`}
            phpExample={`$data = [
  "api_key"    => config('wa.wa_api_key'),
  "number_key" => config('wa.wa_number_key'),
  "phone_no"   => "628123456789",
  "url"        => "https://example.com/laporan.pdf",
  "filename"   => "Laporan.pdf",
];
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL            => '${baseUrl}/api/v1/send_file_url',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => 'POST',
  CURLOPT_POSTFIELDS     => json_encode($data),
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);
$response = json_decode(curl_exec($curl));
curl_close($curl);`}
            response={`{
  "status": "200",
  "message": "Successfully",
  "ack": "successfully"
}`}
          />

          {/* groups */}
          <Endpoint
            method="POST"
            path="/api/v1/groups"
            description="Daftar grup WhatsApp"
            note="Menggunakan auth body sama seperti endpoint lain."
            body={`{
  "api_key":    "XXXXXX-YYYYYY-ZZZZZZ",
  "number_key": "XXXXXX-YYYYYY-ZZZZZZ"
}`}
            response={`[
  {
    "id": "120363xxxxxx@g.us",
    "name": "Nama Grup",
    "participantCount": 42,
    "description": "Deskripsi grup"
  }
]`}
          />

          {/* send_template */}
          <Endpoint
            method="POST"
            path="/api/v1/send_template"
            description="Kirim pesan menggunakan template dengan variabel dinamis"
            body={`{
  "api_key":     "XXXXXX-YYYYYY-ZZZZZZ",
  "number_key":  "XXXXXX-YYYYYY-ZZZZZZ",
  "phone_no":    "628123456789",
  "template_id": "template-id-here",
  "variables": {
    "user_name": "John Doe",
    "order_id":  "ORD-12345",
    "company":   "Perusahaan ABC"
  }
}`}
            phpExample={`$data = [
  "api_key"     => config('wa.wa_api_key'),
  "number_key"  => config('wa.wa_number_key'),
  "phone_no"    => "628123456789",
  "template_id" => "template-id-here",
  "variables"   => [
    "user_name" => "John Doe",
    "order_id"  => "ORD-12345",
    "company"   => "Perusahaan ABC"
  ]
];
$curl = curl_init();
curl_setopt_array($curl, [
  CURLOPT_URL            => '${baseUrl}/api/v1/send_template',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST  => 'POST',
  CURLOPT_POSTFIELDS     => json_encode($data),
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);
$response = json_decode(curl_exec($curl));
curl_close($curl);`}
            response={`{
  "success": true,
  "message_id": "3EB0C6D6F4A8B12D",
  "template_used": {
    "id": "template-id-here",
    "name": "Welcome Message"
  }
}`}
          />

        </div>
      </Section>

      {/* Legacy endpoints */}
      <Section title="Legacy Endpoint (lama)">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
          <p className="text-gray-500 text-xs">
            Endpoint lama masih berjalan. Auth menggunakan header <code className="text-yellow-600">Authorization: Bearer &lt;api_key&gt;</code>.
            Direkomendasikan migrasi ke endpoint baru di atas.
          </p>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex gap-3">
              <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">POST</span>
              <code className="text-gray-500">/api/v1/send/text</code>
              <span className="text-gray-400">body: {`{ to, text }`}</span>
            </div>
            <div className="flex gap-3">
              <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">POST</span>
              <code className="text-gray-500">/api/v1/send/media</code>
              <span className="text-gray-400">body: {`{ to, url, type, caption }`}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Webhook */}
      <Section title="Webhook (Pesan Masuk)">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3 shadow-sm">
          <p className="text-gray-600 text-sm">
            Set URL webhook per nomor di tab <strong className="text-gray-800">Webhook</strong> untuk menerima pesan masuk.
          </p>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Payload yang dikirim ke webhook kamu:</p>
          <CodeBlock
            code={`POST https://your-server.com/webhook
Content-Type: application/json

// Pesan teks
{
  "event": "message",
  "data": {
    "from": "628123456789@s.whatsapp.net",
    "fromMe": false,
    "id": "msg-id",
    "timestamp": 1234567890,
    "type": "conversation",
    "text": "Halo!"
  }
}

// Gambar / Video / Sticker
{
  "event": "message",
  "data": {
    "type": "imageMessage",
    "text": "caption atau null",
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

// Dokumen / File
{
  "event": "message",
  "data": {
    "type": "documentMessage",
    "media": { "url": "...", "mimetype": "application/pdf", "filename": "laporan.pdf", "fileSize": 204800 }
  }
}

// Lokasi
{
  "event": "message",
  "data": {
    "type": "locationMessage",
    "location": { "latitude": -8.6705, "longitude": 115.2126, "name": "Bali", "address": "..." }
  }
}

// Kontak
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

      {/* cURL Examples */}
      <Section title="cURL Examples">
        <div className="space-y-4">
          <div>
            <p className="text-gray-500 text-xs mb-2">Kirim pesan teks:</p>
            <CodeBlock
              code={`curl -X POST ${baseUrl}/api/v1/send_message \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key":    "XXXXXX-YYYYYY-ZZZZZZ",
    "number_key": "XXXXXX-YYYYYY-ZZZZZZ",
    "phone_no":   "628123456789",
    "message":    "Halo!"
  }'`}
            />
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-2">Kirim gambar:</p>
            <CodeBlock
              code={`curl -X POST ${baseUrl}/api/v1/send_image_url \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key":    "XXXXXX-YYYYYY-ZZZZZZ",
    "number_key": "XXXXXX-YYYYYY-ZZZZZZ",
    "phone_no":   "628123456789",
    "url":        "https://example.com/foto.jpg",
    "message":    "Caption gambar"
  }'`}
            />
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-2">Cek API key:</p>
            <CodeBlock
              code={`curl -X POST ${baseUrl}/api/v1/checking_key \\
  -H "Content-Type: application/json" \\
  -d '{"api_key": "XXXXXX-YYYYYY-ZZZZZZ"}'`}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
