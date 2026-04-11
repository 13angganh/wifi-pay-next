// components/views/SettingsView.tsx
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/Confirm';

type PinStep = 'menu' | 'enable-new' | 'enable-confirm' | 'disable-verify' | 'change-old' | 'change-new' | 'change-confirm';

export default function SettingsView() {
  const { settings, updateSettings } = useAppStore();
  const [pinStep, setPinStep]   = useState<PinStep>('menu');
  const [pin1, setPin1]         = useState('');
  const [pin2, setPin2]         = useState('');
  const [pinErr, setPinErr]     = useState('');
  const [newAmounts, setNewAmounts] = useState(settings.quickAmounts.join(', '));

  function simpleHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return String(Math.abs(h));
  }

  function verifyPin(input: string): boolean {
    return simpleHash(input) === settings.pin;
  }

  function validatePin(p: string): boolean {
    if (p.length !== 4 || !/^\d{4}$/.test(p)) {
      setPinErr('PIN harus 4 digit angka'); return false;
    }
    return true;
  }

  // ── Enable PIN flow ──
  function startEnable() { setPinStep('enable-new'); setPin1(''); setPin2(''); setPinErr(''); }
  function handleEnableNew() {
    if (!validatePin(pin1)) return;
    setPinStep('enable-confirm'); setPin2(''); setPinErr('');
  }
  function handleEnableConfirm() {
    if (pin2 !== pin1) { setPinErr('PIN tidak cocok'); setPin2(''); return; }
    updateSettings({ pinEnabled: true, pin: simpleHash(pin1) });
    showToast('✅ PIN berhasil diaktifkan');
    setPinStep('menu'); setPin1(''); setPin2('');
  }

  // ── Disable PIN flow ──
  function startDisable() { setPinStep('disable-verify'); setPin1(''); setPinErr(''); }
  function handleDisableVerify() {
    if (!verifyPin(pin1)) { setPinErr('PIN salah'); setPin1(''); return; }
    showConfirm('🔓','Nonaktifkan PIN?<br><span style="font-size:11px;color:var(--txt3)">App tidak akan terkunci saat dibuka</span>','Ya, Nonaktifkan',() => {
      updateSettings({ pinEnabled: false, pin: '' });
      showToast('PIN dinonaktifkan');
      setPinStep('menu'); setPin1('');
    });
  }

  // ── Change PIN flow ──
  function startChange() { setPinStep('change-old'); setPin1(''); setPin2(''); setPinErr(''); }
  function handleChangeOld() {
    if (!verifyPin(pin1)) { setPinErr('PIN lama salah'); setPin1(''); return; }
    setPinStep('change-new'); setPin1(''); setPinErr('');
  }
  function handleChangeNew() {
    if (!validatePin(pin1)) return;
    setPinStep('change-confirm'); setPin2(''); setPinErr('');
  }
  function handleChangeConfirm() {
    if (pin2 !== pin1) { setPinErr('PIN tidak cocok'); setPin2(''); return; }
    updateSettings({ pin: simpleHash(pin1) });
    showToast('✅ PIN berhasil diubah');
    setPinStep('menu'); setPin1(''); setPin2('');
  }

  // ── Quick amounts ──
  function saveAmounts() {
    const parsed = newAmounts.split(/[,\s]+/).map(s => +s.trim()).filter(n => n > 0 && !isNaN(n));
    if (parsed.length < 2) { showToast('Minimal 2 nominal','err'); return; }
    if (parsed.length > 8) { showToast('Maksimal 8 nominal','err'); return; }
    updateSettings({ quickAmounts: parsed });
    showToast('✅ Nominal quick pay disimpan');
  }

  const cardStyle: React.CSSProperties = {
    background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:10,
  };
  const labelStyle: React.CSSProperties = {
    fontSize:10, color:'var(--txt3)', letterSpacing:'.07em', marginBottom:8,
  };
  const inputStyle: React.CSSProperties = {
    background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)',
    padding:'10px 14px', borderRadius:8, fontSize:14, width:'100%', textAlign:'center',
    fontFamily:"'DM Mono',monospace", letterSpacing:8,
  };

  function PinInput({ value, onChange, placeholder='••••' }: { value:string; onChange:(v:string)=>void; placeholder?:string }) {
    return (
      <input type="password" inputMode="numeric" maxLength={4} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value.replace(/\D/g,'').slice(0,4))}
        style={inputStyle} autoFocus />
    );
  }

  function PinCard({ title, desc, children }: { title:string; desc?:string; children:React.ReactNode }) {
    return (
      <div style={cardStyle}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginBottom:4 }}>{title}</div>
        {desc && <div style={{ fontSize:11, color:'var(--txt3)', marginBottom:12 }}>{desc}</div>}
        {children}
        {pinErr && <div style={{ fontSize:11, color:'#e05c5c', textAlign:'center', marginTop:8 }}>{pinErr}</div>}
      </div>
    );
  }

  function Btn({ label, onClick, danger=false, secondary=false }: { label:string; onClick:()=>void; danger?:boolean; secondary?:boolean }) {
    return (
      <button onClick={onClick} style={{
        width:'100%', padding:'10px', borderRadius:8, border:'none', cursor:'pointer',
        fontSize:13, fontWeight:600, marginTop:8,
        background: danger?'#1f0d0d':secondary?'var(--bg3)':'var(--zc)',
        color: danger?'#e05c5c':secondary?'var(--txt2)':'#fff',
        ...(danger?{border:'1px solid #e05c5c33'}:secondary?{border:'1px solid var(--border)'}:{}),
      }}>{label}</button>
    );
  }

  return (
    <div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:14, color:'var(--txt)' }}>
        ⚙️ Pengaturan
      </div>

      {/* ── PIN SECURITY ── */}
      {pinStep === 'menu' && (
        <div style={cardStyle}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>🔐 PIN Security</div>
              <div style={{ fontSize:11, color:'var(--txt3)', marginTop:2 }}>
                {settings.pinEnabled ? 'Aktif — app terkunci saat dibuka' : 'Nonaktif — app langsung terbuka'}
              </div>
            </div>
            <div style={{ fontSize:11, fontWeight:700, color: settings.pinEnabled ? '#4CAF50' : 'var(--txt4)' }}>
              {settings.pinEnabled ? '✅ ON' : '○ OFF'}
            </div>
          </div>
          {!settings.pinEnabled
            ? <Btn label="Aktifkan PIN" onClick={startEnable} />
            : <>
                <Btn label="Ubah PIN" onClick={startChange} secondary />
                <Btn label="Nonaktifkan PIN" onClick={startDisable} danger />
              </>
          }
        </div>
      )}

      {pinStep === 'enable-new' && (
        <PinCard title="🔐 Buat PIN Baru" desc="Masukkan 4 digit PIN">
          <PinInput value={pin1} onChange={setPin1} />
          <Btn label="Lanjut" onClick={handleEnableNew} />
          <Btn label="Batal" onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}

      {pinStep === 'enable-confirm' && (
        <PinCard title="🔐 Konfirmasi PIN" desc="Masukkan PIN yang sama lagi">
          <PinInput value={pin2} onChange={setPin2} />
          <Btn label="Aktifkan" onClick={handleEnableConfirm} />
          <Btn label="Batal" onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}

      {pinStep === 'disable-verify' && (
        <PinCard title="🔓 Nonaktifkan PIN" desc="Masukkan PIN saat ini untuk konfirmasi">
          <PinInput value={pin1} onChange={setPin1} />
          <Btn label="Verifikasi" onClick={handleDisableVerify} />
          <Btn label="Batal" onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}

      {pinStep === 'change-old' && (
        <PinCard title="🔑 Ubah PIN" desc="Masukkan PIN lama">
          <PinInput value={pin1} onChange={setPin1} />
          <Btn label="Lanjut" onClick={handleChangeOld} />
          <Btn label="Batal" onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}

      {pinStep === 'change-new' && (
        <PinCard title="🔑 PIN Baru" desc="Masukkan PIN baru">
          <PinInput value={pin1} onChange={setPin1} />
          <Btn label="Lanjut" onClick={handleChangeNew} />
          <Btn label="Batal" onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}

      {pinStep === 'change-confirm' && (
        <PinCard title="🔑 Konfirmasi PIN Baru" desc="Masukkan PIN baru lagi">
          <PinInput value={pin2} onChange={setPin2} />
          <Btn label="Simpan PIN Baru" onClick={handleChangeConfirm} />
          <Btn label="Batal" onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}

      {/* ── TANGGAL BAYAR ── */}
      <div style={cardStyle}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginBottom:4 }}>📅 Tanggal Bayar</div>
        <div style={{ fontSize:11, color:'var(--txt3)', marginBottom:12 }}>
          {settings.autoDate
            ? 'Otomatis — tanggal hari ini saat entry bayar'
            : 'Manual — isi tanggal sendiri setiap entry'}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {([['Otomatis',true],['Manual',false]] as const).map(([label, val]) => (
            <button key={label} onClick={() => { updateSettings({ autoDate: val }); showToast(`Tanggal bayar: ${label}`); }}
              style={{ flex:1, padding:'9px', borderRadius:8, border:`1px solid ${settings.autoDate===val?'var(--zc)':'var(--border)'}`, background: settings.autoDate===val?'var(--zcdim)':'var(--bg3)', color: settings.autoDate===val?'var(--zc)':'var(--txt2)', cursor:'pointer', fontSize:12, fontWeight:600 }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ fontSize:10, color:'var(--txt4)', marginTop:8, lineHeight:1.5 }}>
          {settings.autoDate
            ? '💡 Saat quick pay, tanggal otomatis terisi dengan hari ini.'
            : '💡 Tanggal tidak otomatis terisi — berguna saat rekap telat.'}
        </div>
      </div>

      {/* ── QUICK PAY AMOUNTS ── */}
      <div style={cardStyle}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginBottom:4 }}>⚡ Nominal Quick Pay Default</div>
        <div style={{ fontSize:11, color:'var(--txt3)', marginBottom:12 }}>
          Nominal quick pay yang tampil untuk member yang belum punya tarif khusus.
        </div>
        <div style={labelStyle}>NOMINAL (×1000) — pisahkan dengan koma</div>
        <input
          className="lf-input"
          style={{ marginBottom:0, textAlign:'left', letterSpacing:'normal', fontFamily:"'DM Mono',monospace" }}
          value={newAmounts}
          onChange={e => setNewAmounts(e.target.value)}
          placeholder="50, 80, 90, 100, 150, 200"
        />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
          {settings.quickAmounts.map(a => (
            <span key={a} style={{ background:'var(--bg3)', border:'1px solid var(--zc)', color:'var(--zc)', padding:'3px 10px', borderRadius:5, fontSize:11 }}>{a}</span>
          ))}
        </div>
        <Btn label="Simpan Nominal Default" onClick={saveAmounts} />
        <div style={{ fontSize:10, color:'var(--txt4)', marginTop:8, lineHeight:1.6, padding:'8px', background:'var(--bg3)', borderRadius:6 }}>
          💡 <b>Tarif per member</b> (tombol ★ biru) diatur di menu <b>Member → ✏️ Edit → Tarif</b>. Tarif member akan tampil sebagai tombol quick pay khusus yang berbeda untuk tiap member.
        </div>
      </div>

      {/* ── APP INFO ── */}
      <div style={{ ...cardStyle, textAlign:'center' }}>
        <div style={{ fontSize:11, color:'var(--txt4)', lineHeight:2 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:'var(--txt)', marginBottom:4 }}>📶 WiFi Pay</div>
          <div>Versi v10.2 Next</div>
          <div>Firebase: wifi-pay-online</div>
          <div>Server: Singapore</div>
        </div>
      </div>
    </div>
  );
}
