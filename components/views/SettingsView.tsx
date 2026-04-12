// components/views/SettingsView.tsx — Sesi B: Export + Share + Auto-lock PIN
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/Confirm';
import { doJSONBackup, doWASummary, generatePDF, generateExcel } from '@/lib/export';
import { MONTHS, YEARS } from '@/lib/constants';

type PinStep = 'menu' | 'enable-new' | 'enable-confirm' | 'disable-verify' | 'change-old' | 'change-new' | 'change-confirm';
type ExportPanel = null | 'json' | 'pdf' | 'excel';
type SharePanel  = null | 'wa' | 'share-file';

const TIMEOUT_OPTIONS = [
  { label: 'Tidak pernah', value: 0 },
  { label: '5 menit',      value: 5 },
  { label: '10 menit',     value: 10 },
  { label: '30 menit',     value: 30 },
  { label: '1 jam',        value: 60 },
];

export default function SettingsView() {
  const { settings, updateSettings, appData } = useAppStore();

  // PIN state
  const [pinStep, setPinStep] = useState<PinStep>('menu');
  const [pin1, setPin1]       = useState('');
  const [pin2, setPin2]       = useState('');
  const [pinErr, setPinErr]   = useState('');

  // Quick amounts
  const [newAmounts, setNewAmounts] = useState(settings.quickAmounts.join(', '));

  // Export accordion
  const [exportPanel, setExportPanel] = useState<ExportPanel>(null);
  const [expZone,  setExpZone]  = useState<'KRS'|'SLK'|'ALL'>('KRS');
  const [expType,  setExpType]  = useState<'monthly'|'yearly'>('monthly');
  const [expYear,  setExpYear]  = useState(new Date().getFullYear());
  const [expMonth, setExpMonth] = useState(new Date().getMonth());

  // Share accordion
  const [sharePanel,  setSharePanel]  = useState<SharePanel>(null);
  const [waYear,  setWaYear]   = useState(new Date().getFullYear());
  const [waMonth, setWaMonth]  = useState(new Date().getMonth());
  const [sfZone,  setSfZone]   = useState<'KRS'|'SLK'|'ALL'>('KRS');
  const [sfType,  setSfType]   = useState<'monthly'|'yearly'>('monthly');
  const [sfYear,  setSfYear]   = useState(new Date().getFullYear());
  const [sfMonth, setSfMonth]  = useState(new Date().getMonth());
  const [sfFmt,   setSfFmt]    = useState<'pdf'|'excel'>('pdf');

  // ── PIN helpers ──
  function simpleHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return String(Math.abs(h));
  }
  function verifyPin(input: string) { return simpleHash(input) === settings.pin; }
  function validatePin(p: string): boolean {
    if (p.length !== 4 || !/^\d{4}$/.test(p)) { setPinErr('PIN harus 4 digit angka'); return false; }
    return true;
  }

  // Enable PIN
  function startEnable() { setPinStep('enable-new'); setPin1(''); setPin2(''); setPinErr(''); }
  function handleEnableNew() { if (!validatePin(pin1)) return; setPinStep('enable-confirm'); setPin2(''); setPinErr(''); }
  function handleEnableConfirm() {
    if (pin2 !== pin1) { setPinErr('PIN tidak cocok'); setPin2(''); return; }
    updateSettings({ pinEnabled: true, pin: simpleHash(pin1) });
    showToast('✅ PIN berhasil diaktifkan'); setPinStep('menu'); setPin1(''); setPin2('');
  }

  // Disable PIN
  function startDisable() { setPinStep('disable-verify'); setPin1(''); setPinErr(''); }
  function handleDisableVerify() {
    if (!verifyPin(pin1)) { setPinErr('PIN salah'); setPin1(''); return; }
    showConfirm('🔓','Nonaktifkan PIN?<br><span style="font-size:11px;color:var(--txt3)">App tidak akan terkunci saat dibuka</span>','Ya, Nonaktifkan', () => {
      updateSettings({ pinEnabled: false, pin: '' });
      showToast('PIN dinonaktifkan'); setPinStep('menu'); setPin1('');
    });
  }

  // Change PIN
  function startChange() { setPinStep('change-old'); setPin1(''); setPin2(''); setPinErr(''); }
  function handleChangeOld() { if (!verifyPin(pin1)) { setPinErr('PIN lama salah'); setPin1(''); return; } setPinStep('change-new'); setPin1(''); setPinErr(''); }
  function handleChangeNew() { if (!validatePin(pin1)) return; setPinStep('change-confirm'); setPin2(''); setPinErr(''); }
  function handleChangeConfirm() {
    if (pin2 !== pin1) { setPinErr('PIN tidak cocok'); setPin2(''); return; }
    updateSettings({ pin: simpleHash(pin1) }); showToast('✅ PIN berhasil diubah'); setPinStep('menu'); setPin1(''); setPin2('');
  }

  // Quick amounts
  function saveAmounts() {
    const parsed = newAmounts.split(/[,\s]+/).map(s => +s.trim()).filter(n => n > 0 && !isNaN(n));
    if (parsed.length < 2) { showToast('Minimal 2 nominal', 'err'); return; }
    if (parsed.length > 8) { showToast('Maksimal 8 nominal', 'err'); return; }
    updateSettings({ quickAmounts: parsed }); showToast('✅ Nominal quick pay disimpan');
  }

  // Export handlers
  async function handleDownloadPDF() {
    try {
      showToast('Membuat PDF...', 'info');
      const month = expType === 'yearly' ? null : expMonth;
      const { blob, filename } = await generatePDF(appData, expZone, expYear, month);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('✅ PDF berhasil didownload');
    } catch { showToast('Gagal buat PDF', 'err'); }
  }

  function handleDownloadExcel() {
    try {
      showToast('Membuat Excel...', 'info');
      const month = expType === 'yearly' ? null : expMonth;
      const { blob, filename } = generateExcel(appData, expZone, expYear, month);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('✅ Excel berhasil didownload');
    } catch { showToast('Gagal buat Excel', 'err'); }
  }

  // Share handlers
  function handleWASummary() { doWASummary(appData, waYear, waMonth); }

  async function handleShareFile() {
    try {
      showToast('Membuat file...', 'info');
      const month = sfType === 'yearly' ? null : sfMonth;
      if (sfFmt === 'pdf') {
        const { blob, filename } = await generatePDF(appData, sfZone, sfYear, month);
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          showToast('✅ File didownload (share tidak didukung)');
        }
      } else {
        const { blob, filename } = generateExcel(appData, sfZone, sfYear, month);
        const file = new File([blob], filename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          showToast('✅ File didownload (share tidak didukung)');
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') showToast('Gagal membuat file', 'err');
    }
  }

  // ── Reusable styles ──
  const cardStyle: React.CSSProperties = {
    background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:10, boxShadow:'var(--shadow-xs)',
  };
  const labelStyle: React.CSSProperties = { fontSize:10, color:'var(--txt3)', letterSpacing:'.07em', marginBottom:8 };
  const inputStyle: React.CSSProperties = {
    background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)',
    padding:'10px 14px', borderRadius:8, fontSize:14, width:'100%', textAlign:'center',
    fontFamily:"'DM Mono',monospace", letterSpacing:8,
  };
  const selStyle: React.CSSProperties = {
    background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)',
    padding:'7px 10px', borderRadius:7, fontSize:12, flex:1,
  };
  const subBtnStyle = (active: boolean): React.CSSProperties => ({
    display:'flex', alignItems:'center', justifyContent:'space-between',
    width:'100%', padding:'10px 12px', border:'1px solid var(--border)',
    borderRadius:8, background: active ? 'var(--zcdim)' : 'var(--bg3)',
    color: active ? 'var(--zc)' : 'var(--txt2)', cursor:'pointer', fontSize:12,
    fontWeight: active ? 600 : 400, marginBottom:6, transition:'all var(--t-fast)',
  });

  function PinInput({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
    return (
      <input type="password" inputMode="numeric" maxLength={4} value={value} placeholder="••••"
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
    const borderVal = danger ? '1px solid #e05c5c33' : secondary ? '1px solid var(--border)' : 'none';
    const extraStyle = (!danger && !secondary) ? { boxShadow:'var(--shadow-z)' as string } : {};
    return (
      <button onClick={onClick} style={{
        width:'100%', padding:'10px', borderRadius:8, border: borderVal, cursor:'pointer',
        fontSize:13, fontWeight:600, marginTop:8, transition:'all var(--t-fast)',
        background: danger?'#1f0d0d':secondary?'var(--bg3)':'var(--zc)',
        color: danger?'#e05c5c':secondary?'var(--txt2)':'#fff',
        ...extraStyle,
      }}>{label}</button>
    );
  }

  // ── Panel selector komponen untuk Export & Share ──
  function ZoneTypePicker({ zone, setZone, type, setType, showAll=false }: {
    zone:'KRS'|'SLK'|'ALL'; setZone:(z:'KRS'|'SLK'|'ALL')=>void;
    type:'monthly'|'yearly'; setType:(t:'monthly'|'yearly')=>void;
    showAll?: boolean;
  }) {
    return (
      <div style={{ marginTop:10 }}>
        <div style={labelStyle}>ZONA</div>
        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
          {(['KRS','SLK', ...(showAll?['ALL']:[])] as ('KRS'|'SLK'|'ALL')[]).map(z => (
            <button key={z} onClick={() => setZone(z)} style={{
              flex:1, padding:'7px', borderRadius:7, border:`1px solid ${zone===z?'var(--zc)':'var(--border)'}`,
              background: zone===z?'var(--zcdim)':'var(--bg3)', color: zone===z?'var(--zc)':'var(--txt2)',
              cursor:'pointer', fontSize:11, fontWeight:600, transition:'all var(--t-fast)',
            }}>{z}</button>
          ))}
        </div>
        <div style={labelStyle}>TIPE</div>
        <div style={{ display:'flex', gap:6 }}>
          {([['Bulanan','monthly'],['Tahunan','yearly']] as const).map(([lbl,val]) => (
            <button key={val} onClick={() => setType(val)} style={{
              flex:1, padding:'7px', borderRadius:7, border:`1px solid ${type===val?'var(--zc)':'var(--border)'}`,
              background: type===val?'var(--zcdim)':'var(--bg3)', color: type===val?'var(--zc)':'var(--txt2)',
              cursor:'pointer', fontSize:11, fontWeight:600, transition:'all var(--t-fast)',
            }}>{lbl}</button>
          ))}
        </div>
      </div>
    );
  }

  function YearMonthPicker({ year, setYear, month, setMonth, showMonth }: {
    year:number; setYear:(y:number)=>void; month:number; setMonth:(m:number)=>void; showMonth:boolean;
  }) {
    return (
      <div style={{ display:'flex', gap:6, marginTop:10 }}>
        <select style={selStyle} value={year} onChange={e => setYear(+e.target.value)}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {showMonth && (
          <select style={selStyle} value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
          </select>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, marginBottom:14, color:'var(--txt)' }}>
        ⚙️ Pengaturan
      </div>

      {/* ══════════════════════════════
          PIN SECURITY
      ══════════════════════════════ */}
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

          {/* Auto-lock timeout — hanya tampil jika PIN aktif */}
          {settings.pinEnabled && (
            <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid var(--border2)' }}>
              <div style={{ ...labelStyle, marginBottom:10 }}>AUTO-LOCK PIN</div>
              <div style={{ fontSize:11, color:'var(--txt4)', marginBottom:8, lineHeight:1.5 }}>
                Kunci layar otomatis jika tidak ada aktivitas. Firebase tetap aktif, tidak perlu login ulang.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {TIMEOUT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { updateSettings({ pinTimeoutMinutes: opt.value }); showToast(`Auto-lock: ${opt.label}`); }}
                    style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'8px 12px', borderRadius:7, border:`1px solid ${settings.pinTimeoutMinutes===opt.value?'var(--zc)':'var(--border)'}`,
                      background: settings.pinTimeoutMinutes===opt.value?'var(--zcdim)':'var(--bg3)',
                      color: settings.pinTimeoutMinutes===opt.value?'var(--zc)':'var(--txt2)',
                      cursor:'pointer', fontSize:12, transition:'all var(--t-fast)',
                    }}>
                    <span>{opt.label}</span>
                    {settings.pinTimeoutMinutes===opt.value && <span style={{ fontSize:10 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
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

      {/* ══════════════════════════════
          EXPORT DATA
      ══════════════════════════════ */}
      <div style={cardStyle}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginBottom:12 }}>⬇ Export Data</div>

        {/* JSON Backup */}
        <button style={subBtnStyle(exportPanel==='json')} onClick={() => {
          doJSONBackup(appData); showToast('✅ Backup JSON didownload');
        }}>
          <span>📦 JSON (Backup)</span>
          <span style={{ fontSize:10, color:'var(--txt4)' }}>Download langsung</span>
        </button>

        {/* PDF */}
        <button style={subBtnStyle(exportPanel==='pdf')} onClick={() => setExportPanel(exportPanel==='pdf' ? null : 'pdf')}>
          <span>📄 PDF</span>
          <span style={{ fontSize:13 }}>{exportPanel==='pdf' ? '▲' : '▼'}</span>
        </button>
        {exportPanel === 'pdf' && (
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:12, marginBottom:6 }}>
            <ZoneTypePicker zone={expZone} setZone={setExpZone} type={expType} setType={setExpType} showAll />
            <YearMonthPicker year={expYear} setYear={setExpYear} month={expMonth} setMonth={setExpMonth} showMonth={expType==='monthly'} />
            <button onClick={handleDownloadPDF} style={{ width:'100%', marginTop:10, padding:'9px', borderRadius:7, border:'none', background:'var(--zc)', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', boxShadow:'var(--shadow-z)' }}>
              ⬇ Download PDF
            </button>
          </div>
        )}

        {/* Excel */}
        <button style={subBtnStyle(exportPanel==='excel')} onClick={() => setExportPanel(exportPanel==='excel' ? null : 'excel')}>
          <span>📊 Excel</span>
          <span style={{ fontSize:13 }}>{exportPanel==='excel' ? '▲' : '▼'}</span>
        </button>
        {exportPanel === 'excel' && (
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:12, marginBottom:6 }}>
            <ZoneTypePicker zone={expZone} setZone={setExpZone} type={expType} setType={setExpType} />
            <YearMonthPicker year={expYear} setYear={setExpYear} month={expMonth} setMonth={setExpMonth} showMonth={expType==='monthly'} />
            <button onClick={handleDownloadExcel} style={{ width:'100%', marginTop:10, padding:'9px', borderRadius:7, border:'none', background:'#1d6f42', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer' }}>
              ⬇ Download Excel
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════
          SHARE & REKAP
      ══════════════════════════════ */}
      <div style={cardStyle}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginBottom:12 }}>📤 Share & Rekap</div>

        {/* WA Summary */}
        <button style={subBtnStyle(sharePanel==='wa')} onClick={() => setSharePanel(sharePanel==='wa' ? null : 'wa')}>
          <span>💬 Kirim Ringkasan WA</span>
          <span style={{ fontSize:13 }}>{sharePanel==='wa' ? '▲' : '▼'}</span>
        </button>
        {sharePanel === 'wa' && (
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:12, marginBottom:6 }}>
            <div style={{ ...labelStyle, marginBottom:8 }}>PERIODE RINGKASAN</div>
            <div style={{ display:'flex', gap:6 }}>
              <select style={selStyle} value={waYear} onChange={e => setWaYear(+e.target.value)}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={selStyle} value={waMonth} onChange={e => setWaMonth(+e.target.value)}>
                {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <button onClick={handleWASummary} style={{ width:'100%', marginTop:10, padding:'9px', borderRadius:7, border:'none', background:'#25D366', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer' }}>
              📲 Kirim ke WhatsApp
            </button>
          </div>
        )}

        {/* Share PDF/Excel */}
        <button style={subBtnStyle(sharePanel==='share-file')} onClick={() => setSharePanel(sharePanel==='share-file' ? null : 'share-file')}>
          <span>📁 Share PDF / Excel</span>
          <span style={{ fontSize:13 }}>{sharePanel==='share-file' ? '▲' : '▼'}</span>
        </button>
        {sharePanel === 'share-file' && (
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:12, marginBottom:6 }}>
            {/* Format */}
            <div style={{ ...labelStyle, marginBottom:8 }}>FORMAT</div>
            <div style={{ display:'flex', gap:6, marginBottom:10 }}>
              {(['pdf','excel'] as const).map(f => (
                <button key={f} onClick={() => setSfFmt(f)} style={{
                  flex:1, padding:'7px', borderRadius:7, border:`1px solid ${sfFmt===f?'var(--zc)':'var(--border)'}`,
                  background: sfFmt===f?'var(--zcdim)':'var(--bg3)', color: sfFmt===f?'var(--zc)':'var(--txt2)',
                  cursor:'pointer', fontSize:11, fontWeight:600, textTransform:'uppercase', transition:'all var(--t-fast)',
                }}>{f}</button>
              ))}
            </div>
            <ZoneTypePicker zone={sfZone} setZone={setSfZone} type={sfType} setType={setSfType} showAll={sfFmt==='pdf'} />
            <YearMonthPicker year={sfYear} setYear={setSfYear} month={sfMonth} setMonth={setSfMonth} showMonth={sfType==='monthly'} />
            <button onClick={handleShareFile} style={{ width:'100%', marginTop:10, padding:'9px', borderRadius:7, border:'none', background:'var(--zc)', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', boxShadow:'var(--shadow-z)' }}>
              📤 Generate & Share
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════
          TANGGAL BAYAR
      ══════════════════════════════ */}
      <div style={cardStyle}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginBottom:4 }}>📅 Tanggal Bayar</div>
        <div style={{ fontSize:11, color:'var(--txt3)', marginBottom:12 }}>
          {settings.autoDate ? 'Otomatis — tanggal hari ini saat entry bayar' : 'Manual — isi tanggal sendiri setiap entry'}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {([['Otomatis',true],['Manual',false]] as const).map(([label, val]) => (
            <button key={label} onClick={() => { updateSettings({ autoDate: val }); showToast(`Tanggal bayar: ${label}`); }}
              style={{ flex:1, padding:'9px', borderRadius:8, border:`1px solid ${settings.autoDate===val?'var(--zc)':'var(--border)'}`, background: settings.autoDate===val?'var(--zcdim)':'var(--bg3)', color: settings.autoDate===val?'var(--zc)':'var(--txt2)', cursor:'pointer', fontSize:12, fontWeight:600, transition:'all var(--t-fast)' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ fontSize:10, color:'var(--txt4)', marginTop:8, lineHeight:1.5 }}>
          {settings.autoDate ? '💡 Saat quick pay, tanggal otomatis terisi dengan hari ini.' : '💡 Tanggal tidak otomatis terisi — berguna saat rekap telat.'}
        </div>
      </div>

      {/* ══════════════════════════════
          NOMINAL QUICK PAY
      ══════════════════════════════ */}
      <div style={cardStyle}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginBottom:4 }}>⚡ Nominal Quick Pay Default</div>
        <div style={{ fontSize:11, color:'var(--txt3)', marginBottom:12 }}>
          Nominal quick pay yang tampil untuk member yang belum punya tarif khusus.
        </div>
        <div style={{ ...labelStyle, marginBottom:8 }}>NOMINAL (×1000) — pisahkan dengan koma</div>
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
          💡 <b>Tarif per member</b> (tombol ★ biru) diatur di menu <b>Member → ✏️ Edit → Tarif</b>.
        </div>
      </div>

      {/* ══════════════════════════════
          APP INFO
      ══════════════════════════════ */}
      <div style={{ ...cardStyle, textAlign:'center' }}>
        <div style={{ fontSize:11, color:'var(--txt4)', lineHeight:2 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:'var(--txt)', marginBottom:4 }}>📶 WiFi Pay</div>
          <div>Versi v11.0 Next</div>
          <div>Firebase: wifi-pay-online</div>
          <div>Server: Singapore</div>
        </div>
      </div>
    </div>
  );
}
