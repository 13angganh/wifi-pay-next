// components/views/MemberCard.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS, QUICK } from '@/lib/constants';
import { getPay, isFree, rp } from '@/lib/helpers';
import { saveDB } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/Confirm';
import RiwayatModal from '@/components/modals/RiwayatModal';
import type { Zone } from '@/types';

interface Props { name: string; index: number; }

export default function MemberCard({ name, index }: Props) {
  const {
    appData, setAppData, uid, userEmail,
    activeZone, selYear, selMonth,
    expandedCard, setExpandedCard,
    entryCardYear, entryCardMonth, setEntryCard,
    globalLocked, lockedEntries,
    setSyncStatus,
    setRiwayatZone, setRiwayatName, setRiwayatYear,
  } = useAppStore();

  const [riwOpen, setRiwOpen] = useState(false);

  const cardYear  = entryCardYear[name]  ?? selYear;
  const cardMonth = entryCardMonth[name] ?? selMonth;

  const info      = appData.memberInfo?.[activeZone+'__'+name] || {};
  const val       = getPay(appData, activeZone, name, selYear, selMonth);
  const entryVal  = getPay(appData, activeZone, name, cardYear, cardMonth);
  const freeCur   = isFree(appData, activeZone, name, selYear, selMonth);
  const freeEntry = isFree(appData, activeZone, name, cardYear, cardMonth);
  const isLocked  = globalLocked || (lockedEntries[activeZone+'__'+name] === true);
  const isExp     = expandedCard === name;

  const cardRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isExp) return;
    const t = setTimeout(() => {
      inputRef.current?.focus();
      cardRef.current?.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }, 80);
    return () => clearTimeout(t);
  }, [isExp]);

  async function persist(newData: typeof appData, action: string, detail: string) {
    setAppData(newData);
    if (!uid) return;
    setSyncStatus('loading');
    try { await saveDB(uid, newData, { action, detail }, userEmail||''); setSyncStatus('ok'); }
    catch { setSyncStatus('err'); }
  }

  async function saveEntryPay(rawVal: string) {
    if (isLocked) { showToast('Data terkunci! Unlock dulu','err'); return; }
    const k = `${activeZone}__${name}__${cardYear}__${cardMonth}`;
    const newData = { ...appData, payments: { ...appData.payments } };
    if (rawVal === '') {
      delete newData.payments[k];
      await persist(newData, `🗑️ Hapus bayar ${activeZone} - ${name}`, `${MONTHS[cardMonth]} ${cardYear}: dihapus`);
      showToast(`${name} dihapus`,'err');
    } else {
      const amt = +rawVal;
      if (isNaN(amt)) { showToast('Nominal tidak valid','err'); return; }
      newData.payments[k] = amt;
      await persist(newData, `💰 Bayar ${activeZone} - ${name}`, `${MONTHS[cardMonth]} ${cardYear}: ${amt===0?'Akumulasi':rp(amt)}`);
      showToast(`${name} → ${amt===0?'Akumulasi':rp(amt)}`);
    }
  }

  async function quickPay(amt: number) {
    if (isLocked) { showToast('Data terkunci! Unlock dulu','err'); return; }
    const k = `${activeZone}__${name}__${cardYear}__${cardMonth}`;
    const newData = { ...appData, payments: { ...appData.payments, [k]: amt } };
    await persist(newData, `💰 Quick Pay ${activeZone} - ${name}`, `${MONTHS[cardMonth]} ${cardYear}: ${rp(amt)}`);
    showToast(`${name} → ${rp(amt)}`);
    setExpandedCard(null);
  }

  async function clearPay() {
    if (isLocked) { showToast('Data terkunci! Unlock dulu','err'); return; }
    if (entryVal === null) return;
    showConfirm('🗑️',`Hapus pembayaran <b>${name}</b>?<br><span style="font-size:11px;color:var(--txt3)">${MONTHS[cardMonth]} ${cardYear} · ${entryVal>0?rp(entryVal):'Akumulasi'}</span>`,'Ya, Hapus',async()=>{
      const k = `${activeZone}__${name}__${cardYear}__${cardMonth}`;
      const newData = { ...appData, payments: { ...appData.payments } };
      delete newData.payments[k];
      await persist(newData, `🗑️ Hapus bayar ${activeZone} - ${name}`, `${MONTHS[cardMonth]} ${cardYear}: dihapus`);
      showToast(`${name} dihapus`,'err');
    });
  }

  async function saveDate(dateVal: string) {
    const k2      = `date_${cardYear}_${cardMonth}`;
    const infoKey = `${activeZone}__${name}`;
    const newInfo = { ...(appData.memberInfo||{}), [infoKey]: { ...(appData.memberInfo?.[infoKey]||{}), [k2]: dateVal } };
    await persist({ ...appData, memberInfo: newInfo }, `📅 Update tanggal ${activeZone} - ${name}`, `${MONTHS[cardMonth]} ${cardYear}: ${dateVal}`);
  }

  function openRiwayat(e: React.MouseEvent) {
    e.stopPropagation();
    setRiwayatZone(activeZone as Zone);
    setRiwayatName(name);
    setRiwayatYear(new Date().getFullYear());
    setRiwOpen(true);
  }

  // Badge status (berdasarkan bulan yang dipilih secara global)
  let tagEl: React.ReactNode;
  if (freeCur) tagEl = <span className="mc-tag" style={{ background:'#0a3a25',color:'#4CAF50',border:'1px solid #4CAF5033',fontSize:9 }}>🆓</span>;
  else if (val !== null && val > 0) tagEl = <span className="mc-tag tpaid">✓</span>;
  else if (val === 0) tagEl = <span className="mc-tag" style={{ background:'#0a2a1a',color:'#3a9e7a',border:'1px solid #3a9e7a44',fontSize:9 }}>✓ 0</span>;
  else tagEl = <span className="mc-tag tunpaid">✕</span>;

  // ID badge — klik buka riwayat
  const idEl = info.id
    ? (info.ip
        ? <a className="mc-id" href={String(info.ip).startsWith('http')?String(info.ip):'http://'+String(info.ip)} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>{String(info.id)}</a>
        : <span className="mc-id" style={{ cursor:'pointer' }} onClick={openRiwayat}>{String(info.id)}</span>)
    : null;

  return (
    <>
      <div ref={cardRef} id={`card-${name.replace(/\s/g,'_')}`} className={`mcard ${isExp?'expanded':''}`}>
        {/* Top row */}
        <div className="mc-top" onClick={() => setExpandedCard(isExp ? null : name)}>
          <span className="mc-num">{index+1}</span>
          {idEl}
          <span className="mc-name">{name}</span>
          {/* Nominal badge jika sudah bayar */}
          {val !== null && (
            val === 0
              ? <span style={{ fontSize:10, color:'#3a9e7a' }}>Akm</span>
              : <span style={{ fontSize:11, color:'#4CAF50' }}>{val.toLocaleString('id-ID')}</span>
          )}
          {tagEl}
          <span style={{ color:'var(--txt4)', fontSize:12, marginLeft:2 }}>{isExp?'▲':'▼'}</span>
        </div>

        {/* Body expanded */}
        {isExp && (
          <div className="mc-body">
            {/* Bulan selector */}
            <div className="mc-row" style={{ marginBottom:6 }}>
              <span className="mc-label">BULAN</span>
              <select className="cs" style={{ fontSize:11, padding:'4px 8px' }} value={cardYear}  onChange={e => setEntryCard(name,+e.target.value,cardMonth)}>
                {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
              <select className="cs" style={{ fontSize:11, padding:'4px 8px' }} value={cardMonth} onChange={e => setEntryCard(name,cardYear,+e.target.value)}>
                {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
              </select>
            </div>

            {freeEntry ? (
              <div style={{ background:'#0a2a18',border:'1px solid #4CAF5033',borderRadius:7,padding:8,fontSize:11,color:'#4CAF50',textAlign:'center' }}>
                🆓 Member Gratis periode ini
              </div>
            ) : isLocked ? (
              <div style={{ background:'#1f0d0d',border:'1px solid #e05c5c33',borderRadius:7,padding:8,fontSize:11,color:'#e05c5c',textAlign:'center' }}>
                🔒 Data terkunci
              </div>
            ) : (
              <>
                {/* Input nominal */}
                <div className="mc-row">
                  <span className="mc-label">JUMLAH</span>
                  <input ref={inputRef} className="mc-input" type="number" inputMode="numeric" placeholder="0"
                    defaultValue={entryVal!==null?String(entryVal):''}
                    id={`inp-${name.replace(/\s/g,'_')}`}
                    onBlur={e => saveEntryPay(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'){ saveEntryPay((e.target as HTMLInputElement).value); setExpandedCard(null); } }}
                    autoComplete="off" autoCorrect="off" />
                  {entryVal !== null && <button className="delbtn" onClick={clearPay}>✕</button>}
                </div>

                {/* Tanggal */}
                <div className="mc-row">
                  <span className="mc-label">TGL BAYAR</span>
                  <input className="mc-date" type="date"
                    defaultValue={(info[`date_${cardYear}_${cardMonth}`] as string)||''}
                    onBlur={e => saveDate(e.target.value)} />
                </div>

                {/* Quick pay */}
                <div className="mc-row">
                  <span className="mc-label">QUICK</span>
                  <div className="qrow">
                    {info.tarif
                      ? <button className="qb" style={{ borderColor:'var(--zc)',color:'var(--zc)',fontWeight:700 }} onClick={() => quickPay(info.tarif as number)}>{info.tarif as number} ★</button>
                      : <span style={{ fontSize:9, color:'var(--txt4)', alignSelf:'center' }}>★ Belum ada tarif</span>}
                    {QUICK.filter(a => a !== info.tarif).map(a => (
                      <button key={a} className="qb" onClick={() => quickPay(a)}>{a}</button>
                    ))}
                  </div>
                </div>

                {/* Hint tarif */}
                {!info.tarif && (
                  <div style={{ fontSize:9, color:'var(--txt4)', marginTop:-4, marginBottom:4 }}>
                    💡 Set tarif di menu <b style={{ color:'var(--txt3)' }}>Member → ✏️ Edit</b>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Riwayat modal (per card) */}
      <RiwayatModal open={riwOpen} onClose={() => setRiwOpen(false)} />
    </>
  );
}
