'use client';
export default function LoadingScreen() {
  return (
    <div style={{ position:'fixed',inset:0,background:'var(--bg)',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16 }}>
      <div className="ls-logo">📶</div>
      <div className="ls-name">WiFi Pay</div>
      <div className="ls-sub">SISTEM IURAN BULANAN</div>
      <div className="ls-bar"><div className="ls-fill" /></div>
      <div className="ls-dots"><div className="ls-dot" /><div className="ls-dot" /><div className="ls-dot" /></div>
    </div>
  );
}
