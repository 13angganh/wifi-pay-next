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
};

export default en;
