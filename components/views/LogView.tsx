// components/views/LogView.tsx
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';

export default function LogView() {
  const { appData, logSearch, setLogSearch, logType, setLogType } = useAppStore();
  const [logYear,  setLogYear]  = useState('');
  const [logMonth, setLogMonth] = useState('');
  const [logName,  setLogName]  = useState('');

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
    const qn = logName.trim().toLowerCase();
    filtered = filtered.filter(l => (l.action || '').toLowerCase().includes(qn) || (l.detail || '').toLowerCase().includes(qn));
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
        <button onClick={() => setLogType('all')} style={{ flex:1, padding:6, borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background: logType==='all' ? '#2196F3' : 'transparent', color: logType==='all' ? '#fff' : 'var(--txt3)' }}>📋 Semua</button>
        <button onClick={() => setLogType('pay')} style={{ flex:1, padding:6, borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background: logType==='pay' ? '#4CAF50' : 'transparent', color: logType==='pay' ? '#0a0c12' : 'var(--txt3)' }}>💰 Hanya Bayar</button>
      </div>

      {/* Search */}
      <div className="search-wrap" style={{ marginBottom:8 }}>
        <input className="search-box" style={{ margin:0 }} placeholder="🔍 Cari nama / aksi..." value={logSearch} onChange={e => setLogSearch(e.target.value)} />
        {logSearch && <button className="search-clear" onClick={() => setLogSearch('')}>✕</button>}
      </div>

      {/* Date filter */}
      {/* Filter nama member */}
      <div className="search-wrap" style={{ marginBottom:8 }}>
        <input className="search-box" style={{ margin:0 }} placeholder="👤 Filter nama member..." value={logName} onChange={e => setLogName(e.target.value)} />
        {logName && <button className="search-clear" onClick={() => setLogName('')}>✕</button>}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <select className="cs" style={{ flex:1 }} value={logYear} onChange={e => setLogYear(e.target.value)}>
          <option value="">Semua Tahun</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="cs" style={{ flex:1 }} value={logMonth} onChange={e => setLogMonth(e.target.value)}>
          <option value="">Semua Bulan</option>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <button onClick={reset} style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt3)', padding:'6px 10px', borderRadius:7, cursor:'pointer', fontSize:11 }}>Reset</button>
      </div>

      <div style={{ fontSize:10, color:'var(--txt3)', margin:'10px 0', letterSpacing:'.06em' }}>
        {filtered.length} dari {logs.length} LOG · Semua log dihapus otomatis 30 hari
      </div>

      {/* Log items */}
      <div id="log-items">
        {filtered.length === 0
          ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">Tidak Ada Log</div><div className="empty-sub">Belum ada aktivitas yang tercatat</div></div>
          : filtered.slice(0, 150).map((l, i) => {
            const d  = new Date(l.ts);
            const dt = `${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}`;
            const isPay = isPayLog(l.action);
            return (
              <div key={i} className="log-item" style={{ borderLeft: `2px solid ${isPay ? '#4CAF5044' : 'var(--border)'}` }}>
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
