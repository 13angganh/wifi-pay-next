// components/layout/Sidebar.tsx — Sesi 5B: user section + Lucide + footer bersih
'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { doLogout, switchAccount } from '@/hooks/useAuth';
import { PAGE_TITLES } from '@/lib/constants';
import type { ViewName } from '@/types';
import {
  Wifi,
  LayoutDashboard,
  CreditCard,
  BarChart3,
  AlertCircle,
  TrendingUp,
  ScrollText,
  Users,
  Briefcase,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS: { v: ViewName; icon: React.ReactNode }[] = [
  { v:'dashboard',   icon: <LayoutDashboard size={16} strokeWidth={1.5} /> },
  { v:'entry',       icon: <CreditCard      size={16} strokeWidth={1.5} /> },
  { v:'rekap',       icon: <BarChart3       size={16} strokeWidth={1.5} /> },
  { v:'tunggakan',   icon: <AlertCircle     size={16} strokeWidth={1.5} /> },
  { v:'grafik',      icon: <TrendingUp      size={16} strokeWidth={1.5} /> },
  { v:'log',         icon: <ScrollText      size={16} strokeWidth={1.5} /> },
  { v:'members',     icon: <Users           size={16} strokeWidth={1.5} /> },
  { v:'operasional', icon: <Briefcase       size={16} strokeWidth={1.5} /> },
];

interface Props { onNavigate: (v: ViewName) => void; }

function getInitials(name: string | null, email: string | null): string {
  const n = name || email?.split('@')[0] || '?';
  const parts = n.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}

export default function Sidebar({ onNavigate }: Props) {
  const router = useRouter();
  const { activeZone, currentView, userName, userEmail, setSidebar } = useAppStore();

  async function handleSwitchAccount() {
    await doLogout();
    router.replace('/login');
    setSidebar(false);
  }

  async function handleLogout() {
    const { clearCred } = await import('@/lib/helpers');
    clearCred();
    await doLogout();
    router.replace('/login');
    setSidebar(false);
  }

  const initials = getInitials(userName, userEmail);
  const displayName = userName || userEmail?.split('@')[0] || 'Pengguna';

  return (
    <>
      {/* Header — Logo + nama app saja */}
      <div className="sb-header">
        <div className="sb-logo" style={{
          background:'linear-gradient(135deg,var(--zc),color-mix(in srgb,var(--zc) 70%,#000))',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <Wifi size={18} color="#fff" strokeWidth={1.5} />
        </div>
        <div>
          <div className="sb-app-name">WiFi Pay</div>
          <div style={{ fontSize:8, color:'var(--txt5)', letterSpacing:'.06em' }}>v11.1 Next</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sb-nav" aria-label="Menu navigasi utama">
        {NAV_ITEMS.map(item => (
          <button key={item.v}
            className={`sb-item ${currentView === item.v ? 'on' : ''}`}
            onClick={() => onNavigate(item.v)}
            aria-label={PAGE_TITLES[item.v]}
            aria-current={currentView === item.v ? 'page' : undefined}
          >
            <span className="si" aria-hidden="true">{item.icon}</span>
            {PAGE_TITLES[item.v]}
          </button>
        ))}

        <div className="sb-divider" role="separator" />

        {/* Settings */}
        <button
          className={`sb-item ${currentView === 'settings' ? 'on' : ''}`}
          onClick={() => onNavigate('settings')}
          aria-label="Pengaturan"
          aria-current={currentView === 'settings' ? 'page' : undefined}
        >
          <span className="si" aria-hidden="true"><Settings size={16} strokeWidth={1.5} /></span>
          Pengaturan
        </button>
      </nav>

      {/* User section — di atas footer */}
      <div className="sb-user-section">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          {/* Avatar */}
          <div style={{
            width:32, height:32, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,var(--zc),color-mix(in srgb,var(--zc) 60%,#000))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:"'DM Mono',monospace", fontWeight:500, fontSize:12, color:'#fff',
            letterSpacing:'.01em',
          }}>
            {initials}
          </div>
          <div style={{ overflow:'hidden' }}>
            <div style={{
              fontSize:13, fontWeight:500, color:'var(--txt)',
              fontFamily:"'DM Sans',sans-serif",
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}>
              {displayName}
            </div>
          </div>
        </div>

        {/* Ganti Akun + Keluar sejajar */}
        <div style={{ display:'flex', gap:6 }}>
          <button
            className="sb-user-btn"
            onClick={handleSwitchAccount}
            aria-label="Ganti akun"
            style={{ flex:1 }}
          >
            <LogOut size={13} strokeWidth={1.5} />
            <span>Ganti Akun</span>
          </button>
          <button
            className="sb-user-btn danger"
            onClick={handleLogout}
            aria-label="Keluar dari aplikasi"
            style={{ flex:1 }}
          >
            <LogOut size={13} strokeWidth={1.5} />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding:'10px 16px',
        borderTop:'1px solid var(--border)',
        fontSize:9, color:'var(--txt5)',
        letterSpacing:'.04em',
        textAlign:'center',
      }}>
        WiFi Pay v11.1 Next
      </div>
    </>
  );
}
