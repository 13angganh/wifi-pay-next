// components/ui/PinLock.tsx
// Lock screen PIN — tampil setiap buka app jika PIN aktif
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function PinLock() {
  const { settings, setPinUnlocked, pinUnlocked } = useAppStore();
  const [digits, setDigits]   = useState(['','','','']);
  const [error,  setError]    = useState('');
  const [shake,  setShake]    = useState(false);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => { refs[0].current?.focus(); }, []);

  // Tidak perlu lock jika PIN belum diaktifkan atau sudah unlock
  if (!settings.pinEnabled || pinUnlocked) return null;

  function simpleHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return String(Math.abs(h));
  }

  function handleDigit(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError('');
    if (val && i < 3) refs[i+1].current?.focus();
    if (next.every(d => d !== '') && val) {
      const entered = next.join('');
      if (simpleHash(entered) === settings.pin) {
        setPinUnlocked(true);
      } else {
        setShake(true);
        setError('PIN salah');
        setTimeout(() => { setShake(false); setDigits(['','','','']); refs[0].current?.focus(); }, 600);
      }
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i-1].current?.focus();
  }

  // Numpad
  const pad = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  function pressPad(k: string) {
    if (k === '⌫') {
      const last = digits.map((d,i)=>({d,i})).filter(x=>x.d).pop();
      if (!last) return;
      const next = [...digits]; next[last.i]=''; setDigits(next);
      refs[last.i].current?.focus();
    } else {
      const idx = digits.findIndex(d=>d==='');
      if (idx === -1) return;
      handleDigit(idx, k);
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--bg)', zIndex:99999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24 }}>
      <div style={{ width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,#2196F3,#1565C0)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, boxShadow:'0 8px 32px #2196F333' }}>
        📶
      </div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'var(--txt)' }}>WiFi Pay</div>
      <div style={{ fontSize:12, color:'var(--txt3)', letterSpacing:'.08em' }}>MASUKKAN PIN</div>

      {/* Dots display */}
      <div style={{ display:'flex', gap:14 }} className={shake ? 'pin-shake' : ''}>
        {digits.map((d,i) => (
          <div key={i} style={{ width:14, height:14, borderRadius:'50%', background: d ? 'var(--zc)' : 'var(--bg3)', border:'2px solid var(--border)', transition:'background .15s' }} />
        ))}
      </div>

      {/* Hidden inputs for keyboard */}
      <div style={{ position:'absolute', opacity:0, pointerEvents:'none' }}>
        {digits.map((d,i) => (
          <input key={i} ref={refs[i]} type="tel" maxLength={1} value={d}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)} />
        ))}
      </div>

      {/* Error */}
      {error && <div style={{ fontSize:11, color:'#e05c5c', marginTop:-12 }}>{error}</div>}

      {/* Numpad */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,64px)', gap:10, marginTop:8 }}>
        {pad.map((k,i) => k === '' ? <div key={i} /> : (
          <button key={i} onClick={() => pressPad(k)}
            style={{ width:64, height:64, borderRadius:16, border:'1px solid var(--border)', background:'var(--bg2)', color:'var(--txt)', fontSize: k==='⌫'?18:22, fontWeight:600, cursor:'pointer', transition:'all .1s', fontFamily:"'DM Mono',monospace" }}
            onMouseDown={e => (e.currentTarget.style.transform='scale(.93)')}
            onMouseUp={e => (e.currentTarget.style.transform='scale(1)')}>
            {k}
          </button>
        ))}
      </div>

      <style>{`.pin-shake{animation:pinShake .5s ease}@keyframes pinShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}
