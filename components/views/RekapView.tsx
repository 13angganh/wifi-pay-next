// components/views/RekapView.tsx — Sesi D: preview tabel sebelum download
'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getPay, isFree, rp, getKey } from '@/lib/helpers';
import { saveDB } from '@/lib/db';
import { generatePDF, generateExcel } from '@/lib/export';
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
    settings,
  } = useAppStore();

  // ── Sesi D: preview state ──
  const [showPreview, setShowPreview] = useState(false);
  const [previewMonth, setPreviewMonth] = useState<number | null>(null); // null = tahunan

  const inputDirty   = useRef(false);
  const modalClosing = useRef(false);

  const mems     = activeZone === 'KRS' ? appData.krsMembers : appData.slkMembers;
  const filtered  = mems.filter(m => m.toLowerCase().includes(search.toLowerCase()));
  const grand     = MONTHS.reduce((s, _, mi) =>
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

  function closeModal() {
    modalClosing.current = true;
    inputDirty.current   = false;
    setRekapExpanded(null);
    setTimeout(() => { modalClosing.current = false; }, 200);
  }

  async function quickPay(name: string, amt: number, month: number) {
    if (isLocked(name)) { showToast('Data terkunci!', 'err'); return; }
    const k       = getKey(activeZone, name, selYear, month);
    const newData = { ...appData, payments: { ...appData.payments, [k]: amt } };
    if (settings?.autoDate) {
      const today   = new Date().toISOString().slice(0, 10);
      const infoKey = `${activeZone}__${name}`;
      const dateKey = `date_${selYear}_${month}`;
      newData.memberInfo = {
        ...(newData.memberInfo || {}),
        [infoKey]: { ...(newData.memberInfo?.[infoKey] || {}), [dateKey]: today },
      };
    }
    await persist(newData, `💰 Quick Pay Rekap ${activeZone} - ${name}`, `${MONTHS[month]} ${selYear} → ${rp(amt)}`);
    showToast(`${name} ${MONTHS[month]} → ${rp(amt)}`);
    closeModal();
  }

  async function manualPay(name: string, val: string, month: number) {
    if (!inputDirty.current) return;
    if (modalClosing.current) return;
    inputDirty.current = false;
    if (isLocked(name)) { showToast('Data terkunci!', 'err'); return; }
    const k       = getKey(activeZone, name, selYear, month);
    const newData = { ...appData, payments: { ...appData.payments } };
    if (val === '') {
      delete newData.payments[k];
      await persist(newData, `🗑️ Hapus bayar Rekap ${activeZone} - ${name}`, `${MONTHS[month]} ${selYear}`);
      showToast(`${name} ${MONTHS[month]} dihapus`, 'err');
    } else {
      const amt = +val;
      if (isNaN(amt)) { showToast('Nominal tidak valid', 'err'); return; }
      newData.payments[k] = amt;
      await persist(newData, `💰 Bayar Rekap ${activeZone} - ${name}`, `${MONTHS[month]} ${selYear} → ${rp(amt)}`);
      showToast(`${name} ${MONTHS[month]} → ${amt === 0 ? 'Akumulasi' : rp(amt)}`);
    }
    closeModal();
  }

  async function clearPay(name: string, month: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (isLocked(name)) { showToast('Data terkunci!', 'err'); return; }
    const curVal = getPay(appData, activeZone, name, selYear, month);
    if (curVal === null) return;
    showConfirm(
      '🗑️',
      `Hapus pembayaran <b>${name}</b>?<br><span style="font-size:11px;color:var(--txt3)">${MONTHS[month]} ${selYear} · ${curVal > 0 ? rp(curVal) : 'Akumulasi'}</span>`,
      'Ya, Hapus',
      async () => {
        const k       = getKey(activeZone, name, selYear, month);
        const newData = { ...appData, payments: { ...appData.payments } };
        delete newData.payments[k];
        await persist(newData, `🗑️ Hapus bayar Rekap ${activeZone} - ${name}`, `${MONTHS[month]} ${selYear}`);
        showToast(`${name} ${MONTHS[month]} dihapus`, 'err');
        closeModal();
      }
    );
  }

  // ── Sesi D: download handlers ──
  async function handleDownloadPDF() {
    try {
      showToast('Membuat PDF...', 'info');
      const { blob, filename } = await generatePDF(appData, activeZone, selYear, previewMonth);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('✅ PDF berhasil didownload');
    } catch { showToast('Gagal buat PDF', 'err'); }
  }

  function handleDownloadExcel() {
    try {
      const { blob, filename } = generateExcel(appData, activeZone, selYear, previewMonth);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('✅ Excel berhasil didownload');
    } catch { showToast('Gagal buat Excel', 'err'); }
  }

  // ── Sesi D: Preview tabel komponen ──
  function PreviewTable() {
    const pm = previewMonth;
    const previewMems = mems;

    if (pm !== null) {
      // Preview bulanan
      const rows = previewMems.map(name => {
        const info   = appData.memberInfo?.[activeZone + '__' + name] || {};
        const val    = getPay(appData, activeZone, name, selYear, pm);
        const free   = isFree(appData, activeZone, name, selYear, pm);
        const tgl    = (info[`date_${selYear}_${pm}`] as string) || '—';
        const status = free ? 'Free' : val !== null ? 'Lunas' : 'Belum';
        const color  = free ? '#4CAF50' : val !== null ? '#4CAF50' : '#e05c5c';
        const nominal = free ? '🆓' : val !== null ? (val === 0 ? 'Akumulasi' : rp(val)) : '—';
        return { name, tgl, status, color, nominal };
      });
      const totalBulanan = previewMems.reduce((s, m) => s + (getPay(appData, activeZone, m, selYear, pm) || 0), 0);

      return (
        <div style={{ overflowX:'auto', borderRadius:8, border:'1px solid var(--border2)', marginTop:10 }}>
          <table style={{ borderCollapse:'collapse', fontSize:11, width:'100%' }}>
            <thead>
              <tr style={{ background:'var(--bg3)' }}>
                <th style={{ padding:'7px 8px', fontSize:9, color:'var(--txt4)', letterSpacing:'.06em', textAlign:'left', whiteSpace:'nowrap' }}>#</th>
                <th style={{ padding:'7px 8px', fontSize:9, color:'var(--txt4)', letterSpacing:'.06em', textAlign:'left', whiteSpace:'nowrap' }}>NAMA</th>
                <th style={{ padding:'7px 8px', fontSize:9, color:'var(--txt4)', letterSpacing:'.06em', textAlign:'center', whiteSpace:'nowrap' }}>TGL BAYAR</th>
                <th style={{ padding:'7px 8px', fontSize:9, color:'var(--txt4)', letterSpacing:'.06em', textAlign:'right', whiteSpace:'nowrap' }}>NOMINAL</th>
                <th style={{ padding:'7px 8px', fontSize:9, color:'var(--txt4)', letterSpacing:'.06em', textAlign:'center', whiteSpace:'nowrap' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name} style={{ borderTop:'1px solid var(--border2)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                  <td style={{ padding:'6px 8px', color:'var(--txt4)', fontSize:10 }}>{i + 1}</td>
                  <td style={{ padding:'6px 8px', fontSize:12 }}>{r.name}</td>
                  <td style={{ padding:'6px 8px', textAlign:'center', color:'var(--txt3)', fontSize:10 }}>{r.tgl}</td>
                  <td style={{ padding:'6px 8px', textAlign:'right', fontWeight:600, color:'var(--txt)' }}>{r.nominal}</td>
                  <td style={{ padding:'6px 8px', textAlign:'center' }}>
                    <span style={{ fontSize:9, padding:'2px 7px', borderRadius:10, background: r.color === '#4CAF50' ? '#0d2b1f' : '#1f0d0d', color: r.color, border:`1px solid ${r.color}22` }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:'2px solid var(--border)', background:'var(--bg3)' }}>
                <td colSpan={3} style={{ padding:'7px 8px', fontSize:10, color:'var(--txt3)' }}>TOTAL</td>
                <td style={{ padding:'7px 8px', textAlign:'right', fontFamily:"'Syne',sans-serif", fontWeight:800, color:'var(--zc)', fontSize:13 }}>
                  {rp(totalBulanan)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      );
    } else {
      // Preview tahunan — ringkasan per member
      const rows = previewMems.map(name => {
        let total = 0; let lunas = 0;
        for (let mi = 0; mi < 12; mi++) {
          const v    = getPay(appData, activeZone, name, selYear, mi);
          const free = isFree(appData, activeZone, name, selYear, mi);
          if (v !== null || free) lunas++;
          total += v || 0;
        }
        return { name, total, lunas };
      });
      const grandTotal = rows.reduce((s, r) => s + r.total, 0);

      return (
        <div style={{ overflowX:'auto', borderRadius:8, border:'1px solid var(--border2)', marginTop:10 }}>
          <table style={{ borderCollapse:'collapse', fontSize:11, width:'100%' }}>
            <thead>
              <tr style={{ background:'var(--bg3)' }}>
                <th style={{ padding:'7px 8px', fontSize:9, color:'var(--txt4)', letterSpacing:'.06em', textAlign:'left' }}>#</th>
                <th style={{ padding:'7px 8px', fontSize:9, color:'var(--txt4)', letterSpacing:'.06em', textAlign:'left' }}>NAMA</th>
                <th style={{ padding:'7px 8px', fontSize:9, color:'var(--txt4)', letterSpacing:'.06em', textAlign:'center' }}>LUNAS</th>
                <th style={{ padding:'7px 8px', fontSize:9, color:'var(--txt4)', letterSpacing:'.06em', textAlign:'right' }}>TOTAL {selYear}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name} style={{ borderTop:'1px solid var(--border2)', background: i % 2 === 0 ? 'transparent' : 'var(--bg3)' }}>
                  <td style={{ padding:'6px 8px', color:'var(--txt4)', fontSize:10 }}>{i + 1}</td>
                  <td style={{ padding:'6px 8px', fontSize:12 }}>{r.name}</td>
                  <td style={{ padding:'6px 8px', textAlign:'center', fontSize:11 }}>
                    <span style={{ color: r.lunas === 12 ? '#4CAF50' : r.lunas > 6 ? '#FF9800' : '#e05c5c' }}>
                      {r.lunas}/12
                    </span>
                  </td>
                  <td style={{ padding:'6px 8px', textAlign:'right', fontWeight:600, color:'var(--txt)' }}>
                    {r.total > 0 ? rp(r.total) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:'2px solid var(--border)', background:'var(--bg3)' }}>
                <td colSpan={3} style={{ padding:'7px 8px', fontSize:10, color:'var(--txt3)' }}>TOTAL {selYear}</td>
                <td style={{ padding:'7px 8px', textAlign:'right', fontFamily:"'Syne',sans-serif", fontWeight:800, color:'var(--zc)', fontSize:13 }}>
                  {rp(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    }
  }

  function RekapModal() {
    if (!rekapExpanded) return null;
    const { name, month } = rekapExpanded;
    const entryVal  = getPay(appData, activeZone, name, selYear, month);
    const entryFree = isFree(appData, activeZone, name, selYear, month);
    const locked    = isLocked(name);
    const info      = appData.memberInfo?.[activeZone + '__' + name] || {};
    const tarif     = info.tarif as number | undefined;
    const quickAmts = settings?.quickAmounts || [50, 80, 90, 100, 150, 200];

    return (
      <div
        style={{ position:'fixed', inset:0, zIndex:8000, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop: Math.round(window.innerHeight * 0.18) }}
        onClick={closeModal}
      >
        <div
          style={{ background:'var(--card)', border:'1px solid var(--zc)', borderRadius:14, width:'min(320px,90vw)', boxShadow:'var(--shadow-lg)', overflow:'hidden', animation:'modalScaleIn var(--t-base)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px 10px', borderBottom:'1px solid var(--border2)' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--txt)' }}>{name}</div>
              <div style={{ fontSize:10, color:'var(--zc)', marginTop:1 }}>{activeZone} · {MONTHS[month]} {selYear}</div>
            </div>
            <button onClick={closeModal} style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt3)', width:28, height:28, borderRadius:8, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
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
                  <input
                    className="mc-input"
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    defaultValue={entryVal !== null ? String(entryVal) : ''}
                    style={{ flex:1, minWidth:0 }}
                    onChange={() => { inputDirty.current = true; }}
                    onBlur={e => manualPay(name, e.target.value, month)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        inputDirty.current = true;
                        manualPay(name, (e.target as HTMLInputElement).value, month);
                      }
                    }}
                    autoFocus
                  />
                  {entryVal !== null && (
                    <button className="delbtn" onClick={e => clearPay(name, month, e)}>✕</button>
                  )}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {tarif && (
                    <button className="qb" style={{ borderColor:'var(--zc)', color:'var(--zc)', fontWeight:700 }} onClick={() => quickPay(name, tarif, month)}>
                      {tarif} ★
                    </button>
                  )}
                  {quickAmts.filter(a => a !== tarif).map(a => (
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
        <select className="cs" style={{ flex:'none', width:'auto' }} value={selYear}
          onChange={e => { setSelYear(+e.target.value); closeModal(); setShowPreview(false); }}>
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

      {/* ── Sesi D: Preview + Download panel ── */}
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:10, padding:12, marginBottom:10, boxShadow:'var(--shadow-xs)' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12, marginBottom:10, color:'var(--txt)' }}>
          📄 Export & Preview
        </div>

        {/* Tipe preview */}
        <div style={{ fontSize:10, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:6 }}>TIPE</div>
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          <button
            onClick={() => { setPreviewMonth(null); setShowPreview(false); }}
            style={{ flex:1, padding:'7px', borderRadius:7, border:`1px solid ${previewMonth===null?'var(--zc)':'var(--border)'}`, background: previewMonth===null?'var(--zcdim)':'var(--bg3)', color: previewMonth===null?'var(--zc)':'var(--txt2)', cursor:'pointer', fontSize:11, fontWeight:600, transition:'all var(--t-fast)' }}
          >Tahunan</button>
          {MONTHS.map((m, i) => (
            <button key={i}
              onClick={() => { setPreviewMonth(i); setShowPreview(false); }}
              style={{ flex:1, padding:'7px 4px', borderRadius:7, border:`1px solid ${previewMonth===i?'var(--zc)':'var(--border)'}`, background: previewMonth===i?'var(--zcdim)':'var(--bg3)', color: previewMonth===i?'var(--zc)':'var(--txt2)', cursor:'pointer', fontSize:9, fontWeight: previewMonth===i?700:400, transition:'all var(--t-fast)', whiteSpace:'nowrap' }}
            >{m.slice(0,3)}</button>
          ))}
        </div>

        {/* Tombol Preview */}
        <button
          onClick={() => setShowPreview(v => !v)}
          style={{ width:'100%', padding:'9px', borderRadius:7, border:'1px solid var(--border)', background: showPreview?'var(--bg3)':'var(--bg4)', color:'var(--txt2)', cursor:'pointer', fontSize:12, marginBottom: showPreview?0:8, transition:'all var(--t-fast)' }}
        >
          {showPreview ? '▲ Tutup Preview' : '👁 Lihat Preview'} — {previewMonth !== null ? MONTHS[previewMonth] : 'Tahunan'} {selYear}
        </button>

        {/* Preview tabel */}
        {showPreview && <PreviewTable />}

        {/* Download buttons */}
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <button
            onClick={handleDownloadPDF}
            style={{ flex:1, padding:'9px', borderRadius:7, border:'none', background:'var(--zc)', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', boxShadow:'var(--shadow-z)', transition:'opacity var(--t-fast)' }}
          >
            ⬇ PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            style={{ flex:1, padding:'9px', borderRadius:7, border:'none', background:'#1d6f42', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', transition:'opacity var(--t-fast)' }}
          >
            ⬇ Excel
          </button>
        </div>
      </div>

      {/* Tabel rekap utama */}
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
                  <td key={mi}
                    className={`${cls}${isExp ? ' rekap-exp-cell' : ''}`}
                    onClick={() => {
                      inputDirty.current   = false;
                      modalClosing.current = false;
                      setRekapExpanded(isExp ? null : { name, month: mi });
                    }}
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
