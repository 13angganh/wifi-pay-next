// components/layout/Sidebar.tsx — v10.2, hapus BottomNav, tambah Settings
'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { doLogout, switchAccount } from '@/hooks/useAuth';
import { PAGE_TITLES } from '@/lib/constants';
import type { ViewName } from '@/types';

const NAV_ITEMS: { v: ViewName; icon: string }[] = [
  { v:'dashboard',   icon:'🏠' },
  { v:'entry',       icon:'📝' },
  { v:'rekap',       icon:'📊' },
  { v:'tunggakan',   icon:'⚠️' },
  { v:'grafik',      icon:'📈' },
  { v:'log',         icon:'🗂️' },
  { v:'members',     icon:'👥' },
  { v:'operasional', icon:'💼' },
];

interface Props { onNavigate: (v: ViewName) => void; }

export default function Sidebar({ onNavigate }: Props) {
  const router = useRouter();
  const { activeZone, currentView, userName, userEmail, setSidebar } = useAppStore();
  const zc = activeZone === 'KRS' ? '#2196F3' : '#e05c3a';

  // Ganti akun — tetap ingat kredensial, hanya logout session
  async function handleSwitchAccount() {
    await doLogout(); // logout session saja, tidak hapus localStorage
    router.replace('/login');
    setSidebar(false);
  }

  async function handleLogout() {
    // Logout total — hapus kredensial tersimpan
    const { clearCred } = await import('@/lib/helpers');
    clearCred();
    await doLogout();
    router.replace('/login');
    setSidebar(false);
  }

  return (
    <>
      {/* Header */}
      <div className="sb-header">
        <div className="sb-logo" style={{ background:`linear-gradient(135deg,${zc},${zc}bb)` }}>📶</div>
        <div>
          <div className="sb-app-name">WiFi Pay</div>
          <div style={{ fontSize:9, color:'var(--txt4)', letterSpacing:'.04em' }}>
            {userName || userEmail}
          </div>
          <div style={{ fontSize:8, color:'var(--txt5)', letterSpacing:'.06em' }}>v11.0 Next</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        {NAV_ITEMS.map(item => (
          <button key={item.v}
            className={`sb-item ${currentView === item.v ? 'on' : ''}`}
            onClick={() => onNavigate(item.v)}>
            <span className="si">{item.icon}</span>
            {PAGE_TITLES[item.v]}
          </button>
        ))}

        <div className="sb-divider" />

        {/* Settings */}
        <button
          className={`sb-item ${currentView === 'settings' ? 'on' : ''}`}
          onClick={() => onNavigate('settings')}>
          <span className="si">⚙️</span> Pengaturan
        </button>

        <div className="sb-divider" />

        {/* Ganti Akun — ingat kredensial */}
        <button className="sb-item" onClick={handleSwitchAccount}>
          <span className="si">↔</span> Ganti Akun
        </button>

        {/* Keluar — hapus kredensial */}
        <button className="sb-item" style={{ color:'#e05c5c' }} onClick={handleLogout}>
          <span className="si">🚪</span> Keluar
        </button>
      </nav>

      {/* Footer versi */}
      <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', fontSize:9, color:'var(--txt5)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ letterSpacing:'.04em' }}>WiFi Pay v11.0 Next</span>
        <span style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:4, padding:'2px 6px', fontSize:8, letterSpacing:'.04em' }}>wifi-pay-online</span>
      </div>
    </>
  );
}
