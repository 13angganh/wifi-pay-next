// components/views/MembersView.tsx
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
  const [freeOpen, setFreeOpen]   = useState(false);
  const [freeName, setFreeName]   = useState('');
  const [freeZone, setFreeZone]   = useState<Zone>('KRS');
  const [riwOpen,  setRiwOpen]    = useState(false);

  const zone = newMemberZone;
  const zc   = zone === 'KRS' ? '#2196F3' : '#e05c3a';
  const now  = new Date();

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

  function openFree(z: Zone, n: string) {
    setFreeZone(z); setFreeName(n); setFreeOpen(true);
  }

  function openRiwayat(z: Zone, n: string) {
    setRiwayatZone(z); setRiwayatName(n); setRiwayatYear(now.getFullYear());
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
    let newPayments    = { ...appData.payments };
    let newMemberInfo  = { ...(appData.memberInfo||{}) };
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
    showToast(`${newName} berhasil diupdate!`);
    setEditOpen(false);
  }

  async function deleteMember(name: string) {
    showConfirm('🗑️',`Hapus member <b>${name}</b>?<br><span style="font-size:11px;color:var(--txt3)">Data bayar akan disimpan di recycle bin</span>`,'Ya, Hapus',async()=>{
      const list     = zone==='KRS' ? [...appData.krsMembers] : [...appData.slkMembers];
      const filtered = list.filter(m => m !== name);
      const memberKey= `${zone}__${name}`;
      const memberPayments: Record<string,number> = {};
      Object.keys(appData.payments||{}).filter(k=>k.startsWith(memberKey+'__')).forEach(k=>{ memberPayments[k]=appData.payments[k]; });
      const newDeleted = { ...(appData.deletedMembers||{}), [memberKey]:{ zone,name,deletedAt:Date.now(),payments:memberPayments } };
      const newPayments = Object.fromEntries(Object.entries(appData.payments||{}).filter(([k])=>!k.startsWith(memberKey+'__')));
      const newData = { ...appData,[zone==='KRS'?'krsMembers':'slkMembers']:filtered,payments:newPayments,deletedMembers:newDeleted };
      await persist(newData, `🗑️ Hapus member ${zone} - ${name}`);
      showToast(`${name} dihapus`,'err');
    });
  }

  async function restoreMember(key: string) {
    const d = appData.deletedMembers?.[key]; if(!d) return;
    const list = d.zone==='KRS' ? [...appData.krsMembers] : [...appData.slkMembers];
    if (!list.includes(d.name)) { list.push(d.name); list.sort(); }
    const newPayments = { ...(appData.payments||{}), ...(d.payments||{}) };
    const newDeleted  = { ...(appData.deletedMembers||{}) }; delete newDeleted[key];
    const newData = { ...appData,[d.zone==='KRS'?'krsMembers':'slkMembers']:list,payments:newPayments,deletedMembers:newDeleted };
    await persist(newData, `♻️ Restore member ${d.zone} - ${d.name}`);
    showToast(`✅ ${d.name} berhasil dikembalikan!`);
  }

  async function permanentDelete(key: string) {
    const d = appData.deletedMembers?.[key]; if(!d) return;
    showConfirm('💀',`Hapus permanen <b>${d.name}</b>?<br><span style="font-size:11px;color:#e05c5c">Data tidak bisa dikembalikan!</span>`,'Ya, Hapus Permanen',async()=>{
      const newDeleted = { ...(appData.deletedMembers||{}) }; delete newDeleted[key];
      await persist({ ...appData,deletedMembers:newDeleted },`💀 Hapus permanen ${d.zone} - ${d.name}`);
      showToast(`${d.name} dihapus permanen`,'err');
    });
  }

  // Sort
  let mems = zone==='KRS' ? [...appData.krsMembers] : [...appData.slkMembers];
  const getInfo = (n: string) => appData.memberInfo?.[zone+'__'+n] || {};
  const sortFns: Record<SortMode,(a:string,b:string)=>number> = {
    'name-asc':  (a,b) => a.localeCompare(b),
    'name-desc': (a,b) => b.localeCompare(a),
    'id-asc':    (a,b) => String(getInfo(a).id||'zzz').localeCompare(String(getInfo(b).id||'zzz'),undefined,{numeric:true}),
    'id-desc':   (a,b) => String(getInfo(b).id||'').localeCompare(String(getInfo(a).id||''),undefined,{numeric:true}),
    'ip-asc':    (a,b) => String(getInfo(a).ip||'zzz').localeCompare(String(getInfo(b).ip||'zzz'),undefined,{numeric:true}),
    'ip-desc':   (a,b) => String(getInfo(b).ip||'').localeCompare(String(getInfo(a).ip||''),undefined,{numeric:true}),
  };
  mems.sort(sortFns[sortMode]);
  const filtered     = mems.filter(m => m.toLowerCase().includes(search.toLowerCase()));
  const deletedList  = Object.entries(appData.deletedMembers||{}).filter(([k])=>k.startsWith(zone+'__')).sort((a,b)=>b[1].deletedAt-a[1].deletedAt);
  const sortLabels: Record<SortMode,string> = { 'name-asc':'Nama A-Z','name-desc':'Nama Z-A','id-asc':'ID ↑','id-desc':'ID ↓','ip-asc':'IP ↑','ip-desc':'IP ↓' };

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
          style={{ background:membersLocked?'#0d2b1f':'#1f0d0d', border:`1px solid ${membersLocked?'#4CAF5033':'#e05c5c33'}`, color:membersLocked?'#4CAF50':'#e05c5c', padding:'7px 16px', borderRadius:7, cursor:'pointer', fontSize:11 }}>
          {membersLocked ? '🔒 Terkunci' : '🔓 Tidak Terkunci'}
        </button>
      </div>

      {/* Active / Deleted tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:10, background:'var(--bg2)', padding:3, borderRadius:20, border:'1px solid var(--border)' }}>
        <button onClick={() => setMemberTab('active')} style={{ flex:1, padding:6, borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:memberTab==='active'?zc:'transparent', color:memberTab==='active'?'#fff':'var(--txt3)' }}>👥 Aktif ({mems.length})</button>
        <button onClick={() => setMemberTab('deleted')} style={{ flex:1, padding:6, borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:memberTab==='deleted'?'#e05c3a':'transparent', color:memberTab==='deleted'?'#fff':'var(--txt3)' }}>🗑️ Terhapus ({deletedList.length})</button>
      </div>

      {/* Deleted tab */}
      {memberTab === 'deleted' ? (
        deletedList.length === 0
          ? <div style={{ textAlign:'center', padding:30, color:'var(--txt3)', fontSize:12 }}>🗑️ Recycle bin kosong</div>
          : deletedList.map(([k,d]) => (
            <div key={k} className="del-card">
              <div>
                <div className="del-card-name">🗑️ {d.name}</div>
                <div style={{ fontSize:10, color:'var(--txt4)' }}>Dihapus: {new Date(d.deletedAt).toLocaleDateString('id-ID')} · {Object.keys(d.payments||{}).length} data bayar</div>
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
                <div><div style={{ fontSize:10, color:'var(--txt3)', marginBottom:4 }}>NAMA</div><input ref={addRef.name} className="af-input" placeholder="Nama member" autoComplete="off" style={{ textTransform:'uppercase' }} onKeyDown={e=>e.key==='Enter'&&addMember()} /></div>
                <div><div style={{ fontSize:10, color:'var(--txt3)', marginBottom:4 }}>ID PELANGGAN</div><input ref={addRef.id} className="af-input" placeholder="Opsional" autoComplete="off" /></div>
                <div style={{ gridColumn:'span 2' }}><div style={{ fontSize:10, color:'var(--txt3)', marginBottom:4 }}>IP / LINK ROUTER</div><input ref={addRef.ip} className="af-input" placeholder="192.168.x.x atau http://..." autoComplete="off" /></div>
                <div><div style={{ fontSize:10, color:'var(--txt3)', marginBottom:4 }}>TARIF (×1000)</div><input ref={addRef.tarif} type="number" inputMode="numeric" className="af-input" placeholder="Contoh: 100" autoComplete="off" /></div>
              </div>
              <button style={{ width:'100%', background:zc, color:'#fff', border:'none', padding:10, borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }} onClick={addMember}>+ Tambah ke {zone}</button>
            </div>
          )}

          {/* Sort buttons */}
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:8 }}>
            {(Object.entries(sortLabels) as [SortMode,string][]).map(([k,l]) => (
              <button key={k} onClick={() => setSortMode(k)} style={{ padding:'4px 9px', borderRadius:10, border:'none', cursor:'pointer', fontSize:10, background:sortMode===k?'#2196F3':'var(--bg3)', color:sortMode===k?'#fff':'var(--txt3)' }}>{l}</button>
            ))}
          </div>

          {/* Search */}
          <div className="search-wrap">
            <input className="search-box" placeholder={`🔍 Cari nama di ${zone}...`} value={search} onChange={e=>setSearch(e.target.value)} />
            {search && <button className="search-clear" onClick={()=>setSearch('')}>✕</button>}
          </div>
          <div style={{ fontSize:10, color:'var(--txt4)', marginBottom:8 }}>{filtered.length} member{search?' ditemukan':''} · {zone}</div>

          {/* Member rows */}
          <div id="member-rows">
            {filtered.length === 0
              ? <div style={{ textAlign:'center', padding:20, color:'var(--txt3)', fontSize:12 }}>Tidak ada member</div>
              : filtered.map((name, i) => {
                const info      = getInfo(name);
                const isFreeNow = isFree(appData, zone, name, selYear, selMonth);
                return (
                  <div key={name} className="mem-row" style={{ flexDirection:'column', alignItems:'stretch', gap:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span className="mem-num">{i+1}.</span>
                      <span className="mem-id-badge" style={!info.id ? { color:'var(--txt4)', borderColor:'var(--border)' } : {}}>{String(info.id||'—')}</span>
                      <span className="mem-name-txt" style={{ cursor:'pointer' }} onClick={() => openRiwayat(zone, name)}>{name}</span>
                      {isFreeNow && <span style={{ background:'#0a2a18', border:'1px solid #4CAF5033', color:'#4CAF50', fontSize:9, padding:'2px 6px', borderRadius:4, flexShrink:0 }}>🆓 Free</span>}
                      {info.tarif && <span style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt3)', fontSize:9, padding:'2px 6px', borderRadius:4, flexShrink:0 }}>{rp(info.tarif as number)}</span>}
                      {info.ip && <a href={String(info.ip).startsWith('http')?String(info.ip):'http://'+String(info.ip)} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ color:'#2196F3', fontSize:10, textDecoration:'none', border:'1px solid #1e3a5f', padding:'2px 6px', borderRadius:4, flexShrink:0 }}>🔗 {String(info.ip)}</a>}
                    </div>
                    {!membersLocked && (
                      <div style={{ display:'flex', gap:5, justifyContent:'flex-end' }}>
                        <button onClick={() => openFree(zone, name)} style={{ background:isFreeNow?'#0a2a18':'none', border:`1px solid ${isFreeNow?'#4CAF50':'#1e3a5f'}`, color:isFreeNow?'#4CAF50':'var(--txt3)', padding:'4px 8px', borderRadius:5, cursor:'pointer', fontSize:10, flexShrink:0 }}>🆓</button>
                        <button onClick={() => openEdit(name)} style={{ background:'none', border:'1px solid #1e3a5f', color:'#2196F3', padding:'4px 8px', borderRadius:5, cursor:'pointer', fontSize:10, flexShrink:0 }}>✏️</button>
                        <button className="delbtn" onClick={() => deleteMember(name)} style={{ flexShrink:0 }}>✕</button>
                      </div>
                    )}
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
            {(['NAMA','ID PELANGGAN','IP / LINK ROUTER','TARIF BULANAN (×1000)'] as const).map((label, idx) => {
              const fields = ['name','id','ip','tarif'] as const;
              const field  = fields[idx];
              return (
                <div key={field} className="modal-row">
                  <div className="modal-label">{label}</div>
                  <input className="modal-select" type={field==='tarif'?'number':'text'} inputMode={field==='tarif'?'numeric':undefined}
                    placeholder={field==='id'?'Opsional':field==='ip'?'192.168.x.x atau http://...':field==='tarif'?'Contoh: 100 = Rp 100.000':''}
                    value={editData[field]} onChange={e => setEditData(prev => ({ ...prev, [field]:e.target.value }))}
                    style={{ borderRadius:7, padding:'9px 12px', background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--txt)', fontSize:13 }} />
                </div>
              );
            })}
            <button className="modal-action" onClick={saveEdit}>Simpan Perubahan</button>
          </div>
        </div>
      )}

      {/* Free Member Modal */}
      <FreeMemberModal open={freeOpen} zone={freeZone} name={freeName} onClose={() => setFreeOpen(false)} />

      {/* Riwayat Modal */}
      <RiwayatModal open={riwOpen} onClose={() => setRiwOpen(false)} />
    </div>
  );
}
