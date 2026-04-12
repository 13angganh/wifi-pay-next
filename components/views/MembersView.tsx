// components/views/MembersView.tsx — FIXED: IP tampil, layout 2 baris rapi
'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MONTHS, YEARS } from '@/lib/constants';
import { isFree, rp } from '@/lib/helpers';
import { saveDB } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import { showConfirm } from '@/components/ui/Confirm';
import FreeMemberModal from '@/components/modals/FreeMemberModal';
import RiwayatModal    from '@/components/modals/RiwayatModal';
import type { Zone } from '@/types';

type SortMode = 'name-asc'|'name-desc'|'id-asc'|'id-desc'|'ip-asc'|'ip-desc';

export default function MembersView() {
  const {
    appData, setAppData, uid, userEmail,
    newMemberZone, setNewMemberZone,
    memberTab, setMemberTab,
    search, setSearch,
    membersLocked, setMembersLocked,
    selYear, selMonth,
    setSyncStatus,
    setRiwayatZone, setRiwayatName, setRiwayatYear,
  } = useAppStore();

  const [sortMode, setSortMode] = useState<SortMode>('name-asc');
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ zone:'KRS' as Zone, origName:'', name:'', id:'', ip:'', tarif:'' });
  const [freeOpen, setFreeOpen] = useState(false);
  const [freeName, setFreeName] = useState('');
  const [freeZone, setFreeZone] = useState<Zone>('KRS');
  const [riwOpen,  setRiwOpen]  = useState(false);

  const zone = newMemberZone;
  const zc   = zone === 'KRS' ? '#2196F3' : '#e05c3a';

  const addRef = {
    name:  useRef<HTMLInputElement>(null),
    id:    useRef<HTMLInputElement>(null),
    ip:    useRef<HTMLInputElement>(null),
    tarif: useRef<HTMLInputElement>(null),
  };

  async function persist(newData: typeof appData, action: string, detail?: string) {
    setAppData(newData);
    if (!uid) return;
    setSyncStatus('loading');
    try { await saveDB(uid, newData, { action, detail:detail||'' }, userEmail||''); setSyncStatus('ok'); }
    catch { setSyncStatus('err'); }
  }

  function openFree(z: Zone, n: string) { setFreeZone(z); setFreeName(n); setFreeOpen(true); }
  function openRiwayat(z: Zone, n: string) {
    setRiwayatZone(z); setRiwayatName(n); setRiwayatYear(new Date().getFullYear());
    setRiwOpen(true);
  }

  async function addMember() {
    const name  = addRef.name.current?.value.trim().toUpperCase() || '';
    const id    = addRef.id.current?.value.trim()   || '';
    const ip    = addRef.ip.current?.value.trim()   || '';
    const tarif = addRef.tarif.current?.value.trim() || '';
    if (!name) { showToast('Nama wajib diisi','err'); return; }
    const list = zone==='KRS' ? [...appData.krsMembers] : [...appData.slkMembers];
    if (list.includes(name)) { showToast('Nama sudah ada!','err'); return; }
    list.push(name); list.sort();
    const infoKey = `${zone}__${name}`;
    const newInfo = { ...(appData.memberInfo||{}), [infoKey]: { id, ip, ...(tarif ? { tarif:+tarif } : {}) } };
    const newData = { ...appData, [zone==='KRS'?'krsMembers':'slkMembers']: list, memberInfo: newInfo };
    await persist(newData, `➕ Tambah member ${zone} - ${name}`, `ID:${id} IP:${ip}`);
    showToast(`✅ ${name} ditambahkan!`);
    ['name','id','ip','tarif'].forEach(f => { const el = addRef[f as keyof typeof addRef].current; if(el) el.value=''; });
  }

  function openEdit(name: string) {
    const info = appData.memberInfo?.[zone+'__'+name] || {};
    setEditData({ zone, origName:name, name, id:String(info.id||''), ip:String(info.ip||''), tarif:String(info.tarif||'') });
    setEditOpen(true);
  }

  async function saveEdit() {
    const { zone, origName, name, id, ip, tarif } = editData;
    const newName = name.trim().toUpperCase();
    if (!newName) { showToast('Nama tidak boleh kosong','err'); return; }
    const list = zone==='KRS' ? [...appData.krsMembers] : [...appData.slkMembers];
    const idx  = list.indexOf(origName);
    if (idx === -1) { showToast('Member tidak ditemukan','err'); return; }
    if (newName !== origName && list.includes(newName)) { showToast('Nama sudah ada!','err'); return; }
    let newPayments   = { ...appData.payments };
    let newMemberInfo = { ...(appData.memberInfo||{}) };
    if (newName !== origName) {
      list[idx] = newName; list.sort();
      Object.keys(newPayments).filter(k => k.startsWith(`${zone}__${origName}__`)).forEach(k => {
        newPayments[k.replace(`${zone}__${origName}__`,`${zone}__${newName}__`)] = newPayments[k];
        delete newPayments[k];
      });
      const oldInfo = newMemberInfo[`${zone}__${origName}`] || {};
      delete newMemberInfo[`${zone}__${origName}`];
      newMemberInfo[`${zone}__${newName}`] = { ...oldInfo, id, ip, ...(tarif ? { tarif:+tarif } : {}) };
    } else {
      const existing = newMemberInfo[`${zone}__${origName}`] || {};
      newMemberInfo[`${zone}__${origName}`] = { ...existing, id, ip, ...(tarif ? { tarif:+tarif } : {}) };
      if (!tarif) delete newMemberInfo[`${zone}__${origName}`].tarif;
    }
    const newData = { ...appData, [zone==='KRS'?'krsMembers':'slkMembers']:list, payments:newPayments, memberInfo:newMemberInfo };
    await persist(newData, `✏️ Edit member ${zone}`, `${origName} → ${newName}`);
    showToast(`${newName} berhasil diupdate!`); setEditOpen(false);
  }

  async function deleteMember(name: string) {
    showConfirm('🗑️',`Hapus member <b>${name}</b>?<br><span style="font-size:11px;color:var(--txt3)">Data bayar disimpan di recycle bin</span>`,'Ya, Hapus',async()=>{
      const list     = zone==='KRS' ? [...appData.krsMembers] : [...appData.slkMembers];
      const filtered = list.filter(m => m !== name);
      const mk       = `${zone}__${name}`;
      const mp: Record<string,number> = {};
      Object.keys(appData.payments||{}).filter(k=>k.startsWith(mk+'__')).forEach(k=>{mp[k]=appData.payments[k];});
      const nd = { ...appData, [zone==='KRS'?'krsMembers':'slkMembers']:filtered,
        payments:Object.fromEntries(Object.entries(appData.payments||{}).filter(([k])=>!k.startsWith(mk+'__'))),
        deletedMembers:{ ...(appData.deletedMembers||{}), [mk]:{ zone,name,deletedAt:Date.now(),payments:mp } } };
      await persist(nd, `🗑️ Hapus member ${zone} - ${name}`);
      showToast(`${name} dihapus`,'err');
    });
  }

  async function restoreMember(key: string) {
    const d = appData.deletedMembers?.[key]; if(!d) return;
    const list = d.zone==='KRS' ? [...appData.krsMembers] : [...appData.slkMembers];
    if (!list.includes(d.name)) { list.push(d.name); list.sort(); }
    const nd = { ...appData, [d.zone==='KRS'?'krsMembers':'slkMembers']:list,
      payments:{ ...(appData.payments||{}), ...(d.payments||{}) },
      deletedMembers:Object.fromEntries(Object.entries(appData.deletedMembers||{}).filter(([k])=>k!==key)) };
    await persist(nd, `♻️ Restore member ${d.zone} - ${d.name}`);
    showToast(`✅ ${d.name} berhasil dikembalikan!`);
  }

  async function permanentDelete(key: string) {
    const d = appData.deletedMembers?.[key]; if(!d) return;
    showConfirm('💀',`Hapus permanen <b>${d.name}</b>?<br><span style="font-size:11px;color:#e05c5c">Tidak bisa dikembalikan!</span>`,'Ya, Hapus Permanen',async()=>{
      const nd = { ...appData, deletedMembers:Object.fromEntries(Object.entries(appData.deletedMembers||{}).filter(([k])=>k!==key)) };
      await persist(nd, `💀 Hapus permanen ${d.zone} - ${d.name}`);
      showToast(`${d.name} dihapus permanen`,'err');
    });
  }

  // Sort
  const getInfo = (n: string) => appData.memberInfo?.[zone+'__'+n] || {};
  let mems = zone==='KRS' ? [...appData.krsMembers] : [...appData.slkMembers];
  const sortFns: Record<SortMode,(a:string,b:string)=>number> = {
    'name-asc':  (a,b) => a.localeCompare(b),
    'name-desc': (a,b) => b.localeCompare(a),
    'id-asc':    (a,b) => String(getInfo(a).id||'zzz').localeCompare(String(getInfo(b).id||'zzz'),undefined,{numeric:true}),
    'id-desc':   (a,b) => String(getInfo(b).id||'').localeCompare(String(getInfo(a).id||''),undefined,{numeric:true}),
    'ip-asc':    (a,b) => String(getInfo(a).ip||'zzz').localeCompare(String(getInfo(b).ip||'zzz'),undefined,{numeric:true}),
    'ip-desc':   (a,b) => String(getInfo(b).ip||'').localeCompare(String(getInfo(a).ip||''),undefined,{numeric:true}),
  };
  mems.sort(sortFns[sortMode]);
  const filteredMems = mems.filter(m => m.toLowerCase().includes(search.toLowerCase()));
  const deletedList  = Object.entries(appData.deletedMembers||{}).filter(([k])=>k.startsWith(zone+'__')).sort((a,b)=>b[1].deletedAt-a[1].deletedAt);
  const sortLabels: Record<SortMode,string> = { 'name-asc':'A-Z','name-desc':'Z-A','id-asc':'ID ↑','id-desc':'ID ↓','ip-asc':'IP ↑','ip-desc':'IP ↓' };

  const badgeStyle: React.CSSProperties = {
    fontSize:9, padding:'2px 6px', borderRadius:4, flexShrink:0, fontFamily:"'DM Mono',monospace",
  };

  return (
    <div>
      {/* Zone tabs + lock */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ display:'flex', gap:3, background:'var(--bg3)', padding:3, borderRadius:24, border:'1px solid var(--border)' }}>
          {(['KRS','SLK'] as Zone[]).map(z => (
            <button key={z} onClick={() => { setNewMemberZone(z); setSearch(''); setMemberTab('active'); }}
              style={{ padding:'6px 16px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:600,
                background: zone===z ? (z==='KRS'?'#2196F3':'#e05c3a') : 'transparent',
                color: zone===z ? '#fff' : 'var(--txt3)' }}>
              {z} <span style={{ opacity:.6, fontSize:10 }}>({z==='KRS'?appData.krsMembers.length:appData.slkMembers.length})</span>
            </button>
          ))}
        </div>
        <button onClick={() => { setMembersLocked(!membersLocked); showToast(membersLocked?'🔓 Dibuka':'🔒 Dikunci'); }}
          style={{ background:membersLocked?'#0d2b1f':'#1f0d0d', border:`1px solid ${membersLocked?'#4CAF5033':'#e05c5c33'}`, color:membersLocked?'#4CAF50':'#e05c5c', padding:'6px 14px', borderRadius:7, cursor:'pointer', fontSize:11 }}>
          {membersLocked ? '🔒 Terkunci' : '🔓 Buka'}
        </button>
      </div>

      {/* Active / Deleted tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:10, background:'var(--bg2)', padding:3, borderRadius:20, border:'1px solid var(--border)' }}>
        <button onClick={() => setMemberTab('active')} style={{ flex:1, padding:6, borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:memberTab==='active'?zc:'transparent', color:memberTab==='active'?'#fff':'var(--txt3)' }}>👥 Aktif ({mems.length})</button>
        <button onClick={() => setMemberTab('deleted')} style={{ flex:1, padding:6, borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:memberTab==='deleted'?'#e05c3a':'transparent', color:memberTab==='deleted'?'#fff':'var(--txt3)' }}>🗑️ Terhapus ({deletedList.length})</button>
      </div>

      {/* DELETED TAB */}
      {memberTab === 'deleted' ? (
        deletedList.length === 0
          ? <div className="empty-state" style={{padding:'24px'}}><div className="empty-icon">🗑️</div><div className="empty-title">Recycle Bin Kosong</div><div className="empty-sub">Tidak ada member yang dihapus</div></div>
          : deletedList.map(([k,d]) => (
            <div key={k} className="del-card">
              <div>
                <div className="del-card-name">🗑️ {d.name}</div>
                <div style={{ fontSize:10, color:'var(--txt4)' }}>Dihapus: {new Date(d.deletedAt).toLocaleDateString('id-ID')} · {Object.keys(d.payments||{}).length} data</div>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                <button className="restore-btn" onClick={() => restoreMember(k)}>♻️ Kembalikan</button>
                <button onClick={() => permanentDelete(k)} style={{ background:'#1f0d0d', border:'1px solid #e05c5c55', color:'#e05c5c', padding:'5px 10px', borderRadius:6, cursor:'pointer', fontSize:11 }}>🗑️</button>
              </div>
            </div>
          ))
      ) : (
        <>
          {/* Add form */}
          {!membersLocked && (
            <div className="add-form">
              <div className="af-title">TAMBAH MEMBER BARU KE {zone}</div>
              <div className="af-grid">
                <div>
                  <div style={{ fontSize:10, color:'var(--txt3)', marginBottom:4 }}>NAMA</div>
                  <input ref={addRef.name} className="af-input" placeholder="Nama member" autoComplete="off"
                    style={{ textTransform:'uppercase' }} onKeyDown={e=>e.key==='Enter'&&addMember()} />
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--txt3)', marginBottom:4 }}>ID PELANGGAN</div>
                  <input ref={addRef.id} className="af-input" placeholder="Opsional" autoComplete="off" />
                </div>
                <div style={{ gridColumn:'span 2' }}>
                  <div style={{ fontSize:10, color:'var(--txt3)', marginBottom:4 }}>IP / LINK ROUTER</div>
                  <input ref={addRef.ip} className="af-input" placeholder="192.168.x.x atau http://..." autoComplete="off" />
                </div>
                <div>
                  <div style={{ fontSize:10, color:'var(--txt3)', marginBottom:4 }}>TARIF (×1000)</div>
                  <input ref={addRef.tarif} type="number" inputMode="numeric" className="af-input" placeholder="Contoh: 100" autoComplete="off" />
                </div>
              </div>
              <button style={{ width:'100%', background:zc, color:'#fff', border:'none', padding:10, borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }} onClick={addMember}>
                + Tambah ke {zone}
              </button>
            </div>
          )}

          {/* Sort */}
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:8 }}>
            {(Object.entries(sortLabels) as [SortMode,string][]).map(([k,l]) => (
              <button key={k} onClick={() => setSortMode(k)}
                style={{ padding:'4px 9px', borderRadius:10, border:'none', cursor:'pointer', fontSize:10,
                  background:sortMode===k?'#2196F3':'var(--bg3)', color:sortMode===k?'#fff':'var(--txt3)' }}>{l}</button>
            ))}
          </div>

          {/* Search */}
          <div className="search-wrap">
            <input className="search-box" placeholder={`🔍 Cari nama di ${zone}...`} value={search} onChange={e=>setSearch(e.target.value)} />
            {search && <button className="search-clear" onClick={()=>setSearch('')}>✕</button>}
          </div>
          <div style={{ fontSize:10, color:'var(--txt4)', marginBottom:8 }}>{filteredMems.length} member{search?' ditemukan':''} · {zone}</div>

          {/* Member rows */}
          <div id="member-rows">
            {filteredMems.length === 0
              ? <div className="empty-state" style={{padding:'24px'}}><div className="empty-icon">👥</div><div className="empty-title">Belum Ada Member</div><div className="empty-sub">Tambahkan member baru di atas</div></div>
              : filteredMems.map((name, i) => {
                const info      = getInfo(name);
                const isFreeNow = isFree(appData, zone, name, selYear, selMonth);
                const ipStr     = String(info.ip || '');
                const idStr     = String(info.id || '—');

                return (
                  <div key={name} style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:8, padding:'8px 12px', marginBottom:4 }}>
                    {/* Baris 1: nomor, ID, nama, badge */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom: (!membersLocked || ipStr) ? 5 : 0 }}>
                      <span style={{ fontSize:10, color:'var(--txt4)', width:18, flexShrink:0 }}>{i+1}</span>
                      <span style={{ ...badgeStyle, background:'#1e2a4022', border:'1px solid #2196F322', color: info.id ? '#2196F3' : 'var(--txt4)' }}>{idStr}</span>
                      <span style={{ fontSize:12, flex:1, cursor:'pointer', color:'var(--txt)', fontWeight:500 }} onClick={() => openRiwayat(zone, name)}>{name}</span>
                      {isFreeNow && <span style={{ ...badgeStyle, background:'#0a2a18', border:'1px solid #4CAF5033', color:'#4CAF50' }}>🆓</span>}
                      {info.tarif && <span style={{ ...badgeStyle, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt3)' }}>{rp(info.tarif as number)}</span>}
                    </div>

                    {/* Baris 2: IP + action buttons */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, paddingLeft:24 }}>
                      {/* IP tampil sebagai teks dengan link */}
                      {ipStr ? (
                        <a
                          href={ipStr.startsWith('http') ? ipStr : 'http://'+ipStr}
                          target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize:10, color:'#2196F3', textDecoration:'none', fontFamily:"'DM Mono',monospace", flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
                        >
                          🔗 {ipStr}
                        </a>
                      ) : (
                        <span style={{ flex:1, fontSize:10, color:'var(--txt5)', fontStyle:'italic' }}>—</span>
                      )}

                      {/* Action buttons — selalu di baris bawah */}
                      {!membersLocked && (
                        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                          <button onClick={() => openFree(zone, name)}
                            style={{ background:isFreeNow?'#0a2a18':'none', border:`1px solid ${isFreeNow?'#4CAF50':'var(--border)'}`, color:isFreeNow?'#4CAF50':'var(--txt4)', padding:'3px 8px', borderRadius:5, cursor:'pointer', fontSize:10 }}>
                            🆓
                          </button>
                          <button onClick={() => openEdit(name)}
                            style={{ background:'none', border:'1px solid var(--border)', color:'#2196F3', padding:'3px 8px', borderRadius:5, cursor:'pointer', fontSize:10 }}>
                            ✏️
                          </button>
                          <button onClick={() => deleteMember(name)}
                            style={{ background:'none', border:'1px solid #2a1a1a', color:'#4a2a2a', padding:'3px 8px', borderRadius:5, cursor:'pointer', fontSize:10 }}>
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div className="modal-bg center" onClick={() => setEditOpen(false)}>
          <div className="modal center" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✏️ Edit Member <button className="modal-close" onClick={() => setEditOpen(false)}>✕</button></div>
            {([
              { label:'NAMA',                   field:'name',  type:'text',   ph:''                             },
              { label:'ID PELANGGAN',            field:'id',    type:'text',   ph:'Opsional'                     },
              { label:'IP / LINK ROUTER',        field:'ip',    type:'text',   ph:'192.168.x.x atau http://...'  },
              { label:'TARIF BULANAN (×1000)',   field:'tarif', type:'number', ph:'Contoh: 100 = Rp 100.000'    },
            ] as const).map(({ label, field, type, ph }) => (
              <div key={field} className="modal-row">
                <div className="modal-label">{label}</div>
                <input
                  className="modal-select"
                  type={type}
                  inputMode={type==='number' ? 'numeric' : undefined}
                  placeholder={ph}
                  value={editData[field]}
                  onChange={e => setEditData(prev => ({ ...prev, [field]: e.target.value }))}
                  style={{ borderRadius:7, padding:'9px 12px', background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)', fontSize:13, fontFamily:"'DM Mono',monospace" }}
                />
              </div>
            ))}
            <button className="modal-action" onClick={saveEdit}>Simpan Perubahan</button>
          </div>
        </div>
      )}

      <FreeMemberModal open={freeOpen} zone={freeZone} name={freeName} onClose={() => setFreeOpen(false)} />
      <RiwayatModal    open={riwOpen}  onClose={() => setRiwOpen(false)} />
    </div>
  );
}
