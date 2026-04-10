// components/views/GrafikView.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getPay, getZoneTotal, rp, getKey } from '@/lib/helpers';

declare const Chart: any;

export default function GrafikView() {
  const { appData, activeZone, selYear, setSelYear, darkMode } = useAppStore();
  const chartRefs = { monthly: useRef<HTMLCanvasElement>(null), yearly: useRef<HTMLCanvasElement>(null), compare: useRef<HTMLCanvasElement>(null) };
  const instances = useRef<Record<string, any>>({});

  const az = activeZone as string;
  const mems = az === 'KRS' ? appData.krsMembers : activeZone === 'SLK' ? appData.slkMembers : [...appData.krsMembers, ...appData.slkMembers];
  const zc   = az === 'KRS' ? '#2196F3' : activeZone === 'SLK' ? '#e05c3a' : '#4CAF50' // TOTAL;

  const mData = MONTHS.map((_, mi) =>
    activeZone === ('TOTAL' as any)
      ? getZoneTotal(appData, 'KRS', selYear, mi) + getZoneTotal(appData, 'SLK', selYear, mi)
      : mems.reduce((s, m) => s + (getPay(appData, activeZone, m, selYear, mi) || 0), 0)
  );
  const yData = YEARS.map(y =>
    activeZone === ('TOTAL' as any)
      ? MONTHS.reduce((s, _, mi) => s + getZoneTotal(appData, 'KRS', y, mi) + getZoneTotal(appData, 'SLK', y, mi), 0)
      : MONTHS.reduce((s, _, mi) => s + mems.reduce((ss, m) => ss + (getPay(appData, activeZone, m, y, mi) || 0), 0), 0)
  );

  const mNonZero = mData.filter(v => v > 0);
  const mAvg = mNonZero.length ? Math.round(mNonZero.reduce((a, b) => a + b, 0) / mNonZero.length) : 0;
  const mTotal = mData.reduce((a, b) => a + b, 0);
  const curYi = YEARS.indexOf(selYear);
  const curYPct = curYi > 0 && yData[curYi - 1] ? Math.round(((yData[curYi] - yData[curYi - 1]) / yData[curYi - 1]) * 100) : null;
  const prevYTotal = curYi > 0 ? yData[curYi - 1] : 0;

  useEffect(() => {
    if (typeof Chart === 'undefined') return;
    Object.values(instances.current).forEach((c: any) => { try { c.destroy(); } catch {} });
    instances.current = {};

    const gridColor = darkMode ? '#1e2231' : '#d0d4e0';
    const tickColor = darkMode ? '#777' : '#5a6080';
    const cfg = {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => `Rp ${(ctx.raw * 1000).toLocaleString('id-ID')}` } } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'DM Mono', size: 10 } } },
        y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'DM Mono', size: 10 }, callback: (v: number) => 'Rp ' + (v * 1000).toLocaleString('id-ID') } },
      },
    };

    if (chartRefs.monthly.current)
      instances.current.monthly = new Chart(chartRefs.monthly.current, { type:'bar', data: { labels: MONTHS, datasets: [{ data: mData, backgroundColor: zc+'99', borderColor: zc, borderWidth:2, borderRadius:4 }] }, options: { ...cfg } });

    if (chartRefs.yearly.current)
      instances.current.yearly = new Chart(chartRefs.yearly.current, { type:'line', data: { labels: YEARS.map(String), datasets: [{ data: yData, borderColor: zc, backgroundColor: zc+'22', borderWidth:2, tension:0.4, fill:true, pointBackgroundColor: zc, pointRadius:4 }] }, options: { ...cfg } });

    const kData = MONTHS.map((_, mi) => getZoneTotal(appData, 'KRS', selYear, mi));
    const sData = MONTHS.map((_, mi) => getZoneTotal(appData, 'SLK', selYear, mi));
    const tData = MONTHS.map((_, mi) => kData[mi] + sData[mi]);
    if (chartRefs.compare.current)
      instances.current.compare = new Chart(chartRefs.compare.current, { type:'line', data: { labels: MONTHS, datasets: [
        { label:'KRS',   data: kData, borderColor:'#2196F3', backgroundColor:'#2196F322', borderWidth:2, tension:0.4, fill:false, pointBackgroundColor:'#2196F3', pointRadius:3 },
        { label:'SLK',   data: sData, borderColor:'#e05c3a', backgroundColor:'#e05c3a22', borderWidth:2, tension:0.4, fill:false, pointBackgroundColor:'#e05c3a', pointRadius:3 },
        { label:'TOTAL', data: tData, borderColor:'#4CAF50', backgroundColor:'#4CAF5022', borderWidth:2, tension:0.4, fill:false, pointBackgroundColor:'#4CAF50', pointRadius:3, borderDash:[4,3] },
      ]}, options: { ...cfg, plugins: { ...cfg.plugins, legend: { display:true, labels: { color: tickColor, font: { family:'DM Mono', size:10 } } } } } });

    return () => { Object.values(instances.current).forEach((c: any) => { try { c.destroy(); } catch {} }); };
  }, [appData, activeZone, selYear, darkMode]);

  function PctBadge({ pct }: { pct: number | null }) {
    if (!pct) return null;
    return <span style={{ fontSize:10, fontWeight:600, color: pct >= 0 ? '#4CAF50' : '#e05c5c', marginLeft:6 }}>{pct >= 0 ? '▲' : '▼'}{Math.abs(pct)}%</span>;
  }

  return (
    <div>
      {/* Controls */}
      <div className="ctrl-row" style={{ justifyContent:'space-between', alignItems:'center' }}>
        <select className="cs" value={selYear} onChange={e => setSelYear(+e.target.value)}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:12 }}>
          <div style={{ fontSize:9, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:4 }}>TOTAL {selYear}<PctBadge pct={curYPct} /></div>
          <div style={{ fontSize:15, fontWeight:700, color:zc }}>{rp(mTotal)}</div>
          <div style={{ fontSize:10, color:'var(--txt4)', marginTop:3 }}>Avg/bulan: {rp(mAvg)}</div>
        </div>
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:12 }}>
          <div style={{ fontSize:9, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:4 }}>VS TAHUN LALU<PctBadge pct={curYPct} /></div>
          <div style={{ fontSize:15, fontWeight:700, color:zc }}>{rp(prevYTotal)}</div>
          <div style={{ fontSize:10, color:'var(--txt4)', marginTop:3 }}>Tahun {selYear - 1}</div>
        </div>
      </div>

      {/* Charts — Chart.js via CDN di _document atau script tag */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js" async />
      <div className="chart-box">
        <div className="chart-title">PENDAPATAN BULANAN {selYear} · {activeZone}</div>
        <div className="chart-wrap"><canvas ref={chartRefs.monthly} /></div>
      </div>
      <div className="chart-box">
        <div className="chart-title">PERBANDINGAN TAHUNAN · {activeZone}</div>
        <div className="chart-wrap"><canvas ref={chartRefs.yearly} /></div>
      </div>
      <div className="chart-box">
        <div className="chart-title">KRS vs SLK {selYear}</div>
        <div className="chart-wrap"><canvas ref={chartRefs.compare} /></div>
      </div>
    </div>
  );
}
