// components/views/EntryView.tsx
'use client';

import { useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getPay, isLunas, isFree, getZoneTotal, rp } from '@/lib/helpers';
import MemberCard from './MemberCard';

export default function EntryView() {
  const {
    appData, activeZone,
    selYear, selMonth, setSelYear, setSelMonth,
    search, setSearch,
    filterStatus, setFilter,
    deferredPrompt,
    entryScrollTop, setEntryScrollTop,
  } = useAppStore();

  const contentRef = useRef<HTMLDivElement>(null);

  const mems = activeZone==='KRS' ? appData.krsMembers : appData.slkMembers;

  // Filter members
  const filtered = mems.filter(name => {
    if (!name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus==='paid')   return isLunas(appData,activeZone,name,selYear,selMonth) && !isFree(appData,activeZone,name,selYear,selMonth);
    if (filterStatus==='unpaid') return getPay(appData,activeZone,name,selYear,selMonth)===null;
    return true;
  });

  const total  = mems.reduce((s,m)=>s+(getPay(appData,activeZone,m,selYear,selMonth)||0),0);
  const paid   = mems.filter(m=>isLunas(appData,activeZone,m,selYear,selMonth)&&!isFree(appData,activeZone,m,selYear,selMonth)).length;
  const unpaid = mems.filter(m=>getPay(appData,activeZone,m,selYear,selMonth)===null&&!isFree(appData,activeZone,m,selYear,selMonth)).length;

  // Save scroll sebelum re-render
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setEntryScrollTop((e.target as HTMLDivElement).scrollTop);
  }, [setEntryScrollTop]);

  return (
    <div>
      {/* PWA install banner */}
      {deferredPrompt && (
        <div className="inst-banner">
          <div className="inst-txt">📲 Install WiFi Pay ke layar beranda!</div>
          <button className="inst-btn" onClick={()=>{(deferredPrompt as any).prompt();}}>Install</button>
        </div>
      )}

      {/* Summary bar */}
      <div className="sum-bar">
        <div><div className="sum-lbl">TOTAL {activeZone}</div><div className="sum-val">{rp(total)}</div></div>
        <div style={{display:'flex',gap:10,fontSize:11}}>
          <span style={{color:'#4CAF50'}}>✓ {paid}</span>
          <span style={{color:'#e05c5c'}}>✕ {unpaid}</span>
        </div>
      </div>

      {/* Period selector */}
      <div className="ctrl-row">
        <select className="cs" value={selYear} onChange={e=>setSelYear(+e.target.value)}>
          {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select className="cs" value={selMonth} onChange={e=>setSelMonth(+e.target.value)}>
          {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
        </select>
        <span style={{fontSize:11,color:'var(--txt3)',alignSelf:'center'}}>{MONTHS[selMonth]} {selYear}</span>
      </div>

      {/* Filter chips */}
      <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
        {([['all','Semua'],['paid','Lunas'],['unpaid','Belum']] as const).map(([f,label])=>(
          <button key={f} className={`fchip ${filterStatus===f?'on':''}`} onClick={()=>setFilter(f)}>{label}</button>
        ))}
      </div>

      {/* Search */}
      <div className="search-wrap">
        <input
          className="search-box"
          placeholder={`🔍 Cari nama di ${activeZone}...`}
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        {search && <button className="search-clear" onClick={()=>setSearch('')}>✕</button>}
      </div>

      <div style={{fontSize:10,color:'var(--txt4)',marginBottom:8}}>
        {filtered.length} member{search?' ditemukan':''} · {activeZone}
      </div>

      {/* Member cards */}
      <div id="entry-cards">
        {filtered.length===0
          ? <div style={{textAlign:'center',padding:30,color:'var(--txt3)',fontSize:12}}>Tidak ada member</div>
          : filtered.map((name,i)=>(
              <MemberCard key={name} name={name} index={i} />
            ))
        }
      </div>
    </div>
  );
}
