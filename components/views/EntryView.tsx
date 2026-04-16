// components/views/EntryView.tsx — Sesi 5C: batch action + fuzzy + left border + Lucide
'use client';

import { useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getPay, isLunas, isFree, rp, fuzzyMatch } from '@/lib/helpers';
import { saveDB } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import MemberCard from './MemberCard';
import {
  ClipboardList, CheckCircle2, Clock, Gift,
  Search, X, Smartphone,
  CheckCheck, XCircle, Users,
} from 'lucide-react';

export default function EntryView() {
  const {
    appData, setAppData, uid, userEmail,
    activeZone, selYear, selMonth, setSelYear, setSelMonth,
    search, setSearch,
    filterStatus, setFilter,
    deferredPrompt,
    setEntryScrollTop,
    globalLocked,
    setSyncStatus,
    batchMode, batchSelected, batchYear, batchMonth,
    setBatchMode, setBatchPeriod, toggleBatchMember, clearBatch,
  } = useAppStore();

  const mems = activeZone === 'KRS' ? appData.krsMembers : appData.slkMembers;

  const freeCount = mems.filter(m => isFree(appData, activeZone, m, selYear, selMonth)).length;
  const paid      = mems.filter(m => isLunas(appData, activeZone, m, selYear, selMonth) && !isFree(appData, activeZone, m, selYear, selMonth)).length;
  const unpaid    = mems.filter(m => getPay(appData, activeZone, m, selYear, selMonth) === null && !isFree(appData, activeZone, m, selYear, selMonth)).length;
  const total     = mems.reduce((s, m) => s + (getPay(appData, activeZone, m, selYear, selMonth) || 0), 0);

  const potensiUnpaid = mems.reduce((sum, m) => {
    const belum = getPay(appData, activeZone, m, selYear, selMonth) === null
      && !isFree(appData, activeZone, m, selYear, selMonth);
    if (!belum) return sum;
    const info  = appData.memberInfo?.[activeZone + '__' + m] || {};
    const tarif = info.tarif as number | undefined;
    return sum + (tarif ?? 0);
  }, 0);

  type FilterType = 'all' | 'paid' | 'unpaid' | 'free';
  const filterStatus2 = filterStatus as FilterType;

  const filtered = mems.filter(name => {
    if (!fuzzyMatch(name, search)) return false;
    if (filterStatus2 === 'paid')   return isLunas(appData, activeZone, name, selYear, selMonth) && !isFree(appData, activeZone, name, selYear, selMonth);
    if (filterStatus2 === 'unpaid') return getPay(appData, activeZone, name, selYear, selMonth) === null && !isFree(appData, activeZone, name, selYear, selMonth);
    if (filterStatus2 === 'free')   return isFree(appData, activeZone, name, selYear, selMonth);
    return true;
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setEntryScrollTop((e.target as HTMLDivElement).scrollTop);
  }, [setEntryScrollTop]);

  const chips: { key: FilterType; icon: React.ReactNode; label: string; count?: number }[] = [
    { key: 'all',    icon: <ClipboardList size={12} />, label: 'Semua' },
    { key: 'paid',   icon: <CheckCircle2  size={12} />, label: 'Lunas',  count: paid },
    { key: 'unpaid', icon: <Clock         size={12} />, label: 'Belum',  count: unpaid },
    { key: 'free',   icon: <Gift          size={12} />, label: 'Free',   count: freeCount },
  ];

  function startBatch(name: string) {
    if (globalLocked) { showToast('Data terkunci! Unlock dulu', 'err'); return; }
    setBatchMode(true);
    setBatchPeriod(selYear, selMonth);
    toggleBatchMember(name);
  }

  async function executeBatch() {
    if (batchSelected.length === 0) return;
    if (globalLocked) { showToast('Data terkunci! Unlock dulu', 'err'); return; }

    const newData = { ...appData, payments: { ...appData.payments } };
    const details: string[] = [];

    for (const name of batchSelected) {
      const info  = appData.memberInfo?.[activeZone + '__' + name] || {};
      const tarif = info.tarif as number | undefined;
      if (!tarif) continue;
      const k = `${activeZone}__${name}__${batchYear}__${batchMonth}`;
      newData.payments[k] = tarif;
      details.push(`${name}: ${rp(tarif)}`);
    }

    const skipped = batchSelected.filter(name => {
      const info = appData.memberInfo?.[activeZone + '__' + name] || {};
      return !(info.tarif as number | undefined);
    });

    if (details.length === 0) {
      showToast('Tidak ada member dengan tarif terdaftar', 'err');
      return;
    }

    setAppData(newData);
    if (uid) {
      setSyncStatus('loading');
      try {
        await saveDB(uid, newData, {
          action: `💰 Batch Pay Entry ${activeZone} - ${details.length} member - ${MONTHS[batchMonth]} ${batchYear}`,
          detail: details.join(', '),
        }, userEmail || '');
        setSyncStatus('ok');
      } catch { setSyncStatus('err'); }
    }
    showToast(`✓ ${details.length} member berhasil ditandai lunas`);
    if (skipped.length > 0) {
      setTimeout(() => showToast(`${skipped.length} member dilewati (belum ada tarif)`, 'info'), 800);
    }
    clearBatch();
  }

  useEffect(() => {
    if (!batchMode) setBatchPeriod(selYear, selMonth);
  }, [selYear, selMonth, batchMode]);

  const batchPreview = batchSelected.map(name => {
    const info  = appData.memberInfo?.[activeZone + '__' + name] || {};
    const tarif = info.tarif as number | undefined;
    return { name, tarif };
  });

  const zc = activeZone === 'KRS' ? 'var(--zc-krs)' : 'var(--zc-slk)';

  return (
    <div onScroll={handleScroll}>
      {/* PWA install banner */}
      {deferredPrompt && (
        <div className="inst-banner">
          <div className="inst-txt" style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Smartphone size={14} />
            Install WiFi Pay ke layar beranda!
          </div>
          <button className="inst-btn" onClick={() => { (deferredPrompt as any).prompt(); }}>Install</button>
        </div>
      )}

      {/* Batch mode header */}
      {batchMode ? (
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'var(--bg2)', border:`1px solid ${zc}`,
          borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:10,
          boxShadow:`0 0 0 1px ${zc}22`,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button
              onClick={clearBatch}
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--txt2)', display:'flex', padding:4, borderRadius:6 }}
              aria-label="Keluar batch mode"
            >
              <X size={18} />
            </button>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:'var(--txt)' }}>
                {batchSelected.length} Member Dipilih
              </div>
              <div style={{ fontSize:10, color:'var(--txt3)' }}>
                {MONTHS[batchMonth]} {batchYear} · {activeZone}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const allNames = filtered.map(n => n);
              const allSelected = allNames.every(n => batchSelected.includes(n));
              useAppStore.getState().setBatchSelected(allSelected ? [] : allNames);
            }}
            style={{
              background:'none', border:'1px solid var(--border)', color:'var(--txt2)',
              padding:'6px 12px', borderRadius:'var(--r-sm)', cursor:'pointer', fontSize:11,
              display:'flex', alignItems:'center', gap:6, minHeight:36,
            }}
          >
            <Users size={12} />
            Pilih Semua
          </button>
        </div>
      ) : (
        /* Summary bar */
        <div className="sum-bar">
          <div>
            <div className="sum-lbl">{MONTHS[selMonth]} {selYear} · {activeZone}</div>
            <div className="sum-val">{rp(total)}</div>
          </div>
          <div style={{ display:'flex', gap:10, fontSize:11, alignItems:'center' }}>
            <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--c-lunas)' }}>
              <CheckCircle2 size={12} /> {paid}
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--c-belum)' }}>
              <XCircle size={12} /> {unpaid}
            </span>
            {freeCount > 0 && (
              <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--c-free)' }}>
                <Gift size={12} /> {freeCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Potensi belum lunas */}
      {!batchMode && unpaid > 0 && potensiUnpaid > 0 && (
        <div style={{
          background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)',
          borderRadius:'var(--r-md)', padding:'10px 16px', marginBottom:10,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div>
            <div style={{ fontSize:9, color:'rgba(239,68,68,0.6)', letterSpacing:'.06em', textTransform:'uppercase' }}>Potensi Belum Masuk</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:'var(--c-belum)' }}>
              {rp(potensiUnpaid)}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, color:'var(--txt4)' }}>dari {unpaid} member belum bayar</div>
            <div style={{ fontSize:9, color:'var(--txt4)', marginTop:2 }}>berdasarkan tarif terdaftar</div>
          </div>
        </div>
      )}

      {/* Period selector */}
      {!batchMode && (
        <div className="ctrl-row">
          <select className="cs" value={selYear} onChange={e => setSelYear(+e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="cs" value={selMonth} onChange={e => setSelMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <span style={{ fontSize:11, color:'var(--txt3)', alignSelf:'center' }}>{MONTHS[selMonth]} {selYear}</span>
        </div>
      )}

      {/* Filter chips */}
      {!batchMode && (
        <div style={{ display:'flex', gap:5, marginBottom:10, flexWrap:'wrap' }}>
          {chips.map(({ key, icon, label, count }) => (
            <button
              key={key}
              className={`fchip ${filterStatus2 === key ? 'on' : ''}`}
              onClick={() => setFilter(key as any)}
              style={{ minHeight:36, display:'flex', alignItems:'center', gap:5 }}
            >
              {icon}
              {label}{count !== undefined ? ` (${count})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      {!batchMode && (
        <>
          <div className="search-wrap" style={{ position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--txt4)', pointerEvents:'none' }} />
            <input
              className="search-box"
              placeholder={`Cari nama di ${activeZone}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft:32 }}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Hapus pencarian">
                <X size={12} />
              </button>
            )}
          </div>
          <div style={{ fontSize:10, color:'var(--txt4)', marginBottom:8 }}>
            {filtered.length} member{search ? ' ditemukan' : ''} · {activeZone}
          </div>
        </>
      )}

      {/* Member cards */}
      <div id="entry-cards">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ClipboardList size={32} strokeWidth={1.2} />
            </div>
            <div className="empty-title">Tidak Ada Member</div>
            <div className="empty-sub">Tambahkan member di menu Member</div>
          </div>
        ) : (
          filtered.map((name, i) => (
            <MemberCard
              key={name}
              name={name}
              index={i}
              batchMode={batchMode}
              batchSelected={batchSelected.includes(name)}
              onLongPress={() => startBatch(name)}
              onBatchToggle={() => {
                if (batchMode) toggleBatchMember(name);
              }}
            />
          ))
        )}
      </div>

      {/* Batch bottom sheet */}
      {batchMode && batchSelected.length > 0 && (
        <div style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:200,
          background:'rgba(24,28,39,0.95)',
          backdropFilter:'blur(16px)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderBottom:'none',
          borderRadius:'var(--r-lg) var(--r-lg) 0 0',
          padding:'20px 16px',
          boxShadow:'0 -8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'var(--bg4)', margin:'0 auto 16px' }} />
          <div style={{ fontSize:11, color:'var(--txt3)', marginBottom:10, fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase' }}>
            Preview · {MONTHS[batchMonth]} {batchYear}
          </div>
          <div style={{ maxHeight:180, overflowY:'auto', marginBottom:14 }}>
            {batchPreview.map(({ name, tarif }) => (
              <div key={name} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'8px 0', borderBottom:'1px solid var(--border2)',
              }}>
                <span style={{ fontSize:13, color:'var(--txt)', fontFamily:"'DM Mono',monospace" }}>{name}</span>
                <span style={{ fontSize:12, fontWeight:600, color: tarif ? 'var(--c-lunas)' : 'var(--txt4)' }}>
                  {tarif ? rp(tarif) : <span style={{ fontSize:10 }}>Belum ada tarif</span>}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, marginBottom:16 }}>
            <span style={{ fontSize:11, color:'var(--txt3)' }}>Total</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'var(--txt)' }}>
              {rp(batchPreview.reduce((s, { tarif }) => s + (tarif || 0), 0))}
            </span>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button
              onClick={clearBatch}
              style={{
                flex:1, padding:'12px 0', border:'1px solid var(--border)',
                background:'none', color:'var(--txt2)', borderRadius:'var(--r-sm)',
                cursor:'pointer', fontSize:13, fontWeight:600, minHeight:44,
              }}
            >
              Batal
            </button>
            <button
              onClick={executeBatch}
              style={{
                flex:2, padding:'12px 0', border:'none',
                background: zc, color:'#fff', borderRadius:'var(--r-sm)',
                cursor:'pointer', fontSize:13, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                minHeight:44,
              }}
            >
              <CheckCheck size={16} />
              Tandai Lunas Semua
            </button>
          </div>
        </div>
      )}

      {batchMode && batchSelected.length > 0 && <div style={{ height:300 }} />}
    </div>
  );
}
