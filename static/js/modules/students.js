// =====================================================
// MODULE: Data Siswa
// =====================================================
window.module_students = async function(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" onclick="openStudentForm()"><i class="bi bi-person-plus-fill"></i> Tambah Siswa</button>
        <button class="btn btn-outline" onclick="importStudents()"><i class="bi bi-file-earmark-arrow-up"></i> Import Excel</button>
        <button class="btn btn-outline" onclick="exportStudents('excel')"><i class="bi bi-file-earmark-excel"></i> Export Excel</button>
        <button class="btn btn-outline" onclick="exportStudents('pdf')"><i class="bi bi-file-earmark-pdf"></i> Export PDF</button>
      </div>
      <div class="toolbar-right">
        <div class="search-input"><i class="bi bi-search"></i><input type="text" id="student-search" placeholder="Cari nama, email, telepon..." oninput="filterStudents()"></div>
        <select class="form-control" id="filter-cabang" onchange="filterStudents()" style="width:180px">
          <option value="">Semua Cabang</option>
        </select>
        <select class="form-control" id="filter-status" onchange="filterStudents()" style="width:140px">
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option><option value="pending">Pending</option><option value="tidak_aktif">Tidak Aktif</option>
        </select>
      </div>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table" id="students-table">
          <thead><tr><th><input type="checkbox" id="check-all" onchange="toggleCheckAll(this)"></th><th>No</th><th>Nama Siswa</th><th>Kontak</th><th>Gender</th><th>Usia</th><th>Program/Kelas</th><th>Status</th><th>Tgl Daftar</th><th>Aksi</th></tr></thead>
          <tbody id="students-tbody"><tr><td colspan="10" style="text-align:center;padding:40px"><div class="loading-spinner"></div></td></tr></tbody>
        </table>
      </div>
      <div class="pagination" id="students-pagination" style="justify-content:space-between;align-items:center">
        <div style="font-size:13px;color:var(--muted)" id="students-info">Memuat...</div>
        <div style="display:flex;gap:6px" id="students-pages"></div>
        <select class="form-control" id="per-page" onchange="loadStudents(1)" style="width:100px;font-size:13px">
          <option value="10">10/halaman</option><option value="25">25/halaman</option><option value="50">50/halaman</option>
        </select>
      </div>
    </div>

    <!-- STUDENT FORM MODAL -->
    <div class="modal-overlay" id="studentModal">
      <div class="modal-box" style="max-width:680px">
        <div class="modal-header">
          <h3 id="studentFormTitle">Tambah Siswa Baru</h3>
          <button class="modal-close" onclick="closeModal('studentModal')">x</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="sf-id">
          <div class="tab-bar">
            <button class="tab-btn active" onclick="switchStudentTab('data-anak',this)">Data Anak</button>
            <button class="tab-btn" onclick="switchStudentTab('program',this)">Program</button>
            <button class="tab-btn" onclick="switchStudentTab('ortu',this)">Data Orang Tua</button>
            <button class="tab-btn" onclick="switchStudentTab('info',this)">Info Tambahan</button>
          </div>
          <!-- Tab: Data Anak -->
          <div class="tab-pane active" id="tab-data-anak">
            <div class="form-row">
              <div class="form-group"><label class="form-label">Nama Lengkap <span class="required">*</span></label><input class="form-control" id="sf-name" required></div>
              <div class="form-group"><label class="form-label">Jenis Kelamin <span class="required">*</span></label>
                <select class="form-control" id="sf-gender"><option value="">Pilih...</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Tempat Lahir</label><input class="form-control" id="sf-tempat_lahir"></div>
              <div class="form-group"><label class="form-label">Tanggal Lahir</label><input class="form-control" type="date" id="sf-tanggal_lahir"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Usia</label><input class="form-control" type="number" id="sf-age" min="1" max="99"></div>
              <div class="form-group"><label class="form-label">Tingkat Pendidikan</label>
                <select class="form-control" id="sf-education_level"><option value="">Pilih...</option><option>TK</option><option>SD</option><option>SMP</option><option>SMA</option></select></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Asal Sekolah SD</label><input class="form-control" id="sf-school_sd"></div>
              <div class="form-group"><label class="form-label">Asal Sekolah SMP</label><input class="form-control" id="sf-school_smp"></div>
            </div>
          </div>
          <!-- Tab: Program -->
          <div class="tab-pane" id="tab-program">
            <p style="font-size:13px;color:var(--muted);margin-bottom:14px">Pilih program/kelas yang akan diikuti</p>
            <div id="program-checkboxes" style="display:flex;flex-direction:column;gap:10px"></div>
            <div id="rec-box" style="display:none;margin-top:16px;padding:14px;background:var(--sage-subtle);border-radius:10px;border:1px solid rgba(74,124,89,.2)">
              <div style="font-size:13px;font-weight:700;color:var(--sage);margin-bottom:8px">?? Rekomendasi Apriori</div>
              <div id="rec-content"></div>
            </div>
            <div style="margin-top:16px;padding:14px;background:#f8faf9;border-radius:10px" id="program-total" style="font-size:14px;font-weight:700"></div>
          </div>
          <!-- Tab: Orang Tua -->
          <div class="tab-pane" id="tab-ortu">
            <div class="form-row">
              <div class="form-group"><label class="form-label">Nama Ayah</label><input class="form-control" id="sf-nama_ayah"></div>
              <div class="form-group"><label class="form-label">Pekerjaan Ayah</label><input class="form-control" id="sf-pekerjaan_ayah"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Nama Ibu</label><input class="form-control" id="sf-nama_ibu"></div>
              <div class="form-group"><label class="form-label">Pekerjaan Ibu</label><input class="form-control" id="sf-pekerjaan_ibu"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Email <span class="required">*</span></label><input class="form-control" type="email" id="sf-email"></div>
              <div class="form-group"><label class="form-label">No. HP/WA <span class="required">*</span></label><input class="form-control" id="sf-phone"></div>
            </div>
          </div>
          <!-- Tab: Info -->
          <div class="tab-pane" id="tab-info">
            <div class="form-group"><label class="form-label">Alamat Lengkap <span class="required">*</span></label><textarea class="form-control" id="sf-address" rows="3"></textarea></div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Kota/Kabupaten</label><input class="form-control" id="sf-kota"></div>
              <div class="form-group"><label class="form-label">Kode Pos</label><input class="form-control" id="sf-kode_pos"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Cabang <span class="required">*</span></label>
                <select class="form-control" id="sf-cabang_id"><option value="">Pilih cabang...</option></select></div>
              <div class="form-group"><label class="form-label">Status Siswa</label>
                <select class="form-control" id="sf-status"><option value="aktif">Aktif</option><option value="pending">Pending</option><option value="tidak_aktif">Tidak Aktif</option></select></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('studentModal')">Batal</button>
          <button class="btn btn-primary" onclick="saveStudent()"><i class="bi bi-save"></i> Simpan Siswa</button>
        </div>
      </div>
    </div>

    <!-- IMPORT SISWA MODAL -->
    <div class="modal-overlay" id="importSiswaModal">
      <div class="modal-box" style="max-width:620px">
        <div class="modal-header"><h3><i class="bi bi-file-earmark-arrow-up"></i> Import Data Siswa</h3><button class="modal-close" onclick="closeModal('importSiswaModal')">x</button></div>
        <div class="modal-body">
          <div style="display:flex;gap:10px;margin-bottom:16px">
            <div style="flex:1;padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:12px">
              <strong>Format CSV yang diperlukan:</strong><br>Nama*, Email*, No HP*, Gender*, Usia*, Alamat*, Kota, Pendidikan, Asal SD, Asal SMP, Nama Ayah, Nama Ibu, Pekerjaan Ayah, Pekerjaan Ibu, Tempat Lahir, Tgl Lahir, Status, ID Cabang
            </div>
            <button class="btn btn-outline" onclick="downloadTemplateSiswa()" style="white-space:nowrap;align-self:center"><i class="bi bi-download"></i> Template CSV</button>
          </div>
          <div class="form-group"><label class="form-label">Upload File CSV</label>
            <div class="upload-zone" onclick="document.getElementById('siswa-file-input').click()" style="cursor:pointer">
              <i class="bi bi-file-earmark-spreadsheet" style="font-size:32px;color:var(--sage)"></i>
              <div style="margin-top:8px;font-weight:600">Klik atau drag file CSV di sini</div>
              <div style="font-size:12px;color:var(--muted)" id="siswa-file-name">Belum ada file dipilih</div>
            </div>
            <input type="file" id="siswa-file-input" accept=".csv" style="display:none" onchange="previewImportSiswa(this)">
          </div>
          <div id="siswa-import-preview"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('importSiswaModal')">Batal</button>
          <button class="btn btn-outline" onclick="downloadTemplateSiswa()"><i class="bi bi-download"></i> Download Template</button>
          <button class="btn btn-primary" id="btn-do-import-siswa" onclick="doImportSiswa()" style="display:none"><i class="bi bi-upload"></i> Import Sekarang</button>
        </div>
      </div>
    </div>
  `;
  await loadStudentCabang();
  await loadStudents(1);
  await loadProgramCheckboxes();
};

let allStudents = [], allClasses = [], allCabangSiswa = [];
let studentPage = 1;

async function loadStudentCabang() {
  try {
    const d = await apiFetch('/php/api/cabang.php');
    allCabangSiswa = Array.isArray(d) ? d : [];
    const fc = document.getElementById('filter-cabang');
    const sc = document.getElementById('sf-cabang_id');
    allCabangSiswa.forEach(c => {
      if (fc) fc.add(new Option(c.nama, c.id));
      if (sc) sc.add(new Option(c.nama, c.id));
    });
  } catch(e) {}
}

async function loadStudents(page=1) {
  studentPage = page;
  try {
    const [sa, ca] = await Promise.all([apiFetch('/php/api/students.php'), apiFetch('/php/api/classes.php')]);
    allStudents = Array.isArray(sa) ? sa : [];
    allClasses = Array.isArray(ca) ? ca : [];
    filterStudents();
  } catch(e) { toast('Gagal memuat data siswa','error'); }
}

function filterStudents() {
  const q = (document.getElementById('student-search')||{}).value?.toLowerCase()||'';
  const stat = (document.getElementById('filter-status')||{}).value||'';
  const cab = (document.getElementById('filter-cabang')||{}).value||'';
  let data = allStudents.filter(s => {
    const matchQ = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || (s.phone||'').includes(q);
    const matchS = !stat || (s.status||'aktif')===stat;
    const matchC = !cab || String(s.cabang_id||'')=== String(cab);
    return matchQ && matchS && matchC;
  });
  renderStudents(data);
}

function renderStudents(data) {
  const perPage = parseInt((document.getElementById('per-page')||{}).value||10);
  const total = data.length;
  const pages = Math.ceil(total/perPage);
  const start = (studentPage-1)*perPage;
  const slice = data.slice(start, start+perPage);
  const tbody = document.getElementById('students-tbody');
  if(!tbody) return;
  if(!slice.length){ tbody.innerHTML='<tr><td colspan="10" class="empty-state" style="padding:40px"><i class="bi bi-people"></i><p>Belum ada data siswa</p></td></tr>'; return; }
  tbody.innerHTML = slice.map((s,i)=>`
    <tr>
      <td><input type="checkbox" class="student-check" value="${s.id}"></td>
      <td>${start+i+1}</td>
      <td>
        <div style="font-weight:700;color:var(--text)">${s.name}</div>
        <div style="font-size:11px;color:var(--muted)">${s.education_level||''} ${s.school_sd||s.school_smp||''}</div>
      </td>
      <td>
        <div style="font-size:13px">${s.email||'-'}</div>
        <div style="font-size:11px;color:var(--muted)">${s.phone||'-'}</div>
      </td>
      <td>${s.gender==='Laki-laki'?'<i class="bi bi-gender-male" style="color:#3B7DD8"></i>':'<i class="bi bi-gender-female" style="color:#E87C4E"></i>'} ${s.gender||'-'}</td>
      <td>${s.age||'-'}</td>
      <td><span class="badge badge-blue">${s.education_level||'Umum'}</span></td>
      <td>${statusBadge(s.status||'aktif')}</td>
      <td style="font-size:12px;color:var(--muted)">${fmtDate(s.created_at)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-outline" onclick="editStudent(${s.id})" title="Edit"><i class="bi bi-pencil-fill"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id},'${s.name.replace(/'/g,"\\'")}')" title="Hapus"><i class="bi bi-trash-fill"></i></button>
        </div>
      </td>
    </tr>`).join('');
  const info = document.getElementById('students-info');
  if(info) info.textContent = `Menampilkan ${start+1}-${Math.min(start+perPage,total)} dari ${total} siswa`;
  const pagesEl = document.getElementById('students-pages');
  if(pagesEl){
    let btns='';
    if(pages>1){
      if(studentPage>1) btns+=`<button class="page-btn" onclick="renderPagedStudents(${studentPage-1})"><i class="bi bi-chevron-left"></i></button>`;
      for(let p=Math.max(1,studentPage-2);p<=Math.min(pages,studentPage+2);p++) btns+=`<button class="page-btn${p===studentPage?' active':''}" onclick="renderPagedStudents(${p})">${p}</button>`;
      if(studentPage<pages) btns+=`<button class="page-btn" onclick="renderPagedStudents(${studentPage+1})"><i class="bi bi-chevron-right"></i></button>`;
    }
    pagesEl.innerHTML=btns;
  }
}

function renderPagedStudents(p) { studentPage=p; filterStudents(); }

function statusBadge(s) {
  const m = {aktif:'badge-green',pending:'badge-yellow',tidak_aktif:'badge-red'};
  const l = {aktif:'Aktif',pending:'Pending',tidak_aktif:'Tidak Aktif'};
  return `<span class="badge ${m[s]||'badge-gray'}">${l[s]||s}</span>`;
}

async function loadProgramCheckboxes() {
  const el = document.getElementById('program-checkboxes');
  if(!el) return;
  if(!allClasses.length){ const d=await apiFetch('/php/api/classes.php'); allClasses=Array.isArray(d)?d:[]; }
  const cats = [...new Set(allClasses.map(c=>c.category))];
  el.innerHTML = cats.map(cat=>{
    const cls = allClasses.filter(c=>c.category===cat);
    return `<div style="margin-bottom:8px"><div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:6px">${cat}</div>
      ${cls.map(c=>`<label style="display:flex;align-items:center;gap:10px;padding:10px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;transition:.2s;margin-bottom:6px" onmouseenter="this.style.borderColor='var(--sage)'" onmouseleave="this.style.borderColor='var(--border)'">
        <input type="checkbox" name="sf-classes" value="${c.id}" data-price="${c.price}" data-name="${c.name}" onchange="updateProgramTotal();loadRecommendations()">
        <div style="flex:1"><div style="font-weight:600;font-size:13px">${c.name}</div><div style="font-size:12px;color:var(--muted)">${c.schedule||''}</div></div>
        <div style="font-weight:700;color:var(--sage);font-size:13px">${fmtRp(c.price)}/bln</div>
      </label>`).join('')}
    </div>`;
  }).join('');
}

function updateProgramTotal() {
  const checks = document.querySelectorAll('input[name="sf-classes"]:checked');
  const total = Array.from(checks).reduce((sum,c)=>sum+parseFloat(c.dataset.price||0),0);
  const el = document.getElementById('program-total');
  if(el) el.innerHTML = `<span style="font-size:13px;color:var(--muted)">Total Biaya: </span><span style="font-size:18px;font-weight:800;color:var(--sage)">${fmtRp(total)}/bulan</span>`;
}

async function loadRecommendations() {
  const checks = Array.from(document.querySelectorAll('input[name="sf-classes"]:checked')).map(c=>c.value);
  if(!checks.length){ document.getElementById('rec-box').style.display='none'; return; }
  try {
    const d = await apiFetch(`/php/api/recommendations.php?classes=${checks.join(',')}`);
    const recs = Array.isArray(d) ? d : (d.recommendations||[]);
    const box = document.getElementById('rec-box');
    const cont = document.getElementById('rec-content');
    if(!box||!cont) return;
    if(!recs.length){ box.style.display='none'; return; }
    box.style.display='block';
    cont.innerHTML = recs.slice(0,3).map(r=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(74,124,89,.1)">
        <div>
          <span style="font-size:13px;font-weight:600">+ ${r.class_name||'Kelas #'+r.class_id}</span>
          <span class="badge badge-green" style="margin-left:8px">${Math.round((r.confidence||0)*100)}% cocok</span>
        </div>
        <button class="btn btn-sm btn-primary" onclick="addRecommendedClass(${r.class_id})">Tambahkan</button>
      </div>`).join('');
  } catch(e){}
}

function addRecommendedClass(id) {
  const cb = document.querySelector(`input[name="sf-classes"][value="${id}"]`);
  if(cb){ cb.checked=true; updateProgramTotal(); }
}

function switchStudentTab(tabId, btn) {
  document.querySelectorAll('#studentModal .tab-pane').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('#studentModal .tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+tabId).classList.add('active');
  btn.classList.add('active');
}

function openStudentForm(student=null) {
  document.getElementById('studentFormTitle').textContent = student ? 'Edit Data Siswa' : 'Tambah Siswa Baru';
  const fields = ['id','name','email','phone','gender','age','address','education_level','school_sd','school_smp','tempat_lahir','tanggal_lahir','nama_ayah','nama_ibu','pekerjaan_ayah','pekerjaan_ibu','kota','kode_pos','status','cabang_id'];
  fields.forEach(f => { const el = document.getElementById('sf-'+f); if(el) el.value = student?.[f]||''; });
  document.querySelectorAll('input[name="sf-classes"]').forEach(c=>c.checked=false);
  updateProgramTotal();
  document.getElementById('rec-box').style.display='none';
  openModal('studentModal');
  switchStudentTab('data-anak', document.querySelector('#studentModal .tab-btn'));
}
window.openStudentForm = openStudentForm;

function editStudent(id) {
  const s = allStudents.find(s=>s.id==id);
  if(s) openStudentForm(s);
}
window.editStudent = editStudent;

async function saveStudent() {
  const id = document.getElementById('sf-id').value;
  const data = {};
  ['name','email','phone','gender','age','address','education_level','school_sd','school_smp','tempat_lahir','tanggal_lahir','nama_ayah','nama_ibu','pekerjaan_ayah','pekerjaan_ibu','kota','kode_pos','status','cabang_id'].forEach(f=>{
    const el=document.getElementById('sf-'+f); if(el) data[f]=el.value;
  });
  if(!data.name){toast('Nama siswa wajib diisi','error');return;}
  if(!data.email){toast('Email wajib diisi','error');return;}
  if(id) data.id=id;
  try {
    const r = await apiFetch('/php/api/students.php',{method:id?'PUT':'POST',body:JSON.stringify(data)});
    if(r.success||r.id){
      toast(id?'Siswa berhasil diperbarui':'Siswa berhasil ditambahkan','success');
      closeModal('studentModal');
      await loadStudents(studentPage);
    } else toast(r.message||'Gagal menyimpan','error');
  } catch(e){ toast('Error: '+e.message,'error'); }
}
window.saveStudent = saveStudent;

async function deleteStudent(id, name) {
  showConfirm('Hapus Siswa', `Hapus siswa "${name}"? Semua registrasi akan ikut terhapus.`, async()=>{
    const r = await apiFetch('/php/api/students.php',{method:'DELETE',body:JSON.stringify({id})});
    if(r.success){ toast('Siswa berhasil dihapus','success'); await loadStudents(studentPage); }
    else toast(r.message||'Gagal menghapus','error');
  });
}
window.deleteStudent = deleteStudent;

function toggleCheckAll(cb) { document.querySelectorAll('.student-check').forEach(c=>c.checked=cb.checked); }
window.toggleCheckAll = toggleCheckAll;

function exportStudents(type) {
  const cab = (document.getElementById('filter-cabang')||{}).value||'';
  const stat = (document.getElementById('filter-status')||{}).value||'';
  const ext = type === 'pdf' ? 'html' : 'csv';
  const url = `/WEB/Website-Sanggar-Bunda-Sari/php/api/export_students.php?type=${ext}${cab?'&cabang_id='+cab:''}${stat?'&status='+stat:''}`;
  window.open(url, '_blank');
  toast(`Export ${type === 'pdf' ? 'PDF' : 'Excel (CSV)'} sedang dibuka...`, 'success');
}
window.exportStudents = exportStudents;

function importStudents() {
  document.getElementById('siswa-import-preview').innerHTML = '';
  document.getElementById('btn-do-import-siswa').style.display = 'none';
  document.getElementById('siswa-file-name').textContent = 'Belum ada file dipilih';
  openModal('importSiswaModal');
}
window.importStudents = importStudents;

function downloadTemplateSiswa() {
  window.open('/WEB/Website-Sanggar-Bunda-Sari/php/api/import_students.php?action=template','_blank');
}
window.downloadTemplateSiswa = downloadTemplateSiswa;

async function previewImportSiswa(input) {
  if (!input.files.length) return;
  const fname = document.getElementById('siswa-file-name');
  if (fname) fname.textContent = input.files[0].name;
  const prev = document.getElementById('siswa-import-preview');
  prev.innerHTML = '<div style="text-align:center;padding:12px"><div class="loading-spinner"></div><p style="font-size:12px;color:var(--muted);margin-top:8px">Membaca file...</p></div>';
  const form = new FormData();
  form.append('file', input.files[0]);
  form.append('preview','1');
  try {
    const r = await fetch('/WEB/Website-Sanggar-Bunda-Sari/php/api/import_students.php', {method:'POST', body:form});
    const d = await r.json();
    const errHtml = d.errors?.length ? `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:10px;margin-top:8px;font-size:12px"><strong>${d.errors.length} peringatan:</strong><ul style="margin:4px 0 0 16px">${d.errors.slice(0,5).map(e=>`<li>${e}</li>`).join('')}</ul></div>` : '';
    prev.innerHTML = `
      <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:10px;margin-bottom:8px;font-size:13px">
        ✅ Ditemukan <strong>${d.total}</strong> siswa siap diimport ${d.error_count?`(${d.error_count} baris bermasalah)`:''}
      </div>
      <div style="max-height:180px;overflow-y:auto;margin-bottom:6px">
        <table class="data-table" style="font-size:11px">
          <thead><tr><th>Nama</th><th>Email</th><th>HP</th><th>Gender</th><th>Usia</th><th>Cabang</th></tr></thead>
          <tbody>${(d.preview||[]).map(r=>`<tr><td>${r.name}</td><td>${r.email}</td><td>${r.phone}</td><td>${r.gender}</td><td>${r.age}</td><td>${['','Cibinong','Inkopad','Bojong','Cilebut'][parseInt(r.cabang_id||1)]||r.cabang_id}</td></tr>`).join('')}</tbody>
        </table>
      </div>${errHtml}`;
    if (d.total > 0) document.getElementById('btn-do-import-siswa').style.display = 'inline-flex';
  } catch(e) { prev.innerHTML = '<div style="color:#dc2626;font-size:13px;padding:10px">Gagal membaca file. Pastikan format CSV valid (gunakan koma sebagai pemisah).</div>'; }
}
window.previewImportSiswa = previewImportSiswa;

async function doImportSiswa() {
  const input = document.getElementById('siswa-file-input');
  if (!input.files.length) { toast('Pilih file CSV terlebih dahulu','error'); return; }
  const btn = document.getElementById('btn-do-import-siswa');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px"></div> Mengimport...';
  const form = new FormData();
  form.append('file', input.files[0]);
  try {
    const r = await fetch('/WEB/Website-Sanggar-Bunda-Sari/php/api/import_students.php', {method:'POST', body:form});
    const d = await r.json();
    if (d.success) {
      toast(`✅ Berhasil import ${d.imported} siswa! ${d.skipped>0?d.skipped+' dilewati':''}`, 'success');
      closeModal('importSiswaModal');
      await loadStudents(1);
    } else toast(d.message||'Import gagal','error');
  } catch(e) { toast('Import gagal: '+e.message,'error'); }
  btn.disabled = false;
  btn.innerHTML = '<i class="bi bi-upload"></i> Import Sekarang';
}
window.doImportSiswa = doImportSiswa;
