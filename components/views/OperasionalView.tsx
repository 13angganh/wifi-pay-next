// components/views/OperasionalView.tsx — FIXED: font konsisten semua baris
'use client';

import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getZoneTotal, rp } from '@/lib/helpers';
import { saveDB } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/Confirm';
import type { OpsItem } from '@/types';

// Font dan ukuran konsisten untuk semua elemen
const FONT    = "'DM Mono',monospace";
const FS_BODY = 12;  // font size semua input dan label
const FS_VAL  = 12;  // font size semua nilai result — SAMA semua
const FS_LBL  = 11;  // font size label result

export default function OperasionalView() {
  const { appData, setAppData, uid, userEmail, opsYear, opsMonth, setOpsYear, setOpsMonth, setSyncStatus } = useAppStore();

  const opsKey  = `${opsYear}_${opsMonth}`;
  const opsData = appData.operasional?.[opsKey] || { items: [] };
  const items   = opsData.items || [];

  const krsTotal    = getZoneTotal(appData, 'KRS', opsYear, opsMonth);
  const slkTotal    = getZoneTotal(appData, 'SLK', opsYear, opsMonth);
  const grossIncome = krsTotal + slkTotal;
  const totalOps    = items.reduce((s, it) => s + (+it.nominal || 0), 0);
  const netIncome   = grossIncome - totalOps;

  async function persist(newData: typeof appData) {
    setAppData(newData);
    if (!uid) return;
    setSyncStatus('loading');
    try {
      await saveDB(uid, newData, { action:'💼 Update operasional', detail:`${MONTHS[opsMonth]} ${opsYear}` }, userEmail || '');
      setSyncStatus('ok');
    } catch { setSyncStatus('err'); }
  }

  function updatedData(newItems: OpsItem[]) {
    return { ...appData, operasional: { ...appData.operasional, [opsKey]: { items: newItems } } };
  }

  async function addItem() { await persist(updatedData([...items, { label:'', nominal:0 }])); }

  async function updateItem(i: number, field: 'label' | 'nominal', val: string) {
    const newItems = items.map((it, idx) =>
      idx === i ? { ...it, [field]: field === 'nominal' ? (+val || 0) : val } : it
    );
    await persist(updatedData(newItems));
  }

  function deleteItem(i: number) {
    const item = items[i];
    showConfirm('🗑️', `Hapus <b>${item?.label || 'item ini'}</b>?`, 'Ya, Hapus', async () => {
      await persist(updatedData(items.filter((_, idx) => idx !== i)));
      showToast('Item dihapus', 'err');
    });
  }

  const minYear = 2026;
  const filteredYears = YEARS.filter(y => y >= minYear);

  // Style konsisten untuk semua input
  const inputBaseStyle: React.CSSProperties = {
    background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)',
    borderRadius:6, padding:'8px 10px', fontSize:FS_BODY, fontFamily:FONT,
    outline:'none',
  };

  // Style konsisten untuk semua baris result
  function ResultRow({ label, value, color, highlight }: { label:string; value:string; color:string; highlight?:boolean }) {
    return (
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        padding: highlight ? '10px 12px' : '8px 0',
        borderBottom: highlight ? 'none' : '1px solid var(--border)',
        background: highlight ? '#0a2010' : 'transparent',
        borderRadius: highlight ? 8 : 0,
        marginTop: highlight ? 6 : 0,
        border: highlight ? '1px solid #4CAF5033' : undefined,
      }}>
        <span style={{ fontSize:FS_LBL, color: highlight ? '#4CAF50' : 'var(--txt3)', fontFamily:FONT, fontWeight: highlight ? 700 : 400 }}>
          {label}
        </span>
        <span style={{ fontSize:FS_VAL, color, fontFamily:FONT, fontWeight:600 }}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Period selector */}
      <div className="ctrl-row" style={{ marginBottom:10 }}>
        <select className="cs" value={opsYear} onChange={e => { const y=+e.target.value; setOpsYear(y); if(y===minYear&&opsMonth<0) setOpsMonth(0); }}>
          {filteredYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="cs" value={opsMonth} onChange={e => setOpsMonth(+e.target.value)}>
          {MONTHS.map((m, i) => <option key={i} value={i} disabled={opsYear===minYear&&i<0}>{m}</option>)}
        </select>
        <span style={{ fontSize:11, color:'var(--txt3)', alignSelf:'center', fontFamily:FONT }}>{MONTHS[opsMonth]} {opsYear}</span>
      </div>

      {/* Items */}
      <div className="ops-card">
        <div style={{ fontSize:10, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:10, fontFamily:FONT }}>
          PENGELUARAN OPERASIONAL
        </div>

        {items.map((it, i) => (
          <div key={i} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
            {/* Label keterangan */}
            <input
              style={{ ...inputBaseStyle, flex:1 }}
              placeholder="Keterangan (listrik, internet...)"
              defaultValue={it.label}
              onBlur={e => updateItem(i, 'label', e.target.value)}
              autoComplete="off"
            />
            {/* Nominal — rata kanan, font sama */}
            <input
              style={{ ...inputBaseStyle, width:90, textAlign:'right' }}
              type="number"
              inputMode="numeric"
              placeholder="0"
              defaultValue={it.nominal || ''}
              onBlur={e => updateItem(i, 'nominal', e.target.value)}
              autoComplete="off"
            />
            <button onClick={() => deleteItem(i)}
              style={{ background:'#1f0d0d', border:'1px solid #e05c5c55', color:'#e05c5c', padding:'7px 10px', borderRadius:6, cursor:'pointer', fontSize:FS_BODY, flexShrink:0, fontFamily:FONT }}>
              ✕
            </button>
          </div>
        ))}

        <button onClick={addItem}
          style={{ width:'100%', background:'var(--bg3)', border:'1px dashed #1e3a5f', color:'#2196F3', padding:9, borderRadius:8, cursor:'pointer', fontSize:FS_BODY, marginTop:6, fontFamily:FONT }}>
          + Tambah Item
        </button>
      </div>

      {/* Result — semua font sama ukuran FS_VAL */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, padding:'4px 14px', marginTop:10 }}>
        <ResultRow label="📥 Pendapatan KRS"    value={rp(krsTotal)}    color="#2196F3" />
        <ResultRow label="📥 Pendapatan SLK"    value={rp(slkTotal)}    color="#e05c3a" />
        <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />
        <ResultRow label="💰 Pendapatan Kotor"  value={rp(grossIncome)} color="#4CAF50" />
        <ResultRow label="💸 Total Pengeluaran" value={rp(totalOps)}    color="#e05c5c" />
        <ResultRow
          label="✅ PENDAPATAN BERSIH"
          value={rp(netIncome)}
          color={netIncome >= 0 ? '#4CAF50' : '#e05c5c'}
          highlight
        />
      </div>
    </div>
  );
}
