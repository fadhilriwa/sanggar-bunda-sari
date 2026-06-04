window.module_classes = async function(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" onclick="openClassForm()"><i class="bi bi-plus-lg"></i> Tambah Kelas</button>
        <button class="btn btn-outline" onclick="openImportKelas()"><i class="bi bi-file-earmark-arrow-up"></i> Import Excel</button>
        <button class="btn btn-outline" onclick="downloadTemplateKelas()"><i class="bi bi-download"></i> Template</button>
      </div>
      <div class="toolbar-right">
        <select class="form-control" id="cls-cabang-filter" onchange="filterClasses()" style="width:200px">
          <option value="">Semua Cabang</option>
        </select>
        <select class="form-control" id="cls-cat-filter" onchange="filterClasses()" style="width:160px">
          <option value="">Semua Kategori</option>
          <option>Matematika</option><option>Bahasa Inggris</option><option>Calistung</option><option>Melukis</option><option>Seni</option>
        </select>
        <div class="search-input"><i class="bi bi-search"></i><input type="text" id="cls-search" placeholder="Cari kelas..." oninput="filterClasses()"></div>
      </div>
    </div>

    <!-- CABANG TABS -->
    <div id="cabang-tab-bar" style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap"></div>

    <!-- VIEW TOGGLE -->
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="btn btn-outline active" id="btn-view-table" onclick="switchKelasView('table',this)"><i class="bi bi-table"></i> Tabel</button>
      <button class="btn btn-outline" id="btn-view-card" onclick="switchKelasView('card',this)"><i class="bi bi-grid-3x3-gap-fill"></i> Kartu</button>
      <button class="btn btn-outline" id="btn-view-jadwal" onclick="switchKelasView('jadwal',this)"><i class="bi bi-calendar3"></i> Jadwal</button>
    </div>

    <!-- TABLE VIEW -->
    <div id="cls-view-table">
      <div class="card"><div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>No</th><th>Nama Program</th><th>Kategori</th><th>Cabang</th><th>Jadwal</th><th>Pengajar</th><th>Kapasitas</th><th>Biaya/Bulan</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody id="cls-tbody"><tr><td colspan="10" style="text-align:center;padding:40px"><div class="loading-spinner"></div></td></tr></tbody>
        </table>
      </div></div>
    </div>

    <!-- CARD VIEW -->
    <div id="cls-view-card" style="display:none">
      <div id="cls-card-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px"></div>
    </div>

    <!-- JADWAL VIEW -->
    <div id="cls-view-jadwal" style="display:none">
      <div id="cls-jadwal-content"></div>
    </div>

    <!-- IMPORT MODAL -->
    <div class="modal-overlay" id="importKelasModal">
      <div class="modal-box" style="max-width:600px">
        <div class="modal-header"><h3><i class="bi bi-file-earmark-arrow-up"></i> Import Kelas & Jadwal</h3><button class="modal-close" onclick="closeModal('importKelasModal')">x</button></div>
        <div class="modal-body">
          <div style="padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:16px;font-size:13px">
            <strong>Panduan Import:</strong><br>
            1. Download template CSV terlebih dahulu<br>
            2. Isi data sesuai format (jangan ubah header)<br>
            3. Upload file CSV yang sudah diisi
          </div>
          <div class="form-group"><label class="form-label">File CSV</label>
            <div class="upload-zone" id="kelas-drop-zone" onclick="document.getElementById('kelas-file-input').click()">
              <i class="bi bi-file-earmark-spreadsheet" style="font-size:32px;color:var(--sage)"></i>
              <div style="margin-top:8px;font-weight:600">Klik atau drag file CSV di sini</div>
              <div style="font-size:12px;color:var(--muted)">Format: .csv</div>
            </div>
            <input type="file" id="kelas-file-input" accept=".csv" style="display:none" onchange="previewImportKelas(this)">
          </div>
          <div id="kelas-import-preview" style="margin-top:12px"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('importKelasModal')">Batal</button>
          <button class="btn btn-outline" onclick="downloadTemplateKelas()"><i class="bi bi-download"></i> Download Template</button>
          <button class="btn btn-primary" id="btn-do-import-kelas" onclick="doImportKelas()" style="display:none"><i class="bi bi-upload"></i> Import Sekarang</button>
        </div>
      </div>
    </div>

    <!-- CLASS FORM MODAL -->
    <div class="modal-overlay" id="classModal">
      <div class="modal-box" style="max-width:620px">
        <div class="modal-header"><h3 id="classFormTitle">Tambah Kelas</h3><button class="modal-close" onclick="closeModal('classModal')">x</button></div>
        <div class="modal-body">
          <input type="hidden" id="cf-id">
          <div class="form-row">
            <div class="form-group"><label class="form-label">Nama Program <span class="required">*</span></label><input class="form-control" id="cf-name" required></div>
            <div class="form-group"><label class="form-label">Kategori <span class="required">*</span></label>
              <select class="form-control" id="cf-category"><option value="">Pilih...</option><option>Matematika</option><option>Bahasa Inggris</option><option>Calistung</option><option>Melukis</option><option>Seni</option></select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Cabang <span class="required">*</span></label>
              <select class="form-control" id="cf-cabang_id"><option value="">Pilih cabang...</option></select></div>
            <div class="form-group"><label class="form-label">Pengajar</label><input class="form-control" id="cf-teacher" placeholder="Nama pengajar"></div>
          </div>
          <div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-control" id="cf-description" rows="2"></textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Biaya/Bulan (Rp) <span class="required">*</span></label><input class="form-control" type="number" id="cf-price" min="0"></div>
            <div class="form-group"><label class="form-label">Kapasitas</label><input class="form-control" type="number" id="cf-capacity" min="1" value="15"></div>
          </div>
          <div class="form-group"><label class="form-label">Jadwal (Teks)</label><input class="form-control" id="cf-schedule" placeholder="Mis: Senin & Rabu 15:00-16:30"></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Hari</label><input class="form-control" id="cf-day_of_week" placeholder="Mis: Senin,Rabu"></div>
            <div class="form-group"><label class="form-label">Jam Mulai</label><input class="form-control" type="time" id="cf-time_start"></div>
            <div class="form-group"><label class="form-label">Jam Selesai</label><input class="form-control" type="time" id="cf-time_end"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('classModal')">Batal</button>
          <button class="btn btn-primary" onclick="saveClass()"><i class="bi bi-save"></i> Simpan</button>
        </div>
      </div>
    </div>`;

  await loadCabangAndClasses();
};

let allClassesData = [], allCabangData = [], activeKelasView = 'table', activeCabangId = '';

async function loadCabangAndClasses() {
  const [cb, cl] = await Promise.all([
    apiFetch('/php/api/cabang.php'),
    apiFetch('/php/api/classes.php')
  ]);
  allCabangData = Array.isArray(cb) ? cb : [];
  allClassesData = Array.isArray(cl) ? cl : [];

  // Populate cabang filter
  const filter = document.getElementById('cls-cabang-filter');
  const cfCabang = document.getElementById('cf-cabang_id');
  if (filter) allCabangData.forEach(c => { filter.add(new Option(c.nama, c.id)); });
  if (cfCabang) allCabangData.forEach(c => { cfCabang.add(new Option(c.nama, c.id)); });

  // Cabang tab buttons
  const tabBar = document.getElementById('cabang-tab-bar');
  if (tabBar) {
    const colors = ['#4A7C59','#3B7DD8','#E87C4E','#8B5CF6'];
    tabBar.innerHTML = `<button class="btn btn-sm ${!activeCabangId?'btn-primary':'btn-outline'}" onclick="setCabangTab('',this)">?? Semua Cabang</button>` +
      allCabangData.map((c,i) => `<button class="btn btn-sm btn-outline" style="${activeCabangId==c.id?'background:'+colors[i%4]+';color:#fff;border-color:'+colors[i%4]:''}" onclick="setCabangTab('${c.id}',this)" data-cabang="${c.id}">${c.kode} - ${c.nama.replace('Sanggar Bunda Sari ','')}</button>`).join('');
  }
  filterClasses();
}
window.loadCabangAndClasses = loadCabangAndClasses;

function setCabangTab(id, btn) {
  activeCabangId = id;
  const filterEl = document.getElementById('cls-cabang-filter');
  if (filterEl) filterEl.value = id;
  document.querySelectorAll('#cabang-tab-bar .btn').forEach(b => {
    b.classList.remove('btn-primary');
    b.classList.add('btn-outline');
    b.style.background = '';
    b.style.color = '';
    b.style.borderColor = '';
  });
  btn.classList.add('btn-primary');
  btn.classList.remove('btn-outline');
  filterClasses();
}
window.setCabangTab = setCabangTab;

function filterClasses() {
  const q = (document.getElementById('cls-search')||{}).value?.toLowerCase()||'';
  const cat = (document.getElementById('cls-cat-filter')||{}).value||'';
  const cab = (document.getElementById('cls-cabang-filter')||{}).value||activeCabangId||'';
  const data = allClassesData.filter(c =>
    (!q || c.name?.toLowerCase().includes(q) || c.teacher?.toLowerCase().includes(q)) &&
    (!cat || c.category === cat) &&
    (!cab || String(c.cabang_id) === String(cab))
  );
  if (activeKelasView === 'table') renderClassTable(data);
  else if (activeKelasView === 'card') renderClassCards(data);
  else renderJadwalPerCabang(data);
}
window.filterClasses = filterClasses;

function switchKelasView(view, btn) {
  activeKelasView = view;
  ['table','card','jadwal'].forEach(v => {
    const el = document.getElementById(`cls-view-${v}`);
    if (el) el.style.display = v === view ? 'block' : 'none';
  });
  document.querySelectorAll('[id^="btn-view-"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterClasses();
}
window.switchKelasView = switchKelasView;

const catColors = {Matematika:'badge-blue','Bahasa Inggris':'badge-purple',Calistung:'badge-orange',Melukis:'badge-pink',Seni:'badge-pink'};

function renderClassTable(data) {
  const tbody = document.getElementById('cls-tbody');
  if (!tbody) return;
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="10" class="empty-state" style="padding:40px"><i class="bi bi-collection"></i><p>Tidak ada kelas ditemukan</p></td></tr>'; return; }
  tbody.innerHTML = data.map((c,i) => `<tr>
    <td>${i+1}</td>
    <td><div style="font-weight:700">${c.name}</div><div style="font-size:11px;color:var(--muted)">${c.description||''}</div></td>
    <td><span class="badge ${catColors[c.category]||'badge-gray'}">${c.category||'-'}</span></td>
    <td><span style="font-size:12px;font-weight:600;color:var(--sage)">${c.cabang_nama||c.cabang_kode||'-'}</span></td>
    <td style="font-size:12px">${c.schedule||'-'}</td>
    <td style="font-size:12px">${c.teacher||'-'}</td>
    <td><strong>${c.capacity||15}</strong> <span style="color:var(--muted);font-size:11px">siswa</span></td>
    <td style="font-weight:700;color:var(--sage)">${fmtRp(c.price)}</td>
    <td><span class="badge badge-green">Aktif</span></td>
    <td><div style="display:flex;gap:6px">
      <button class="btn btn-sm btn-outline" onclick="editClass(${c.id})" title="Edit"><i class="bi bi-pencil-fill"></i></button>
      <button class="btn btn-sm btn-danger" onclick="deleteClass(${c.id},'${(c.name||'').replace(/'/g,"\\'")}')"><i class="bi bi-trash-fill"></i></button>
    </div></td>
  </tr>`).join('');
}

function renderClassCards(data) {
  const el = document.getElementById('cls-card-grid');
  if (!el) return;
  const colors2 = {'Matematika':'#dbeafe','Bahasa Inggris':'#ede9fe','Calistung':'#ffedd5','Melukis':'#fce7f3','Seni':'#fce7f3'};
  if (!data.length) { el.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:40px"><i class="bi bi-collection"></i><p>Tidak ada kelas</p></div>'; return; }
  el.innerHTML = data.map(c => `<div class="card" style="margin:0;border-top:4px solid var(--sage)">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:15px;font-weight:800">${c.name}</div>
          <span class="badge ${catColors[c.category]||'badge-gray'}" style="margin-top:4px">${c.category||'-'}</span>
        </div>
        <div style="font-size:20px;width:40px;height:40px;border-radius:10px;background:${colors2[c.category]||'#f1f5f9'};display:flex;align-items:center;justify-content:center">
          ${c.category==='Matematika'?'?':c.category==='Bahasa Inggris'?'???':c.category==='Calistung'?'??':'??'}
        </div>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px"><i class="bi bi-geo-alt-fill"></i> ${c.cabang_nama||'-'}</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:4px"><i class="bi bi-clock"></i> ${c.schedule||'Jadwal belum diset'}</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:12px"><i class="bi bi-person-fill"></i> ${c.teacher||'Pengajar belum diset'}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:18px;font-weight:800;color:var(--sage)">${fmtRp(c.price)}</div>
        <div style="font-size:11px;color:var(--muted)">${c.capacity||15} siswa</div>
      </div>
      <div style="display:flex;gap:6px;margin-top:12px">
        <button class="btn btn-sm btn-outline" style="flex:1" onclick="editClass(${c.id})"><i class="bi bi-pencil-fill"></i> Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteClass(${c.id},'${(c.name||'').replace(/'/g,"\\'")}')"><i class="bi bi-trash-fill"></i></button>
      </div>
    </div>
  </div>`).join('');
}

function renderJadwalPerCabang(data) {
  const el = document.getElementById('cls-jadwal-content');
  if (!el) return;
  const days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
  const cabangToShow = activeCabangId ? allCabangData.filter(c=>c.id==activeCabangId) : allCabangData;
  el.innerHTML = cabangToShow.map(cab => {
    const kelasKab = data.filter(c => String(c.cabang_id) === String(cab.id));
    return `<div class="card" style="margin-bottom:16px">
      <div class="card-header" style="background:var(--sage);color:#fff">
        <span class="card-title" style="color:#fff"><i class="bi bi-geo-alt-fill"></i> ${cab.nama}</span>
        <span style="font-size:12px;opacity:.85">${kelasKab.length} kelas aktif</span>
      </div>
      <div style="padding:16px;overflow-x:auto">
        <div style="display:grid;grid-template-columns:repeat(7,minmax(120px,1fr));gap:8px;min-width:700px">
          ${days.map(day => `
            <div>
              <div style="text-align:center;font-size:11px;font-weight:800;color:var(--muted);padding:6px;background:#f8faf9;border-radius:6px;margin-bottom:6px">${day}</div>
              <div style="display:flex;flex-direction:column;gap:4px">
                ${kelasKab.filter(c=>(c.day_of_week||c.schedule||'').toLowerCase().includes(day.toLowerCase())).map(c=>`
                  <div style="padding:6px 8px;background:var(--sage-subtle);border-left:3px solid var(--sage);border-radius:4px;font-size:11px;cursor:pointer" onclick="editClass(${c.id})" title="${c.name}">
                    <div style="font-weight:700;margin-bottom:2px">${c.name}</div>
                    <div style="color:var(--muted)">${c.time_start?c.time_start.substring(0,5):'?'}–${c.time_end?c.time_end.substring(0,5):'?'}</div>
                    <div style="color:var(--sage-dark);font-size:10px">${c.teacher||''}</div>
                  </div>`).join('')||'<div style="font-size:11px;color:var(--muted);text-align:center;padding:4px">–</div>'}
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }).join('') || '<div class="empty-state" style="padding:40px"><i class="bi bi-calendar3"></i><p>Pilih cabang untuk melihat jadwal</p></div>';
}

function openClassForm(cls=null) {
  document.getElementById('classFormTitle').textContent = cls ? 'Edit Kelas' : 'Tambah Kelas';
  ['id','name','category','description','price','capacity','schedule','day_of_week','teacher'].forEach(f => {
    const el = document.getElementById('cf-'+f); if (el) el.value = cls?.[f]||'';
  });
  const ts = document.getElementById('cf-time_start'); if(ts) ts.value = cls?.time_start?.substring(0,5)||'';
  const te = document.getElementById('cf-time_end'); if(te) te.value = cls?.time_end?.substring(0,5)||'';
  const cab = document.getElementById('cf-cabang_id'); if(cab) cab.value = cls?.cabang_id||'';
  openModal('classModal');
}
window.openClassForm = openClassForm;

function editClass(id) { openClassForm(allClassesData.find(c=>c.id==id)); }
window.editClass = editClass;

async function saveClass() {
  const id = document.getElementById('cf-id').value;
  const data = {};
  ['name','category','description','price','capacity','schedule','day_of_week','time_start','time_end','teacher'].forEach(f => { const el=document.getElementById('cf-'+f); if(el) data[f]=el.value; });
  const cab = document.getElementById('cf-cabang_id'); if(cab) data.cabang_id = cab.value;
  if (!data.name) { toast('Nama kelas wajib diisi','error'); return; }
  if (!data.cabang_id) { toast('Pilih cabang','error'); return; }
  if (id) data.id = id;
  const r = await apiFetch('/php/api/classes.php', {method: id?'PUT':'POST', body: JSON.stringify(data)});
  if (r.success) { toast('Kelas berhasil disimpan','success'); closeModal('classModal'); await loadCabangAndClasses(); }
  else toast(r.message||'Gagal simpan','error');
}
window.saveClass = saveClass;

async function deleteClass(id, name) {
  showConfirm('Hapus Kelas', `Hapus kelas "${name}"?`, async () => {
    const r = await apiFetch('/php/api/classes.php', {method:'DELETE', body: JSON.stringify({id})});
    if (r.success) { toast('Kelas dihapus','success'); await loadCabangAndClasses(); } else toast(r.message,'error');
  });
}
window.deleteClass = deleteClass;

function openImportKelas() { document.getElementById('kelas-import-preview').innerHTML=''; document.getElementById('btn-do-import-kelas').style.display='none'; openModal('importKelasModal'); }
window.openImportKelas = openImportKelas;

function downloadTemplateKelas() { window.open('/WEB/Website-Sanggar-Bunda-Sari/php/api/import_classes.php?action=template','_blank'); }
window.downloadTemplateKelas = downloadTemplateKelas;

async function previewImportKelas(input) {
  if (!input.files.length) return;
  const prev = document.getElementById('kelas-import-preview');
  prev.innerHTML = '<div class="loading-spinner"></div>';
  const form = new FormData();
  form.append('file', input.files[0]);
  form.append('preview','1');
  try {
    const r = await fetch('/WEB/Website-Sanggar-Bunda-Sari/php/api/import_classes.php', {method:'POST', body:form});
    const d = await r.json();
    const errHtml = d.errors?.length ? `<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:10px;margin-top:8px;font-size:12px"><strong>${d.errors.length} peringatan:</strong><ul style="margin:4px 0 0 16px">${d.errors.slice(0,5).map(e=>`<li>${e}</li>`).join('')}</ul></div>`:'';
    prev.innerHTML = `<div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:10px;margin-bottom:8px;font-size:13px">
      ? Ditemukan <strong>${d.total}</strong> kelas siap diimport ${d.error_count?`(${d.error_count} baris bermasalah)`:''}
    </div>
    <div style="max-height:200px;overflow-y:auto;margin-bottom:8px">
      <table class="data-table" style="font-size:12px"><thead><tr><th>Nama Kelas</th><th>Kategori</th><th>Biaya</th><th>Kapasitas</th><th>Jadwal</th></tr></thead>
      <tbody>${(d.preview||[]).map(r=>`<tr><td>${r.name}</td><td>${r.category}</td><td>${fmtRp(r.price)}</td><td>${r.capacity}</td><td>${r.schedule}</td></tr>`).join('')}</tbody></table>
    </div>${errHtml}`;
    if (d.total > 0) document.getElementById('btn-do-import-kelas').style.display = 'inline-flex';
  } catch(e) { prev.innerHTML = '<div style="color:#dc2626;font-size:13px">Gagal membaca file. Pastikan format CSV valid.</div>'; }
}
window.previewImportKelas = previewImportKelas;

async function doImportKelas() {
  const input = document.getElementById('kelas-file-input');
  if (!input.files.length) { toast('Pilih file terlebih dahulu','error'); return; }
  const form = new FormData(); form.append('file', input.files[0]);
  const btn = document.getElementById('btn-do-import-kelas');
  btn.disabled = true; btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px"></div> Mengimport...';
  try {
    const r = await fetch('/WEB/Website-Sanggar-Bunda-Sari/php/api/import_classes.php', {method:'POST', body:form});
    const d = await r.json();
    if (d.success) {
      toast(`Berhasil import ${d.imported} kelas! ${d.skipped>0?d.skipped+' dilewati':''}`, 'success');
      closeModal('importKelasModal');
      await loadCabangAndClasses();
    } else toast(d.message||'Import gagal','error');
  } catch(e) { toast('Import gagal: '+e.message,'error'); }
  btn.disabled = false; btn.innerHTML = '<i class="bi bi-upload"></i> Import Sekarang';
}
window.doImportKelas = doImportKelas;
