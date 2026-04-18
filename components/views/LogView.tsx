// components/views/LogView.tsx — Sesi 5D: Lucide icons
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { fuzzyMatch } from '@/lib/helpers'
import { useT } from '@/hooks/useT';
import { ScrollText, Search, User, X, RotateCcw } from 'lucide-react';

export default function LogView() {
  const { appData, logSearch, setLogSearch, logType, setLogType } = useAppStore();
  const [logYear,  setLogYear]  = useState('');
  const [logMonth, setLogMonth] = useState('');
  const [logName,  setLogName]  = useState('');
  const t = useT();

  const logs = appData.activityLog || [];

  let filtered = [...logs];
  if (logType === 'pay') {
    filtered = filtered.filter(l => l.action && (
      l.action.includes('💰') || l.action.includes('🗑️ Hapus bayar') ||
      l.action.includes('Quick Pay') || l.action.includes('🆓')
    ));
  }
  if (logSearch.trim()) {
    const q = logSearch.trim().toLowerCase();
    filtered = filtered.filter(l => (l.action || '').toLowerCase().includes(q) || (l.detail || '').toLowerCase().includes(q));
  }
  if (logName.trim()) {
    filtered = filtered.filter(l =>
      fuzzyMatch(l.action || '', logName) || fuzzyMatch(l.detail || '', logName)
    );
  }
  if (logYear)  filtered = filtered.filter(l => new Date(l.ts).getFullYear() === +logYear);
  if (logMonth) filtered = filtered.filter(l => new Date(l.ts).getMonth() === +logMonth);

  function reset() { setLogSearch(''); setLogYear(''); setLogMonth(''); setLogType('all'); setLogName(''); }

  const isPayLog = (action: string) =>
    action && (action.includes('💰') || action.includes('🗑️ Hapus bayar') || action.includes('🆓') || action.includes('Quick Pay'));

  return (
    <div>
      {/* Type filter tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:8, background:'var(--bg3)', padding:3, borderRadius:20, border:'1px solid var(--border)' }}>
        <button onClick={() => setLogType('all')} style={{ flex:1, padding:6, borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, transition:'all var(--t-fast)', background: logType==='all' ? 'var(--zc)' : 'transparent', color: logType==='all' ? '#fff' : 'var(--txt3)', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
          <ScrollText size={11} /> {t('common.all')}
        </button>
        <button onClick={() => setLogType('pay')} style={{ flex:1, padding:6, borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, transition:'all var(--t-fast)', background: logType==='pay' ? 'var(--c-lunas)' : 'transparent', color: logType==='pay' ? '#0a0c12' : 'var(--txt3)', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
          {t('log.payOnly')}
        </button>
      </div>

      {/* Search aksi */}
      <div className="search-wrap" style={{ marginBottom:8, position:'relative', display:'flex', alignItems:'center' }}>
        <Search size={13} style={{ position:'absolute', left:10, color:'var(--txt4)', pointerEvents:'none' }} />
        <input className="search-box" style={{ margin:0, paddingLeft:30 }} placeholder={t('log.searchPlaceholder')} value={logSearch} onChange={e => setLogSearch(e.target.value)} />
        {logSearch && <button className="search-clear" onClick={() => setLogSearch('')} aria-label="Hapus pencarian"><X size={12} /></button>}
      </div>

      {/* Filter nama */}
      <div className="search-wrap" style={{ marginBottom:8, position:'relative', display:'flex', alignItems:'center' }}>
        <User size={13} style={{ position:'absolute', left:10, color:'var(--txt4)', pointerEvents:'none' }} />
        <input className="search-box" style={{ margin:0, paddingLeft:30 }} placeholder={t('log.filterName')} value={logName} onChange={e => setLogName(e.target.value)} />
        {logName && <button className="search-clear" onClick={() => setLogName('')} aria-label="Hapus filter"><X size={12} /></button>}
      </div>

      {/* Date filter */}
      <div style={{ display:'flex', gap:6 }}>
        <select className="cs" style={{ flex:1 }} value={logYear} onChange={e => setLogYear(e.target.value)}>
          <option value="">{t('log.allYears')}</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="cs" style={{ flex:1 }} value={logMonth} onChange={e => setLogMonth(e.target.value)}>
          <option value="">{t('log.allMonths')}</option>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <button onClick={reset} aria-label={`${t('action.reset')} filter`} style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt3)', padding:'6px 10px', borderRadius:'var(--r-sm)', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', gap:4, transition:'all var(--t-fast)' }}>
          <RotateCcw size={12} /> {t('action.reset')}
        </button>
      </div>

      <div style={{ fontSize:10, color:'var(--txt3)', margin:'10px 0', letterSpacing:'.06em', fontFamily:"'DM Sans',sans-serif" }}>
        {filtered.length} dari {logs.length} {t('log.autoDelete')}
      </div>

      {/* Log items */}
      <div id="log-items">
        {filtered.length === 0
          ? (
            <div className="empty-state">
              <div className="empty-icon"><ScrollText size={28} color="var(--txt5)" /></div>
              <div className="empty-title">{t('log.empty')}</div>
              <div className="empty-sub">{t('log.emptyDesc')}</div>
            </div>
          )
          : filtered.slice(0, 150).map((l, i) => {
            const d  = new Date(l.ts);
            const dt = `${d.toLocaleDateString()} ${d.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' })}`;
            const isPay = isPayLog(l.action);
            return (
              <div key={i} className="log-item" style={{ borderLeft: `2px solid ${isPay ? 'rgba(34,197,94,0.4)' : 'var(--border)'}` }}>
                <div className="log-time">{dt} · {l.user || '—'}</div>
                <div className="log-action">{l.action}</div>
                {l.detail && <div className="log-detail">{l.detail}</div>}
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
