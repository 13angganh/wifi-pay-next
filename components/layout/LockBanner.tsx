// components/layout/LockBanner.tsx — Sesi 5B: Lucide Lock, sistem baru
'use client';

import { useAppStore } from '@/store/useAppStore';
import { Lock } from 'lucide-react';

export default function LockBanner() {
  const { globalLocked, setGlobalLocked } = useAppStore();
  if (!globalLocked) return null;

  return (
    <div className="lock-banner show" style={{
      display:'flex', alignItems:'center',
      gap:8, padding:'8px var(--sp-3)',
      background:'rgba(239,68,68,0.08)',
      borderBottom:'1px solid rgba(239,68,68,0.16)',
    }}>
      <Lock size={13} strokeWidth={1.5} style={{ color:'var(--c-belum)', flexShrink:0 }} />
      <span style={{ fontSize:12, color:'var(--c-belum)', flex:1, fontFamily:"'DM Sans',sans-serif" }}>
        Entry terkunci — ketuk untuk membuka
      </span>
      <button
        onClick={() => setGlobalLocked(false)}
        aria-label="Buka kunci entry"
        style={{
          background:'var(--c-belum)', border:'none',
          color:'#fff', padding:'4px 12px',
          borderRadius:'var(--r-sm)',
          cursor:'pointer', fontSize:11,
          flexShrink:0,
          fontFamily:"'DM Sans',sans-serif",
          fontWeight:500,
          minHeight:28,
          transition:'opacity var(--t-fast) var(--ease-smooth)',
        }}
      >
        Buka
      </button>
    </div>
  );
}
