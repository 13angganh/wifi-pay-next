// components/layout/Header.tsx — Sesi B: bersih, hanya 3 tombol
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { saveDB } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import GlobalSearch from '@/components/modals/GlobalSearch';

interface Props { onToggleSidebar: () => void; }

export default function Header({ onToggleSidebar }: Props) {
  const {
    activeZone, setZone,
    globalLocked, setGlobalLocked,
    syncStatus, darkMode, toggleTheme,
    appData, uid, setSyncStatus,
  } = useAppStore();

  const [searchOpen, setSearchOpen] = useState(false);

  const zc = activeZone === 'KRS' ? '#2196F3' : '#e05c3a';

  function handleZone(z: 'KRS' | 'SLK') {
    setZone(z);
    const color = z === 'KRS' ? '#2196F3' : '#e05c3a';
    document.documentElement.style.setProperty('--zc', color);
    document.documentElement.style.setProperty('--zcdim', color + '22');
  }

  async function toggleGlobalLock() {
    const next = !globalLocked;
    setGlobalLocked(next);
    if (uid) {
      try {
        setSyncStatus('loading');
        await saveDB(uid, { ...appData, _globalLocked: next });
        setSyncStatus('ok');
      } catch { setSyncStatus('err'); }
    }
    showToast(next ? '🔒 Entry dikunci' : '🔓 Entry dibuka');
  }

  return (
    <>
      <div id="header">
        {/* Row 1: hamburger + logo + zone switch */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <button
            id="hamburger"
            className="hbtn"
            style={{ padding:'5px 8px', flexShrink:0 }}
            onClick={onToggleSidebar}
          >
            ☰
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${zc},${zc}bb)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, boxShadow:'var(--shadow-z)' }}>
              📶
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, letterSpacing:'-.02em' }}>
                WiFi Pay
              </div>
              <div style={{ fontSize:9, color:'var(--txt4)' }}>v11.0 Next</div>
            </div>
          </div>

          {/* Zone switch */}
          <div className="zone-sw" style={{ marginLeft:'auto' }}>
            <button className={`zbtn ${activeZone === 'KRS' ? 'krs' : ''}`} onClick={() => handleZone('KRS')}>KRS</button>
            <button className={`zbtn ${activeZone === 'SLK' ? 'slk' : ''}`} onClick={() => handleZone('SLK')}>SLK</button>
          </div>
        </div>

        {/* Row 2: sync dot + 3 tombol saja */}
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {/* Sync indicator — dot saja tanpa teks */}
          <span
            className={`sync-dot ${syncStatus !== 'ok' ? 'off' : ''}`}
            title={syncStatus === 'ok' ? 'Tersimpan' : syncStatus === 'loading' ? 'Menyimpan...' : syncStatus === 'err' ? 'Gagal sync' : 'Offline'}
            style={{ marginRight:4 }}
          />

          <span style={{ flex:1 }} />

          {/* Kunci/Buka entry */}
          <button
            className="hbtn"
            style={{ color: globalLocked ? '#e05c5c' : '#4CAF50', display:'flex', alignItems:'center', gap:4 }}
            onClick={toggleGlobalLock}
            title={globalLocked ? 'Buka kunci entry' : 'Kunci entry'}
          >
            {globalLocked ? '🔒' : '🔓'}
            <span style={{ fontSize:9 }}>{globalLocked ? 'KUNCI' : 'BUKA'}</span>
          </button>

          {/* Pencarian */}
          <button
            className="hbtn"
            onClick={() => setSearchOpen(true)}
            title="Cari member"
          >
            🔍
          </button>

          {/* Toggle tema */}
          <button
            className="hbtn"
            onClick={toggleTheme}
            title={darkMode ? 'Mode terang' : 'Mode gelap'}
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
