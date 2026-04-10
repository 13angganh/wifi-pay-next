// ══════════════════════════════════════════
// lib/constants.ts — Konstanta global
// ══════════════════════════════════════════

export const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];

export const YEARS = ((): number[] => {
  const y: number[] = [];
  for (let i = 2023; i <= new Date().getFullYear() + 2; i++) y.push(i);
  return y;
})();

export const QUICK = [50, 80, 90, 100, 150, 200];

export const DEFAULT_KRS = [
  "ABIL","ADIT","AJI","AKBAR","ALFIN","ANA","ARIFIN","ARPAN","AYU NANDA",
  "B-ANI","B-IKE","B-NINGSIH","B-WULAN","BAGAS","BERI","CECEK","DAYAT",
  "DELLA","DIKA JON","DISTY","DIYAN","EGA","ELLA","ENGGAR","ESRA","FARHAN",
  "FEBI","FEMLI","FERA","FIRLI","GILANG","GO","HABIBAH","HABIL","HALIK",
  "HAMIM","HOLIP","ICAN","IING","IMAM","IMAMAH","INTAN GN","INTAN RIO",
  "JIHAN","LENI","LILIS","LINDA","MAHRUS","MAY","MUHAMMAD","MUIS","NATUL",
  "NIA","NININ","NONIK","NORMA","P-BUDI","POS","PUPUT","QORI","QORI SAS",
  "RAGIL","RANI","RIA","RIFA","RILA","RIRIB","RITA","ROSI","RYAN","SAHYUN",
  "SANTI","SDN","SIFA","SUD","SURYA","TK PGRI","UCI","VINA","VIO","WAHYU",
  "WARSA","WAWAN","WILDA","WILDAN","YENI","ZEN"
];

export const DEFAULT_SLK = [
  "AFAN","AIDI","AMIN","ANAS","ANGGUN","ANIS","BAY","CLARA","DAIFI","DHEA",
  "DIKRI","ELIYA","ERFAN","FAHMI","FAIL","FATIA","FIROCH","GUNAWAN","H-MUALIS",
  "HAIKAL","HENDRA","IKROM","INUL","IPUL","IRHAM","LUKMAN","MAHRUS","MAKSUM",
  "MAY","MELLY","NAFIS","NAUFAL","NIA SALAK","NISA","NURIL","OPEK","P-IIL",
  "RIFKI","RINA","ROBI","ROSI","SAMSUDI","SATAM","SHELA","SHOFIA","SOFI",
  "SUKI","SUTIK","UUS","VIVI","WAHYU","WARDA","ZAHDAN"
];

export const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Beranda',
  entry: 'Entry',
  rekap: 'Rekap',
  tunggakan: 'Tunggakan',
  grafik: 'Grafik',
  log: 'Log',
  members: 'Member',
  operasional: 'Operasional',
};

export const PAGE_ICONS: Record<string, string> = {
  dashboard: '🏠',
  entry: '📝',
  rekap: '📊',
  tunggakan: '⚠️',
  grafik: '📈',
  log: '🗂️',
  members: '👥',
  operasional: '💼',
};
