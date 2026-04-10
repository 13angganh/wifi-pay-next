// components/modals/AccountModal.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { doLogout, switchAccount } from '@/hooks/useAuth';

interface Props { open: boolean; onClose: () => void; }

export default function AccountModal({ open, onClose }: Props) {
  const router = useRouter();
  const { userEmail, userName } = useAppStore();
  if (!open) return null;

  async function handleLogout() {
    onClose();
    await doLogout();
    router.replace('/login');
  }

  async function handleSwitch() {
    onClose();
    await switchAccount();
    router.replace('/login');
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">👤 Akun <button className="modal-close" onClick={onClose}>✕</button></div>
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:12, marginBottom:14 }}>
          <div style={{ fontSize:10, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:4 }}>LOGIN SEBAGAI</div>
          {userName && <div style={{ fontSize:13, color:'var(--txt)', fontWeight:500 }}>{userName}</div>}
          <div style={{ fontSize:11, color:'var(--txt4)', marginTop:2 }}>{userEmail}</div>
        </div>
        <button className="lf-btn secondary" style={{ marginBottom:8 }} onClick={handleSwitch}>↔ Ganti Akun</button>
        <button className="lf-btn" style={{ background:'#1f0d0d', color:'#e05c5c', border:'1px solid #e05c5c33' }} onClick={handleLogout}>Keluar</button>
      </div>
    </div>
  );
}
