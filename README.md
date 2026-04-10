# WiFi Pay Next

Versi React + Next.js dari WiFi Pay PWA — dioptimasi untuk UI/UX modern.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Firebase RTDB · Zustand  
**Deploy:** Vercel (paralel dengan Firebase hosting lama yang tetap live)  
**Data:** Firebase Realtime Database yang sama — tidak ada duplikasi data

---

## Cara Setup Lokal

### 1. Clone & install
```bash
git clone https://github.com/13angganh/wifi-pay-next
cd wifi-pay-next
npm install
```

### 2. Buat `.env.local`
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wifi-pay-online.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://wifi-pay-online-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=wifi-pay-online
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wifi-pay-online.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Jalankan dev server
```bash
npm run dev
# Buka http://localhost:3000
```

---

## Deploy ke Vercel

### Cara 1 — Via GitHub (Recommended)
1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com) → New Project
3. Import repo `wifi-pay-next`
4. Tambahkan semua env vars dari `.env.local` di Vercel dashboard
5. Deploy — otomatis setiap push ke `main`

### Cara 2 — Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Tambah Icons

Copy folder `icons/` dari project lama ke `public/icons/`:
```
public/
  icons/
    icon-72.png
    icon-96.png
    icon-128.png
    icon-144.png
    icon-152.png
    icon-192.png
    icon-384.png
    icon-512.png
```

---

## Struktur Project

```
app/
  login/              → Halaman login (3 state: remembered, form, register)
  (app)/              → Protected routes (butuh auth)
    layout.tsx        → Auth guard + Firebase listener
    dashboard/        → Dashboard ringkasan
    entry/            → Input pembayaran
    rekap/            → Tabel rekap tahunan
    tunggakan/        → List nunggak / rajin / free
    grafik/           → Chart.js visualisasi
    log/              → Activity log
    members/          → CRUD member
    operasional/      → Pengeluaran & net income

components/
  layout/
    AppShell.tsx      → Wrapper utama
    Header.tsx        → Header + action buttons + modals
    Sidebar.tsx       → Sidebar navigasi
    BottomNav.tsx     → Bottom navigation
    LockBanner.tsx    → Banner entry terkunci
    LoadingScreen.tsx → Loading animasi
  ui/
    Toast.tsx         → Notifikasi toast
    Confirm.tsx       → Dialog konfirmasi
  views/
    DashboardView.tsx
    EntryView.tsx
    MemberCard.tsx    → Kartu entry per member
    RekapView.tsx
    TunggakanView.tsx
    GrafikView.tsx
    LogView.tsx
    OperasionalView.tsx
    MembersView.tsx
  modals/
    ShareModal.tsx    → Share rekap via WhatsApp
    ExportModal.tsx   → Export JSON / Excel
    ImportModal.tsx   → Import JSON backup
    GlobalSearch.tsx  → Cari member semua zona
    RiwayatModal.tsx  → Riwayat 12 bulan member
    AccountModal.tsx  → Info akun + logout
    FreeMemberModal.tsx → Set/hapus free member

lib/
  firebase.ts         → Firebase init (env vars)
  db.ts               → CRUD Firebase Realtime DB
  helpers.ts          → Utility functions
  constants.ts        → MONTHS, YEARS, DEFAULT members
  export.ts           → generatePDF, generateExcel, WA summary
  backup.ts           → Auto backup tanggal 1

store/
  useAppStore.ts      → Compose semua slices
  slices/
    authSlice.ts      → uid, email, name
    dataSlice.ts      → appData, syncStatus
    viewSlice.ts      → zone, view, entry state, lock
    uiSlice.ts        → darkMode, sidebar, PWA
    exportSlice.ts    → share/export state

hooks/
  useAuth.ts          → Firebase auth hooks
  useAppData.ts       → Firebase realtime listener

types/
  index.ts            → TypeScript interfaces
```

---

## Fitur Lengkap

| Fitur | Status |
|---|---|
| Login / Register / Remember credentials | ✅ |
| Firebase Auth + Realtime DB sync | ✅ |
| Dashboard ringkasan KRS + SLK | ✅ |
| Entry pembayaran + quick pay + tanggal | ✅ |
| Rekap tabel tahunan + edit per cell | ✅ |
| Tunggakan — Nunggak / Rajin / Free | ✅ |
| Grafik Chart.js bulanan + tahunan | ✅ |
| Activity log dengan filter | ✅ |
| Operasional + net income | ✅ |
| Member CRUD + sort + recycle bin | ✅ |
| Free member (range bulan) | ✅ |
| Riwayat 12 bulan per member | ✅ |
| Global search semua zona | ✅ |
| Share rekap PDF/Excel via WhatsApp | ✅ |
| Export JSON backup / Excel | ✅ |
| Import JSON + sync Firebase | ✅ |
| Backup otomatis tanggal 1 | ✅ |
| WA Summary ringkasan bulanan | ✅ |
| Global lock + per-member lock | ✅ |
| Dark / Light mode | ✅ |
| Sidebar (desktop) + BottomNav (mobile) | ✅ |
| PWA installable | ✅ |
| Service Worker + Update banner | ✅ |

---

*WiFi Pay Next v1.0 — Dibangun di atas WiFi Pay v10.1*
