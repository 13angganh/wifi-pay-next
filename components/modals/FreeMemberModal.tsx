// components/modals/FreeMemberModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { saveDB } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/Confirm';
import type { Zone } from '@/types';

interface Props {
  open:    boolean;
  zone:    Zone;
  name:    string;
  onClose: () => void;
}

export default function FreeMemberModal({ open, zone, name, onClose }: Props) {
  const { appData, setAppData, uid, userEmail, setSyncStatus } = useAppStore();

  const existing = appData.freeMembers?.[zone+'__'+name];
  const now = new Date();

  const [fromYear,  setFromYear]  = useState(existing?.fromYear  ?? now.getFullYear());
  const [fromMonth, setFromMonth] = useState(existing?.fromMonth ?? now.getMonth());
  const [toYear,    setToYear]    = useState(existing?.toYear    ?? now.getFullYear());
  const [toMonth,   setToMonth]   = useState(existing?.toMonth   ?? 11);
  const [noEnd,     setNoEnd]     = useState(existing ? existing.toYear === undefined : false);

  // Reset saat modal dibuka dengan member berbeda
  useEffect(() => {
    if (!open) return;
    const fm = appData.freeMembers?.[zone+'__'+name];
    setFromYear(fm?.fromYear  ?? now.getFullYear());
    setFromMonth(fm?.fromMonth ?? now.getMonth());
    setToYear(fm?.toYear      ?? now.getFullYear());
    setToMonth(fm?.toMonth    ?? 11);
    setNoEnd(fm ? fm.toYear === undefined : false);
  }, [open, zone, name]);

  if (!open) return null;

  async function persist(newData: typeof appData, action: string, detail: string) {
    setAppData(newData);
    if (!uid) return;
    setSyncStatus('loading');
    try {
      await saveDB(uid, newData, { action, detail }, userEmail || '');
      setSyncStatus('ok');
    } catch { setSyncStatus('err'); }
  }

  async function handleSave() {
    if (!noEnd && (toYear * 12 + toMonth) < (fromYear * 12 + fromMonth)) {
      showToast('Tanggal selesai harus setelah tanggal mulai', 'err');
      return;
    }
    const key      = zone + '__' + name;
    const freeData = {
      active: true, fromYear, fromMonth,
      ...(noEnd ? {} : { toYear, toMonth }),
    };
    const newData = {
      ...appData,
      freeMembers: { ...(appData.freeMembers || {}), [key]: freeData },
    };
    const detail = `Dari ${MONTHS[fromMonth]} ${fromYear}${noEnd ? ' (selamanya)' : ' s/d ' + MONTHS[toMonth] + ' ' + toYear}`;
    await persist(newData, `🆓 Set Free Member ${zone} - ${name}`, detail);
    showToast(`${name} dijadikan free member ✅`);
    onClose();
  }

  function handleRemove() {
    showConfirm(
      '💳',
      `Kembalikan <b>${name}</b> ke berbayar?<br><span style="font-size:11px;color:var(--txt3)">Status free member akan dihapus. Riwayat bayar tetap aman.</span>`,
      'Ya, Kembalikan Berbayar',
      async () => {
        const key     = zone + '__' + name;
        const newFree = { ...(appData.freeMembers || {}) };
        delete newFree[key];
        await persist({ ...appData, freeMembers: newFree }, `💳 Kembalikan ke Berbayar ${zone} - ${name}`, 'Free member dihapus');
        showToast(`${name} dikembalikan ke berbayar`);
        onClose();
      }
    );
  }

  const cs: React.CSSProperties = {
    background: 'var(--bg3)', border: '1px solid var(--border)',
    color: 'var(--txt)', padding: '7px 10px', borderRadius: 7,
    fontSize: 12, flex: 1,
  };

  return (
    <div style={{ display:'flex', position:'fixed', inset:0, background:'#000a', zIndex:9000, alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:20, width:'min(360px,95vw)', maxHeight:'85vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>

        {/* Title */}
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, marginBottom:16, color:'var(--txt)' }}>
          🆓 Free Member: {name}
        </div>

        {/* Dari */}
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:10, color:'var(--txt3)', marginBottom:5, letterSpacing:'.06em' }}>MULAI GRATIS DARI</div>
          <div style={{ display:'flex', gap:6 }}>
            <select style={cs} value={fromYear}  onChange={e => setFromYear(+e.target.value)}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select style={cs} value={fromMonth} onChange={e => setFromMonth(+e.target.value)}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Selamanya toggle */}
        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--txt2)', cursor:'pointer', marginBottom:8 }}>
          <input type="checkbox" checked={noEnd} onChange={e => setNoEnd(e.target.checked)} style={{ accentColor:'#4CAF50' }} />
          Gratis selamanya (tanpa tanggal selesai)
        </label>

        {/* Sampai */}
        {!noEnd && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:10, color:'var(--txt3)', marginBottom:5, letterSpacing:'.06em' }}>SAMPAI DENGAN</div>
            <div style={{ display:'flex', gap:6 }}>
              <select style={cs} value={toYear}  onChange={e => setToYear(+e.target.value)}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={cs} value={toMonth} onChange={e => setToMonth(+e.target.value)}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:8, marginTop:14 }}>
          <button onClick={handleSave}
            style={{ flex:1, background:'#0a2a18', border:'1px solid #4CAF50', color:'#4CAF50', padding:10, borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:12 }}>
            ✅ Simpan Free
          </button>
          {existing && (
            <button onClick={handleRemove}
              style={{ flex:1, background:'#1f0d0d', border:'1px solid #e05c5c', color:'#e05c5c', padding:10, borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:12 }}>
              💳 Kembalikan Berbayar
            </button>
          )}
        </div>
        <button onClick={onClose}
          style={{ width:'100%', marginTop:8, background:'none', border:'1px solid var(--border)', color:'var(--txt4)', padding:8, borderRadius:8, cursor:'pointer', fontSize:12 }}>
          Batal
        </button>
      </div>
    </div>
  );
}
