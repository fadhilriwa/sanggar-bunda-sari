window.module_cms_pengumuman = async function(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left"><button class="btn btn-primary" onclick="openPengForm()"><i class="bi bi-plus-lg"></i> Buat Pengumuman</button></div>
      <div class="toolbar-right">
        <select class="form-control" id="peng-filter" onchange="filterPeng()" style="width:140px"><option value="">Semua Kategori</option><option>Libur</option><option>Kegiatan</option><option>Info Biaya</option><option>Umum</option></select>
      </div>
    </div>
    <div id="peng-list" style="display:flex;flex-direction:column;gap:12px"><div class="loading-spinner"></div></div>
    <div class="modal-overlay" id="pengModal"><div class="modal-box" style="max-width:600px">
      <div class="modal-header"><h3>Kelola Pengumuman</h3><button class="modal-close" onclick="closeModal('pengModal')">x</button></div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Judul <span class="required">*</span></label><input class="form-control" id="pg-judul"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Kategori</label>
            <select class="form-control" id="pg-kategori"><option>Umum</option><option>Libur</option><option>Kegiatan</option><option>Info Biaya</option></select></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select class="form-control" id="pg-status"><option value="publish">Publish</option><option value="draft">Draft</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Isi Pengumuman</label><textarea class="form-control" id="pg-isi" rows="5"></textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Tampilkan Mulai</label><input class="form-control" type="date" id="pg-mulai"></div>
          <div class="form-group"><label class="form-label">Tampilkan Sampai</label><input class="form-control" type="date" id="pg-berakhir"></div>
        </div>
        <div class="form-group"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="pg-pin"> <span>Pin di halaman utama</span></label></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('pengModal')">Batal</button>
        <button class="btn btn-primary" onclick="savePeng()"><i class="bi bi-send"></i> Publish</button>
      </div>
    </div></div>`;
  loadPengumuman();
};
let allPeng=[];
async function loadPengumuman(){
  try{
    const d=await apiFetch('/php/api/cms_pengumuman.php');
    allPeng=Array.isArray(d)?d:[];
    filterPeng();
  }catch(e){
    allPeng=[];filterPeng();
  }
}
function filterPeng(){
  const cat=(document.getElementById('peng-filter')||{}).value||'';
  const data=allPeng.filter(p=>!cat||p.kategori===cat);
  const el=document.getElementById('peng-list');
  if(!el) return;
  if(!data.length){el.innerHTML='<div class="empty-state" style="padding:48px"><i class="bi bi-megaphone"></i><p>Belum ada pengumuman</p></div>';return;}
  const catColors={Libur:'badge-red',Kegiatan:'badge-blue',Umum:'badge-gray','Info Biaya':'badge-orange'};
  el.innerHTML=data.map(p=>`<div class="card" style="margin:0"><div class="card-body">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
      <div style="flex:1">
        ${p.pin?'<span class="badge badge-orange" style="margin-bottom:6px">?? Pinned</span>':''}
        <div style="font-size:16px;font-weight:700;margin-bottom:6px">${p.judul}</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:10px">${p.isi||''}</div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="badge ${catColors[p.kategori]||'badge-gray'}">${p.kategori}</span>
          <span class="badge ${p.status==='publish'?'badge-green':'badge-gray'}">${p.status==='publish'?'Publish':'Draft'}</span>
          <span style="font-size:11px;color:var(--muted)">${fmtDate(p.tanggal_mulai)} ${p.tanggal_berakhir?'- '+fmtDate(p.tanggal_berakhir):''}</span>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn btn-sm btn-outline"><i class="bi bi-pencil-fill"></i></button>
        <button class="btn btn-sm btn-danger"><i class="bi bi-trash-fill"></i></button>
      </div>
    </div>
  </div></div>`).join('');
}
function openPengForm(){
  const now=new Date().toISOString().split('T')[0];
  document.getElementById('pg-mulai').value=now;
  openModal('pengModal');
}
window.openPengForm=openPengForm;
async function savePeng(){
  const judul=document.getElementById('pg-judul').value;
  if(!judul){toast('Judul wajib diisi','error');return;}
  const data={judul,kategori:document.getElementById('pg-kategori').value,isi:document.getElementById('pg-isi').value,status:document.getElementById('pg-status').value,tanggal_mulai:document.getElementById('pg-mulai').value,tanggal_berakhir:document.getElementById('pg-berakhir').value,pin:document.getElementById('pg-pin').checked?1:0};
  try{
    const r=await apiFetch('/php/api/cms_pengumuman.php',{method:'POST',body:JSON.stringify(data)});
    if(r.success){toast('Pengumuman berhasil dipublikasikan','success');closeModal('pengModal');await loadPengumuman();}
    else toast(r.message||'Gagal','error');
  }catch(e){toast('Gagal menyimpan','error');}
}
window.savePeng=savePeng;
window.filterPeng=filterPeng;
