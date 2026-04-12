// components/views/DashboardView.tsx — Sesi C: WA summary ikut selector + aging widget tunggakan
'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { showToast } from '@/components/ui/Toast';
import { getZoneTotal, isLunas, isFree, getPay, getArrears, rp } from '@/lib/helpers';
import { doJSONBackup, doWASummary } from '@/lib/export';
import type { ViewName } from '@/types';

export default function DashboardView() {
  const router = useRouter();
  const { appData, selYear, selMonth, setSelYear, setSelMonth, setView } = useAppStore();
  const dy = selYear; const dm = selMonth;

  // ── Income ──
  const krsTotal    = getZoneTotal(appData, 'KRS', dy, dm);
  const slkTotal    = getZoneTotal(appData, 'SLK', dy, dm);
  const totalIncome = krsTotal + slkTotal;
  const prevDm      = dm === 0 ? 11 : dm - 1;
  const prevDy      = dm === 0 ? dy - 1 : dy;
  const krsPrev     = getZoneTotal(appData, 'KRS', prevDy, prevDm);
  const slkPrev     = getZoneTotal(appData, 'SLK', prevDy, prevDm);
  const krsPct2: number | null = krsPrev > 0 ? Math.round(((krsTotal - krsPrev) / krsPrev) * 100) : null;
  const slkPct2: number | null = slkPrev > 0 ? Math.round(((slkTotal - slkPrev) / slkPrev) * 100) : null;
  const opsData   = appData.operasional?.[`${dy}_${dm}`] || { items: [] };
  const totalOps  = (opsData.items || []).reduce((s, it) => s + (+it.nominal || 0), 0);
  const netIncome = totalIncome - totalOps;

  // ── Member counts ──
  const krsAll = appData.krsMembers || [];
  const slkAll = appData.slkMembers || [];
  const krsLunas = krsAll.filter(m => isLunas(appData, 'KRS', m, dy, dm) && !isFree(appData, 'KRS', m, dy, dm)).length;
  const krsBelum = krsAll.filter(m => getPay(appData, 'KRS', m, dy, dm) === null && !isFree(appData, 'KRS', m, dy, dm)).length;
  const slkLunas = slkAll.filter(m => isLunas(appData, 'SLK', m, dy, dm) && !isFree(appData, 'SLK', m, dy, dm)).length;
  const slkBelum = slkAll.filter(m => getPay(appData, 'SLK', m, dy, dm) === null && !isFree(appData, 'SLK', m, dy, dm)).length;
  const krsPct   = krsAll.length ? Math.round(krsLunas / krsAll.length * 100) : 0;
  const slkPct   = slkAll.length ? Math.round(slkLunas / slkAll.length * 100) : 0;
  const krsFree  = krsAll.filter(m => isFree(appData, 'KRS', m, dy, dm)).length;
  const slkFree  = slkAll.filter(m => isFree(appData, 'SLK', m, dy, dm)).length;
  const totalFree = krsFree + slkFree;

  // ── Tunggakan ──
  const topTunggak: { z: string; name: string; count: number; oldest: string }[] = [];
  for (const z of ['KRS', 'SLK'] as const) {
    const mems = z === 'KRS' ? appData.krsMembers : appData.slkMembers;
    for (const name of mems) {
      const unpaid = getArrears(appData, z, name, dy, dm).filter(u => !isFree(appData, z, name, u.y, u.mi));
      if (unpaid.length > 0) topTunggak.push({ z, name, count: unpaid.length, oldest: unpaid[0].label });
    }
  }
  topTunggak.sort((a, b) => b.count - a.count);
  const top5 = topTunggak.slice(0, 5);

  // ── Sesi C: Aging widget ──
  // Klasifikasi tunggakan berdasarkan lama waktu
  const aging = { one: 0, two3: 0, four: 0 };
  for (const t of topTunggak) {
    if (t.count === 1)       aging.one++;
    else if (t.count <= 3)   aging.two3++;
    else                     aging.four++;
  }
  const totalTunggak = aging.one + aging.two3 + aging.four;

  // ── Misc ──
  const lastBackup = typeof window !== 'undefined' ? localStorage.getItem('wp_last_backup') : null;
  const backupLbl  = lastBackup ? new Date(+lastBackup).toLocaleDateString('id-ID') : 'Belum pernah';
  const bulanLbl   = `${MONTHS[dm]} ${dy}`;

  function nav(v: ViewName) { setView(v); router.push('/' + v); }

  function PctBadge({ pct }: { pct: number | null }) {
    if (pct === null) return null;
    const up = pct >= 0;
    return (
      <span style={{ fontSize:9, fontWeight:600, color: up ? '#4CAF50' : '#e05c5c', marginLeft:4 }}>
        {up ? '▲' : '▼'}{Math.abs(pct)}% vs {MONTHS[prevDm]}
      </span>
    );
  }

  const card = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:12, marginBottom:8 } as const;

  return (
    <div>
      {/* Period selector */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'var(--txt)' }}>📊 Dashboard</div>
        <div style={{ display:'flex', gap:5 }}>
          <select className="cs" style={{ fontSize:11, padding:'5px 8px' }} value={dm} onChange={e => setSelMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select className="cs" style={{ fontSize:11, padding:'5px 8px' }} value={dy} onChange={e => setSelYear(+e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div style={{ fontSize:9, color:'var(--txt4)', letterSpacing:'.07em', marginBottom:6 }}>{bulanLbl.toUpperCase()}</div>

      {/* KRS + SLK */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
        {([
          ['KRS', '#2196F3', krsTotal, krsPct2, krsLunas, krsAll.length, krsPct],
          ['SLK', '#e05c3a', slkTotal, slkPct2, slkLunas, slkAll.length, slkPct],
        ] as const).map(([zone, color, tot, pct2, lunas, allLen, pct]) => (
          <div key={zone} style={card}>
            <div style={{ fontSize:9, color:'var(--txt4)', marginBottom:2 }}>{zone} <PctBadge pct={pct2 as number | null} /></div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(11px,3.5vw,14px)', fontWeight:800, color: color as string, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {rp(tot as number)}
            </div>
            <div style={{ marginTop:6 }}>
              <div style={{ height:4, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background: color as string, borderRadius:2, transition:'width .4s' }} />
              </div>
              <div style={{ fontSize:9, color:'var(--txt4)', marginTop:3 }}>{lunas}/{allLen} lunas ({pct}%)</div>
            </div>
          </div>
        ))}
      </div>

      {/* Income summary */}
      <div style={card}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, gap:8 }}>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:9, color:'var(--txt4)', marginBottom:2 }}>PENDAPATAN KOTOR</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(11px,3.8vw,16px)', fontWeight:800, color:'#4CAF50', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{rp(totalIncome)}</div>
          </div>
          <div style={{ textAlign:'right', minWidth:0, flex:1 }}>
            <div style={{ fontSize:9, color:'var(--txt4)', marginBottom:2 }}>BERSIH (setelah ops)</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(11px,3.8vw,16px)', fontWeight:800, color: netIncome >= 0 ? '#4CAF50' : '#e05c5c', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{rp(netIncome)}</div>
          </div>
        </div>
        {totalOps > 0
          ? <div style={{ fontSize:10, color:'#e05c5c' }}>💸 Operasional: {rp(totalOps)}</div>
          : <div style={{ fontSize:10, color:'var(--txt4)' }}>💸 Belum ada data operasional</div>}
      </div>

      {/* Belum bayar */}
      <div style={card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--txt)' }}>⚠️ Belum Bayar {bulanLbl}</div>
          <div style={{ fontSize:11, color:'#e05c5c', fontWeight:700 }}>{krsBelum + slkBelum} pelanggan</div>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom: totalFree > 0 ? 8 : 0 }}>
          {([['KRS', krsBelum, '#e05c5c'], ['SLK', slkBelum, '#e05c5c'], ['LUNAS', krsLunas + slkLunas, '#4CAF50']] as const).map(
            ([label, val, color]) => (
              <div key={label} style={{ flex:1, background:'var(--bg3)', borderRadius:8, padding:8, textAlign:'center' }}>
                <div style={{ fontSize:9, color:'var(--txt4)' }}>{label}</div>
                <div style={{ fontSize:18, fontWeight:700, color: color as string }}>{val}</div>
              </div>
            )
          )}
        </div>
        {totalFree > 0 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#0a2a1a', border:'1px solid #4CAF5022', borderRadius:7, padding:'7px 10px' }}>
            <span style={{ fontSize:10, color:'#4CAF50' }}>🆓 Free member {bulanLbl}</span>
            <span style={{ fontSize:12, fontWeight:700, color:'#4CAF50' }}>{totalFree} member <span style={{ fontSize:9, opacity:.7 }}>(KRS:{krsFree} SLK:{slkFree})</span></span>
          </div>
        )}
      </div>

      {/* Top tunggakan */}
      <div style={card}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--txt)', marginBottom:8 }}>🔴 Tunggakan Terbanyak</div>
        {top5.length === 0
          ? <div style={{ textAlign:'center', padding:16, color:'#4CAF50', fontSize:12 }}>✅ Semua lunas!</div>
          : top5.map((t, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom: i < top5.length - 1 ? '1px solid var(--border2)' : 'none' }}>
              <div>
                <span style={{ fontSize:12, color:'var(--txt)' }}>{t.name}</span>
                <span style={{ fontSize:9, color:'var(--txt4)', marginLeft:6 }}>{t.z}</span>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'#e05c5c', fontWeight:700 }}>{t.count} bulan</div>
                <div style={{ fontSize:9, color:'var(--txt4)' }}>sejak {t.oldest}</div>
              </div>
            </div>
          ))}
        {topTunggak.length > 5 && (
          <div style={{ fontSize:10, color:'var(--txt4)', textAlign:'center', marginTop:8, cursor:'pointer' }} onClick={() => nav('tunggakan')}>
            +{topTunggak.length - 5} lainnya → Lihat semua
          </div>
        )}

        {/* ── Sesi C: Aging Widget ── */}
        {totalTunggak > 0 && (
          <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid var(--border2)' }}>
            <div style={{ fontSize:9, color:'var(--txt4)', letterSpacing:'.07em', marginBottom:10 }}>KLASIFIKASI USIA TUNGGAKAN</div>
            <div style={{ display:'flex', gap:8 }}>
              {/* 1 bulan */}
              <div style={{ flex:1, textAlign:'center', background:'#1a1500', border:'1px solid #FFC10733', borderRadius:9, padding:'10px 6px' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#FFC107' }}>{aging.one}</div>
                <div style={{ fontSize:9, color:'#FFC10799', marginTop:3 }}>1 bulan</div>
                <div style={{ fontSize:8, color:'var(--txt5)', marginTop:2 }}>⚠️ Baru</div>
              </div>
              {/* 2-3 bulan */}
              <div style={{ flex:1, textAlign:'center', background:'#1a0d00', border:'1px solid #FF980033', borderRadius:9, padding:'10px 6px' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#FF9800' }}>{aging.two3}</div>
                <div style={{ fontSize:9, color:'#FF980099', marginTop:3 }}>2–3 bulan</div>
                <div style={{ fontSize:8, color:'var(--txt5)', marginTop:2 }}>🔶 Segera</div>
              </div>
              {/* 4+ bulan */}
              <div style={{ flex:1, textAlign:'center', background:'#1f0d0d', border:'1px solid #e05c5c33', borderRadius:9, padding:'10px 6px' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#e05c5c' }}>{aging.four}</div>
                <div style={{ fontSize:9, color:'#e05c5c99', marginTop:3 }}>4+ bulan</div>
                <div style={{ fontSize:8, color:'var(--txt5)', marginTop:2 }}>🔴 Kritis</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backup */}
      <div style={{ ...card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--txt)' }}>💾 Backup Terakhir</div>
          <div style={{ fontSize:10, color:'var(--txt4)', marginTop:2 }}>{backupLbl}</div>
        </div>
        <button
          style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt2)', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontSize:11, transition:'all var(--t-fast)' }}
          onClick={() => { doJSONBackup(appData); showToast('✅ Backup JSON berhasil!'); }}
        >
          Backup Sekarang
        </button>
      </div>

      {/* ── Sesi C: WA Summary — ikut selector bulan/tahun ── */}
      <div style={card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--txt)' }}>📤 Ringkasan WA</div>
          <div style={{ fontSize:10, color:'var(--txt4)' }}>{bulanLbl}</div>
        </div>
        <button
          style={{ width:'100%', background:'#0d2b1f', border:'1px solid #4CAF5033', color:'#4CAF50', padding:10, borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:600, transition:'all var(--t-fast)' }}
          onClick={() => { doWASummary(appData, dy, dm); }}
        >
          📊 Kirim Ringkasan {bulanLbl} ke WA
        </button>
        <div style={{ fontSize:9, color:'var(--txt4)', marginTop:6, textAlign:'center' }}>
          Periode sesuai selector di atas
        </div>
      </div>
    </div>
  );
}
