// components/views/EntryView.tsx — Sesi C: tambah indikasi potensi belum lunas
'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getPay, isLunas, isFree, rp } from '@/lib/helpers';
import MemberCard from './MemberCard';

export default function EntryView() {
  const {
    appData, activeZone,
    selYear, selMonth, setSelYear, setSelMonth,
    search, setSearch,
    filterStatus, setFilter,
    deferredPrompt,
    setEntryScrollTop,
  } = useAppStore();

  const mems = activeZone === 'KRS' ? appData.krsMembers : appData.slkMembers;

  // Hitung stats — free member TIDAK masuk paid NOR unpaid
  const freeCount = mems.filter(m => isFree(appData, activeZone, m, selYear, selMonth)).length;
  const paid      = mems.filter(m => isLunas(appData, activeZone, m, selYear, selMonth) && !isFree(appData, activeZone, m, selYear, selMonth)).length;
  const unpaid    = mems.filter(m => getPay(appData, activeZone, m, selYear, selMonth) === null && !isFree(appData, activeZone, m, selYear, selMonth)).length;
  const total     = mems.reduce((s, m) => s + (getPay(appData, activeZone, m, selYear, selMonth) || 0), 0);

  // ── Sesi C: Hitung potensi pendapatan belum masuk ──
  // Hanya member yang belum bayar + punya tarif khusus terdaftar
  const potensiUnpaid = mems.reduce((sum, m) => {
    const belum = getPay(appData, activeZone, m, selYear, selMonth) === null
      && !isFree(appData, activeZone, m, selYear, selMonth);
    if (!belum) return sum;
    const info  = appData.memberInfo?.[activeZone + '__' + m] || {};
    const tarif = info.tarif as number | undefined;
    return sum + (tarif ?? 0);
  }, 0);

  // Filter chips — 'free' tambahan
  type FilterType = 'all' | 'paid' | 'unpaid' | 'free';
  const filterStatus2 = filterStatus as FilterType;

  const filtered = mems.filter(name => {
    if (!name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus2 === 'paid')   return isLunas(appData, activeZone, name, selYear, selMonth) && !isFree(appData, activeZone, name, selYear, selMonth);
    if (filterStatus2 === 'unpaid') return getPay(appData, activeZone, name, selYear, selMonth) === null && !isFree(appData, activeZone, name, selYear, selMonth);
    if (filterStatus2 === 'free')   return isFree(appData, activeZone, name, selYear, selMonth);
    return true;
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setEntryScrollTop((e.target as HTMLDivElement).scrollTop);
  }, [setEntryScrollTop]);

  const chips: { key: FilterType; label: string; count?: number }[] = [
    { key:'all',    label:'📋 Semua' },
    { key:'paid',   label:'✅ Lunas',  count: paid },
    { key:'unpaid', label:'⏳ Belum',  count: unpaid },
    { key:'free',   label:'🆓 Free',   count: freeCount },
  ];

  return (
    <div onScroll={handleScroll}>
      {/* PWA install banner */}
      {deferredPrompt && (
        <div className="inst-banner">
          <div className="inst-txt">📲 Install WiFi Pay ke layar beranda!</div>
          <button className="inst-btn" onClick={() => { (deferredPrompt as any).prompt(); }}>Install</button>
        </div>
      )}

      {/* Summary bar */}
      <div className="sum-bar">
        <div>
          <div className="sum-lbl">{MONTHS[selMonth]} {selYear} · {activeZone}</div>
          <div className="sum-val">{rp(total)}</div>
        </div>
        <div style={{ display:'flex', gap:10, fontSize:11, alignItems:'center' }}>
          <span style={{ color:'#4CAF50' }}>✓ {paid}</span>
          <span style={{ color:'#e05c5c' }}>✕ {unpaid}</span>
          {freeCount > 0 && <span style={{ color:'#2196F3' }}>🆓 {freeCount}</span>}
        </div>
      </div>

      {/* ── Sesi C: Potensi belum lunas ── */}
      {unpaid > 0 && potensiUnpaid > 0 && (
        <div style={{
          background:'#1f0d0d', border:'1px solid #e05c5c22', borderRadius:9,
          padding:'8px 14px', marginBottom:10,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div>
            <div style={{ fontSize:9, color:'#e05c5c88', letterSpacing:'.06em' }}>POTENSI BELUM MASUK</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:'#e05c5c' }}>
              {rp(potensiUnpaid)}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, color:'var(--txt4)' }}>
              dari {unpaid} member belum bayar
            </div>
            <div style={{ fontSize:9, color:'var(--txt4)', marginTop:2 }}>
              berdasarkan tarif terdaftar
            </div>
          </div>
        </div>
      )}

      {/* Period selector */}
      <div className="ctrl-row">
        <select className="cs" value={selYear} onChange={e => setSelYear(+e.target.value)}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="cs" value={selMonth} onChange={e => setSelMonth(+e.target.value)}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <span style={{ fontSize:11, color:'var(--txt3)', alignSelf:'center' }}>{MONTHS[selMonth]} {selYear}</span>
      </div>

      {/* Filter chips */}
      <div style={{ display:'flex', gap:5, marginBottom:10, flexWrap:'wrap' }}>
        {chips.map(({ key, label, count }) => (
          <button
            key={key}
            className={`fchip ${filterStatus2 === key ? 'on' : ''}`}
            onClick={() => setFilter(key as any)}
          >
            {label}{count !== undefined ? ` (${count})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrap">
        <input className="search-box" placeholder={`🔍 Cari nama di ${activeZone}...`}
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
      </div>

      <div style={{ fontSize:10, color:'var(--txt4)', marginBottom:8 }}>
        {filtered.length} member{search ? ' ditemukan' : ''} · {activeZone}
      </div>

      {/* Member cards */}
      <div id="entry-cards">
        {filtered.length === 0
          ? <div className="empty-state"><div className="empty-icon">📝</div><div className="empty-title">Tidak Ada Member</div><div className="empty-sub">Tambahkan member di menu Member</div></div>
          : filtered.map((name, i) => <MemberCard key={name} name={name} index={i} />)
        }
      </div>
    </div>
  );
}
