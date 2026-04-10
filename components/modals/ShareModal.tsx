// components/modals/ShareModal.tsx
'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { generatePDF, generateExcel } from '@/lib/export';
import { showToast } from '@/components/ui/Toast';

interface Props { open: boolean; onClose: () => void; }

export default function ShareModal({ open, onClose }: Props) {
  const { appData, activeZone, selYear, selMonth, shareType, setShareType, shareFmt, setShareFmt } = useAppStore();
  const [zone, setZone] = useState<string>(activeZone);
  const [year,  setYear]  = useState(selYear);
  const [month, setMonth] = useState(selMonth);
  const [busy,  setBusy]  = useState(false);

  if (!open) return null;

  async function doShare() {
    setBusy(true);
    showToast('Membuat file...', 'info');
    try {
      const mon = shareType === 'monthly' ? month : null;
      let blob: Blob, filename: string;
      if (shareFmt === 'pdf') {
        ({ blob, filename } = await generatePDF(appData, zone, year, mon));
      } else {
        ({ blob, filename } = generateExcel(appData, zone, year, mon));
      }
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a'); a.href = url; a.download = filename; a.click();
      setTimeout(() => {
        const txt = encodeURIComponent(`Rekap WiFi Pay ${zone} ${shareType==='monthly'?MONTHS[month]+' ':''}${year}\nFile: ${filename}`);
        window.open(`https://wa.me/?text=${txt}`, '_blank');
      }, 1000);
      showToast('File siap, WhatsApp dibuka!');
      onClose();
    } catch (e) {
      showToast('Gagal generate file','err');
    } finally { setBusy(false); }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">📤 Share Rekap <button className="modal-close" onClick={onClose}>✕</button></div>

        {/* Tipe */}
        <div className="modal-row">
          <div className="modal-label">TIPE REKAP</div>
          <div style={{ display:'flex', gap:8 }}>
            {(['monthly','yearly'] as const).map(t => (
              <button key={t} className={`fmt-btn ${shareType===t?'on':''}`} onClick={() => setShareType(t)}>
                {t==='monthly'?'Bulanan':'Tahunan'}
              </button>
            ))}
          </div>
        </div>

        {/* Bulan (hanya jika monthly) */}
        {shareType === 'monthly' && (
          <div className="modal-row">
            <div className="modal-label">BULAN</div>
            <select className="modal-select" value={month} onChange={e => setMonth(+e.target.value)}>
              {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        )}

        <div className="modal-row">
          <div className="modal-label">TAHUN</div>
          <select className="modal-select" value={year} onChange={e => setYear(+e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="modal-row">
          <div className="modal-label">ZONA</div>
          <select className="modal-select" value={zone} onChange={e => setZone(e.target.value)}>
            <option value="KRS">KRS</option>
            <option value="SLK">SLK</option>
            <option value="ALL">KRS + SLK (Gabungan)</option>
          </select>
        </div>

        <div className="modal-row">
          <div className="modal-label">FORMAT</div>
          <div style={{ display:'flex', gap:8 }}>
            {(['pdf','excel'] as const).map(f => (
              <button key={f} className={`fmt-btn ${shareFmt===f?'on':''}`} onClick={() => setShareFmt(f)}>
                {f==='pdf'?'📄 PDF':'📊 Excel'}
              </button>
            ))}
          </div>
        </div>

        <button className="modal-action" onClick={doShare} disabled={busy}>
          {busy ? 'Membuat...' : 'Generate & Share via WhatsApp'}
        </button>
      </div>
    </div>
  );
}
