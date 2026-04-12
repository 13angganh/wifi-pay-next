// components/views/TunggakanView.tsx
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getArrears, isFree } from '@/lib/helpers';

type TMode = 'nakal' | 'rajin' | 'free';

export default function TunggakanView() {
  const { appData, activeZone, selYear, selMonth, setSelYear, setSelMonth } = useAppStore();
  const [mode, setMode] = useState<TMode>('nakal');

  const mems = activeZone === 'KRS' ? appData.krsMembers : appData.slkMembers;

  // Nunggak
  const allArrears = mems.map(name => {
    const unpaid = getArrears(appData, activeZone, name, selYear, selMonth)
      .filter(u => !isFree(appData, activeZone, name, u.y, u.mi));
    return { name, unpaid, count: unpaid.length };
  }).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  // Rajin
  const rajin = mems.filter(name => {
    if (isFree(appData, activeZone, name, selYear, selMonth)) return false;
    return getArrears(appData, activeZone, name, selYear, selMonth)
      .filter(u => !isFree(appData, activeZone, name, u.y, u.mi)).length === 0;
  });

  // Free
  const freeList = mems.filter(name => isFree(appData, activeZone, name, selYear, selMonth));

  const count = mode === 'nakal' ? allArrears.length : mode === 'rajin' ? rajin.length : freeList.length;
  const sumColor = mode === 'nakal' ? '#e05c5c' : mode === 'rajin' ? '#4CAF50' : '#2196F3';
  const sumLabel = mode === 'nakal' ? 'TUNGGAKAN S/D' : mode === 'rajin' ? 'LUNAS S/D' : 'FREE MEMBER';

  return (
    <div>
      {/* Period selector */}
      <div className="ctrl-row">
        <select className="cs" value={selMonth} onChange={e => setSelMonth(+e.target.value)}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className="cs" value={selYear} onChange={e => setSelYear(+e.target.value)}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Mode tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:10, background:'var(--bg3)', padding:3, borderRadius:20, border:'1px solid var(--border)' }}>
        {([
          ['nakal', '⚠️ Nunggak', '#e05c3a', '#fff'],
          ['rajin', '🌟 Rajin',   '#4CAF50', '#0a0c12'],
          ['free',  '🆓 Free',    '#3a5bce', '#fff'],
        ] as const).map(([m, label, bg, fg]) => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex:1, padding:7, borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600,
              background: mode === m ? bg : 'transparent',
              color:      mode === m ? fg : 'var(--txt3)' }}>
            {label} ({m === 'nakal' ? allArrears.length : m === 'rajin' ? rajin.length : freeList.length})
          </button>
        ))}
      </div>

      {/* Summary bar */}
      <div className="sum-bar" style={{ marginBottom:10 }}>
        <div className="sum-lbl">{sumLabel} {MONTHS[selMonth].toUpperCase()} {selYear} · {activeZone}</div>
        <div className="sum-val" style={{ color: sumColor }}>{count} pelanggan</div>
      </div>

      {/* Cards */}
      {mode === 'nakal' && (
        allArrears.length === 0
          ? <div className="empty-state" style={{padding:'28px 24px'}}><div className="empty-icon">✅</div><div className="empty-title" style={{color:'#4CAF50'}}>Semua Lunas!</div><div className="empty-sub">Tidak ada tunggakan sampai bulan ini</div></div>
          : allArrears.map((x, i) => (
            <div key={x.name} className="tcard">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span className="tcard-name">{i + 1}. {x.name}</span>
                <span style={{ fontSize:10, color:'#e05c5c', fontWeight:600 }}>{x.count} bulan nunggak</span>
              </div>
              <div className="tcard-months">
                {x.unpaid.slice(0, 12).map(u => <span key={u.label} className="tmonth">{u.label}</span>)}
                {x.unpaid.length > 12 && <span className="tmonth" style={{ color:'var(--txt2)' }}>+{x.unpaid.length - 12} lagi</span>}
              </div>
            </div>
          ))
      )}

      {mode === 'rajin' && (
        rajin.length === 0
          ? <div className="empty-state" style={{padding:'24px'}}><div className="empty-icon">🏅</div><div className="empty-title">Belum Ada</div><div className="empty-sub">Belum ada member yang lunas semua bulan</div></div>
          : rajin.map((name, i) => (
            <div key={name} className="tcard" style={{ borderColor:'#4CAF5033' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span className="tcard-name" style={{ color:'#4CAF50' }}>✅ {i + 1}. {name}</span>
                <span style={{ fontSize:10, color:'#4CAF50' }}>Lunas semua</span>
              </div>
            </div>
          ))
      )}

      {mode === 'free' && (
        freeList.length === 0
          ? <div className="empty-state" style={{padding:'24px'}}><div className="empty-icon">🆓</div><div className="empty-title">Tidak Ada</div><div className="empty-sub">Tidak ada free member aktif bulan ini</div></div>
          : freeList.map((name, i) => {
            const fm = appData.freeMembers?.[activeZone + '__' + name];
            const toStr = fm?.toYear !== undefined
              ? ` s/d ${MONTHS[fm.toMonth!]} ${fm.toYear}` : ' (selamanya)';
            return (
              <div key={name} className="tcard" style={{ borderColor:'#4CAF5022', background:'#0a1a10' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span className="tcard-name" style={{ color:'#4CAF50' }}>🆓 {i + 1}. {name}</span>
                  <span style={{ fontSize:10, color:'#4CAF50' }}>Gratis</span>
                </div>
                {fm && (
                  <div style={{ fontSize:10, color:'var(--txt4)', marginTop:3 }}>
                    Dari {MONTHS[fm.fromMonth]} {fm.fromYear}{toStr}
                  </div>
                )}
              </div>
            );
          })
      )}
    </div>
  );
}
