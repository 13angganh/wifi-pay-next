// components/layout/BottomNav.tsx
'use client';

import { useAppStore } from '@/store/useAppStore';
import type { ViewName } from '@/types';

const NAV_ITEMS: { v: ViewName; icon: string; label: string }[] = [
  { v:'dashboard',   icon:'🏠', label:'Home'    },
  { v:'entry',       icon:'📝', label:'Entry'   },
  { v:'rekap',       icon:'📊', label:'Rekap'   },
  { v:'tunggakan',   icon:'⚠️', label:'Tunggak' },
  { v:'grafik',      icon:'📈', label:'Grafik'  },
  { v:'log',         icon:'🗂️', label:'Log'     },
  { v:'members',     icon:'👥', label:'Member'  },
  { v:'operasional', icon:'💼', label:'Ops'     },
];

interface BottomNavProps {
  onNavigate: (v: ViewName) => void;
}

export default function BottomNav({ onNavigate }: BottomNavProps) {
  const { currentView } = useAppStore();

  return (
    <div id="bnav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.v}
          className={`nb ${currentView === item.v ? 'on' : ''}`}
          data-v={item.v}
          onClick={() => onNavigate(item.v)}
        >
          <span className="ni">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
