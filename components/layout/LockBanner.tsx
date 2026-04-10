// components/layout/LockBanner.tsx - FIXED: inline flow bukan fixed
'use client';
import { useAppStore } from '@/store/useAppStore';

export default function LockBanner() {
  const { globalLocked, setGlobalLocked } = useAppStore();
  if (!globalLocked) return null;
  return (
    <div className="lock-banner show">
      <span style={{ fontSize:12, color:'#F44336', flex:1 }}>
        🔒 Entry terkunci — buka di tombol kunci
      </span>
      <button
        onClick={() => setGlobalLocked(false)}
        style={{ background:'#F44336', border:'none', color:'#fff', padding:'4px 12px', borderRadius:6, cursor:'pointer', fontSize:11, flexShrink:0 }}
      >
        Buka
      </button>
    </div>
  );
}
