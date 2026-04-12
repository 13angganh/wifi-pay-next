// components/views/GrafikView.tsx — Sesi D: pie/donut + proyeksi + multi-periode
'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { getPay, getZoneTotal, isLunas, isFree, rp } from '@/lib/helpers';

declare const Chart: any;

export default function GrafikView() {
  const { appData, activeZone, selYear, setSelYear, darkMode } = useAppStore();

  // ── Sesi D: state tambahan ──
  const [donutMonth, setDonutMonth] = useState(new Date().getMonth());
  const [p1Year,  setP1Year]  = useState(new Date().getFullYear());
  const [p1Month, setP1Month] = useState(new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1);
  const [p2Year,  setP2Year]  = useState(new Date().getFullYear() - 1);
  const [p2Month, setP2Month] = useState(new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1);

  const chartRefs = {
    monthly: useRef<HTMLCanvasElement>(null),
    yearly:  useRef<HTMLCanvasElement>(null),
    compare: useRef<HTMLCanvasElement>(null),
    donut:   useRef<HTMLCanvasElement>(null),   // Sesi D
    mperiod: useRef<HTMLCanvasElement>(null),   // Sesi D
  };
  const instances = useRef<Record<string, any>>({});

  const az   = activeZone as string;
  const mems = az === 'KRS' ? appData.krsMembers : activeZone === 'SLK' ? appData.slkMembers : [...appData.krsMembers, ...appData.slkMembers];
  const zc   = az === 'KRS' ? '#2196F3' : activeZone === 'SLK' ? '#e05c3a' : '#4CAF50';

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
  const mAvg     = mNonZero.length ? Math.round(mNonZero.reduce((a, b) => a + b, 0) / mNonZero.length) : 0;
  const mTotal   = mData.reduce((a, b) => a + b, 0);
  const curYi    = YEARS.indexOf(selYear);
  const curYPct  = curYi > 0 && yData[curYi - 1] ? Math.round(((yData[curYi] - yData[curYi - 1]) / yData[curYi - 1]) * 100) : null;
  const prevYTotal = curYi > 0 ? yData[curYi - 1] : 0;

  // ── Sesi D: Proyeksi bulan depan (avg 3 bulan terakhir non-zero) ──
  const last3 = mData.slice(0, new Date().getMonth() + 1).filter(v => v > 0).slice(-3);
  const proyeksi = last3.length ? Math.round(last3.reduce((a, b) => a + b, 0) / last3.length) : 0;
  const nextMonthIdx = (new Date().getMonth() + 1) % 12;
  const nextMonthLabel = MONTHS[nextMonthIdx];

  // ── Sesi D: Donut data ──
  function getDonutData(zone: string, year: number, month: number) {
    const zoneMems = zone === 'KRS' ? appData.krsMembers : appData.slkMembers;
    let lunas = 0, belum = 0, free = 0;
    for (const m of zoneMems) {
      if (isFree(appData, zone, m, year, month))            free++;
      else if (isLunas(appData, zone, m, year, month))      lunas++;
      else                                                   belum++;
    }
    return { lunas, belum, free, total: zoneMems.length };
  }

  // ── Sesi D: Multi-periode ──
  const p1Total = mems.reduce((s, m) => s + (getPay(appData, activeZone, m, p1Year, p1Month) || 0), 0);
  const p2Total = mems.reduce((s, m) => s + (getPay(appData, activeZone, m, p2Year, p2Month) || 0), 0);
  const mperiodPct = p2Total > 0 ? Math.round(((p1Total - p2Total) / p2Total) * 100) : null;

  // Build chart configs dengan useEffect
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

    // Chart bulanan dengan bar proyeksi
    if (chartRefs.monthly.current) {
      const labelsM = [...MONTHS, `${nextMonthLabel}*`];
      const dataM   = [...mData, proyeksi];
      const bgColors = [
        ...mData.map((_, i) => i < MONTHS.length ? zc + '99' : 'transparent'),
        '#4CAF5066',
      ];
      const borderColors = [...mData.map(() => zc), '#4CAF50'];
      const borderDash = mData.map((_, i) => i === mData.length ? [4, 3] : []);
      instances.current.monthly = new Chart(chartRefs.monthly.current, {
        type: 'bar',
        data: {
          labels: labelsM,
          datasets: [
            { data: dataM, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 2, borderRadius: 4 },
          ],
        },
        options: { ...cfg },
      });
    }

    if (chartRefs.yearly.current)
      instances.current.yearly = new Chart(chartRefs.yearly.current, {
        type: 'line',
        data: { labels: YEARS.map(String), datasets: [{ data: yData, borderColor: zc, backgroundColor: zc + '22', borderWidth: 2, tension: 0.4, fill: true, pointBackgroundColor: zc, pointRadius: 4 }] },
        options: { ...cfg },
      });

    const kData = MONTHS.map((_, mi) => getZoneTotal(appData, 'KRS', selYear, mi));
    const sData = MONTHS.map((_, mi) => getZoneTotal(appData, 'SLK', selYear, mi));
    const tData = MONTHS.map((_, mi) => kData[mi] + sData[mi]);
    if (chartRefs.compare.current)
      instances.current.compare = new Chart(chartRefs.compare.current, {
        type: 'line',
        data: { labels: MONTHS, datasets: [
          { label: 'KRS',   data: kData, borderColor: '#2196F3', backgroundColor: '#2196F322', borderWidth: 2, tension: 0.4, fill: false, pointBackgroundColor: '#2196F3', pointRadius: 3 },
          { label: 'SLK',   data: sData, borderColor: '#e05c3a', backgroundColor: '#e05c3a22', borderWidth: 2, tension: 0.4, fill: false, pointBackgroundColor: '#e05c3a', pointRadius: 3 },
          { label: 'TOTAL', data: tData, borderColor: '#4CAF50', backgroundColor: '#4CAF5022', borderWidth: 2, tension: 0.4, fill: false, pointBackgroundColor: '#4CAF50', pointRadius: 3, borderDash: [4, 3] },
        ]},
        options: { ...cfg, plugins: { ...cfg.plugins, legend: { display: true, labels: { color: tickColor, font: { family: 'DM Mono', size: 10 } } } } },
      });

    return () => { Object.values(instances.current).forEach((c: any) => { try { c.destroy(); } catch {} }); };
  }, [appData, activeZone, selYear, darkMode, proyeksi]);

  // Donut chart — rebuild saat donutMonth berubah
  useEffect(() => {
    if (typeof Chart === 'undefined') return;
    try { instances.current.donut?.destroy(); } catch {}

    if (!chartRefs.donut.current) return;
    const tickColor = darkMode ? '#777' : '#5a6080';
    const donutZone = activeZone === ('TOTAL' as any) ? 'KRS' : activeZone;
    const { lunas, belum, free } = getDonutData(donutZone, selYear, donutMonth);
    instances.current.donut = new Chart(chartRefs.donut.current, {
      type: 'doughnut',
      data: {
        labels: ['Lunas', 'Belum', 'Free'],
        datasets: [{ data: [lunas, belum, free], backgroundColor: ['#4CAF50cc', '#e05c5ccc', '#2196F3cc'], borderColor: ['#4CAF50', '#e05c5c', '#2196F3'], borderWidth: 2 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: tickColor, font: { family: 'DM Mono', size: 10 }, padding: 12 } },
          tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.raw} member` } },
        },
        cutout: '65%',
      },
    });
  }, [appData, activeZone, selYear, donutMonth, darkMode]);

  // Multi-periode bar chart
  useEffect(() => {
    if (typeof Chart === 'undefined') return;
    try { instances.current.mperiod?.destroy(); } catch {}

    if (!chartRefs.mperiod.current) return;
    const tickColor = darkMode ? '#777' : '#5a6080';
    const gridColor = darkMode ? '#1e2231' : '#d0d4e0';
    const lbl1 = `${MONTHS[p1Month].slice(0,3)} ${p1Year}`;
    const lbl2 = `${MONTHS[p2Month].slice(0,3)} ${p2Year}`;
    instances.current.mperiod = new Chart(chartRefs.mperiod.current, {
      type: 'bar',
      data: {
        labels: [lbl1, lbl2],
        datasets: [{
          data: [p1Total, p2Total],
          backgroundColor: [zc + '99', '#aaa6'],
          borderColor: [zc, '#aaa'],
          borderWidth: 2,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => `Rp ${(ctx.raw * 1000).toLocaleString('id-ID')}` } },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'DM Mono', size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { family: 'DM Mono', size: 10 }, callback: (v: number) => 'Rp ' + (v * 1000).toLocaleString('id-ID') } },
        },
      },
    });
  }, [p1Year, p1Month, p2Year, p2Month, appData, activeZone, darkMode]);

  function PctBadge({ pct }: { pct: number | null }) {
    if (!pct) return null;
    return <span style={{ fontSize:10, fontWeight:600, color: pct >= 0 ? '#4CAF50' : '#e05c5c', marginLeft:6 }}>{pct >= 0 ? '▲' : '▼'}{Math.abs(pct)}%</span>;
  }

  const selStyle: React.CSSProperties = {
    background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)',
    padding:'6px 10px', borderRadius:7, fontSize:11, flex:1,
  };

  // Donut summary data
  const donutZone = activeZone === ('TOTAL' as any) ? 'KRS' : activeZone;
  const donutData = getDonutData(donutZone, selYear, donutMonth);

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
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:12, boxShadow:'var(--shadow-xs)' }}>
          <div style={{ fontSize:9, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:4 }}>TOTAL {selYear}<PctBadge pct={curYPct} /></div>
          <div style={{ fontSize:15, fontWeight:700, color:zc }}>{rp(mTotal)}</div>
          <div style={{ fontSize:10, color:'var(--txt4)', marginTop:3 }}>Avg/bulan: {rp(mAvg)}</div>
        </div>
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:12, boxShadow:'var(--shadow-xs)' }}>
          <div style={{ fontSize:9, color:'var(--txt3)', letterSpacing:'.06em', marginBottom:4 }}>VS TAHUN LALU<PctBadge pct={curYPct} /></div>
          <div style={{ fontSize:15, fontWeight:700, color:zc }}>{rp(prevYTotal)}</div>
          <div style={{ fontSize:10, color:'var(--txt4)', marginTop:3 }}>Tahun {selYear - 1}</div>
        </div>
      </div>

      {/* JANGAN HAPUS: script CDN duplikat ini sudah berjalan — biarkan */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js" async />

      {/* 1. Chart: Pendapatan Bulanan + bar proyeksi */}
      <div className="chart-box">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div className="chart-title" style={{ margin:0 }}>PENDAPATAN BULANAN {selYear} · {activeZone}</div>
          {proyeksi > 0 && (
            <div style={{ fontSize:9, color:'#4CAF50', display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ width:10, height:10, background:'#4CAF5066', borderRadius:2, display:'inline-block' }} />
              {nextMonthLabel}* proj.
            </div>
          )}
        </div>
        <div className="chart-wrap"><canvas ref={chartRefs.monthly} /></div>
      </div>

      {/* 2. Chart: KRS vs SLK + TOTAL */}
      <div className="chart-box">
        <div className="chart-title">KRS vs SLK {selYear}</div>
        <div className="chart-wrap"><canvas ref={chartRefs.compare} /></div>
      </div>

      {/* 3. Sesi D: Pie/Donut lunas vs belum vs free */}
      <div className="chart-box">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div className="chart-title" style={{ margin:0 }}>KOMPOSISI {donutZone} — LUNAS VS BELUM</div>
          <select style={{ ...selStyle, flex:'none', width:'auto', fontSize:10 }} value={donutMonth} onChange={e => setDonutMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        {/* Ringkasan angka di atas donut */}
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          {[
            { label:'Lunas', val: donutData.lunas, color:'#4CAF50' },
            { label:'Belum', val: donutData.belum, color:'#e05c5c' },
            { label:'Free',  val: donutData.free,  color:'#2196F3' },
          ].map(d => (
            <div key={d.label} style={{ flex:1, textAlign:'center', background:'var(--bg3)', borderRadius:8, padding:'8px 4px', border:`1px solid ${d.color}22` }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:d.color }}>{d.val}</div>
              <div style={{ fontSize:9, color:'var(--txt4)', marginTop:2 }}>{d.label}</div>
            </div>
          ))}
        </div>
        <div style={{ position:'relative', height:180 }}><canvas ref={chartRefs.donut} /></div>
      </div>

      {/* 4. Chart: Perbandingan Tahunan */}
      <div className="chart-box">
        <div className="chart-title">PERBANDINGAN TAHUNAN · {activeZone}</div>
        <div className="chart-wrap"><canvas ref={chartRefs.yearly} /></div>
      </div>

      {/* 5. Sesi D: Proyeksi bulan depan (card info) */}
      {proyeksi > 0 && (
        <div style={{ background:'var(--bg2)', border:'1px solid #4CAF5033', borderRadius:10, padding:14, marginBottom:12, boxShadow:'var(--shadow-xs)' }}>
          <div style={{ fontSize:9, color:'#4CAF5099', letterSpacing:'.07em', marginBottom:6 }}>📈 PROYEKSI BULAN DEPAN</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:'#4CAF50' }}>{rp(proyeksi)}</div>
              <div style={{ fontSize:10, color:'var(--txt4)', marginTop:3 }}>{nextMonthLabel} {proyeksi === mData[new Date().getMonth()] ? selYear : selYear}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:10, color:'var(--txt3)' }}>berdasarkan</div>
              <div style={{ fontSize:10, color:'var(--txt4)' }}>avg {last3.length} bulan terakhir</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Sesi D: Multi-periode comparison */}
      <div className="chart-box">
        <div className="chart-title" style={{ marginBottom:12 }}>PERBANDINGAN DUA PERIODE</div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          {/* Periode 1 */}
          <div>
            <div style={{ fontSize:9, color:'var(--zc)', letterSpacing:'.06em', marginBottom:6 }}>PERIODE 1</div>
            <div style={{ display:'flex', gap:5 }}>
              <select style={selStyle} value={p1Year}  onChange={e => setP1Year(+e.target.value)}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={selStyle} value={p1Month} onChange={e => setP1Month(+e.target.value)}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m.slice(0,3)}</option>)}
              </select>
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:'var(--zc)', marginTop:6 }}>{rp(p1Total)}</div>
          </div>
          {/* Periode 2 */}
          <div>
            <div style={{ fontSize:9, color:'#aaa', letterSpacing:'.06em', marginBottom:6 }}>PERIODE 2</div>
            <div style={{ display:'flex', gap:5 }}>
              <select style={selStyle} value={p2Year}  onChange={e => setP2Year(+e.target.value)}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select style={selStyle} value={p2Month} onChange={e => setP2Month(+e.target.value)}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m.slice(0,3)}</option>)}
              </select>
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:'#aaa', marginTop:6 }}>{rp(p2Total)}</div>
          </div>
        </div>

        {/* Selisih */}
        {mperiodPct !== null && (
          <div style={{ textAlign:'center', padding:'6px 0', marginBottom:10, fontSize:12, fontWeight:700, color: mperiodPct >= 0 ? '#4CAF50' : '#e05c5c' }}>
            {mperiodPct >= 0 ? '▲' : '▼'} {Math.abs(mperiodPct)}% selisih periode
          </div>
        )}

        <div style={{ position:'relative', height:160 }}><canvas ref={chartRefs.mperiod} /></div>
      </div>
    </div>
  );
}
