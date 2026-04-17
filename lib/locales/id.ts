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
  'header.lock'      : 'KUNCI',
  'header.unlock'    : 'BUKA',
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
  // Dashboard tambahan
  'dashboard.thisMonth'  : 'Pendapatan Bulan Ini',
  'dashboard.net'        : 'Bersih',
  'dashboard.unpaidTitle': 'Belum Bayar',
  'dashboard.topArrears' : 'Tunggakan Terbanyak',
  'dashboard.allPaid'    : 'Semua Lunas!',
  'dashboard.lastBackup' : 'Backup Terakhir',
  'dashboard.backupNow'  : 'Backup Sekarang',
  'dashboard.waSummary'  : 'Ringkasan WA',
  'dashboard.sendWA'     : 'Kirim Ringkasan',
  'dashboard.periodNote' : 'Periode sesuai selector di atas',

  // Common tambahan
  'common.members'    : 'pelanggan',
  'common.more'       : 'lainnya',
  'common.months'     : 'bulan',
  'common.since'      : 'sejak',
  'common.optional'   : 'Opsional',

  // Tunggakan tambahan
  'tunggakan.nakal'        : 'Nunggak',
  'tunggakan.rajin'        : 'Rajin',
  'tunggakan.sumLabel'     : 'TUNGGAKAN S/D',
  'tunggakan.sumLunas'     : 'LUNAS S/D',
  'tunggakan.sumFree'      : 'FREE MEMBER',
  'tunggakan.emptyTotal'   : 'Tidak ada tunggakan sampai bulan ini',
  'tunggakan.emptyNew'     : 'Tidak ada tunggakan 1 bulan',
  'tunggakan.emptySoon'    : 'Tidak ada tunggakan 2-3 bulan',
  'tunggakan.emptyCritical': 'Tidak ada tunggakan 4+ bulan',
  'tunggakan.paidAll'      : 'Lunas semua',
  'tunggakan.emptyRajin'   : 'Belum ada member yang lunas semua bulan',
  'tunggakan.emptyFree'    : 'Tidak ada free member aktif bulan ini',
  'tunggakan.forever'      : 'selamanya',

  // Log tambahan
  'log.payOnly'           : 'Hanya Bayar',
  'log.searchPlaceholder' : 'Cari nama / aksi...',
  'log.filterName'        : 'Filter nama member...',
  'log.allYears'          : 'Semua Tahun',
  'log.allMonths'         : 'Semua Bulan',
  'log.autoDelete'        : 'LOG · Log dihapus otomatis 30 hari',
  'log.emptyDesc'         : 'Belum ada aktivitas yang tercatat',

  // Entry tambahan
  'entry.locked'           : 'Data terkunci! Unlock dulu',
  'entry.lockedShort'      : 'terkunci',
  'entry.noTarif'          : 'Tidak ada member dengan tarif terdaftar',
  'entry.noTarifShort'     : 'Belum ada tarif',
  'entry.selectAll'        : 'Pilih Semua',
  'entry.potentialUnpaid'  : 'Potensi Belum Masuk',
  'entry.from'             : 'dari',
  'entry.membersUnpaid'    : 'member belum bayar',
  'entry.searchPlaceholder': 'Cari nama di',
  'entry.batchSkipped'     : 'member dilewati (belum ada tarif)',

  // Rekap tambahan
  'rekap.batchCancel' : 'Batalkan Semua',

  // Members tambahan
  'members.nameRequired'   : 'Nama wajib diisi',
  'members.nameDuplicate'  : 'Nama sudah ada!',
  'members.notFound'       : 'Member tidak ditemukan',
  'members.added'          : 'ditambahkan!',
  'members.updated'        : 'berhasil diupdate!',
  'members.deleted'        : 'dihapus',
  'members.restored'       : 'berhasil dikembalikan!',
  'members.emptyDesc'      : 'Tambahkan member baru di atas',
  'members.recycleBinEmpty': 'Recycle Bin Kosong',
  'members.recycleBinDesc' : 'Tidak ada member yang dihapus',
  'members.saveChanges'    : 'Simpan Perubahan',
  'members.editTitle'      : 'Edit Member',
  'members.customerId'     : 'ID Pelanggan',
  'members.ipLabel'        : 'IP / Link Router',
  'members.tarifLabel'     : 'Tarif Bulanan (×1000)',
  'members.tarifShort'     : 'Tarif (×1000)',
  'members.namePlaceholder': 'Nama member',
  'members.addTitle'       : 'TAMBAH MEMBER BARU KE',
  'members.addTo'          : 'Tambah ke',

  // Ops tambahan
  'ops.expenseTitle'   : 'PENGELUARAN OPERASIONAL',
  'ops.itemPlaceholder': 'Keterangan (listrik, internet...)',
  'ops.addItem'        : '+ Tambah Item',
  'ops.incomeKRS'      : 'Pendapatan KRS',
  'ops.incomeSLK'      : 'Pendapatan SLK',
  'ops.grossIncome'    : 'Pendapatan Kotor',
  'ops.totalExpense'   : 'Total Pengeluaran',
  'ops.netIncome'      : 'PENDAPATAN BERSIH',

  // Settings tambahan
  'settings.pinEnable' : 'Aktifkan PIN',
  'settings.pinDisable': 'Nonaktifkan PIN',
  'settings.pinChange' : 'Ganti PIN',
  'settings.pinSave'   : 'Simpan & Aktifkan',
  'settings.addZone'   : 'Tambah Zona Baru',
  'settings.zonesNote' : 'Menyembunyikan zona tidak menghapus data. Zona tersembunyi tidak tampil di header.',

  // Action tambahan
  'action.reset'  : 'Reset',

};

export default id;
