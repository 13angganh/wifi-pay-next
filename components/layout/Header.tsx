// components/layout/Header.tsx — Sesi 5B: sync pill + Lucide + touch target
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { saveDB } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import GlobalSearch from '@/components/modals/GlobalSearch';
import {
  Wifi, Menu, Lock, LockOpen, Search, Sun, Moon,
  Cloud, RotateCw, AlertTriangle, WifiOff,
} from 'lucide-react';

interface Props { onToggleSidebar: () => void; }

export default function Header({ onToggleSidebar }: Props) {
  const {
    activeZone, setZone,
    globalLocked, setGlobalLocked,
    syncStatus, darkMode, toggleTheme,
    appData, uid, setSyncStatus,
  } = useAppStore();

  const [searchOpen, setSearchOpen] = useState(false);

  function handleZone(z: 'KRS' | 'SLK') {
    setZone(z);
    const color  = z === 'KRS' ? '#3B82F6' : '#F97316';
    const colorR = z === 'KRS' ? '59,130,246' : '249,115,22';
    document.documentElement.style.setProperty('--zc', color);
    document.documentElement.style.setProperty('--zc-rgb', colorR);
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
    showToast(next ? 'Entry dikunci' : 'Entry dibuka', next ? 'info' : 'ok');
  }

  // Sync pill config
  const syncConfigs = {
    ok:      { icon: <Cloud size={12} strokeWidth={1.5} />,         label: 'Tersimpan',  cls: 'sync-pill ok'      },
    loading: { icon: <RotateCw size={12} strokeWidth={1.5} />,      label: 'Menyimpan',  cls: 'sync-pill loading' },
    err:     { icon: <AlertTriangle size={12} strokeWidth={1.5} />, label: 'Gagal sync', cls: 'sync-pill err'     },
    offline: { icon: <WifiOff size={12} strokeWidth={1.5} />,       label: 'Offline',    cls: 'sync-pill offline' },
  };
  const syncCfg = syncConfigs[syncStatus as keyof typeof syncConfigs] ?? syncConfigs.ok;

  return (
    <>
      <div id="header">
        {/* Row 1: hamburger + logo + zone switch */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <button
            id="hamburger"
            className="hbtn"
            style={{ padding:'0 8px', flexShrink:0, minWidth:40, minHeight:40, display:'flex', alignItems:'center', justifyContent:'center' }}
            onClick={onToggleSidebar}
            aria-label="Buka menu"
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:30, height:30, borderRadius:8,
              background:'linear-gradient(135deg,var(--zc),color-mix(in srgb,var(--zc) 70%,#000))',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, boxShadow:'var(--shadow-z)',
            }}>
              <Wifi size={16} color="#fff" strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, letterSpacing:'-.02em' }}>
                WiFi Pay
              </div>
              <div style={{ fontSize:9, color:'var(--txt4)' }}>v11.1 Next</div>
            </div>
          </div>

          {/* Zone switch */}
          <div className="zone-sw" style={{ marginLeft:'auto' }}>
            <button
              className={`zbtn ${activeZone === 'KRS' ? 'krs' : ''}`}
              onClick={() => handleZone('KRS')}
              aria-label="Zona KRS"
            >KRS</button>
            <button
              className={`zbtn ${activeZone === 'SLK' ? 'slk' : ''}`}
              onClick={() => handleZone('SLK')}
              aria-label="Zona SLK"
            >SLK</button>
          </div>
        </div>

        {/* Row 2: sync pill + action buttons */}
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {/* Sync pill */}
          <div
            className={syncCfg.cls}
            role="status"
            aria-live="polite"
            aria-label={`Status sync: ${syncCfg.label}`}
          >
            <span className={syncStatus === 'loading' ? 'sync-spin' : ''}>
              {syncCfg.icon}
            </span>
            <span>{syncCfg.label}</span>
          </div>

          <span style={{ flex:1 }} />

          {/* Kunci/Buka entry */}
          <button
            className="hbtn"
            style={{
              color: globalLocked ? 'var(--c-belum)' : 'var(--c-lunas)',
              display:'flex', alignItems:'center', gap:4,
              minWidth:40, minHeight:40,
            }}
            onClick={toggleGlobalLock}
            aria-label={globalLocked ? 'Buka kunci entry' : 'Kunci entry'}
            title={globalLocked ? 'Buka kunci entry' : 'Kunci entry'}
          >
            {globalLocked
              ? <Lock size={14} strokeWidth={1.5} />
              : <LockOpen size={14} strokeWidth={1.5} />
            }
            <span style={{ fontSize:9 }}>{globalLocked ? 'KUNCI' : 'BUKA'}</span>
          </button>

          {/* Pencarian */}
          <button
            className="hbtn"
            style={{ minWidth:40, minHeight:40, display:'flex', alignItems:'center', justifyContent:'center' }}
            onClick={() => setSearchOpen(true)}
            aria-label="Cari member"
            title="Cari member"
          >
            <Search size={16} strokeWidth={1.5} />
          </button>

          {/* Toggle tema */}
          <button
            className="hbtn"
            style={{ minWidth:40, minHeight:40, display:'flex', alignItems:'center', justifyContent:'center' }}
            onClick={toggleTheme}
            aria-label={darkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            title={darkMode ? 'Mode terang' : 'Mode gelap'}
          >
            {darkMode
              ? <Sun size={16} strokeWidth={1.5} />
              : <Moon size={16} strokeWidth={1.5} />
            }
          </button>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
