// =====================================================
// MODULE: Registrasi
// =====================================================
window.module_registrations = async function(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" onclick="openRegForm()"><i class="bi bi-plus-lg"></i> Tambah Registrasi</button>
      </div>
      <div class="toolbar-right">
        <div class="search-input"><i class="bi bi-search"></i><input type="text" id="reg-search" placeholder="Cari nama siswa atau kelas..." oninput="filterRegs()"></div>
        <select class="form-control" id="reg-status-filter" onchange="filterRegs()" style="width:140px">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="disetujui">Disetujui</option>
          <option value="aktif">Aktif</option>
          <option value="ditolak">Ditolak</option>
          <option value="berhenti">Berhenti</option>
        </select>
      </div>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>No</th><th>Nama Siswa</th><th>Kelas/Program</th><th>Tgl Daftar</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody id="regs-tbody"><tr><td colspan="6" style="text-align:center;padding:40px"><div class="loading-spinner"></div></td></tr></tbody>
        </table>
      </div>
    </div>
    <!-- REG FORM MODAL -->
    <div class="modal-overlay" id="regModal">
      <div class="modal-box" style="max-width:480px">
        <div class="modal-header"><h3 id="regFormTitle">Tambah Registrasi</h3><button class="modal-close" onclick="closeModal('regModal')">x</button></div>
        <div class="modal-body">
          <input type="hidden" id="rf-id">
          <div class="form-group"><label class="form-label">Siswa <span class="required">*</span></label>
            <select class="form-control" id="rf-student_id"><option value="">Pilih siswa...</option></select></div>
          <div class="form-group"><label class="form-label">Kelas <span class="required">*</span></label>
            <select class="form-control" id="rf-class_id"><option value="">Pilih kelas...</option></select></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select class="form-control" id="rf-status">
              <option value="aktif">Aktif</option><option value="pending">Pending</option>
              <option value="disetujui">Disetujui</option><option value="ditolak">Ditolak</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Catatan</label><textarea class="form-control" id="rf-catatan" rows="3"></textarea></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('regModal')">Batal</button>
          <button class="btn btn-primary" onclick="saveReg()"><i class="bi bi-save"></i> Simpan</button>
        </div>
      </div>
    </div>
    <!-- DETAIL MODAL -->
    <div class="modal-overlay" id="regDetailModal">
      <div class="modal-box" style="max-width:500px">
        <div class="modal-header"><h3>Detail Registrasi</h3><button class="modal-close" onclick="closeModal('regDetailModal')">x</button></div>
        <div class="modal-body" id="reg-detail-body"></div>
        <div class="modal-footer" id="reg-detail-actions"></div>
      </div>
    </div>
  `;
  await loadRegs();
};

let allRegs=[], regStudents=[], regClasses=[];

async function loadRegs(){
  try{
    const [r,s,c]=await Promise.all([apiFetch('/php/api/registrations.php'),apiFetch('/php/api/students.php'),apiFetch('/php/api/classes.php')]);
    allRegs=Array.isArray(r)?r:[];
    regStudents=Array.isArray(s)?s:[];
    regClasses=Array.isArray(c)?c:[];
    // populate dropdowns
    const sd=document.getElementById('rf-student_id');
    if(sd) regStudents.forEach(s=>sd.add(new Option(s.name,s.id)));
    const cd=document.getElementById('rf-class_id');
    if(cd) regClasses.forEach(c=>cd.add(new Option(c.name,c.id)));
    filterRegs();
    loadPendingBadge();
  }catch(e){toast('Gagal memuat registrasi','error');}
}

function filterRegs(){
  const q=(document.getElementById('reg-search')||{}).value?.toLowerCase()||'';
  const stat=(document.getElementById('reg-status-filter')||{}).value||'';
  const data=allRegs.filter(r=>(!q||r.student_name?.toLowerCase().includes(q)||r.class_name?.toLowerCase().includes(q))&&(!stat||(r.status||'aktif')===stat));
  renderRegs(data);
}

function regStatusBadge(s){
  const m={aktif:'badge-green',pending:'badge-yellow',disetujui:'badge-blue',ditolak:'badge-red',berhenti:'badge-gray'};
  const l={aktif:'Aktif',pending:'Pending',disetujui:'Disetujui',ditolak:'Ditolak',berhenti:'Berhenti'};
  return `<span class="badge ${m[s]||'badge-gray'}">${l[s]||s}</span>`;
}

function renderRegs(data){
  const tbody=document.getElementById('regs-tbody');
  if(!tbody) return;
  if(!data.length){tbody.innerHTML='<tr><td colspan="6" class="empty-state" style="padding:40px"><i class="bi bi-clipboard"></i><p>Belum ada registrasi</p></td></tr>';return;}
  tbody.innerHTML=data.map((r,i)=>`
    <tr>
      <td>${i+1}</td>
      <td><div style="font-weight:700">${r.student_name||'-'}</div></td>
      <td><span class="badge badge-blue">${r.class_name||'-'}</span></td>
      <td style="font-size:12px;color:var(--muted)">${fmtDate(r.registration_date)}</td>
      <td>${regStatusBadge(r.status||'aktif')}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-outline" onclick="viewRegDetail(${r.id})" title="Detail"><i class="bi bi-eye-fill"></i></button>
          ${(r.status==='pending')?`
            <button class="btn btn-sm btn-primary" onclick="updateRegStatus(${r.id},'aktif')" title="Setujui"><i class="bi bi-check-lg"></i></button>
            <button class="btn btn-sm btn-danger" onclick="updateRegStatus(${r.id},'ditolak')" title="Tolak"><i class="bi bi-x-lg"></i></button>`
          :`<button class="btn btn-sm btn-danger" onclick="deleteReg(${r.id})" title="Hapus"><i class="bi bi-trash-fill"></i></button>`}
        </div>
      </td>
    </tr>`).join('');
}

function viewRegDetail(id){
  const r=allRegs.find(x=>x.id==id);
  if(!r) return;
  const body=document.getElementById('reg-detail-body');
  const acts=document.getElementById('reg-detail-actions');
  body.innerHTML=`
    <div style="display:grid;gap:12px">
      <div style="display:flex;gap:16px;padding:14px;background:var(--sage-subtle);border-radius:10px">
        <div style="font-size:36px">??</div>
        <div><div style="font-size:16px;font-weight:800">${r.student_name}</div><div style="color:var(--muted);font-size:13px">Siswa</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div style="padding:10px;background:#f8faf9;border-radius:8px"><div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px">KELAS</div><div style="font-weight:700">${r.class_name}</div></div>
        <div style="padding:10px;background:#f8faf9;border-radius:8px"><div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px">TANGGAL DAFTAR</div><div style="font-weight:700">${fmtDate(r.registration_date)}</div></div>
        <div style="padding:10px;background:#f8faf9;border-radius:8px"><div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px">STATUS</div>${regStatusBadge(r.status||'aktif')}</div>
        <div style="padding:10px;background:#f8faf9;border-radius:8px"><div style="font-size:11px;color:var(--muted);font-weight:700;margin-bottom:4px">KATEGORI</div><div>${r.class_category||r.class_name}</div></div>
      </div>
      ${r.catatan?`<div style="padding:10px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a"><div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:4px">CATATAN</div>${r.catatan}</div>`:''}
    </div>`;
  acts.innerHTML=`
    <button class="btn btn-outline" onclick="closeModal('regDetailModal')">Tutup</button>
    ${r.status==='pending'?`<button class="btn btn-primary" onclick="updateRegStatus(${r.id},'aktif');closeModal('regDetailModal')">Setujui</button><button class="btn btn-danger" onclick="updateRegStatus(${r.id},'ditolak');closeModal('regDetailModal')">Tolak</button>`:''}`;
  openModal('regDetailModal');
}
window.viewRegDetail=viewRegDetail;

async function updateRegStatus(id, status){
  const r=await apiFetch('/php/api/registrations.php',{method:'PUT',body:JSON.stringify({id,status})});
  if(r.success){toast(`Status diubah ke: ${status}`,'success');await loadRegs();}else toast(r.message||'Gagal','error');
}
window.updateRegStatus=updateRegStatus;

async function deleteReg(id){
  showConfirm('Hapus Registrasi','Hapus registrasi ini?',async()=>{
    const r=await apiFetch('/php/api/registrations.php',{method:'DELETE',body:JSON.stringify({id})});
    if(r.success){toast('Registrasi dihapus','success');await loadRegs();}else toast(r.message,'error');
  });
}
window.deleteReg=deleteReg;

function openRegForm(){
  document.getElementById('regFormTitle').textContent='Tambah Registrasi';
  ['id','catatan'].forEach(f=>{const el=document.getElementById('rf-'+f);if(el)el.value='';});
  openModal('regModal');
}
window.openRegForm=openRegForm;

async function saveReg(){
  const sid=document.getElementById('rf-student_id').value;
  const cid=document.getElementById('rf-class_id').value;
  const status=document.getElementById('rf-status').value;
  const catatan=document.getElementById('rf-catatan').value;
  if(!sid||!cid){toast('Pilih siswa dan kelas','error');return;}
  const r=await apiFetch('/php/api/registrations.php',{method:'POST',body:JSON.stringify({student_id:sid,class_id:cid,status,catatan})});
  if(r.success){toast('Registrasi ditambahkan','success');closeModal('regModal');await loadRegs();}
  else toast(r.message||'Gagal','error');
}
window.saveReg=saveReg;
