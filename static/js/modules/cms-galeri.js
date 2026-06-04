// MODULE: CMS Galeri Kegiatan
var GALERI_API = '/php/api/cms_galeri.php';
var galeriAlbums = [], galeriFotos = [], galeriFilesQueue = [];

window.module_cms_galeri = async function(container) {
  var today = new Date().toISOString().slice(0,10);
  container.innerHTML =
    '<div class="toolbar"><div class="toolbar-left">'
    + '<button class="btn btn-primary" onclick="openBuatAlbum()"><i class="bi bi-folder-plus"></i> Buat Album</button>'
    + '<button class="btn btn-outline" onclick="openUploadFoto()"><i class="bi bi-image-fill"></i> Upload Foto</button>'
    + '</div><div class="toolbar-right">'
    + '<select class="form-control" id="galeri-filter-album" onchange="loadGaleriFotos()" style="width:200px"><option value="">Semua Album</option></select>'
    + '<div class="search-input"><i class="bi bi-search"></i><input type="text" id="galeri-search" placeholder="Cari keterangan..." oninput="filterGaleri()"></div>'
    + '</div></div>'
    + '<div id="album-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin-bottom:20px"></div>'
    + '<div class="card">'
    + '<div class="card-header"><span class="card-title" id="galeri-foto-title"><i class="bi bi-images"></i> Semua Foto</span>'
    + '<span class="badge badge-blue" id="galeri-foto-count">0 foto</span></div>'
    + '<div id="foto-grid" style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;min-height:200px">'
    + '<div class="loading-spinner" style="grid-column:1/-1;justify-self:center;margin:40px auto"></div></div></div>'
    + '<div class="modal-overlay" id="galeriUploadModal"><div class="modal-box" style="max-width:580px">'
    + '<div class="modal-header"><h3><i class="bi bi-cloud-upload-fill"></i> Upload Foto Kegiatan</h3>'
    + '<button class="modal-close" onclick="closeModal(\'galeriUploadModal\')">x</button></div>'
    + '<div class="modal-body">'
    + '<div class="form-group"><label class="form-label">Album</label>'
    + '<select class="form-control" id="upload-album-id"><option value="">-- Tanpa Album --</option></select></div>'
    + '<div class="form-group"><label class="form-label">Foto <span class="required">*</span></label>'
    + '<div class="upload-zone" onclick="document.getElementById(\'galeri-file-multi\').click()">'
    + '<i class="bi bi-images" style="font-size:36px;color:var(--sage)"></i>'
    + '<div style="font-weight:600;margin-top:8px">Klik untuk pilih foto</div>'
    + '<div style="font-size:12px;color:var(--muted)">JPG/PNG/GIF/WebP - Maks 5MB</div></div>'
    + '<input type="file" id="galeri-file-multi" multiple accept="image/*" style="display:none" onchange="previewGaleriFiles(this)"></div>'
    + '<div class="form-row">'
    + '<div class="form-group"><label class="form-label">Keterangan</label><input class="form-control" id="upload-keterangan" placeholder="Deskripsi foto"></div>'
    + '<div class="form-group"><label class="form-label">Tanggal</label><input class="form-control" type="date" id="upload-tgl" value="' + today + '"></div>'
    + '</div><div class="form-group"><label class="form-label">Tag Program</label>'
    + '<select class="form-control" id="upload-tag"><option value="">-- Semua --</option>'
    + '<option>Matematika</option><option>Bahasa Inggris</option><option>Calistung</option><option>Melukis</option><option>Seni</option></select></div>'
    + '<div id="galeri-preview-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;margin-top:12px"></div>'
    + '<div id="galeri-upload-progress" style="display:none;margin-top:10px">'
    + '<div style="font-size:13px;margin-bottom:4px" id="galeri-progress-text">Mengupload...</div>'
    + '<div style="height:8px;background:#e2e8f0;border-radius:4px"><div id="galeri-progress-bar" style="height:100%;background:var(--sage);border-radius:4px;width:0%"></div></div></div>'
    + '</div><div class="modal-footer">'
    + '<button class="btn btn-outline" onclick="closeModal(\'galeriUploadModal\')">Batal</button>'
    + '<button class="btn btn-primary" id="btn-upload-galeri" onclick="doUploadGaleri()"><i class="bi bi-upload"></i> Upload</button>'
    + '</div></div></div>'
    + '<div class="modal-overlay" id="albumModal"><div class="modal-box" style="max-width:480px">'
    + '<div class="modal-header"><h3 id="album-modal-title">Buat Album</h3>'
    + '<button class="modal-close" onclick="closeModal(\'albumModal\')">x</button></div>'
    + '<div class="modal-body"><input type="hidden" id="album-id">'
    + '<div class="form-group"><label class="form-label">Nama Album <span class="required">*</span></label><input class="form-control" id="album-nama"></div>'
    + '<div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-control" id="album-deskripsi" rows="2"></textarea></div>'
    + '<div class="form-group"><label class="form-label">Tanggal</label><input class="form-control" type="date" id="album-tgl"></div>'
    + '</div><div class="modal-footer">'
    + '<button class="btn btn-outline" onclick="closeModal(\'albumModal\')">Batal</button>'
    + '<button class="btn btn-primary" onclick="saveAlbum()"><i class="bi bi-save"></i> Simpan</button>'
    + '</div></div></div>';
  await loadGaleriAlbums();
  await loadGaleriFotos();
};

async function loadGaleriAlbums() {
  try {
    var d = await apiFetch(GALERI_API + '?type=albums');
    galeriAlbums = Array.isArray(d) ? d : [];
    renderAlbumGrid();
    ['galeri-filter-album','upload-album-id'].forEach(function(eid) {
      var el = document.getElementById(eid); if (!el) return;
      while (el.options.length > 1) el.remove(1);
      galeriAlbums.forEach(function(a) { el.add(new Option(a.nama, a.id)); });
    });
  } catch(e) { console.error('loadGaleriAlbums:', e); }
}
window.loadGaleriAlbums = loadGaleriAlbums;

function renderAlbumGrid() {
  var el = document.getElementById('album-grid'); if (!el) return;
  if (!galeriAlbums.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:12px;grid-column:1/-1"><i class="bi bi-info-circle"></i> Belum ada album.</div>';
    return;
  }
  el.innerHTML = galeriAlbums.map(function(a) {
    return '<div class="card" style="margin:0;cursor:pointer" onclick="filterByAlbum(' + a.id + ')">'
      + '<div style="height:120px;background:var(--sage);border-radius:var(--radius) var(--radius) 0 0;display:flex;align-items:center;justify-content:center;font-size:40px">📸</div>'
      + '<div style="padding:10px"><div style="font-weight:700;font-size:13px">' + a.nama + '</div>'
      + '<div style="font-size:11px;color:var(--muted)">' + a.jumlah_foto + ' foto</div>'
      + '<div style="display:flex;gap:6px;margin-top:8px">'
      + '<button class="btn btn-sm btn-outline" style="flex:1" onclick="event.stopPropagation();editAlbum(' + a.id + ')"><i class="bi bi-pencil-fill"></i></button>'
      + '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteAlbum(' + a.id + ')"><i class="bi bi-trash-fill"></i></button>'
      + '</div></div></div>';
  }).join('');
}

async function loadGaleriFotos() {
  var albumId = (document.getElementById('galeri-filter-album') || {}).value || '';
  var el = document.getElementById('foto-grid');
  if (el) el.innerHTML = '<div class="loading-spinner" style="justify-self:center;margin:40px auto"></div>';
  try {
    var d = await apiFetch(GALERI_API + (albumId ? '?album_id=' + albumId : ''));
    galeriFotos = Array.isArray(d) ? d : [];
    filterGaleri();
  } catch(e) { if (el) el.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted)">Gagal memuat foto</div>'; }
}
window.loadGaleriFotos = loadGaleriFotos;

function filterGaleri() {
  var q = ((document.getElementById('galeri-search') || {}).value || '').toLowerCase();
  var data = galeriFotos.filter(function(f) {
    return !q || (f.keterangan||'').toLowerCase().indexOf(q) > -1 || (f.tag_program||'').toLowerCase().indexOf(q) > -1;
  });
  renderFotoGrid(data);
}
window.filterGaleri = filterGaleri;

function renderFotoGrid(data) {
  var el = document.getElementById('foto-grid');
  var cEl = document.getElementById('galeri-foto-count');
  if (!el) return;
  if (cEl) cEl.textContent = data.length + ' foto';
  if (!data.length) {
    el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--muted)"><i class="bi bi-images" style="font-size:48px;display:block;opacity:.4"></i><p>Belum ada foto. Klik Upload Foto untuk menambahkan.</p></div>';
    return;
  }
  el.innerHTML = data.map(function(f) {
    var src = f.foto_url || ('/WEB/Website-Sanggar-Bunda-Sari/uploads/galeri/' + f.foto);
    return '<div style="position:relative;border-radius:10px;overflow:hidden;background:#f1f5f4;aspect-ratio:1;cursor:pointer" onclick="openFotoLightbox(' + f.id + ')" onmouseenter="this.querySelector(\'.fdel\').style.display=\'block\'" onmouseleave="this.querySelector(\'.fdel\').style.display=\'none\'">'
      + '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover" loading="lazy">'
      + (f.keterangan ? '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.7));padding:12px 6px 4px;font-size:11px;color:#fff">' + f.keterangan + '</div>' : '')
      + '<button class="fdel" onclick="event.stopPropagation();deleteGaleriFoto(' + f.id + ')" style="position:absolute;top:6px;right:6px;background:rgba(220,38,38,.8);color:#fff;border:none;border-radius:50%;width:26px;height:26px;cursor:pointer;display:none;font-size:14px;line-height:1">x</button>'
      + '</div>';
  }).join('');
}

function filterByAlbum(id) {
  var el = document.getElementById('galeri-filter-album'); if (el) el.value = id;
  loadGaleriFotos();
}
window.filterByAlbum = filterByAlbum;

function openBuatAlbum() {
  var fields = ['album-id','album-nama','album-deskripsi'];
  fields.forEach(function(x) { var e = document.getElementById(x); if(e) e.value = ''; });
  var t = document.getElementById('album-tgl'); if(t) t.value = new Date().toISOString().slice(0,10);
  document.getElementById('album-modal-title').textContent = 'Buat Album Baru';
  openModal('albumModal');
}
window.openBuatAlbum = openBuatAlbum;

function editAlbum(id) {
  var a = galeriAlbums.filter(function(x) { return x.id == id; })[0]; if (!a) return;
  document.getElementById('album-id').value = a.id;
  document.getElementById('album-nama').value = a.nama;
  document.getElementById('album-deskripsi').value = a.deskripsi || '';
  document.getElementById('album-tgl').value = a.tgl_kegiatan || '';
  document.getElementById('album-modal-title').textContent = 'Edit Album';
  openModal('albumModal');
}
window.editAlbum = editAlbum;

async function saveAlbum() {
  var id = document.getElementById('album-id').value;
  var nama = (document.getElementById('album-nama').value || '').trim();
  if (!nama) { toast('Nama album wajib diisi','error'); return; }
  var payload = {
    nama: nama,
    deskripsi: document.getElementById('album-deskripsi').value,
    tgl_kegiatan: document.getElementById('album-tgl').value
  };
  var body = id
    ? Object.assign({ type: 'album', id: id }, payload)
    : Object.assign({ action: 'create_album' }, payload);
  var r = await apiFetch(GALERI_API, { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
  if (r && r.success) { toast('Album disimpan','success'); closeModal('albumModal'); await loadGaleriAlbums(); }
  else toast((r && r.message) || 'Gagal simpan','error');
}
window.saveAlbum = saveAlbum;

async function deleteAlbum(id) {
  var a = galeriAlbums.filter(function(x) { return x.id == id; })[0];
  var nama = a ? a.nama : 'album ini';
  showConfirm('Hapus Album', 'Hapus "' + nama + '" dan semua fotonya?', async function() {
    var r = await apiFetch(GALERI_API, { method: 'DELETE', body: JSON.stringify({ id: id, type: 'album' }) });
    if (r && r.success) { toast('Album dihapus','success'); await loadGaleriAlbums(); await loadGaleriFotos(); }
    else toast('Gagal hapus','error');
  });
}
window.deleteAlbum = deleteAlbum;

function openUploadFoto() {
  galeriFilesQueue = [];
  document.getElementById('galeri-preview-grid').innerHTML = '';
  document.getElementById('galeri-upload-progress').style.display = 'none';
  openModal('galeriUploadModal');
}
window.openUploadFoto = openUploadFoto;

function previewGaleriFiles(input) {
  var prev = document.getElementById('galeri-preview-grid');
  Array.from(input.files).forEach(function(f) {
    if (!f.type.startsWith('image/')) return;
    galeriFilesQueue.push(f);
    var reader = new FileReader();
    reader.onload = function(ev) {
      var d = document.createElement('div');
      d.style.cssText = 'border-radius:6px;overflow:hidden;aspect-ratio:1';
      d.innerHTML = '<img src="' + ev.target.result + '" style="width:100%;height:100%;object-fit:cover">';
      prev.appendChild(d);
    };
    reader.readAsDataURL(f);
  });
}
window.previewGaleriFiles = previewGaleriFiles;

async function doUploadGaleri() {
  if (!galeriFilesQueue.length) { toast('Pilih foto terlebih dahulu','error'); return; }
  var btn = document.getElementById('btn-upload-galeri');
  var bar = document.getElementById('galeri-progress-bar');
  var txt = document.getElementById('galeri-progress-text');
  document.getElementById('galeri-upload-progress').style.display = 'block';
  btn.disabled = true;
  var done = 0;
  for (var i = 0; i < galeriFilesQueue.length; i++) {
    var form = new FormData();
    form.append('foto', galeriFilesQueue[i]);
    form.append('album_id', document.getElementById('upload-album-id').value);
    form.append('keterangan', document.getElementById('upload-keterangan').value);
    form.append('tgl_kegiatan', document.getElementById('upload-tgl').value);
    form.append('tag_program', document.getElementById('upload-tag').value);
    try {
      var res = await fetch('/WEB/Website-Sanggar-Bunda-Sari/php/api/cms_galeri.php', { method: 'POST', body: form });
      await res.json();
    } catch(e) { console.error('upload error:', e); }
    done++;
    if (bar) bar.style.width = (done / galeriFilesQueue.length * 100) + '%';
    if (txt) txt.textContent = 'Upload ' + done + '/' + galeriFilesQueue.length;
  }
  btn.disabled = false;
  toast('Upload ' + done + ' foto selesai!','success');
  closeModal('galeriUploadModal');
  await loadGaleriAlbums();
  await loadGaleriFotos();
}
window.doUploadGaleri = doUploadGaleri;

async function deleteGaleriFoto(id) {
  showConfirm('Hapus Foto', 'Hapus foto ini?', async function() {
    var r = await apiFetch(GALERI_API, { method: 'DELETE', body: JSON.stringify({ id: id }) });
    if (r && r.success) { toast('Foto dihapus','success'); await loadGaleriFotos(); }
    else toast('Gagal hapus','error');
  });
}
window.deleteGaleriFoto = deleteGaleriFoto;

function openFotoLightbox(id) {
  var f = galeriFotos.filter(function(x) { return x.id == id; })[0]; if (!f) return;
  var src = f.foto_url || ('/WEB/Website-Sanggar-Bunda-Sari/uploads/galeri/' + f.foto);
  var lb = document.createElement('div');
  lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:20px';
  lb.onclick = function() { lb.remove(); };
  lb.innerHTML = '<img src="' + src + '" style="max-width:90vw;max-height:80vh;border-radius:12px">'
    + (f.keterangan ? '<p style="color:#fff;margin-top:12px;font-size:14px">' + f.keterangan + '</p>' : '')
    + '<button onclick="this.parentElement.remove()" style="position:absolute;top:20px;right:20px;background:rgba(255,255,255,.2);color:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer">x</button>';
  document.body.appendChild(lb);
}
window.openFotoLightbox = openFotoLightbox;