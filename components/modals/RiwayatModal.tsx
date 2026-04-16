// components/modals/RiwayatModal.tsx — Sesi 5D: drag handle, glassmorphism, Lucide
'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getPay, isFree, rp } from '@/lib/helpers';
import { ChevronLeft, ChevronRight, X, Gift, CheckCircle2, XCircle, Calendar } from 'lucide-react';

interface Props { open: boolean; onClose: () => void; }

export default function RiwayatModal({ open, onClose }: Props) {
  const router = useRouter();
  const {
    appData, riwayatZone, riwayatName, riwayatYear,
    setRiwayatYear, setView, setZone, setEntryCard, setExpandedCard,
  } = useAppStore();

  if (!open || !riwayatName) return null;

  const info     = appData.memberInfo?.[riwayatZone+'__'+riwayatName] || {};
  const nowYear  = new Date().getFullYear();
  const nowMonth = new Date().getMonth();
  const minYear  = YEARS[0];
  const maxYear  = YEARS[YEARS.length - 1];

  let lunas = 0; let totalVal = 0;

  const rows = MONTHS.map((mName, mi) => {
    if (riwayatYear === nowYear && mi > nowMonth) return null;
    const v    = getPay(appData, riwayatZone, riwayatName, riwayatYear, mi);
    const free = isFree(appData, riwayatZone, riwayatName, riwayatYear, mi);
    const tgl  = (info[`date_${riwayatYear}_${mi}`] as string) || '';

    let statusEl: React.ReactNode;
    if (free) {
      statusEl = (
        <span style={{ color:'var(--c-free)', fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
          <Gift size={12} /> Free
        </span>
      );
      lunas++;
    } else if (v !== null && v > 0) {
      statusEl = (
        <span style={{ color:'var(--c-lunas)', fontSize:11, fontWeight:600, fontFamily:"'DM Mono',monospace" }}>
          {rp(v)}
        </span>
      );
      lunas++; totalVal += v;
    } else if (v === 0) {
      statusEl = (
        <span style={{ color:'var(--c-lunas)', fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
          <CheckCircle2 size={12} /> Akumulasi
        </span>
      );
      lunas++;
    } else {
      statusEl = (
        <span style={{ color:'var(--c-belum)', fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
          <XCircle size={12} /> Belum
        </span>
      );
    }

    return (
      <div key={mi} className="rw-month-row" style={{ cursor:'pointer' }}
        onClick={() => {
          setZone(riwayatZone);
          setView('entry');
          setEntryCard(riwayatName, riwayatYear, mi);
          setExpandedCard(riwayatName);
          router.push('/entry');
          onClose();
        }}>
        <div>
          <div style={{ fontSize:12, color:'var(--txt)', fontFamily:"'DM Mono',monospace" }}>{mName} {riwayatYear}</div>
          {tgl && <div style={{ fontSize:9, color:'var(--txt4)', marginTop:1 }}>{tgl}</div>}
        </div>
        {statusEl}
      </div>
    );
  }).filter(Boolean);

  const totalMonths = rows.length;

  return (
    <div
      id="riwayat-modal"
      style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}
      onClick={onClose}
    >
      <div
        className="riwayat-box"
        id="riwayat-box-inner"
        style={{
          background:'rgba(24,28,39,0.96)', backdropFilter:'blur(16px)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:'var(--r-lg) var(--r-lg) 0 0',
          boxShadow:'var(--shadow-lg)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:10, paddingBottom:6 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 16px 14px' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:'var(--txt)', display:'flex', alignItems:'center', gap:8 }}>
            <Calendar size={15} strokeWidth={1.5} color="var(--zc)" />
            {riwayatName}
            <span style={{ fontSize:11, fontWeight:400, color:'var(--txt3)' }}>({riwayatZone})</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup riwayat"
            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', color:'var(--txt3)', width:32, height:32, borderRadius:'var(--r-sm)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--t-fast)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Year tabs */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:12, paddingBottom:4, padding:'0 16px 4px' }}>
          {YEARS.map(y => (
            <button key={y} className={`rw-year-tab ${y===riwayatYear?'active':''}`} onClick={() => setRiwayatYear(y)}>{y}</button>
          ))}
        </div>

        {/* Year nav */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, padding:'0 16px' }}>
          <button
            onClick={() => riwayatYear > minYear && setRiwayatYear(riwayatYear - 1)}
            disabled={riwayatYear <= minYear}
            aria-label="Tahun sebelumnya"
            style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt2)', width:32, height:32, borderRadius:'var(--r-sm)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: riwayatYear <= minYear ? 0.4 : 1, transition:'all var(--t-fast)' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'var(--txt)' }}>{riwayatYear}</span>
          <button
            onClick={() => riwayatYear < maxYear && setRiwayatYear(riwayatYear + 1)}
            disabled={riwayatYear >= maxYear}
            aria-label="Tahun berikutnya"
            style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt2)', width:32, height:32, borderRadius:'var(--r-sm)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: riwayatYear >= maxYear ? 0.4 : 1, transition:'all var(--t-fast)' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Summary bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.04)', borderRadius:'var(--r-sm)', padding:'8px 12px', marginBottom:10, marginLeft:16, marginRight:16 }}>
          <span style={{ fontSize:11, color:'var(--txt3)', fontFamily:"'DM Sans',sans-serif" }}>{lunas}/{totalMonths} bulan lunas</span>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'var(--zc)' }}>{rp(totalVal)}</span>
        </div>

        {/* Rows */}
        <div style={{ padding:'0 16px' }}>
          {rows.length === 0 ? (
            <div className="empty-state" style={{ padding:'32px 24px' }}>
              <div className="empty-icon"><Calendar size={28} color="var(--txt5)" /></div>
              <div className="empty-title">Tidak Ada Data</div>
              <div className="empty-sub">Belum ada riwayat pembayaran tahun {riwayatYear}</div>
            </div>
          ) : rows}
        </div>
      </div>
    </div>
  );
}
