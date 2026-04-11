// app/login/page.tsx — v10.2
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { doLogin, doRegister, loginRemembered } from '@/hooks/useAuth';
import { getSavedCred } from '@/lib/helpers';

type LoginState = 'remembered' | 'form' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { uid } = useAppStore();

  useEffect(() => {
    if (uid) router.replace('/dashboard');
  }, [uid, router]);

  const savedCred  = typeof window !== 'undefined' ? getSavedCred() : null;
  const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('wp_remember_email') : null;
  const savedName  = typeof window !== 'undefined' ? localStorage.getItem('wp_remember_name')  : null;

  const [state,    setState]   = useState<LoginState>(savedCred ? 'remembered' : 'form');
  const [email,    setEmail]   = useState(savedCred?.email || '');
  const [pass,     setPass]    = useState(savedCred?.pass  || '');
  const [err,      setErr]     = useState('');
  const [loading,  setLoading] = useState(false);
  const [rEmail,   setREmail]  = useState('');
  const [rPass,    setRPass]   = useState('');
  const [rName,    setRName]   = useState('');
  const [rErr,     setRErr]    = useState('');
  const [rLoading, setRLoading]= useState(false);

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

  // Ganti akun — isi form dengan kredensial lama agar tinggal klik Masuk
  function handleSwitchAccount() {
    setEmail(savedCred?.email || '');
    setPass(savedCred?.pass   || '');
    setErr('');
    setState('form');
  }

  const inputStyle: React.CSSProperties = {
    width:'100%', background:'var(--bg3)', border:'1px solid var(--border)',
    color:'var(--txt)', padding:'10px 14px', borderRadius:8, fontSize:14,
    marginBottom:14, fontFamily:"'DM Mono',monospace", outline:'none',
    transition:'border .2s',
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, zIndex:200 }}>
      {/* Logo */}
      <div style={{ width:72, height:72, background:'linear-gradient(135deg,#2196F3,#1565C0)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, marginBottom:20, boxShadow:'0 8px 32px #2196F333' }}>📶</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginBottom:2 }}>WiFi Pay</div>
      <div style={{ fontSize:10, color:'var(--txt4)', letterSpacing:'.12em', marginBottom:32 }}>v10.2 Next</div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:24, width:'100%', maxWidth:360 }}>

        {/* STATE A — Remembered */}
        {state === 'remembered' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ width:52, height:52, background:'linear-gradient(135deg,#2196F3,#1565C0)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, margin:'0 auto 12px' }}>👤</div>
              <div style={{ fontSize:11, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:4 }}>SELAMAT DATANG KEMBALI</div>
              <div style={{ fontSize:14, color:'var(--txt)', fontWeight:500 }}>{savedName || savedEmail?.split('@')[0]}</div>
              <div style={{ fontSize:11, color:'var(--txt4)', marginTop:2 }}>{savedEmail}</div>
            </div>
            <button className="lf-btn" onClick={handleLanjutkan} disabled={loading}
              style={{ background:'#2196F3' }}>
              {loading ? '⏳ Memuat...' : '🚀 Lanjutkan'}
            </button>
            <div style={{ textAlign:'center', margin:'12px 0', fontSize:11, color:'var(--txt4)' }}>atau</div>
            {/* Ganti Akun — isi form dengan kredensial lama */}
            <button className="lf-btn secondary" onClick={handleSwitchAccount}>↔ Ganti Akun</button>
            {err && <div className="lf-err">{err}</div>}
          </div>
        )}

        {/* STATE B — Form Login */}
        {state === 'form' && (
          <div>
            {savedCred && (
              <button onClick={() => setState('remembered')}
                style={{ background:'none', border:'none', color:'var(--txt3)', fontSize:11, cursor:'pointer', marginBottom:12, display:'block' }}>
                ← Kembali
              </button>
            )}
            <div style={{ fontSize:10, color:'var(--txt3)', letterSpacing:'.07em', marginBottom:6 }}>EMAIL</div>
            <input style={inputStyle} type="email" inputMode="email" placeholder="email@gmail.com"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
              onFocus={e => (e.target as HTMLInputElement).style.borderColor='var(--zc)'}
              onBlur={e  => (e.target as HTMLInputElement).style.borderColor='var(--border)'} />
            <div style={{ fontSize:10, color:'var(--txt3)', letterSpacing:'.07em', marginBottom:6 }}>PASSWORD</div>
            <input style={inputStyle} type="password" placeholder="••••••••"
              value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor='var(--zc)'}
              onBlur={e  => (e.target as HTMLInputElement).style.borderColor='var(--border)'} />
            {err && <div className="lf-err">{err}</div>}
            <button className="lf-btn" onClick={handleLogin} disabled={loading}
              style={{ background:'#2196F3' }}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
            <div style={{ textAlign:'center', margin:'12px 0', fontSize:10, color:'var(--txt5)', position:'relative' }}>
              <div style={{ position:'absolute', left:0, top:'50%', right:0, height:1, background:'var(--border)' }} />
              <span style={{ background:'var(--card)', padding:'0 10px', position:'relative' }}>atau</span>
            </div>
            <div style={{ fontSize:11, color:'var(--txt3)', textAlign:'center' }}>
              Belum punya akun? <span style={{ color:'#2196F3', cursor:'pointer' }} onClick={() => { setState('register'); setErr(''); }}>Daftar di sini</span>
            </div>
          </div>
        )}

        {/* STATE C — Register */}
        {state === 'register' && (
          <div>
            {(['EMAIL','PASSWORD (min 6 karakter)','NAMA PENGGUNA'] as const).map((label, i) => {
              const vals  = [rEmail, rPass, rName];
              const types = ['email','password','text'] as const;
              const modes = ['email','current-password','name'] as const;
              const sets  = [setREmail, setRPass, setRName];
              return (
                <div key={label}>
                  <div style={{ fontSize:10, color:'var(--txt3)', letterSpacing:'.07em', marginBottom:6 }}>{label}</div>
                  <input style={inputStyle} type={types[i]} autoComplete={modes[i]}
                    placeholder={i===0?'email@gmail.com':i===1?'••••••••':'Nama kamu'}
                    value={vals[i]} onChange={e => sets[i](e.target.value)}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor='var(--zc)'}
                    onBlur={e  => (e.target as HTMLInputElement).style.borderColor='var(--border)'} />
                </div>
              );
            })}
            {rErr && <div className="lf-err">{rErr}</div>}
            <button className="lf-btn" onClick={handleRegister} disabled={rLoading}
              style={{ background:'#2196F3' }}>
              {rLoading ? 'Mendaftar...' : 'Daftar & Masuk'}
            </button>
            <div style={{ textAlign:'center', margin:'12px 0', fontSize:10, color:'var(--txt5)', position:'relative' }}>
              <div style={{ position:'absolute', left:0, top:'50%', right:0, height:1, background:'var(--border)' }} />
              <span style={{ background:'var(--card)', padding:'0 10px', position:'relative' }}>atau</span>
            </div>
            <div style={{ fontSize:11, color:'var(--txt3)', textAlign:'center' }}>
              Sudah punya akun? <span style={{ color:'#2196F3', cursor:'pointer' }} onClick={() => { setState('form'); setRErr(''); }}>Masuk di sini</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
