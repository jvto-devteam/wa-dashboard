# WA Dashboard

Multi-user WhatsApp dashboard built with Next.js 16, Prisma 7, and Baileys.

## Login

| Role  | Email           | Password  |
|-------|-----------------|-----------|
| Admin | admin@admin.com | Admin1234 |

> Ganti password setelah pertama kali login.

## Menjalankan Server

```bash
npm run dev
```

Buka `http://localhost:3000`

> **Catatan:** Koneksi pertama ke database remote membutuhkan waktu ~30 detik. Halaman akan loading sebentar setelah server pertama kali dinyalakan.

---

## Fitur

### Admin
- Buat / hapus akun user
- Monitor semua WA numbers dari semua user
- Lihat statistik pesan (masuk/keluar)

### User
- Tambah hingga **3 WA numbers** per akun
- Setiap nomor punya **API key unik**
- Setiap nomor punya **webhook URL** sendiri
- Tab per nomor: Connection, Send, Groups, Webhook, API

---

## API v1

Base URL: `http://localhost:3000`

Auth: `Authorization: Bearer <api_key_nomor>`

| Method | Endpoint           | Deskripsi                  |
|--------|--------------------|----------------------------|
| GET    | /api/v1/groups     | Daftar grup WA             |
| POST   | /api/v1/send/text  | Kirim pesan teks           |
| POST   | /api/v1/send/media | Kirim gambar/video/dokumen |

**Kirim teks:**
```bash
curl -X POST http://localhost:3000/api/v1/send/text \
  -H "Authorization: Bearer API_KEY_MU" \
  -H "Content-Type: application/json" \
  -d '{"to": "628123456789", "text": "Halo!"}'
```

**Kirim ke grup:**
```bash
curl -X POST http://localhost:3000/api/v1/send/text \
  -H "Authorization: Bearer API_KEY_MU" \
  -H "Content-Type: application/json" \
  -d '{"to": "120363xxxxxx@g.us", "text": "Halo grup!"}'
```

**Kirim media:**
```bash
curl -X POST http://localhost:3000/api/v1/send/media \
  -H "Authorization: Bearer API_KEY_MU" \
  -H "Content-Type: application/json" \
  -d '{"to": "628123456789", "url": "https://...", "type": "image", "caption": "Caption"}'
```

---

## Webhook

Setiap nomor bisa dikonfigurasi dengan webhook URL. Semua tipe pesan WA didukung.

### Field umum (selalu ada)
```json
{
  "event": "message",
  "data": {
    "from": "628xxx@s.whatsapp.net",
    "fromMe": false,
    "id": "MSG_ID",
    "timestamp": 1234567890,
    "type": "conversation"
  }
}
```

### Teks biasa (`conversation`, `extendedTextMessage`)
```json
{ "type": "conversation", "text": "Halo!" }
```

### Gambar (`imageMessage`) / Video (`videoMessage`) / Stiker (`stickerMessage`)
```json
{
  "type": "imageMessage",
  "text": "caption jika ada",
  "media": {
    "url": "https://mmg.whatsapp.net/...",
    "mimetype": "image/jpeg",
    "fileSize": 123456
  }
}
```
> Video juga memiliki field `seconds`. Stiker memiliki field `isAnimated`.

### Audio / Voice note (`audioMessage`)
```json
{
  "type": "audioMessage",
  "media": {
    "url": "https://mmg.whatsapp.net/...",
    "mimetype": "audio/ogg; codecs=opus",
    "seconds": 12,
    "ptt": true
  }
}
```
> `ptt: true` artinya voice note (Push To Talk).

### Dokumen / File (`documentMessage`)
```json
{
  "type": "documentMessage",
  "text": "caption jika ada",
  "media": {
    "url": "https://mmg.whatsapp.net/...",
    "mimetype": "application/pdf",
    "filename": "dokumen.pdf",
    "fileSize": 204800,
    "title": "Judul dokumen"
  }
}
```

### Lokasi / Maps (`locationMessage`, `liveLocationMessage`)
```json
{
  "type": "locationMessage",
  "location": {
    "latitude": -6.2088,
    "longitude": 106.8456,
    "name": "Nama tempat",
    "address": "Alamat lengkap",
    "isLive": false
  }
}
```

### Kontak (`contactMessage`, `contactsArrayMessage`)
```json
{
  "type": "contactMessage",
  "contact": {
    "displayName": "John Doe",
    "vcard": "BEGIN:VCARD\nVERSION:3.0\n..."
  }
}
```

---

## Stack

- **Framework:** Next.js 16.2.2 (App Router)
- **Database:** PostgreSQL via Prisma 7.6.0 + `@prisma/adapter-pg`
- **WhatsApp:** `@whiskeysockets/baileys`
- **Auth:** JWT (`jose`) + HTTP-only cookie
- **Password:** bcryptjs (cost factor 12)
