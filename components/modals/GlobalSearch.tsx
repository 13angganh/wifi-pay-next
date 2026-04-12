// components/modals/GlobalSearch.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { getPay, isFree, rp } from '@/lib/helpers';

interface Props { open: boolean; onClose: () => void; }

export default function GlobalSearch({ open, onClose }: Props) {
  const router = useRouter();
  const { appData, selYear, selMonth, setView, setZone, setExpandedCard } = useAppStore();
  const [q, setQ] = useState('');
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  if (!open) return null;

  // Cari di semua zona
  const results: { z: 'KRS'|'SLK'; name: string; paid: boolean; free: boolean; val: number|null; id?: string; ip?: string; tarif?: number }[] = [];
  for (const z of ['KRS','SLK'] as const) {
    const mems = z === 'KRS' ? appData.krsMembers : appData.slkMembers;
    for (const name of mems) {
      if (!q.trim() || name.toLowerCase().includes(q.toLowerCase())) {
        const info = appData.memberInfo?.[z+'__'+name] || {};
        const val  = getPay(appData, z, name, selYear, selMonth);
        results.push({ z, name, paid: val !== null, free: isFree(appData, z, name, selYear, selMonth), val, id: info.id as string, ip: info.ip as string, tarif: info.tarif as number });
      }
    }
  }

  function gotoMember(z: 'KRS'|'SLK', name: string) {
    setZone(z);
    setView('entry');
    setExpandedCard(name);
    router.push('/entry');
    onClose();
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9000, background:'#000b', display:'flex', flexDirection:'column', padding:'16px 14px', animation:'modalBgIn .18s ease' }}>
      <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:'env(safe-area-inset-top)', animation:'modalSlideUp .22s cubic-bezier(.4,0,.2,1)' }}>
        <input
          ref={inputRef}
          style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--txt)', padding:'12px 16px', borderRadius:12, fontSize:14, fontFamily:"'DM Mono',monospace", outline:'none', transition:'border-color var(--t-fast)', boxShadow:'var(--shadow-sm)' }}
          placeholder="🔍 Cari nama member..."
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--zc)'}
          onBlur={e  => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
        />
        <button onClick={onClose} style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt2)', padding:'10px 14px', borderRadius:10, cursor:'pointer', fontSize:13, flexShrink:0, transition:'all var(--t-fast)' }}>✕</button>
      </div>

      <div style={{ flex:1, overflowY:'auto', marginTop:10 }}>
        {!q.trim()
          ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">Cari Member</div>
              <div className="empty-sub">Ketik nama member untuk mencari di semua zona</div>
            </div>
          )
          : results.length === 0
            ? (
              <div className="empty-state">
                <div className="empty-icon">😶</div>
                <div className="empty-title">Tidak Ditemukan</div>
                <div className="empty-sub">Tidak ada member dengan nama &ldquo;{q}&rdquo;</div>
              </div>
            )
            : results.map(r => (
                <div key={r.z+r.name} className="gsr-item" onClick={() => gotoMember(r.z, r.name)}>
                  <span style={{ fontSize:9, padding:'2px 7px', borderRadius:4, fontWeight:600, flexShrink:0, background: r.z==='KRS'?'#1e2a40':'#3d1f14', color: r.z==='KRS'?'#2196F3':'#e05c3a' }}>{r.z}</span>
                  <div style={{ flex:1 }}>
                    <div className="gsr-name">{r.name}</div>
                    {r.id && <div style={{ fontSize:9, color:'var(--txt4)' }}>{r.id}{r.ip?' · '+r.ip:''}</div>}
                  </div>
                  <div className="gsr-detail">
                    {r.free
                      ? <span style={{ color:'#4CAF50' }}>🆓 Free</span>
                      : r.paid && r.val === 0
                        ? <span style={{ color:'#3a9e7a' }}>✓ Akumulasi</span>
                        : r.paid
                          ? <span style={{ color:'#4CAF50' }}>✓ {r.val?.toLocaleString('id-ID')}</span>
                          : <span style={{ color:'#e05c5c' }}>✕ Belum</span>}
                    {r.tarif && <div style={{ fontSize:9, color:'var(--txt4)' }}>Tarif: {rp(r.tarif)}</div>}
                  </div>
                </div>
              ))
        }
      </div>
    </div>
  );
}
