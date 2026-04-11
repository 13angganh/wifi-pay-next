// components/layout/Header.tsx - FIXED: hapus tombol akun dari header
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { saveDB } from '@/lib/db';
import { doWASummary } from '@/lib/export';
import { showToast } from '@/components/ui/Toast';
import ShareModal   from '@/components/modals/ShareModal';
import ExportModal  from '@/components/modals/ExportModal';
import GlobalSearch from '@/components/modals/GlobalSearch';
import ImportInput, { triggerImport } from '@/components/modals/ImportModal';

interface Props { onToggleSidebar: () => void; }

export default function Header({ onToggleSidebar }: Props) {
  const {
    activeZone, setZone,
    globalLocked, setGlobalLocked,
    syncStatus, darkMode, toggleTheme,
    userName, userEmail,
    appData, uid, setSyncStatus,
  } = useAppStore();

  const [shareOpen,  setShareOpen]  = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
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

  const syncLabel: Record<string, string> = {
    ok:'tersimpan', loading:'menyimpan...', err:'gagal sync', offline:'offline',
  };

  return (
    <>
      <div id="header">
        {/* Row 1: hamburger + logo + zone switch */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          {/* Hamburger — selalu tampil, buka/tutup sidebar */}
          <button
            id="hamburger"
            className="hbtn"
            style={{ padding:'5px 8px', flexShrink:0 }}
            onClick={onToggleSidebar}
          >
            ☰
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${zc},${zc}bb)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
              📶
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, letterSpacing:'-.02em' }}>
                WiFi Pay
              </div>
              <div style={{ fontSize:9, color:'var(--txt4)' }}>v10.2 Next</div>
            </div>
          </div>

          {/* Zone switch */}
          <div className="zone-sw" style={{ marginLeft:'auto' }}>
            <button className={`zbtn ${activeZone === 'KRS' ? 'krs' : ''}`} onClick={() => handleZone('KRS')}>KRS</button>
            <button className={`zbtn ${activeZone === 'SLK' ? 'slk' : ''}`} onClick={() => handleZone('SLK')}>SLK</button>
          </div>
        </div>

        {/* Row 2: action buttons — tanpa tombol akun (sudah di sidebar) */}
        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span className={`sync-dot ${syncStatus !== 'ok' ? 'off' : ''}`} />
            <span style={{ fontSize:10, color:'var(--txt4)' }}>
              {syncLabel[syncStatus] ?? syncStatus}
            </span>
          </span>
          <button className="hbtn" onClick={() => setShareOpen(true)}>📤 Share</button>
          <button className="hbtn" onClick={() => setExportOpen(true)}>⬇ Export</button>
          <button className="hbtn" onClick={() => triggerImport()}>⬆ Import</button>
          <button
            className="hbtn"
            style={{ color: globalLocked ? '#F44336' : '#4CAF50', display:'flex', alignItems:'center', gap:4 }}
            onClick={toggleGlobalLock}
          >
            {globalLocked ? '🔒' : '🔓'}
            <span style={{ fontSize:9 }}>{globalLocked ? 'KUNCI' : 'BUKA'}</span>
          </button>
          <button className="hbtn" onClick={() => setSearchOpen(true)}>🔍</button>
          <button className="hbtn" onClick={toggleTheme}>{darkMode ? '🌙' : '☀️'}</button>
        </div>
      </div>

      <ShareModal   open={shareOpen}  onClose={() => setShareOpen(false)} />
      <ExportModal  open={exportOpen} onClose={() => setExportOpen(false)} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ImportInput />
    </>
  );
}
