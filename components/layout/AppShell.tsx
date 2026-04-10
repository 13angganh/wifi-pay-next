// components/layout/AppShell.tsx — compose layout + global modals + CDN scripts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Script from 'next/script';
import { useAppStore } from '@/store/useAppStore';
import { checkAutoBackup } from '@/lib/backup';
import Header     from './Header';
import Sidebar    from './Sidebar';
import BottomNav  from './BottomNav';
import LockBanner from './LockBanner';
import Toast      from '@/components/ui/Toast';
import Confirm    from '@/components/ui/Confirm';
import RiwayatModal from '@/components/modals/RiwayatModal';
import type { ViewName } from '@/types';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, setSidebar, setView, darkMode, appData,
          setDeferredPrompt, setUpdateBanner, showUpdateBanner } = useAppStore();

  const [riwayatOpen, setRiwayatOpen] = useState(false);

  // Sync currentView dengan pathname
  useEffect(() => {
    const seg = pathname.split('/')[1] as ViewName;
    if (seg) setView(seg);
  }, [pathname]);

  // Apply dark/light mode ke body
  useEffect(() => {
    document.body.classList.toggle('light', !darkMode);
  }, [darkMode]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.update();
      if (reg.waiting) { reg.waiting.postMessage({ type:'SKIP_WAITING' }); setUpdateBanner(true); }
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        sw?.addEventListener('statechange', () => {
          if (sw.state === 'installed') { sw.postMessage({ type:'SKIP_WAITING' }); setUpdateBanner(true); }
        });
      });
    });
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) { refreshing = true; window.location.reload(); }
    });
  }, []);

  // Auto backup
  useEffect(() => {
    if (appData.krsMembers?.length) checkAutoBackup(appData);
  }, [appData]);

  const navigate = useCallback((v: ViewName) => {
    setView(v);
    router.push('/'+v);
    if (window.innerWidth < 768) setSidebar(false);
  }, [router, setView, setSidebar]);

  return (
    <>
      {/* CDN scripts untuk PDF/Excel/Chart */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js" strategy="lazyOnload" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" strategy="lazyOnload" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js" strategy="lazyOnload" />

      {/* Update banner */}
      {showUpdateBanner && (
        <div className="update-banner">
          <span style={{ fontSize:12, color:'#4CAF50' }}>🆕 Ada versi terbaru WiFi Pay!</span>
          <button onClick={() => { navigator.serviceWorker.getRegistration().then(r => { r?.waiting?.postMessage({ type:'SKIP_WAITING' }); window.location.reload(); }); }}
            style={{ background:'#4CAF50', color:'#0a0c12', border:'none', padding:'6px 14px', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
            Update Sekarang
          </button>
        </div>
      )}

      <div style={{ display:'flex', position:'fixed', inset:0, top: showUpdateBanner ? 44 : 0 }}>
        {/* Overlay (mobile sidebar) */}
        <div className={`sidebar-overlay ${sidebarOpen?'show':''}`} onClick={() => setSidebar(false)} />

        {/* Sidebar */}
        <Sidebar onNavigate={navigate} />

        {/* Main */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
          <Header onToggleSidebar={() => setSidebar(!sidebarOpen)} />
          <LockBanner />
          <div id="content">{children}</div>
          <BottomNav onNavigate={navigate} />
        </div>
      </div>

      {/* Global UI */}
      <Toast />
      <Confirm />
      <RiwayatModal open={riwayatOpen} onClose={() => setRiwayatOpen(false)} />
    </>
  );
}
