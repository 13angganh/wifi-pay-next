// lib/locales/en.ts — English
const en: Record<string, string> = {
  // Nav
  'nav.dashboard'    : 'Dashboard',
  'nav.entry'        : 'Entry',
  'nav.rekap'        : 'Summary',
  'nav.tunggakan'    : 'Arrears',
  'nav.grafik'       : 'Chart',
  'nav.log'          : 'Log',
  'nav.members'      : 'Members',
  'nav.operasional'  : 'Operational',
  'nav.settings'     : 'Settings',

  // Status
  'status.lunas'     : 'Paid',
  'status.belum'     : 'Unpaid',
  'status.free'      : 'Free',

  // Actions
  'action.save'      : 'Save',
  'action.cancel'    : 'Cancel',
  'action.delete'    : 'Delete',
  'action.confirm'   : 'Confirm',
  'action.edit'      : 'Edit',
  'action.add'       : 'Add',
  'action.close'     : 'Close',
  'action.back'      : 'Back',
  'action.search'    : 'Search',
  'action.export'    : 'Export',
  'action.share'     : 'Share',
  'action.logout'    : 'Sign Out',
  'action.changeAccount' : 'Switch Account',

  // Common
  'common.loading'   : 'Loading...',
  'common.saving'    : 'Saving...',
  'common.saved'     : 'Saved',
  'common.error'     : 'Error',
  'common.offline'   : 'Offline',
  'header.lock'      : 'LOCK',
  'header.unlock'    : 'OPEN',
  'common.noData'    : 'No data',
  'common.noResult'  : 'No results',
  'common.total'     : 'Total',
  'common.month'     : 'Month',
  'common.year'      : 'Year',
  'common.zone'      : 'Zone',
  'common.name'      : 'Name',
  'common.amount'    : 'Amount',
  'common.date'      : 'Date',
  'common.all'       : 'All',

  // Dashboard
  'dashboard.title'          : 'Dashboard',
  'dashboard.income'         : 'Total Income',
  'dashboard.members'        : 'Members',
  'dashboard.paid'           : 'Paid',
  'dashboard.unpaid'         : 'Unpaid',
  'dashboard.operasional'    : 'Operational',

  // Entry
  'entry.title'              : 'Payment Entry',
  'entry.markPaid'           : 'Mark as Paid',
  'entry.batchPay'           : 'Pay All',
  'entry.quickPay'           : 'Quick Pay',
  'entry.confirmHighNominal' : 'Amount exceeds the member\'s rate, continue?',
  'entry.batchSuccess'       : 'members marked as paid',

  // Rekap
  'rekap.title'              : 'Summary',
  'rekap.batchConfirm'       : 'Mark All as Paid',

  // Tunggakan
  'tunggakan.title'          : 'Arrears',
  'tunggakan.filter.total'   : 'Total',
  'tunggakan.filter.new'     : 'New',
  'tunggakan.filter.soon'    : 'Soon',
  'tunggakan.filter.critical': 'Critical',
  'tunggakan.months'         : 'months overdue',

  // Grafik
  'grafik.title'             : 'Chart',

  // Log
  'log.title'                : 'Activity Log',
  'log.empty'                : 'No activity yet',

  // Members
  'members.title'            : 'Member List',
  'members.add'              : 'Add Member',
  'members.empty'            : 'No members yet',
  'members.delete'           : 'Delete Member',
  'members.restore'          : 'Restore',

  // Operasional
  'ops.title'                : 'Operational',
  'ops.income'               : 'Income',
  'ops.expense'              : 'Expense',
  'ops.net'                  : 'Net',

  // Settings
  'settings.title'           : 'Settings',
  'settings.pin'             : 'PIN Security',
  'settings.zones'           : 'Zone Management',
  'settings.language'        : 'Language',
  'settings.export'          : 'Export Data',
  'settings.autoDate'        : 'Auto Date',
  'settings.quickPay'        : 'Quick Pay Amount',
  'settings.appInfo'         : 'App Info',
  'settings.version'         : 'Version',

  // Sync
  'sync.saved'               : 'Saved',
  'sync.saving'              : 'Saving',
  'sync.error'               : 'Save failed',
  'sync.offline'             : 'Offline',

  // Onboarding
  'onboarding.step1'         : 'Start by adding members in the Members menu',
  'onboarding.step2'         : 'Record payments in the Entry menu',
  'onboarding.step3'         : 'Monitor your summary in the Dashboard',
  'onboarding.dismiss'       : 'Got it',

  // Login
  'login.greeting'           : 'Welcome back',
  'login.greetingNew'        : 'Welcome',
  'login.email'              : 'Email',
  'login.password'           : 'Password',
  'login.submit'             : 'Sign In',
  'login.changeAccount'      : 'Switch Account',

  // PIN
  'pin.enter'                : 'Enter PIN',
  'pin.wrong'                : 'Wrong PIN',
  'pin.set'                  : 'Set PIN',
  'pin.confirm'              : 'Confirm PIN',
  'pin.notMatch'             : 'PIN does not match',

  // Offline
  'offline.message'          : 'No internet connection',

  // Errors
  'error.loadFailed'         : 'Failed to load data',
  'error.saveFailed'         : 'Failed to save',
  'error.deleteFailed'       : 'Failed to delete',
  // Dashboard tambahan
  'dashboard.thisMonth'  : 'Monthly Income',
  'dashboard.net'        : 'Net',
  'dashboard.unpaidTitle': 'Unpaid',
  'dashboard.topArrears' : 'Most Arrears',
  'dashboard.allPaid'    : 'All Paid!',
  'dashboard.lastBackup' : 'Last Backup',
  'dashboard.backupNow'  : 'Backup Now',
  'dashboard.waSummary'  : 'WA Summary',
  'dashboard.sendWA'     : 'Send Summary',
  'dashboard.periodNote' : 'Period follows selector above',

  // Common tambahan
  'common.members'    : 'customers',
  'common.more'       : 'more',
  'common.months'     : 'months',
  'common.since'      : 'since',
  'common.optional'   : 'Optional',

  // Tunggakan tambahan
  'tunggakan.nakal'        : 'Overdue',
  'tunggakan.rajin'        : 'On-time',
  'tunggakan.sumLabel'     : 'ARREARS UNTIL',
  'tunggakan.sumLunas'     : 'PAID UNTIL',
  'tunggakan.sumFree'      : 'FREE MEMBER',
  'tunggakan.emptyTotal'   : 'No arrears up to this month',
  'tunggakan.emptyNew'     : 'No 1-month arrears',
  'tunggakan.emptySoon'    : 'No 2-3 month arrears',
  'tunggakan.emptyCritical': 'No 4+ month arrears',
  'tunggakan.paidAll'      : 'All paid',
  'tunggakan.emptyRajin'   : 'No members fully paid yet',
  'tunggakan.emptyFree'    : 'No active free members this month',
  'tunggakan.forever'      : 'forever',

  // Log tambahan
  'log.payOnly'           : 'Payments Only',
  'log.searchPlaceholder' : 'Search name / action...',
  'log.filterName'        : 'Filter member name...',
  'log.allYears'          : 'All Years',
  'log.allMonths'         : 'All Months',
  'log.autoDelete'        : 'LOG · Auto-deleted after 30 days',
  'log.emptyDesc'         : 'No activity recorded yet',

  // Entry tambahan
  'entry.locked'           : 'Data locked! Unlock first',
  'entry.lockedShort'      : 'locked',
  'entry.noTarif'          : 'No members with registered rates',
  'entry.noTarifShort'     : 'No rate set',
  'entry.selectAll'        : 'Select All',
  'entry.potentialUnpaid'  : 'Potential Unpaid',
  'entry.from'             : 'from',
  'entry.membersUnpaid'    : 'members unpaid',
  'entry.searchPlaceholder': 'Search in',
  'entry.batchSkipped'     : 'members skipped (no rate)',

  // Rekap tambahan
  'rekap.batchCancel' : 'Cancel All',

  // Members tambahan
  'members.nameRequired'   : 'Name is required',
  'members.nameDuplicate'  : 'Name already exists!',
  'members.notFound'       : 'Member not found',
  'members.added'          : 'added!',
  'members.updated'        : 'updated successfully!',
  'members.deleted'        : 'deleted',
  'members.restored'       : 'restored successfully!',
  'members.emptyDesc'      : 'Add a new member above',
  'members.recycleBinEmpty': 'Recycle Bin Empty',
  'members.recycleBinDesc' : 'No deleted members',
  'members.saveChanges'    : 'Save Changes',
  'members.editTitle'      : 'Edit Member',
  'members.customerId'     : 'Customer ID',
  'members.ipLabel'        : 'IP / Router Link',
  'members.tarifLabel'     : 'Monthly Rate (×1000)',
  'members.tarifShort'     : 'Rate (×1000)',
  'members.namePlaceholder': 'Member name',
  'members.addTitle'       : 'ADD NEW MEMBER TO',
  'members.addTo'          : 'Add to',

  // Ops tambahan
  'ops.expenseTitle'   : 'OPERATIONAL EXPENSES',
  'ops.itemPlaceholder': 'Description (electricity, internet...)',
  'ops.addItem'        : '+ Add Item',
  'ops.incomeKRS'      : 'KRS Income',
  'ops.incomeSLK'      : 'SLK Income',
  'ops.grossIncome'    : 'Gross Income',
  'ops.totalExpense'   : 'Total Expenses',
  'ops.netIncome'      : 'NET INCOME',

  // Settings tambahan
  'settings.pinEnable' : 'Enable PIN',
  'settings.pinDisable': 'Disable PIN',
  'settings.pinChange' : 'Change PIN',
  'settings.pinSave'   : 'Save & Enable',
  'settings.addZone'   : 'Add New Zone',
  'settings.zonesNote' : 'Hiding a zone does not delete data. Hidden zones do not appear in the header.',
  'Aktif — app terkunci saat dibuka' : 'Enabled — app locks when opened',
  'Nonaktif — app langsung terbuka' : 'Disabled — app opens immediately',

  // Action tambahan
  'action.reset'  : 'Reset',

  // Settings PIN steps
  'settings.pinStatus.active'   : 'Active',
  'settings.pinStatus.inactive' : 'Inactive',
  'settings.pin.newTitle'       : 'Create New PIN',
  'settings.pin.enterNew'       : 'Enter 4-digit PIN',
  'settings.pin.reenterNew'     : 'Re-enter the same PIN',
  'settings.pin.enterCurrent'   : 'Enter current PIN to confirm',
  'settings.pin.enterOld'       : 'Enter old PIN',

  // Settings Auto-lock
  'settings.autoLock'           : 'AUTO-LOCK PIN',
  'settings.autoLockDesc'       : 'Auto-lock screen when idle. Firebase stays active.',
  'settings.timeout.never'      : 'Never',
  'settings.timeout.5m'         : '5 minutes',
  'settings.timeout.10m'        : '10 minutes',
  'settings.timeout.30m'        : '30 minutes',
  'settings.timeout.1h'         : '1 hour',

  // Settings Zona
  'settings.zona.hidden'        : 'Hidden',
  'settings.zona.namePlaceholder': 'Zone name (max 6 chars)',
  'settings.zona.color'         : 'Color',

  // Settings WA
  'settings.waPeriod'           : 'SUMMARY PERIOD',
  'settings.sendToWA'           : 'Send to WhatsApp',

  // Settings Tanggal Bayar
  'settings.autoDate.descAuto'   : 'Auto — today\'s date on payment entry',
  'settings.autoDate.descManual' : 'Manual — enter date yourself each time',
  'settings.autoDate.auto'       : 'Auto',
  'settings.autoDate.manual'     : 'Manual',
  'settings.autoDate.toastAuto'  : 'Payment date: Auto',
  'settings.autoDate.toastManual': 'Payment date: Manual',
  'settings.autoDate.noteAuto'   : 'On quick pay, date is automatically set to today.',
  'settings.autoDate.noteManual' : 'Date is not auto-filled — useful when entering late.',

  // Settings Quick Pay
  'settings.quickPayDesc'  : 'Quick pay amount for members without a custom rate.',
  'settings.quickPayLabel' : 'AMOUNT (×1000) — separate with commas',
  'settings.quickPaySave'  : 'Save Default Amount',
  'settings.quickPayNote'  : 'Per-member rate is set in Members → Edit → Rate.',

  // Settings Export
  'settings.export.monthly' : 'Monthly',
  'settings.export.yearly'  : 'Yearly',

  // Common deleted
  'common.deleted' : 'deleted',

  // Settings PIN toast & confirm
  'settings.pin.toastEnabled'  : 'PIN enabled successfully',
  'settings.pin.toastDisabled' : 'PIN disabled',
  'settings.pin.toastChanged'  : 'PIN changed successfully',
  'settings.pin.disableConfirm': 'Disable PIN?<br><span style="font-size:11px;color:var(--txt3)">App will open immediately without PIN</span>',

  // Settings Quick Pay toast
  'settings.quickPay.minError' : 'Minimum 2 amounts required',
  'settings.quickPay.maxError' : 'Maximum 8 amounts allowed',
  'settings.quickPay.saved'    : 'Quick pay amounts saved',

  // Settings Export toast
  'settings.export.makingPDF'    : 'Generating PDF...',
  'settings.export.pdfDone'      : 'PDF downloaded successfully',
  'settings.export.pdfError'     : 'Failed to generate PDF',
  'settings.export.makingExcel'  : 'Generating Excel...',
  'settings.export.excelDone'    : 'Excel downloaded successfully',
  'settings.export.excelError'   : 'Failed to generate Excel',
  'settings.export.makingFile'   : 'Generating file...',
  'settings.export.fileDownloaded': 'File downloaded (share not supported)',
  'settings.export.fileError'    : 'Failed to generate file',

};

export default en;
