// components/views/SettingsView.tsx — Sesi 5D: Lucide, Zona Management, Bahasa, Export proper
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/Confirm';
import { doJSONBackup, doWASummary, generatePDF, generateExcel } from '@/lib/export';
import { saveDB } from '@/lib/db';
import type { CustomZone } from '@/types';
import { useT } from '@/hooks/useT';
import { MONTHS, MONTHS_EN, MONTHS_ID, YEARS } from '@/lib/constants';
import {
  Shield, Settings, Globe, Download, Calendar, Zap, Info,
  ChevronDown, ChevronUp, Check, X, Plus, Edit2, Eye, EyeOff,
  Wifi, FileText, Table2, Share2, MessageCircle,
} from 'lucide-react';

type PinStep = 'menu' | 'enable-new' | 'enable-confirm' | 'disable-verify' | 'change-old' | 'change-new' | 'change-confirm';

const TIMEOUT_KEYS = [
  { key: 'settings.timeout.never', value: 0 },
  { key: 'settings.timeout.5m',    value: 5 },
  { key: 'settings.timeout.10m',   value: 10 },
  { key: 'settings.timeout.30m',   value: 30 },
  { key: 'settings.timeout.1h',    value: 60 },
];

export default function SettingsView() {
  const { settings, updateSettings, appData, setAppData, uid, userEmail, setSyncStatus } = useAppStore();

  // PIN state
  const [pinStep, setPinStep] = useState<PinStep>('menu');
  const [pin1, setPin1]       = useState('');
  const [pin2, setPin2]       = useState('');
  const [pinErr, setPinErr]   = useState('');

  // Quick amounts
  const [newAmounts, setNewAmounts] = useState(settings.quickAmounts.join(', '));

  // Export state — compact selectors
  const [expOpen,  setExpOpen]  = useState(false);
  const [expZone,  setExpZone]  = useState<'KRS'|'SLK'|'ALL'>('KRS');
  const [expType,  setExpType]  = useState<'monthly'|'yearly'>('monthly');
  const [expYear,  setExpYear]  = useState(new Date().getFullYear());
  const [expMonth, setExpMonth] = useState(new Date().getMonth());

  // Share WA state
  const [waOpen,  setWaOpen]   = useState(false);
  const [waYear,  setWaYear]   = useState(new Date().getFullYear());
  const [waMonth, setWaMonth]  = useState(new Date().getMonth());

  // Share file state
  const [sfOpen,  setSfOpen]   = useState(false);
  const [sfZone,  setSfZone]   = useState<'KRS'|'SLK'|'ALL'>('KRS');
  const [sfType,  setSfType]   = useState<'monthly'|'yearly'>('monthly');
  const [sfYear,  setSfYear]   = useState(new Date().getFullYear());
  const [sfMonth, setSfMonth]  = useState(new Date().getMonth());
  const [sfFmt,   setSfFmt]    = useState<'pdf'|'excel'>('pdf');

  // Zona management
  const [zonaOpen,    setZonaOpen]    = useState(false);
  const [editingZona, setEditingZona] = useState<string | null>(null);
  const [editZonaVal, setEditZonaVal] = useState('');
  const [addZonaOpen, setAddZonaOpen] = useState(false);
  const [newZonaKey,  setNewZonaKey]  = useState('');
  const [newZonaColor, setNewZonaColor] = useState('#8B5CF6');
  const t = useT();
  const lang = (useAppStore(s => s.settings) as any).language ?? 'id';
  const MONTH_NAMES = lang === 'en' ? MONTHS_EN : MONTHS_ID;

  async function persistData(newData: typeof appData, action: string, detail: string) {
    setAppData(newData);
    if (!uid) return;
    setSyncStatus('loading');
    try { await saveDB(uid, newData, { action, detail }, userEmail || ''); setSyncStatus('ok'); }
    catch { setSyncStatus('err'); }
  }

  // ── PIN helpers ──
  function simpleHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return String(Math.abs(h));
  }
  function verifyPin(input: string) { return simpleHash(input) === settings.pin; }
  function validatePin(p: string): boolean {
    if (p.length !== 4 || !/^\d{4}$/.test(p)) { setPinErr(t('pin.notMatch')); return false; }
    return true;
  }
  function startEnable() { setPinStep('enable-new'); setPin1(''); setPin2(''); setPinErr(''); }
  function handleEnableNew() { if (!validatePin(pin1)) return; setPinStep('enable-confirm'); setPin2(''); setPinErr(''); }
  function handleEnableConfirm() {
    if (pin2 !== pin1) { setPinErr(t('pin.notMatch')); setPin2(''); return; }
    updateSettings({ pinEnabled: true, pin: simpleHash(pin1) });
    showToast(t('settings.pin.toastEnabled')); setPinStep('menu'); setPin1(''); setPin2('');
  }
  function startDisable() { setPinStep('disable-verify'); setPin1(''); setPinErr(''); }
  function handleDisableVerify() {
    if (!verifyPin(pin1)) { setPinErr(t('pin.wrong')); setPin1(''); return; }
    showConfirm('🔓', t('settings.pin.disableConfirm'), t('action.confirm'), () => {
      updateSettings({ pinEnabled: false, pin: '' });
      showToast(t('settings.pin.toastDisabled')); setPinStep('menu'); setPin1('');
    });
  }
  function startChange() { setPinStep('change-old'); setPin1(''); setPin2(''); setPinErr(''); }
  function handleChangeOld() { if (!verifyPin(pin1)) { setPinErr(t('pin.wrong')); setPin1(''); return; } setPinStep('change-new'); setPin1(''); setPinErr(''); }
  function handleChangeNew() { if (!validatePin(pin1)) return; setPinStep('change-confirm'); setPin2(''); setPinErr(''); }
  function handleChangeConfirm() {
    if (pin2 !== pin1) { setPinErr(t('pin.notMatch')); setPin2(''); return; }
    updateSettings({ pin: simpleHash(pin1) }); showToast(t('settings.pin.toastChanged')); setPinStep('menu'); setPin1(''); setPin2('');
  }

  function saveAmounts() {
    const parsed = newAmounts.split(/[,\s]+/).map(s => +s.trim()).filter(n => n > 0 && !isNaN(n));
    if (parsed.length < 2) { showToast(t('settings.quickPay.minError'), 'err'); return; }
    if (parsed.length > 8) { showToast(t('settings.quickPay.maxError'), 'err'); return; }
    updateSettings({ quickAmounts: parsed }); showToast(t('settings.quickPay.saved'));
  }

  // Export handlers
  async function handleDownloadPDF() {
    try {
      showToast(t('settings.export.makingPDF'), 'info');
      const month = expType === 'yearly' ? null : expMonth;
      const { blob, filename } = await generatePDF(appData, expZone, expYear, month);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(t('settings.export.pdfDone'));
    } catch { showToast(t('settings.export.pdfError'), 'err'); }
  }
  function handleDownloadExcel() {
    try {
      showToast(t('settings.export.makingExcel'), 'info');
      const month = expType === 'yearly' ? null : expMonth;
      const { blob, filename } = generateExcel(appData, expZone, expYear, month);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(t('settings.export.excelDone'));
    } catch { showToast(t('settings.export.excelError'), 'err'); }
  }
  function handleWASummary() { doWASummary(appData, waYear, waMonth); }
  async function handleShareFile() {
    try {
      showToast(t('settings.export.makingFile'), 'info');
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
          showToast(t('settings.export.fileDownloaded'));
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
          showToast(t('settings.export.fileDownloaded'));
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') showToast(t('settings.export.fileError'), 'err');
    }
  }

  // ── Zona management ──
  const zonaHidden: string[]    = (settings as any).hiddenZones ?? [];
  const customZones: CustomZone[] = (settings as any).customZones ?? [];
  // Semua zona: KRS + SLK + custom
  const allZones: { key: string; color: string; isCustom: boolean }[] = [
    { key: 'KRS', color: 'var(--zc-krs)', isCustom: false },
    { key: 'SLK', color: 'var(--zc-slk)', isCustom: false },
    ...customZones.map(z => ({ key: z.key, color: z.color, isCustom: true })),
  ];

  function saveHiddenZones(arr: string[]) {
    updateSettings({ ...(settings as any), hiddenZones: arr });
  }

  function startEditZona(z: string) {
    setEditingZona(z);
    setEditZonaVal(z);
  }

  function saveEditZona(oldZone: string) {
    const newName = editZonaVal.trim().toUpperCase();
    if (!newName || newName === oldZone) { setEditingZona(null); return; }
    if (newName.length > 6) { showToast(t('zona.nameTooLong'), 'err'); return; }
    showConfirm(
      '⚠️',
      `Ganti nama zona <b>${oldZone}</b> → <b>${newName}</b>?<br><span style="font-size:11px;color:var(--txt3)">'+t('zona.renameNote')+'</span>`,
      t('zona.renameYes'),
      () => {
        const zoneNames = (settings as any).zoneNames ?? {};
        updateSettings({ ...(settings as any), zoneNames: { ...zoneNames, [oldZone]: newName } });
        showToast(`Zona ${oldZone} ${t('zona.renamed')} ${newName}`);
        setEditingZona(null);
      }
    );
  }

  function toggleHideZona(z: string) {
    const isHidden = zonaHidden.includes(z);
    const memCount = z === 'KRS' ? appData.krsMembers.length
                   : z === 'SLK' ? appData.slkMembers.length
                   : (appData.zoneMembers?.[z] ?? []).length;
    if (!isHidden && memCount > 0) {
      showConfirm('⚠️', `Sembunyikan zona <b>${z}</b>?<br><span style="font-size:11px;color:var(--txt3)">${z} ${memCount} ${t('zona.hideConfirmWithMembers')}</span>`, t('zona.hideYes'), () => {
        saveHiddenZones([...zonaHidden, z]);
        showToast(`Zona ${z} ${t('zona.hidden')}`);
      });
    } else if (!isHidden) {
      showConfirm('⚠️', `Sembunyikan zona <b>${z}</b>?`, t('zona.hideYes'), () => {
        saveHiddenZones([...zonaHidden, z]);
        showToast(`Zona ${z} ${t('zona.hidden')}`);
      });
    } else {
      showConfirm('⚠️', `Tampilkan kembali zona <b>${z}</b>?`, t('zona.showYes'), () => {
        saveHiddenZones(zonaHidden.filter(h => h !== z));
        showToast(`Zona ${z} ${t('zona.shown')}`);
      });
    }
  }

  function addZona() {
    const key = newZonaKey.trim().toUpperCase();
    if (!key) { showToast(t('zona.nameRequired'), 'err'); return; }
    if (key.length > 6) { showToast(t('zona.nameTooLong'), 'err'); return; }
    if (['KRS','SLK',...customZones.map(z=>z.key)].includes(key)) {
      showToast(t('zona.duplicate'), 'err'); return;
    }
    const newZona: CustomZone = { key, name: key, color: newZonaColor };
    updateSettings({ ...(settings as any), customZones: [...customZones, newZona] });
    showToast(`Zona ${key} ${t('zona.added')}`);
    setNewZonaKey('');
    setNewZonaColor('#8B5CF6');
    setAddZonaOpen(false);
  }

  function deleteCustomZona(key: string) {
    const memCount = (appData.zoneMembers?.[key] ?? []).length;
    showConfirm(
      '⚠️',
      `Hapus zona <b>${key}</b>?${memCount > 0 ? `<br><span style="font-size:11px;color:var(--c-belum)">${memCount} '+t('zona.deleteHasMembers'))+'</span>` : ''}`,
      t('zona.deleteYes'),
      () => {
        updateSettings({ ...(settings as any), customZones: customZones.filter(z => z.key !== key) });
        // Hapus member data zona custom
        if (appData.zoneMembers?.[key]) {
          const { [key]: _, ...rest } = appData.zoneMembers;
          persistData({ ...appData, zoneMembers: rest }, `🗑️ Hapus zona ${key}`, '');
        }
        showToast(`Zona ${key} ${t('zona.deleted')}`);
      }
    );
  }

  // ── Reusable styles ──
  const cardStyle: React.CSSProperties = {
    background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:16, marginBottom:10, boxShadow:'var(--shadow-xs)',
  };
  const cardCritStyle: React.CSSProperties = {
    ...cardStyle, boxShadow:'var(--shadow-md)', border:'1px solid rgba(255,255,255,0.08)',
  };
  const labelStyle: React.CSSProperties = { fontSize:10, color:'var(--txt3)', letterSpacing:'.07em', marginBottom:8, fontFamily:"'DM Sans',sans-serif" };
  const inputStyle: React.CSSProperties = {
    background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)',
    padding:'10px 14px', borderRadius:'var(--r-sm)', fontSize:14, width:'100%', textAlign:'center',
    fontFamily:"'DM Mono',monospace", letterSpacing:8,
  };
  const selStyle: React.CSSProperties = {
    background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)',
    padding:'7px 10px', borderRadius:'var(--r-sm)', fontSize:12, flex:1,
  };

  function ToggleChip({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
    return (
      <button onClick={onClick} style={{
        flex:1, padding:'8px', borderRadius:'var(--r-sm)',
        border:`1px solid ${active ? 'var(--zc)' : 'var(--border)'}`,
        background: active ? 'var(--zcdim)' : 'var(--bg3)',
        color: active ? 'var(--zc)' : 'var(--txt2)',
        cursor:'pointer', fontSize:12, fontWeight: active ? 600 : 400,
        transition:'all var(--t-fast)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:4,
      }}>
        {active && <Check size={11} />}
        {label}
      </button>
    );
  }

  function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title:string; desc?:string }) {
    return (
      <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:14 }}>
        <div style={{ color:'var(--zc)', marginTop:2 }}>{icon}</div>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:'var(--txt)' }}>{title}</div>
          {desc && <div style={{ fontSize:11, color:'var(--txt3)', marginTop:2 }}>{desc}</div>}
        </div>
      </div>
    );
  }

  function Btn({ label, onClick, danger=false, secondary=false, icon }: { label:string; onClick:()=>void; danger?:boolean; secondary?:boolean; icon?: React.ReactNode }) {
    return (
      <button onClick={onClick} style={{
        width:'100%', padding:'10px 14px', borderRadius:'var(--r-sm)', cursor:'pointer',
        fontSize:13, fontWeight:600, marginTop:8, transition:'all var(--t-fast)',
        border: danger ? '1px solid rgba(239,68,68,0.3)' : secondary ? '1px solid var(--border)' : 'none',
        background: danger ? 'rgba(239,68,68,0.1)' : secondary ? 'var(--bg3)' : 'var(--zc)',
        color: danger ? 'var(--c-belum)' : secondary ? 'var(--txt2)' : '#fff',
        boxShadow: (!danger && !secondary) ? 'var(--shadow-z)' : undefined,
        display:'flex', alignItems:'center', justifyContent:'center', gap:6,
      }}>
        {icon} {label}
      </button>
    );
  }

  function PinInput({ value, onChange }: { value:string; onChange:(v:string)=>void }) {
    return (
      <input type="password" inputMode="numeric" maxLength={4} value={value} placeholder="••••"
        onChange={e => onChange(e.target.value.replace(/\D/g,'').slice(0,4))}
        style={inputStyle} autoFocus />
    );
  }

  function PinCard({ title, desc, children }: { title:string; desc?:string; children:React.ReactNode }) {
    return (
      <div style={cardCritStyle}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, marginBottom:4, color:'var(--txt)' }}>{title}</div>
        {desc && <div style={{ fontSize:11, color:'var(--txt3)', marginBottom:12 }}>{desc}</div>}
        {children}
        {pinErr && <div style={{ fontSize:11, color:'var(--c-belum)', textAlign:'center', marginTop:8 }}>{pinErr}</div>}
      </div>
    );
  }

  // Compact dropdown row untuk Export
  function ExportSelectors({ zone, setZone, type, setType, year, setYear, month, setMonth, showAll }: {
    zone:'KRS'|'SLK'|'ALL'; setZone:(z:'KRS'|'SLK'|'ALL')=>void;
    type:'monthly'|'yearly'; setType:(t:'monthly'|'yearly')=>void;
    year:number; setYear:(y:number)=>void;
    month:number; setMonth:(m:number)=>void;
    showAll?: boolean;
  }) {
    return (
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>
        <select style={{ ...selStyle, flex:'none', minWidth:70 }} value={zone} onChange={e => setZone(e.target.value as any)}>
          <option value="KRS">KRS</option>
          <option value="SLK">SLK</option>
          {showAll && <option value="ALL">ALL</option>}
        </select>
        <select style={{ ...selStyle, flex:'none', minWidth:90 }} value={type} onChange={e => setType(e.target.value as any)}>
          <option value="monthly">{t('settings.export.monthly')}</option>
          <option value="yearly">{t('settings.export.yearly')}</option>
        </select>
        {type === 'monthly' && (
          <select style={{ ...selStyle, flex:'none', minWidth:80 }} value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        )}
        <select style={{ ...selStyle, flex:'none', minWidth:68 }} value={year} onChange={e => setYear(+e.target.value)}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'var(--fs-display)', marginBottom:16, color:'var(--txt)', display:'flex', alignItems:'center', gap:8 }}>
        <Settings size={18} strokeWidth={1.5} /> {t('settings.pageTitle')}
      </div>

      {/* ═══════════════════════════════
          KRITIS: PIN SECURITY
      ═══════════════════════════════ */}
      {pinStep === 'menu' && (
        <div style={cardCritStyle}>
          <SectionHeader
            icon={<Shield size={16} strokeWidth={1.5} />}
            title={t('settings.pin')}
            desc={settings.pinEnabled ? t('Aktif — app terkunci saat dibuka') : t('Nonaktif — app langsung terbuka')}
          />
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12, marginTop:-8 }}>
            <span style={{ fontSize:11, fontWeight:700, color: settings.pinEnabled ? 'var(--c-lunas)' : 'var(--txt4)', display:'flex', alignItems:'center', gap:4 }}>
              {settings.pinEnabled ? <Check size={12} /> : null}
              {settings.pinEnabled ? t('settings.pinStatus.active') : t('settings.pinStatus.inactive')}
            </span>
          </div>
          {!settings.pinEnabled
            ? <Btn label={t('settings.pinEnable')} onClick={startEnable} icon={<Shield size={13} />} />
            : <>
                <Btn label={t('settings.pinChange')} onClick={startChange} secondary />
                <Btn label={t('settings.pinDisable')} onClick={startDisable} danger />
              </>
          }
          {settings.pinEnabled && (
            <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid var(--border2)' }}>
              <div style={{ ...labelStyle, marginBottom:10 }}>{t('settings.autoLock')}</div>
              <div style={{ fontSize:11, color:'var(--txt4)', marginBottom:8, lineHeight:1.5 }}>
                {t('settings.autoLockDesc')}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {TIMEOUT_KEYS.map(opt => (
                  <button key={opt.value} onClick={() => { updateSettings({ pinTimeoutMinutes: opt.value }); showToast(`Auto-lock: ${t(opt.key)}`); }}
                    style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'8px 12px', borderRadius:'var(--r-sm)',
                      border:`1px solid ${settings.pinTimeoutMinutes===opt.value ? 'var(--zc)' : 'var(--border)'}`,
                      background: settings.pinTimeoutMinutes===opt.value ? 'var(--zcdim)' : 'var(--bg3)',
                      color: settings.pinTimeoutMinutes===opt.value ? 'var(--zc)' : 'var(--txt2)',
                      cursor:'pointer', fontSize:12, transition:'all var(--t-fast)',
                    }}>
                    <span>{t(opt.key)}</span>
                    {settings.pinTimeoutMinutes===opt.value && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {pinStep === 'enable-new' && (
        <PinCard title={t('settings.pin.newTitle')} desc={t('settings.pin.enterNew')}>
          <PinInput value={pin1} onChange={setPin1} />
          <Btn label={t('action.confirm')} onClick={handleEnableNew} />
          <Btn label={t('action.cancel')} onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}
      {pinStep === 'enable-confirm' && (
        <PinCard title={t('pin.confirm')} desc={t('settings.pin.reenterNew')}>
          <PinInput value={pin2} onChange={setPin2} />
          <Btn label={t('settings.pinSave')} onClick={handleEnableConfirm} />
          <Btn label={t('action.cancel')} onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}
      {pinStep === 'disable-verify' && (
        <PinCard title={t('settings.pinDisable')} desc={t('settings.pin.enterCurrent')}>
          <PinInput value={pin1} onChange={setPin1} />
          <Btn label={t('action.confirm')} onClick={handleDisableVerify} />
          <Btn label={t('action.cancel')} onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}
      {pinStep === 'change-old' && (
        <PinCard title={t('settings.pinChange')} desc={t('settings.pin.enterOld')}>
          <PinInput value={pin1} onChange={setPin1} />
          <Btn label={t('action.confirm')} onClick={handleChangeOld} />
          <Btn label={t('action.cancel')} onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}
      {pinStep === 'change-new' && (
        <PinCard title={t('settings.pin.newTitle')} desc={t('settings.pin.enterNew')}>
          <PinInput value={pin1} onChange={setPin1} />
          <Btn label={t('action.confirm')} onClick={handleChangeNew} />
          <Btn label={t('action.cancel')} onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}
      {pinStep === 'change-confirm' && (
        <PinCard title={t('pin.confirm')} desc={t('settings.pin.reenterNew')}>
          <PinInput value={pin2} onChange={setPin2} />
          <Btn label={t('settings.pinSave')} onClick={handleChangeConfirm} />
          <Btn label={t('action.cancel')} onClick={() => setPinStep('menu')} secondary />
        </PinCard>
      )}

      {/* ═══════════════════════════════
          KRITIS: ZONA MANAGEMENT
      ═══════════════════════════════ */}
      <div style={cardCritStyle}>
        <button
          onClick={() => setZonaOpen(v => !v)}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', background:'none', border:'none', cursor:'pointer', padding:0, color:'var(--txt)' }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ color:'var(--zc)' }}><Settings size={16} strokeWidth={1.5} /></div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>{t('settings.zones')}</div>
              <div style={{ fontSize:11, color:'var(--txt3)', marginTop:2 }}>{t('settings.zonesNote').split('.')[0]}</div>
            </div>
          </div>
          {zonaOpen ? <ChevronUp size={16} color="var(--txt3)" /> : <ChevronDown size={16} color="var(--txt3)" />}
        </button>

        {zonaOpen && (
          <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid var(--border2)' }}>
            {allZones.map(({ key: z, color: zColor, isCustom }) => {
              const isHidden  = zonaHidden.includes(z);
              const memCount  = z === 'KRS' ? appData.krsMembers.length
                              : z === 'SLK' ? appData.slkMembers.length
                              : (appData.zoneMembers?.[z] ?? []).length;
              const isEditing = editingZona === z;

              return (
                <div key={z} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                  background: isHidden ? 'rgba(255,255,255,0.02)' : 'var(--bg3)',
                  borderRadius:'var(--r-sm)', marginBottom:6,
                  border:`1px solid ${isHidden ? 'rgba(255,255,255,0.04)' : 'var(--border)'}`,
                  opacity: isHidden ? 0.6 : 1,
                  transition:'all var(--t-base)',
                }}>
                  {/* Zona color dot */}
                  <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background: zColor }} />

                  {/* Nama / edit input */}
                  {isEditing ? (
                    <input autoFocus value={editZonaVal}
                      onChange={e => setEditZonaVal(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') saveEditZona(z); if (e.key === 'Escape') setEditingZona(null); }}
                      style={{ flex:1, background:'var(--bg4)', border:'1px solid var(--zc)', color:'var(--txt)', padding:'4px 8px', borderRadius:'var(--r-xs)', fontSize:13, fontFamily:"'DM Mono',monospace" }}
                      maxLength={6}
                    />
                  ) : (
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:'var(--txt)', display:'flex', alignItems:'center', gap:6 }}>
                        {z}
                        {isCustom && <span style={{ fontSize:9, background:'rgba(139,92,246,0.15)', color:'#A78BFA', padding:'1px 6px', borderRadius:'var(--r-xs)' }}>Custom</span>}
                        {isHidden && <span style={{ fontSize:9, background:'rgba(255,255,255,0.06)', color:'var(--txt4)', padding:'1px 6px', borderRadius:'var(--r-xs)' }}>{t('settings.zona.hidden')}</span>}
                      </div>
                      <div style={{ fontSize:10, color:'var(--txt4)', marginTop:1 }}>{memCount} {t('common.members')}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display:'flex', gap:4 }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEditZona(z)} aria-label={t('action.save')} style={{ background:'var(--zc)', border:'none', color:'#fff', width:28, height:28, borderRadius:'var(--r-xs)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Check size={12} />
                        </button>
                        <button onClick={() => setEditingZona(null)} aria-label={t('action.cancel')} style={{ background:'var(--bg4)', border:'1px solid var(--border)', color:'var(--txt3)', width:28, height:28, borderRadius:'var(--r-xs)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditZona(z)} aria-label={`Edit zona ${z}`} style={{ background:'var(--bg4)', border:'1px solid var(--border)', color:'var(--txt3)', width:28, height:28, borderRadius:'var(--r-xs)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--t-fast)' }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => toggleHideZona(z)} aria-label={isHidden ? `Tampilkan ${z}` : `Sembunyikan ${z}`} style={{ background:'var(--bg4)', border:'1px solid var(--border)', color: isHidden ? 'var(--c-lunas)' : 'var(--txt3)', width:28, height:28, borderRadius:'var(--r-xs)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--t-fast)' }}>
                          {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        {isCustom && (
                          <button onClick={() => deleteCustomZona(z)} aria-label={`Hapus zona ${z}`} style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', color:'var(--c-belum)', width:28, height:28, borderRadius:'var(--r-xs)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--t-fast)' }}>
                            <X size={12} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Form tambah zona baru */}
            {addZonaOpen ? (
              <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:'12px', marginTop:8 }}>
                <div style={{ fontSize:10, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:10 }}>{t('settings.addZone').toUpperCase()}</div>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
                  <input
                    autoFocus
                    value={newZonaKey}
                    onChange={e => setNewZonaKey(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') addZona(); if (e.key === 'Escape') setAddZonaOpen(false); }}
                    placeholder={t('settings.zona.namePlaceholder')}
                    maxLength={6}
                    style={{ flex:1, background:'var(--bg4)', border:'1px solid var(--border)', color:'var(--txt)', padding:'8px 10px', borderRadius:'var(--r-xs)', fontSize:13, fontFamily:"'DM Mono',monospace", outline:'none' }}
                  />
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                    <label style={{ fontSize:10, color:'var(--txt3)' }}>{t('settings.zona.color')}:</label>
                    <input
                      type="color"
                      value={newZonaColor}
                      onChange={e => setNewZonaColor(e.target.value)}
                      style={{ width:32, height:28, border:'1px solid var(--border)', borderRadius:'var(--r-xs)', cursor:'pointer', padding:2, background:'var(--bg4)' }}
                    />
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={addZona}
                    style={{ flex:1, background:'var(--zc)', color:'#fff', border:'none', borderRadius:'var(--r-sm)', padding:'8px', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                    <Check size={13} /> {t('settings.addZone')}
                  </button>
                  <button onClick={() => { setAddZonaOpen(false); setNewZonaKey(''); }}
                    style={{ background:'var(--bg4)', border:'1px solid var(--border)', color:'var(--txt3)', borderRadius:'var(--r-sm)', padding:'8px 14px', fontSize:12, cursor:'pointer' }}>
                    {t('action.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddZonaOpen(true)}
                style={{ width:'100%', background:'var(--bg3)', border:'1px dashed rgba(139,92,246,0.4)', color:'#A78BFA', borderRadius:'var(--r-sm)', padding:'9px', fontSize:12, cursor:'pointer', marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Plus size={13} strokeWidth={1.5} /> {t('settings.addZone')}
              </button>
            )}

            <div style={{ fontSize:10, color:'var(--txt4)', marginTop:8, lineHeight:1.6, padding:'8px 10px', background:'rgba(255,255,255,0.02)', borderRadius:'var(--r-xs)' }}>
              {t('settings.zonesNote')}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════
          PREFERENSI: BAHASA
      ═══════════════════════════════ */}
      <div style={cardStyle}>
        <SectionHeader
          icon={<Globe size={16} strokeWidth={1.5} />}
          title={t('settings.language')}
        />
        <div style={{ display:'flex', gap:8 }}>
          <ToggleChip label="Indonesia" active={(settings as any).language !== 'en'} onClick={() => { updateSettings({ ...(settings as any), language: 'id' }); showToast('Bahasa: Indonesia'); }} />
          <ToggleChip label="English" active={(settings as any).language === 'en'} onClick={() => { updateSettings({ ...(settings as any), language: 'en' }); showToast('Language: English'); }} />
        </div>
      </div>

      {/* ═══════════════════════════════
          PREFERENSI: EXPORT DATA
      ═══════════════════════════════ */}
      <div style={cardStyle}>
        <SectionHeader icon={<Download size={16} strokeWidth={1.5} />} title={t('settings.export')} />

        {/* JSON Backup */}
        <button
          onClick={() => { doJSONBackup(appData); showToast(t('settings.jsonBackupDone')); }}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'10px 12px', borderRadius:'var(--r-sm)', border:'1px solid var(--border)', background:'var(--bg3)', color:'var(--txt2)', cursor:'pointer', fontSize:12, marginBottom:6, transition:'all var(--t-fast)' }}
        >
          <span style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Download size={13} /> {t('settings.jsonBackup')}
          </span>
          <span style={{ fontSize:10, color:'var(--txt4)' }}>{t('settings.jsonBackupDesc')}</span>
        </button>

        {/* PDF */}
        <button
          onClick={() => setExpOpen(v => !v)}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'10px 12px', borderRadius:'var(--r-sm)', border:`1px solid ${expOpen ? 'var(--zc)' : 'var(--border)'}`, background: expOpen ? 'var(--zcdim)' : 'var(--bg3)', color: expOpen ? 'var(--zc)' : 'var(--txt2)', cursor:'pointer', fontSize:12, marginBottom:6, transition:'all var(--t-fast)' }}
        >
          <span style={{ display:'flex', alignItems:'center', gap:8 }}>
            <FileText size={13} /> PDF / Excel
          </span>
          {expOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {expOpen && (
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:12, marginBottom:6 }}>
            <ExportSelectors zone={expZone} setZone={setExpZone} type={expType} setType={setExpType} year={expYear} setYear={setExpYear} month={expMonth} setMonth={setExpMonth} showAll />
            <div style={{ display:'flex', gap:6, marginTop:10 }}>
              <button onClick={handleDownloadPDF} style={{ flex:1, padding:'9px', borderRadius:'var(--r-sm)', border:'none', background:'var(--zc)', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', boxShadow:'var(--shadow-z)', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                <FileText size={12} /> PDF
              </button>
              <button onClick={handleDownloadExcel} style={{ flex:1, padding:'9px', borderRadius:'var(--r-sm)', border:'none', background:'#1d6f42', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                <Table2 size={12} /> Excel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════
          PREFERENSI: SHARE & REKAP
      ═══════════════════════════════ */}
      <div style={cardStyle}>
        <SectionHeader icon={<Share2 size={16} strokeWidth={1.5} />} title={t('dashboard.waSummary')} />

        {/* WA Summary */}
        <button onClick={() => setWaOpen(v => !v)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'10px 12px', borderRadius:'var(--r-sm)', border:`1px solid ${waOpen ? 'var(--zc)' : 'var(--border)'}`, background: waOpen ? 'var(--zcdim)' : 'var(--bg3)', color: waOpen ? 'var(--zc)' : 'var(--txt2)', cursor:'pointer', fontSize:12, marginBottom:6, transition:'all var(--t-fast)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:8 }}><MessageCircle size={13} /> {t('dashboard.sendWA')}</span>
          {waOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {waOpen && (
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:12, marginBottom:6 }}>
            <div style={{ ...labelStyle, marginBottom:8 }}>{t('settings.waPeriod')}</div>
            <div style={{ display:'flex', gap:6 }}>
              <select style={selStyle} value={waYear} onChange={e => setWaYear(+e.target.value)}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={selStyle} value={waMonth} onChange={e => setWaMonth(+e.target.value)}>
                {MONTH_NAMES.map((m,i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <button onClick={handleWASummary} style={{ width:'100%', marginTop:10, padding:'9px', borderRadius:'var(--r-sm)', border:'none', background:'#25D366', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <MessageCircle size={13} /> {t('settings.sendToWA')}
            </button>
          </div>
        )}

        {/* Share PDF/Excel */}
        <button onClick={() => setSfOpen(v => !v)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'10px 12px', borderRadius:'var(--r-sm)', border:`1px solid ${sfOpen ? 'var(--zc)' : 'var(--border)'}`, background: sfOpen ? 'var(--zcdim)' : 'var(--bg3)', color: sfOpen ? 'var(--zc)' : 'var(--txt2)', cursor:'pointer', fontSize:12, marginBottom:6, transition:'all var(--t-fast)' }}>
          <span style={{ display:'flex', alignItems:'center', gap:8 }}><Share2 size={13} /> {t('settings.sharePdfExcel')}</span>
          {sfOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {sfOpen && (
          <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:12, marginBottom:6 }}>
            <div style={{ ...labelStyle, marginBottom:8 }}>{t('settings.format')}</div>
            <div style={{ display:'flex', gap:6, marginBottom:10 }}>
              <ToggleChip label="PDF" active={sfFmt==='pdf'} onClick={() => setSfFmt('pdf')} />
              <ToggleChip label="Excel" active={sfFmt==='excel'} onClick={() => setSfFmt('excel')} />
            </div>
            <ExportSelectors zone={sfZone} setZone={setSfZone} type={sfType} setType={setSfType} year={sfYear} setYear={setSfYear} month={sfMonth} setMonth={setSfMonth} showAll={sfFmt==='pdf'} />
            <button onClick={handleShareFile} style={{ width:'100%', marginTop:10, padding:'9px', borderRadius:'var(--r-sm)', border:'none', background:'var(--zc)', color:'#fff', fontWeight:600, fontSize:12, cursor:'pointer', boxShadow:'var(--shadow-z)', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Share2 size={13} /> {t('settings.generateShare')}
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════
          PREFERENSI: TANGGAL BAYAR
      ═══════════════════════════════ */}
      <div style={cardStyle}>
        <SectionHeader
          icon={<Calendar size={16} strokeWidth={1.5} />}
          title={t('settings.autoDate')}
          desc={settings.autoDate ? t('settings.autoDate.descAuto') : t('settings.autoDate.descManual')}
        />
        <div style={{ display:'flex', gap:8 }}>
          <ToggleChip label={t('settings.autoDate.auto')} active={settings.autoDate === true} onClick={() => { updateSettings({ autoDate: true }); showToast(t('settings.autoDate.toastAuto')); }} />
          <ToggleChip label={t('settings.autoDate.manual')} active={settings.autoDate !== true} onClick={() => { updateSettings({ autoDate: false }); showToast(t('settings.autoDate.toastManual')); }} />
        </div>
        <div style={{ fontSize:10, color:'var(--txt4)', marginTop:8, lineHeight:1.5 }}>
          {settings.autoDate ? t('settings.autoDate.noteAuto') : t('settings.autoDate.noteManual')}
        </div>
      </div>

      {/* ═══════════════════════════════
          PREFERENSI: NOMINAL QUICK PAY
      ═══════════════════════════════ */}
      <div style={cardStyle}>
        <SectionHeader
          icon={<Zap size={16} strokeWidth={1.5} />}
          title={t('settings.quickPay')}
          desc={t('settings.quickPayDesc')}
        />
        <div style={{ ...labelStyle, marginBottom:8 }}>{t('settings.quickPayLabel')}</div>
        <input
          className="lf-input"
          style={{ marginBottom:0, textAlign:'left', letterSpacing:'normal', fontFamily:"'DM Mono',monospace" }}
          value={newAmounts}
          onChange={e => setNewAmounts(e.target.value)}
          placeholder="50, 80, 90, 100, 150, 200"
        />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
          {settings.quickAmounts.map(a => (
            <span key={a} style={{ background:'var(--bg3)', border:'1px solid var(--zc)', color:'var(--zc)', padding:'3px 10px', borderRadius:'var(--r-xs)', fontSize:11, fontFamily:"'DM Mono',monospace" }}>{a}</span>
          ))}
        </div>
        <Btn label={t('settings.quickPaySave')} onClick={saveAmounts} icon={<Check size={13} />} />
        <div style={{ fontSize:10, color:'var(--txt4)', marginTop:8, lineHeight:1.6, padding:'8px', background:'var(--bg3)', borderRadius:'var(--r-xs)' }}>
          {t('settings.quickPayNote')}
        </div>
      </div>

      {/* ═══════════════════════════════
          APP INFO
      ═══════════════════════════════ */}
      <div style={{ ...cardStyle, textAlign:'center' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div style={{ color:'var(--zc)', marginBottom:6 }}><Wifi size={22} strokeWidth={1.5} /></div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:'var(--txt)' }}>WiFi Pay</div>
          <div style={{ fontSize:11, color:'var(--txt4)', lineHeight:2 }}>
            <div>{t('settings.version')} v11.2 Next</div>
            <div>Firebase: wifi-pay-online</div>
            <div>Server: Singapore</div>
          </div>
        </div>
      </div>
    </div>
  );
}
