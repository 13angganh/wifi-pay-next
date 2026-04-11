// components/views/OperasionalView.tsx
'use client';

import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getZoneTotal, rp } from '@/lib/helpers';
import { saveDB } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/Confirm';
import type { OpsItem } from '@/types';

export default function OperasionalView() {
  const { appData, setAppData, uid, userEmail, opsYear, opsMonth, setOpsYear, setOpsMonth, setSyncStatus } = useAppStore();

  const opsKey  = `${opsYear}_${opsMonth}`;
  const opsData = appData.operasional?.[opsKey] || { items: [] };
  const items   = opsData.items || [];

  const krsTotal   = getZoneTotal(appData, 'KRS', opsYear, opsMonth);
  const slkTotal   = getZoneTotal(appData, 'SLK', opsYear, opsMonth);
  const grossIncome = krsTotal + slkTotal;
  const totalOps   = items.reduce((s, it) => s + (+it.nominal || 0), 0);
  const netIncome  = grossIncome - totalOps;

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
    showConfirm('🗑️', `Hapus <b>${item?.label || 'item ini'}</b> dari operasional?`, 'Ya, Hapus', async () => {
      await persist(updatedData(items.filter((_, idx) => idx !== i)));
      showToast('Item dihapus', 'err');
    });
  }

  const minYear = 2026; const minMonth = 0;
  const filteredYears = YEARS.filter(y => y >= minYear);

  return (
    <div>
      {/* Period selector */}
      <div className="ctrl-row" style={{ marginBottom:10 }}>
        <select className="cs" value={opsYear} onChange={e => { const y = +e.target.value; setOpsYear(y); if (y === minYear && opsMonth < minMonth) setOpsMonth(minMonth); }}>
          {filteredYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="cs" value={opsMonth} onChange={e => setOpsMonth(+e.target.value)}>
          {MONTHS.map((m, i) => {
            const disabled = opsYear === minYear && i < minMonth;
            return <option key={i} value={i} disabled={disabled}>{m}</option>;
          })}
        </select>
        <span style={{ fontSize:11, color:'var(--txt3)', alignSelf:'center' }}>{MONTHS[opsMonth]} {opsYear}</span>
      </div>

      {/* Items */}
      <div className="ops-card">
        <div style={{ fontSize:10, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:10 }}>PENGELUARAN OPERASIONAL</div>
        {items.map((it, i) => (
          <div key={i} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
            <input
              style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)', borderRadius:6, padding:'8px 10px', fontSize:12, fontFamily:"'DM Mono',monospace", outline:'none' }}
              placeholder="Keterangan (listrik, internet...)"
              defaultValue={it.label}
              onBlur={e => updateItem(i, 'label', e.target.value)}
              autoComplete="off"
            />
            <input
              style={{ width:100, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)', borderRadius:6, padding:'8px 10px', fontSize:12, fontFamily:"'DM Mono',monospace", outline:'none', textAlign:'right' }}
              type="number" inputMode="numeric" placeholder="0"
              defaultValue={it.nominal || ''}
              onBlur={e => updateItem(i, 'nominal', e.target.value)}
              autoComplete="off"
            />
            <button onClick={() => deleteItem(i)}
              style={{ background:'#1f0d0d', border:'1px solid #e05c5c55', color:'#e05c5c', padding:'7px 10px', borderRadius:6, cursor:'pointer', fontSize:12, flexShrink:0 }}>✕</button>
          </div>
        ))}
        <button onClick={addItem}
          style={{ width:'100%', background:'var(--bg3)', border:'1px dashed #1e3a5f', color:'#2196F3', padding:9, borderRadius:8, cursor:'pointer', fontSize:12, marginTop:6 }}>
          + Tambah Item
        </button>
      </div>

      {/* Result */}
      <div className="ops-result">
        {([
          ['📥 Pendapatan KRS', rp(krsTotal),    '#2196F3'],
          ['📥 Pendapatan SLK', rp(slkTotal),    '#e05c3a'],
        ] as const).map(([label, val, color]) => (
          <div key={label} className="ops-result-row">
            <span className="ops-result-lbl">{label}</span>
            <span className="ops-result-val" style={{ color: color as string }}>{val}</span>
          </div>
        ))}
        <div className="ops-result-row" style={{ borderTop:'2px solid var(--border)', marginTop:4 }}>
          <span className="ops-result-lbl" style={{ color:'#4CAF50' }}>💰 Pendapatan Kotor</span>
          <span className="ops-result-val" style={{ color:'#4CAF50', fontSize:15 }}>{rp(grossIncome)}</span>
        </div>
        <div className="ops-result-row">
          <span className="ops-result-lbl" style={{ color:'#e05c5c' }}>💸 Total Pengeluaran</span>
          <span className="ops-result-val" style={{ color:'#e05c5c' }}>{rp(totalOps)}</span>
        </div>
        <div className="ops-result-row" style={{ background:'#0a2010', borderRadius:8, padding:10, marginTop:6, border:'1px solid #4CAF5033' }}>
          <span className="ops-result-lbl" style={{ color:'#4CAF50', fontSize:13, fontWeight:700 }}>✅ PENDAPATAN BERSIH</span>
          <span className="ops-result-val" style={{ color: netIncome >= 0 ? '#4CAF50' : '#e05c5c', fontSize:17 }}>{rp(netIncome)}</span>
        </div>
      </div>
    </div>
  );
}
