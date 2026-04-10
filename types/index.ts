// ══════════════════════════════════════════
// types/index.ts — Semua TypeScript interfaces
// ══════════════════════════════════════════

export interface MemberInfo {
  id?: string;       // ID Pelanggan
  ip?: string;       // IP / Link Router
  tarif?: number;    // Tarif bulanan ×1000
  [key: string]: string | number | undefined; // date_YYYY_M fields
}

export interface FreeMember {
  active: boolean;
  fromYear: number;
  fromMonth: number;
  toYear?: number;
  toMonth?: number;
}

export interface OpsItem {
  label: string;
  nominal: number;
}

export interface OpsData {
  items: OpsItem[];
}

export interface ActivityLog {
  action: string;
  detail?: string;
  ts: number;
  user: string;
}

export interface DeletedMember {
  zone: string;
  name: string;
  deletedAt: number;
  payments: Record<string, number>;
}

export interface AppData {
  krsMembers: string[];
  slkMembers: string[];
  payments: Record<string, number>;
  memberInfo: Record<string, MemberInfo>;
  activityLog: ActivityLog[];
  freeMembers: Record<string, FreeMember>;
  deletedMembers: Record<string, DeletedMember>;
  operasional: Record<string, OpsData>;
  _globalLocked?: boolean;
  _lockedEntries?: Record<string, boolean>;
}

export type Zone = 'KRS' | 'SLK';
export type ViewName = 'dashboard' | 'entry' | 'rekap' | 'tunggakan' | 'grafik' | 'log' | 'members' | 'operasional';
export type FilterStatus = 'all' | 'paid' | 'unpaid';
export type ShareType = 'monthly' | 'yearly';
export type ShareFormat = 'pdf' | 'excel';
export type ExportFormat = 'json' | 'csv' | 'excel';
export type SyncStatus = 'ok' | 'loading' | 'err' | 'offline';
