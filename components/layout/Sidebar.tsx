// components/layout/Sidebar.tsx
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

interface SidebarProps {
  onNavigate: (v: ViewName) => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const router      = useRouter();
  const { activeZone, currentView, userName, userEmail } = useAppStore();

  const zc = activeZone === 'KRS' ? '#2196F3' : '#e05c3a';

  async function handleLogout() {
    await doLogout();
    router.replace('/login');
  }

  async function handleSwitchAccount() {
    await switchAccount();
    router.replace('/login');
  }

  return (
    <div id="sidebar">
      {/* Header */}
      <div className="sb-header">
        <div className="sb-logo" style={{ background:`linear-gradient(135deg,${zc},${zc}bb)` }}>📶</div>
        <div>
          <div className="sb-app-name">WiFi Pay</div>
          <div style={{ fontSize:9, color:'var(--txt4)', letterSpacing:'.06em' }}>
            {userName || userEmail}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="sb-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.v}
            className={`sb-item ${currentView === item.v ? 'on' : ''}`}
            onClick={() => onNavigate(item.v)}
          >
            <span className="si">{item.icon}</span>
            {PAGE_TITLES[item.v]}
          </button>
        ))}

        <div className="sb-divider" />

        <button className="sb-item" onClick={handleSwitchAccount}>
          <span className="si">↔</span> Ganti Akun
        </button>
        <button className="sb-item" onClick={handleLogout}>
          <span className="si">🚪</span> Keluar
        </button>
      </nav>

      {/* Footer */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', fontSize:9, color:'var(--txt5)' }}>
        WiFi Pay v10.1 Next
      </div>
    </div>
  );
}
