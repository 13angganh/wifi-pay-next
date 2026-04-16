# WiFi Pay Next — v11.1

> Aplikasi manajemen tagihan WiFi berbasis web (PWA) yang dibangun dengan Next.js, TypeScript, dan Firebase Realtime Database. Dirancang khusus untuk pengelolaan dua zona pelanggan WiFi (KRS dan SLK) dengan UI premium, dark mode, dan fitur ekspor lengkap.

---

## Fitur Utama

**Manajemen Pembayaran**
- Catat pembayaran WiFi per member per bulan untuk dua zona (KRS & SLK)
- Quick Pay — bayar sekaligus langsung dari kartu member
- Batch action — tandai/batalkan pembayaran banyak member sekaligus
- Riwayat pembayaran per member per tahun

**Manajemen Member**
- Tambah, edit, hapus member per zona
- Data member: nama, ID pelanggan, IP/link router, tarif khusus
- Recycle bin — member terhapus bisa dikembalikan
- Status free member (gratis bulan tertentu)

**Rekap & Analitik**
- Tabel rekap bulanan per zona — lunas/belum/gratis
- Tunggakan dengan filter aging: Total, Baru, Segera, Kritis
- Grafik tren pendapatan bulanan (Chart.js)
- Laporan operasional — pendapatan kotor vs pengeluaran vs pendapatan bersih

**Ekspor Data**
- Export PDF rekap bulanan per zona
- Export Excel rekap per zona
- Backup JSON lengkap (auto-backup setiap 7 hari)
- Share ringkasan via WhatsApp

**Keamanan**
- Login Firebase Authentication (email/password)
- PIN lock — auto-lock setelah idle
- Global lock — kunci entry dari header
- Credentials tersimpan aman di localStorage

**UX & Aksesibilitas**
- Dark mode / Light mode
- Onboarding hints untuk pengguna baru
- Offline detection banner
- Error boundary — tampilan fallback jika ada error tak terduga
- Fuzzy search global di semua member dan zona
- Bahasa Indonesia & English (i18n)
- Touch target minimum 44×44px di semua tombol
- Aria-label dan aria-current untuk navigasi

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16.2.2 (App Router) |
| Bahasa | TypeScript 5 |
| State Management | Zustand 5 (5 slice) |
| Backend / DB | Firebase Realtime Database |
| Auth | Firebase Authentication |
| UI Icons | Lucide React |
| Font | Syne (heading), DM Sans (body), DM Mono (data) |
| Charts | Chart.js 4.4.1 (CDN) |
| PDF | jsPDF + jsPDF-AutoTable (CDN) |
| Excel | SheetJS XLSX (CDN) |
| Deploy | Vercel |
| PWA | next-pwa + Service Worker |

---

## Struktur Project

```
wifi-pay-next/
├── app/
│   ├── (app)/               # Route group — semua halaman terproteksi
│   │   ├── dashboard/
│   │   ├── entry/
│   │   ├── rekap/
│   │   ├── tunggakan/
│   │   ├── grafik/
│   │   ├── log/
│   │   ├── members/
│   │   ├── operasional/
│   │   └── settings/
│   ├── login/
│   ├── globals.css           # Sistem desain lengkap (CSS variables, tokens)
│   └── layout.tsx            # Font loader + favicon
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # Shell utama: error boundary, offline, onboarding
│   │   ├── Header.tsx        # Zona switch, sync pill, lock, search, theme
│   │   ├── Sidebar.tsx       # Navigasi utama + user section
│   │   ├── LockBanner.tsx    # Banner PIN lock
│   │   └── LoadingScreen.tsx
│   ├── views/                # Komponen halaman utama
│   │   ├── DashboardView.tsx
│   │   ├── EntryView.tsx
│   │   ├── MemberCard.tsx
│   │   ├── RekapView.tsx
│   │   ├── TunggakanView.tsx
│   │   ├── GrafikView.tsx
│   │   ├── LogView.tsx
│   │   ├── MembersView.tsx
│   │   ├── OperasionalView.tsx
│   │   └── SettingsView.tsx
│   ├── modals/               # Modal dialog
│   │   ├── GlobalSearch.tsx
│   │   ├── RiwayatModal.tsx
│   │   ├── FreeMemberModal.tsx
│   │   ├── ExportModal.tsx
│   │   ├── ShareModal.tsx
│   │   └── AccountModal.tsx
│   └── ui/
│       ├── Toast.tsx
│       ├── Confirm.tsx
│       ├── PinLock.tsx
│       └── OnboardingHint.tsx
├── store/
│   └── slices/
│       ├── authSlice.ts      # uid, email, nama, status login
│       ├── dataSlice.ts      # appData, setAppData
│       ├── viewSlice.ts      # navigasi, batch state
│       ├── uiSlice.ts        # sidebar, darkMode, syncStatus, lock
│       ├── settingsSlice.ts  # settings, PIN, bahasa, zona
│       └── exportSlice.ts
├── lib/
│   ├── firebase.ts           # Inisialisasi Firebase (env vars)
│   ├── db.ts                 # Read/write Firebase RTDB
│   ├── helpers.ts            # rp(), formatDate(), fuzzyMatch(), isLunas(), dll
│   ├── export.ts             # PDF, Excel, JSON backup, WA summary
│   ├── backup.ts             # Auto-backup logic
│   ├── i18n.ts               # t(key), createTranslator()
│   ├── constants.ts          # MONTHS, YEARS, PAGE_TITLES
│   └── locales/
│       ├── id.ts             # ~70 key Bahasa Indonesia
│       └── en.ts             # ~70 key English
├── hooks/
│   ├── useAuth.ts
│   ├── useAppData.ts
│   └── useIdleTimeout.ts
├── types/
│   └── index.ts              # AppData, Member, Zone, ViewName, AppSettings, dll
└── public/
    ├── favicon.svg           # WiFi symbol SVG — gradient KRS biru
    ├── manifest.json
    └── sw.js                 # Service Worker
```

---

## Sistem Desain

### Warna (CSS Variables)

```css
/* Background */
--bg   : #0F1117   /* utama */
--bg2  : #181C27   /* card */
--bg3  : #1E2235   /* elemen dalam card */
--bg4  : #252B40   /* hover/active */

/* Zona */
--zc-krs : #3B82F6   /* KRS — biru */
--zc-slk : #F97316   /* SLK — oranye */

/* Status */
--c-lunas : #22C55E   /* hijau */
--c-belum : #EF4444   /* merah */
--c-free  : #3B82F6

/* Font */
--txt  : #FFFFFF
--txt2 : #A1A8C1
--txt3 : #6B7494
--txt4 : #4A5270
--txt5 : #2D3452
```

### Tipografi
- **Syne 800** — judul, angka besar (display)
- **DM Mono** — nama member, nominal, nilai data
- **DM Sans** — keterangan, label, body text

---

## Cara Install & Jalankan

### Prasyarat
- Node.js 18+
- Akun Firebase (Realtime Database + Authentication aktif)

### 1. Clone & Install

```bash
git clone https://github.com/13angganh/wifi-pay-next.git
cd wifi-pay-next
npm install
```

### 2. Konfigurasi Environment

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://xxx-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### 3. Jalankan Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### 4. Build & Deploy

```bash
npm run build
```

Deploy otomatis via Vercel — push ke branch `main` sudah cukup jika repo sudah terhubung ke Vercel.

---

## Firebase Realtime Database — Struktur Data

```json
{
  "users": {
    "[uid]": {
      "krsMembers": ["NAMA_A", "NAMA_B"],
      "slkMembers": ["NAMA_C"],
      "payments": {
        "KRS__NAMA_A__2026__3": 150000
      },
      "memberInfo": {
        "KRS__NAMA_A": { "id": "001", "ip": "192.168.1.1", "tarif": 150000 }
      },
      "operasional": {
        "2026_3": {
          "items": [{ "label": "Listrik", "nominal": 50000 }]
        }
      },
      "deletedMembers": {},
      "log": []
    }
  }
}
```

---

## Changelog

### v11.1 Next — UI/UX Overhaul Mayor (Apr 2026)

**Sistem Desain Baru**
- Navy dark mode sebagai default — warna bg baru (#0F1117, #181C27, #1E2235)
- Font triple: Syne + DM Sans + DM Mono
- Warna zona baru: KRS #3B82F6, SLK #F97316
- Animasi spring (cubic-bezier), stagger, page transition
- Semua emoji UI diganti Lucide React icons
- CSS variables penuh — zero hardcoded color di komponen

**Komponen Baru / Diperbarui**
- Header: sync pill (cloud/spinner/warning/offline), zona switch berwarna
- Sidebar: user section, avatar inisial, Ganti Akun vs Keluar
- Login: greeting hero Syne 800
- PinLock: redesign premium
- LoadingScreen: redesign navy
- Toast: posisi top center, slide down
- MemberCard: left border status, ripple effect, batch support
- OnboardingHint: panduan 3 langkah untuk pengguna baru (baru di 5E)

**Fitur UX Baru**
- Batch action Entry: long press 500ms → multi-select → bayar/batal sekaligus
- Batch action Rekap: long press kolom bulan → kolom terkunci → batch per kolom
- Quick Pay dengan konfirmasi jika nominal > tarif
- Fuzzy search global (GlobalSearch) — cari member semua zona sekaligus
- Tunggakan: filter aging Total / Baru / Segera / Kritis
- Riwayat modal: navigasi per tahun, left border status
- FreeMember modal: glassmorphism + drag handle
- Modal glassmorphism: backdrop-filter blur(16px)

**Infrastruktur**
- Zustand 5 slice: authSlice, dataSlice, viewSlice, uiSlice, settingsSlice, exportSlice
- i18n: Bahasa Indonesia + English (~70 key masing-masing)
- Helper: rp(), formatDate(), fuzzyMatch(), getArrears(), isFree(), dll
- Export pindah sepenuhnya ke SettingsView (RekapView bersih)
- Zona Management di Settings: hiddenZones, zoneNames
- Error Boundary di AppShell (baru di 5E)
- Offline detection banner (baru di 5E)
- Tablet responsive: 2 kolom di 640px, sidebar fixed di 1024px (baru di 5E)
- Accessibility: aria-label, aria-current, aria-live, role di semua nav

---

## Catatan Pengembang

- File `lib/firebase.ts` dan `lib/db.ts` — jangan disentuh tanpa backup
- Semua warna pakai CSS variable, bukan hardcoded hex
- Semua nominal uang melalui `rp()` dari `lib/helpers.ts`
- Semua format tanggal melalui `formatDate()` dari `lib/helpers.ts`
- Chart.js tidak bisa baca CSS var — warna chart dikecualikan dari aturan di atas
- Emoji di string log/action Firebase (`💰 Bayar`, `🗑️ Hapus`, dll) dibiarkan — bukan UI komponen

---

## Lisensi

Private project — tidak untuk didistribusikan.

---

*Dikembangkan oleh Angga ([@13angganh](https://github.com/13angganh)) · Desa Karang Sengon, Bondowoso*
