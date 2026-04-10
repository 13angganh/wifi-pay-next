// ══════════════════════════════════════════
// app/login/page.tsx — Halaman Login
// 3 state: Remembered | Form Login | Register
// Identik dengan auth.js lama
// ══════════════════════════════════════════
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { doLogin, doRegister, loginRemembered, switchAccount } from '@/hooks/useAuth';
import { getSavedCred } from '@/lib/helpers';

type LoginState = 'remembered' | 'form' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { uid } = useAppStore();

  // Redirect jika sudah login
  useEffect(() => {
    if (uid) router.replace('/dashboard');
  }, [uid, router]);

  const savedCred = typeof window !== 'undefined' ? getSavedCred() : null;
  const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('wp_remember_email') : null;
  const savedName  = typeof window !== 'undefined' ? localStorage.getItem('wp_remember_name')  : null;

  const [state, setState] = useState<LoginState>(savedCred ? 'remembered' : 'form');

  // Form login
  const [email, setEmail]       = useState(savedCred?.email || '');
  const [pass,  setPass]        = useState(savedCred?.pass  || '');
  const [err,   setErr]         = useState('');
  const [loading, setLoading]   = useState(false);

  // Form register
  const [rEmail, setREmail]     = useState('');
  const [rPass,  setRPass]      = useState('');
  const [rName,  setRName]      = useState('');
  const [rErr,   setRErr]       = useState('');
  const [rLoading, setRLoading] = useState(false);

  async function handleLanjutkan() {
    setLoading(true); setErr('');
    const res = await loginRemembered();
    setLoading(false);
    if (res.error === 'no_cred') { setState('form'); return; }
    if (res.error) { setErr(res.error); return; }
    router.replace('/dashboard');
  }

  async function handleLogin() {
    if (!email || !pass) { setErr('Email dan password wajib diisi'); return; }
    setLoading(true); setErr('');
    const res = await doLogin(email, pass);
    setLoading(false);
    if (res.error) { setErr(res.error); return; }
    router.replace('/dashboard');
  }

  async function handleRegister() {
    if (!rEmail || !rPass || !rName) { setRErr('Semua field wajib diisi'); return; }
    if (rPass.length < 6) { setRErr('Password minimal 6 karakter'); return; }
    setRLoading(true); setRErr('');
    const res = await doRegister(rEmail, rPass, rName);
    setRLoading(false);
    if (res.error) { setRErr(res.error); return; }
    router.replace('/dashboard');
  }

  async function handleSwitchAccount() {
    await switchAccount();
    setEmail(''); setPass(''); setErr('');
    setState('form');
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', zIndex:200 }}>
      <div className="login-logo">📶</div>
      <div className="login-title">WiFi Pay</div>
      <div className="login-sub">SISTEM IURAN BULANAN</div>

      <div className="login-box">

        {/* STATE A — Remembered */}
        {state === 'remembered' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:'20px' }}>
              <div style={{ width:52, height:52, background:'linear-gradient(135deg,#2196F3,#1565C0)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, margin:'0 auto 12px' }}>👤</div>
              <div style={{ fontSize:11, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:4 }}>SELAMAT DATANG KEMBALI</div>
              <div style={{ fontSize:14, color:'var(--txt)', fontWeight:500 }}>{savedName || savedEmail?.split('@')[0]}</div>
              <div style={{ fontSize:11, color:'var(--txt4)', marginTop:2 }}>{savedEmail}</div>
            </div>
            <button className="lf-btn" onClick={handleLanjutkan} disabled={loading}>
              {loading ? '⏳ Memuat...' : '🚀 Lanjutkan'}
            </button>
            <div style={{ textAlign:'center', margin:'12px 0', fontSize:11, color:'var(--txt4)' }}>atau</div>
            <button className="lf-btn secondary" onClick={handleSwitchAccount}>↔ Ganti Akun</button>
            {err && <div className="lf-err">{err}</div>}
          </div>
        )}

        {/* STATE B — Form Login */}
        {state === 'form' && (
          <div>
            {savedCred && (
              <button onClick={() => setState('remembered')} style={{ background:'none', border:'none', color:'var(--txt3)', fontSize:11, cursor:'pointer', marginBottom:12, display:'block' }}>
                ← Kembali
              </button>
            )}
            <div className="lf-label">EMAIL</div>
            <input className="lf-input" type="email" inputMode="email" placeholder="email@gmail.com"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
            <div className="lf-label">PASSWORD</div>
            <input className="lf-input" type="password" placeholder="••••••••"
              value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            {err && <div className="lf-err">{err}</div>}
            <button className="lf-btn" onClick={handleLogin} disabled={loading}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
            <div className="lf-divider"><span>atau</span></div>
            <div className="lf-switch">Belum punya akun? <span onClick={() => { setState('register'); setErr(''); }}>Daftar di sini</span></div>
          </div>
        )}

        {/* STATE C — Register */}
        {state === 'register' && (
          <div>
            <div className="lf-label">EMAIL</div>
            <input className="lf-input" type="email" inputMode="email" placeholder="email@gmail.com"
              value={rEmail} onChange={e => setREmail(e.target.value)} />
            <div className="lf-label">PASSWORD (min 6 karakter)</div>
            <input className="lf-input" type="password" placeholder="••••••••"
              value={rPass} onChange={e => setRPass(e.target.value)} />
            <div className="lf-label">NAMA PENGGUNA</div>
            <input className="lf-input" type="text" placeholder="Nama kamu"
              value={rName} onChange={e => setRName(e.target.value)} />
            {rErr && <div className="lf-err">{rErr}</div>}
            <button className="lf-btn" onClick={handleRegister} disabled={rLoading}>
              {rLoading ? 'Mendaftar...' : 'Daftar & Masuk'}
            </button>
            <div className="lf-divider"><span>atau</span></div>
            <div className="lf-switch">Sudah punya akun? <span onClick={() => { setState('form'); setRErr(''); }}>Masuk di sini</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
