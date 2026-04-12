// components/modals/RiwayatModal.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getPay, isFree, rp } from '@/lib/helpers';

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
    if (free)           { statusEl = <span style={{ color:'#4CAF50', fontSize:11 }}>🆓 Free</span>; lunas++; }
    else if (v!==null && v>0) { statusEl = <span style={{ color:'#4CAF50', fontSize:11, fontWeight:600 }}>{rp(v)}</span>; lunas++; totalVal += v; }
    else if (v===0)     { statusEl = <span style={{ color:'#3a9e7a', fontSize:11 }}>✓ Akumulasi</span>; lunas++; }
    else                { statusEl = <span style={{ color:'#e05c5c', fontSize:11 }}>✕ Belum</span>; }

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
          <div style={{ fontSize:12, color:'var(--txt)' }}>{mName} {riwayatYear}</div>
          {tgl && <div style={{ fontSize:9, color:'var(--txt4)' }}>{tgl}</div>}
        </div>
        {statusEl}
      </div>
    );
  }).filter(Boolean);

  const totalMonths = rows.length;

  return (
    <div id="riwayat-modal" style={{ position:'fixed', inset:0, zIndex:9000, background:'#000a', display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={onClose}>
      <div className="riwayat-box" id="riwayat-box-inner" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:'var(--txt)' }}>
            📋 {riwayatName} ({riwayatZone})
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--txt3)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>

        {/* Year tabs */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:12, paddingBottom:4 }}>
          {YEARS.map(y => (
            <button key={y} className={`rw-year-tab ${y===riwayatYear?'active':''}`} onClick={() => setRiwayatYear(y)}>{y}</button>
          ))}
        </div>

        {/* Year nav */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <button onClick={() => riwayatYear > minYear && setRiwayatYear(riwayatYear - 1)} disabled={riwayatYear <= minYear}
            style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt2)', padding:'4px 12px', borderRadius:6, cursor:'pointer', fontSize:13 }}>←</button>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>{riwayatYear}</span>
          <button onClick={() => riwayatYear < maxYear && setRiwayatYear(riwayatYear + 1)} disabled={riwayatYear >= maxYear}
            style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt2)', padding:'4px 12px', borderRadius:6, cursor:'pointer', fontSize:13 }}>→</button>
        </div>

        {/* Summary */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg3)', borderRadius:8, padding:'8px 12px', marginBottom:10 }}>
          <span style={{ fontSize:11, color:'var(--txt3)' }}>{lunas}/{totalMonths} bulan lunas</span>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:'var(--zc)' }}>{rp(totalVal)}</span>
        </div>

        {/* Rows */}
        <div>
          {rows.length === 0
            ? (
              <div className="empty-state" style={{ padding:'32px 24px' }}>
                <div className="empty-icon">📭</div>
                <div className="empty-title">Tidak Ada Data</div>
                <div className="empty-sub">Belum ada riwayat pembayaran tahun {riwayatYear}</div>
              </div>
            )
            : rows}
        </div>
      </div>
    </div>
  );
}
