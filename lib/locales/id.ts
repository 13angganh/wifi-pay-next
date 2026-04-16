// lib/locales/id.ts — Bahasa Indonesia (default)
const id: Record<string, string> = {
  // Nav
  'nav.dashboard'    : 'Dashboard',
  'nav.entry'        : 'Entry',
  'nav.rekap'        : 'Rekap',
  'nav.tunggakan'    : 'Tunggakan',
  'nav.grafik'       : 'Grafik',
  'nav.log'          : 'Log',
  'nav.members'      : 'Member',
  'nav.operasional'  : 'Operasional',
  'nav.settings'     : 'Pengaturan',

  // Status
  'status.lunas'     : 'Lunas',
  'status.belum'     : 'Belum',
  'status.free'      : 'Gratis',

  // Actions
  'action.save'      : 'Simpan',
  'action.cancel'    : 'Batal',
  'action.delete'    : 'Hapus',
  'action.confirm'   : 'Konfirmasi',
  'action.edit'      : 'Edit',
  'action.add'       : 'Tambah',
  'action.close'     : 'Tutup',
  'action.back'      : 'Kembali',
  'action.search'    : 'Cari',
  'action.export'    : 'Export',
  'action.share'     : 'Bagikan',
  'action.logout'    : 'Keluar',
  'action.changeAccount' : 'Ganti Akun',

  // Common
  'common.loading'   : 'Memuat...',
  'common.saving'    : 'Menyimpan...',
  'common.saved'     : 'Tersimpan',
  'common.error'     : 'Gagal',
  'common.offline'   : 'Offline',
  'common.noData'    : 'Tidak ada data',
  'common.noResult'  : 'Tidak ada hasil',
  'common.total'     : 'Total',
  'common.month'     : 'Bulan',
  'common.year'      : 'Tahun',
  'common.zone'      : 'Zona',
  'common.name'      : 'Nama',
  'common.amount'    : 'Nominal',
  'common.date'      : 'Tanggal',
  'common.all'       : 'Semua',

  // Dashboard
  'dashboard.title'          : 'Dashboard',
  'dashboard.income'         : 'Total Pendapatan',
  'dashboard.members'        : 'Member',
  'dashboard.paid'           : 'Lunas',
  'dashboard.unpaid'         : 'Belum',
  'dashboard.operasional'    : 'Operasional',

  // Entry
  'entry.title'              : 'Entry Pembayaran',
  'entry.markPaid'           : 'Tandai Lunas',
  'entry.batchPay'           : 'Bayar Semua',
  'entry.quickPay'           : 'Quick Pay',
  'entry.confirmHighNominal' : 'Nominal lebih tinggi dari tarif, lanjutkan?',
  'entry.batchSuccess'       : 'member berhasil ditandai lunas',

  // Rekap
  'rekap.title'              : 'Rekap',
  'rekap.batchConfirm'       : 'Tandai Lunas Semua',

  // Tunggakan
  'tunggakan.title'          : 'Tunggakan',
  'tunggakan.filter.total'   : 'Total',
  'tunggakan.filter.new'     : 'Baru',
  'tunggakan.filter.soon'    : 'Segera',
  'tunggakan.filter.critical': 'Kritis',
  'tunggakan.months'         : 'bulan tunggakan',

  // Grafik
  'grafik.title'             : 'Grafik',

  // Log
  'log.title'                : 'Log Aktivitas',
  'log.empty'                : 'Belum ada aktivitas',

  // Members
  'members.title'            : 'Daftar Member',
  'members.add'              : 'Tambah Member',
  'members.empty'            : 'Belum ada member',
  'members.delete'           : 'Hapus Member',
  'members.restore'          : 'Pulihkan',

  // Operasional
  'ops.title'                : 'Operasional',
  'ops.income'               : 'Pendapatan',
  'ops.expense'              : 'Pengeluaran',
  'ops.net'                  : 'Net',

  // Settings
  'settings.title'           : 'Pengaturan',
  'settings.pin'             : 'Keamanan PIN',
  'settings.zones'           : 'Manajemen Zona',
  'settings.language'        : 'Bahasa',
  'settings.export'          : 'Export Data',
  'settings.autoDate'        : 'Tanggal Otomatis',
  'settings.quickPay'        : 'Quick Pay Amount',
  'settings.appInfo'         : 'Info Aplikasi',
  'settings.version'         : 'Versi',

  // Sync
  'sync.saved'               : 'Tersimpan',
  'sync.saving'              : 'Menyimpan',
  'sync.error'               : 'Gagal simpan',
  'sync.offline'             : 'Offline',

  // Onboarding
  'onboarding.step1'         : 'Mulai tambah member di menu Member',
  'onboarding.step2'         : 'Catat pembayaran di menu Entry',
  'onboarding.step3'         : 'Pantau ringkasan di Dashboard',
  'onboarding.dismiss'       : 'Mengerti',

  // Login
  'login.greeting'           : 'Selamat datang kembali',
  'login.greetingNew'        : 'Selamat datang',
  'login.email'              : 'Email',
  'login.password'           : 'Password',
  'login.submit'             : 'Masuk',
  'login.changeAccount'      : 'Ganti Akun',

  // PIN
  'pin.enter'                : 'Masukkan PIN',
  'pin.wrong'                : 'PIN salah',
  'pin.set'                  : 'Buat PIN',
  'pin.confirm'              : 'Konfirmasi PIN',
  'pin.notMatch'             : 'PIN tidak cocok',

  // Offline
  'offline.message'          : 'Tidak ada koneksi internet',

  // Errors
  'error.loadFailed'         : 'Gagal memuat data',
  'error.saveFailed'         : 'Gagal menyimpan',
  'error.deleteFailed'       : 'Gagal menghapus',
};

export default id;
