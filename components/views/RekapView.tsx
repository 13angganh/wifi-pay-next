// components/views/RekapView.tsx
'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS, QUICK } from '@/lib/constants';
import { getPay, isFree, getZoneTotal, rp, getKey, fbKey } from '@/lib/helpers';
import { saveDB } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/Confirm';

export default function RekapView() {
  const {
    appData, setAppData, uid, userEmail,
    activeZone, selYear, setSelYear,
    search, setSearch,
    rekapExpanded, setRekapExpanded,
    globalLocked, lockedEntries,
    setSyncStatus,
  } = useAppStore();

  const mems = activeZone === 'KRS' ? appData.krsMembers : appData.slkMembers;
  const filtered = mems.filter(m => m.toLowerCase().includes(search.toLowerCase()));
  const grand = MONTHS.reduce((s, _, mi) =>
    s + mems.reduce((ss, m) => ss + (getPay(appData, activeZone, m, selYear, mi) || 0), 0), 0);

  async function persist(newData: typeof appData, action: string, detail: string) {
    setAppData(newData);
    if (!uid) return;
    setSyncStatus('loading');
    try { await saveDB(uid, newData, { action, detail }, userEmail || ''); setSyncStatus('ok'); }
    catch { setSyncStatus('err'); }
  }

  function isLocked(name: string) {
    return globalLocked || (lockedEntries[activeZone + '__' + name] === true);
  }

  async function quickPay(name: string, amt: number, month: number) {
    if (isLocked(name)) { showToast('Data terkunci!', 'err'); return; }
    const k = getKey(activeZone, name, selYear, month);
    const newData = { ...appData, payments: { ...appData.payments, [k]: amt } };
    await persist(newData, `💰 Quick Pay Rekap ${activeZone} - ${name}`, `${MONTHS[month]} ${selYear} → ${rp(amt)}`);
    showToast(`${name} ${MONTHS[month]} → ${rp(amt)}`);
    setRekapExpanded(null);
  }

  async function manualPay(name: string, val: string, month: number) {
    if (isLocked(name)) { showToast('Data terkunci!', 'err'); return; }
    const k = getKey(activeZone, name, selYear, month);
    const newData = { ...appData, payments: { ...appData.payments } };
    if (val === '') {
      delete newData.payments[k];
      await persist(newData, `🗑️ Hapus bayar Rekap ${activeZone} - ${name}`, `${MONTHS[month]} ${selYear}`);
      showToast(`${name} dihapus`, 'err');
    } else {
      const amt = +val;
      if (isNaN(amt)) { showToast('Nominal tidak valid', 'err'); return; }
      newData.payments[k] = amt;
      await persist(newData, `💰 Bayar Rekap ${activeZone} - ${name}`, `${MONTHS[month]} ${selYear} → ${rp(amt)}`);
      showToast(`${name} ${MONTHS[month]} → ${amt === 0 ? 'Akumulasi' : rp(amt)}`);
    }
    setRekapExpanded(null);
  }

  async function clearPay(name: string, month: number, e?: React.MouseEvent) {
    e?.stopPropagation();
    if (isLocked(name)) { showToast('Data terkunci!', 'err'); return; }
    const k = getKey(activeZone, name, selYear, month);
    const curVal = getPay(appData, activeZone, name, selYear, month);
    if (curVal === null) return;
    showConfirm(
      '🗑️',
      `Hapus pembayaran <b>${name}</b>?<br><span style="font-size:11px;color:var(--txt3)">${MONTHS[month]} ${selYear} · ${curVal > 0 ? rp(curVal) : 'Akumulasi'}</span>`,
      'Ya, Hapus',
      async () => {
        const newData = { ...appData, payments: { ...appData.payments } };
        delete newData.payments[k];
        await persist(newData, `🗑️ Hapus bayar Rekap ${activeZone} - ${name}`, `${MONTHS[month]} ${selYear}`);
        showToast(`${name} ${MONTHS[month]} dihapus`, 'err');
        setRekapExpanded(null);
      }
    );
  }

  // Float modal untuk cell yang di-klik
  function RekapModal() {
    if (!rekapExpanded) return null;
    const { name, month } = rekapExpanded;
    const entryVal = getPay(appData, activeZone, name, selYear, month);
    const entryFree = isFree(appData, activeZone, name, selYear, month);
    const locked = isLocked(name);
    const info = appData.memberInfo?.[activeZone + '__' + name] || {};
    const tarif = info.tarif;

    return (
      <div style={{ position:'fixed', inset:0, zIndex:8000, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop: Math.round(window.innerHeight * 0.18) }} onClick={() => setRekapExpanded(null)}>
        <div style={{ background:'var(--card)', border:'1px solid var(--zc)', borderRadius:14, width:'min(320px,90vw)', boxShadow:'0 8px 32px rgba(0,0,0,.45)', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px 10px', borderBottom:'1px solid var(--border2)' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--txt)' }}>{name}</div>
              <div style={{ fontSize:10, color:'var(--zc)', marginTop:1 }}>{activeZone} · {MONTHS[month]} {selYear}</div>
            </div>
            <button onClick={() => setRekapExpanded(null)} style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt3)', width:28, height:28, borderRadius:8, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
          <div style={{ padding:'12px 14px 14px' }}>
            {entryFree ? (
              <div style={{ textAlign:'center', fontSize:12, color:'#4CAF50', padding:'12px 0' }}>🆓 Member Gratis periode ini</div>
            ) : locked ? (
              <div style={{ textAlign:'center', fontSize:12, color:'#e05c5c', padding:'12px 0' }}>🔒 Data terkunci</div>
            ) : (
              <>
                <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:10, color:'var(--txt4)', flexShrink:0, minWidth:60 }}>NOMINAL</span>
                  <input className="mc-input" type="number" inputMode="numeric" placeholder="0"
                    defaultValue={entryVal !== null ? String(entryVal) : ''}
                    style={{ flex:1, minWidth:0 }}
                    onBlur={e => manualPay(name, e.target.value, month)}
                    onKeyDown={e => { if (e.key === 'Enter') manualPay(name, (e.target as HTMLInputElement).value, month); }}
                    autoFocus
                  />
                  {entryVal !== null && <button className="delbtn" onClick={(e) => clearPay(name, month, e)}>✕</button>}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {tarif && <button className="qb" style={{ borderColor:'var(--zc)', color:'var(--zc)', fontWeight:700 }} onClick={() => quickPay(name, tarif, month)}>{tarif} ★</button>}
                  {QUICK.filter(a => a !== tarif).map(a => (
                    <button key={a} className="qb" onClick={() => quickPay(name, a, month)}>{a}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display:'flex', gap:7, marginBottom:10, alignItems:'center' }}>
        <select className="cs" style={{ flex:'none', width:'auto' }} value={selYear} onChange={e => { setSelYear(+e.target.value); setRekapExpanded(null); }}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <div className="search-wrap" style={{ flex:1, margin:0 }}>
          <input className="search-box" style={{ margin:0 }} placeholder="🔍 cari..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {/* Summary */}
      <div className="sum-bar" style={{ marginBottom:10 }}>
        <div className="sum-lbl">{activeZone} {selYear}</div>
        <div className="sum-val">{rp(grand)}</div>
      </div>

      {/* Table */}
      <div className="rekap-wrap">
        <table className="rtable">
          <thead>
            <tr>
              <th className="stk" style={{ left:0, minWidth:22 }}>#</th>
              <th className="stk" style={{ left:22, textAlign:'left', minWidth:95 }}>NAMA</th>
              {MONTHS.map(m => <th key={m} style={{ minWidth:38 }}>{m}</th>)}
              <th style={{ color:'var(--zc)', minWidth:52 }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((name, i) => {
              let rowTotal = 0;
              const cells = MONTHS.map((_, mi) => {
                const raw  = getPay(appData, activeZone, name, selYear, mi);
                const free = isFree(appData, activeZone, name, selYear, mi);
                const v    = free ? 0 : raw;
                rowTotal  += v || 0;
                const cls  = v! > 0 ? 'cv' : v === 0 && !free ? 'cz' : 'cn';
                const disp = free
                  ? <span style={{ fontSize:8, opacity:.7 }}>🆓</span>
                  : v === 0 ? <span style={{ fontSize:8, opacity:.8 }}>Akm</span>
                  : v !== null ? (v * 1000).toLocaleString('id-ID') : '—';
                const isExp = rekapExpanded?.name === name && rekapExpanded?.month === mi;
                return (
                  <td key={mi} className={`${cls}${isExp ? ' rekap-exp-cell' : ''}`}
                    onClick={() => setRekapExpanded(isExp ? null : { name, month: mi })}
                    title={free ? 'Free Member' : `${MONTHS[mi]} ${selYear}`}>
                    {disp}
                  </td>
                );
              });
              return (
                <tr key={name} data-name={name}>
                  <td className="stk" style={{ left:0, fontSize:10, color:'var(--txt5)', paddingLeft:8, minWidth:22 }}>{i + 1}</td>
                  <td className="stk" style={{ left:22, minWidth:95, fontSize:12, textAlign:'left', paddingLeft:6 }}>{name}</td>
                  {cells}
                  <td style={{ color:'var(--zc)', fontFamily:"'Syne',sans-serif", fontWeight:700 }}>{rowTotal.toLocaleString('id-ID')}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background:'var(--bg3)', borderTop:'2px solid var(--border)' }}>
              <td colSpan={2} className="stk" style={{ left:0, fontSize:10, color:'var(--txt4)', paddingLeft:8, background:'var(--bg3)' }}>TOTAL</td>
              {MONTHS.map((_, mi) => {
                const t = mems.reduce((s, m) => s + (getPay(appData, activeZone, m, selYear, mi) || 0), 0);
                return <td key={mi} style={{ color:'#4CAF50', fontWeight:700 }}>{(t * 1000).toLocaleString('id-ID')}</td>;
              })}
              <td style={{ color:'var(--zc)', fontFamily:"'Syne',sans-serif", fontWeight:800 }}>{rp(grand)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <RekapModal />
    </div>
  );
}
