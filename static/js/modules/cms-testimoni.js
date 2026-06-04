// MODULE: CMS Testimoni
var TESTI_API = '/php/api/cms_testimoni.php';
var allTestimoni = [];

window.module_cms_testimoni = async function(container) {
  container.innerHTML =
    '<div class="toolbar"><div class="toolbar-left">'
    + '<button class="btn btn-primary" onclick="openTestimoniForm()"><i class="bi bi-plus-lg"></i> Tambah Testimoni</button>'
    + '</div><div class="toolbar-right">'
    + '<select class="form-control" id="testi-filter-status" onchange="loadTestimoni()" style="width:160px">'
    + '<option value="">Semua Status</option><option value="tampil">Ditampilkan</option><option value="sembunyikan">Disembunyikan</option>'
    + '</select></div></div>'
    + '<div style="padding:12px;background:var(--sage-subtle);border-radius:10px;margin-bottom:16px;font-size:13px">'
    + '<i class="bi bi-info-circle-fill"></i> Testimoni berstatus <strong>Tampil</strong> akan muncul di website utama.'
    + '</div>'
    + '<div id="testi-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">'
    + '<div class="loading-spinner" style="grid-column:1/-1;justify-self:center;margin:60px auto"></div>'
    + '</div>'
    + '<div class="modal-overlay" id="testimoniModal"><div class="modal-box" style="max-width:560px">'
    + '<div class="modal-header"><h3 id="testi-form-title">Tambah Testimoni</h3>'
    + '<button class="modal-close" onclick="closeModal(' + "'" + 'testimoniModal' + "'" + ')">x</button></div>'
    + '<div class="modal-body"><input type="hidden" id="tf-id">'
    + '<div class="form-row">'
    + '<div class="form-group"><label class="form-label">Nama Orang Tua <span class="required">*</span></label><input class="form-control" id="tf-nama_ortu"></div>'
    + '<div class="form-group"><label class="form-label">Nama Anak</label><input class="form-control" id="tf-nama_anak"></div>'
    + '</div><div class="form-row">'
    + '<div class="form-group"><label class="form-label">Program</label>'
    + '<select class="form-control" id="tf-program"><option value="">-- Pilih --</option>'
    + '<option>Matematika</option><option>Bahasa Inggris</option><option>Calistung</option><option>Melukis</option><option>Seni</option>'
    + '</select></div>'
    + '<div class="form-group"><label class="form-label">Rating</label>'
    + '<select class="form-control" id="tf-rating"><option value="5">5 Bintang</option><option value="4">4 Bintang</option><option value="3">3 Bintang</option></select></div>'
    + '</div>'
    + '<div class="form-group"><label class="form-label">Isi Testimoni <span class="required">*</span></label>'
    + '<textarea class="form-control" id="tf-isi" rows="4" placeholder="Cerita orang tua..."></textarea></div>'
    + '<div class="form-row">'
    + '<div class="form-group"><label class="form-label">Foto URL</label><input class="form-control" id="tf-foto" placeholder="URL foto atau kosongkan">'
    + '<div id="tf-foto-preview" style="margin-top:8px"></div></div>'
    + '<div class="form-group"><label class="form-label">Urutan</label><input class="form-control" type="number" id="tf-urutan" value="1"></div>'
    + '</div>'
    + '<div class="form-group"><label class="form-label">Status</label>'
    + '<select class="form-control" id="tf-status"><option value="tampil">Tampil di Website</option><option value="sembunyikan">Sembunyikan</option></select></div>'
    + '</div><div class="modal-footer">'
    + '<button class="btn btn-outline" onclick="closeModal(' + "'" + 'testimoniModal' + "'" + ')">Batal</button>'
    + '<button class="btn btn-primary" onclick="saveTestimoni()"><i class="bi bi-save"></i> Simpan</button>'
    + '</div></div></div>';
  await loadTestimoni();
};

async function loadTestimoni() {
  var status = (document.getElementById('testi-filter-status') || {}).value || '';
  var grid = document.getElementById('testi-grid');
  if (grid) grid.innerHTML = '<div class="loading-spinner" style="grid-column:1/-1;justify-self:center;margin:60px auto"></div>';
  try {
    var d = await apiFetch(TESTI_API + (status ? '?status=' + status : ''));
    allTestimoni = Array.isArray(d) ? d : [];
    renderTestimoniGrid(allTestimoni);
  } catch(e) {
    if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--muted)">Gagal memuat testimoni</div>';
  }
}
window.loadTestimoni = loadTestimoni;

function renderTestimoniGrid(data) {
  var el = document.getElementById('testi-grid'); if (!el) return;
  if (!data.length) { el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--muted)"><i class="bi bi-chat-quote" style="font-size:48px;opacity:.3;display:block"></i><p>Belum ada testimoni.</p></div>'; return; }
  el.innerHTML = data.map(function(t) {
    var stars = ''; for (var i = 1; i <= 5; i++) stars += i <= (t.rating||5) ? '&#9733;' : '&#9734;';
    var fotoHtml = t.foto_url ? '<img src="' + t.foto_url + '" style="width:100%;height:100%;object-fit:cover">' : '<i class="bi bi-person-fill" style="font-size:22px;color:#94a3b8"></i>';
    var badge = t.status === 'tampil' ? '<span class="badge badge-green">Tampil</span>' : '<span class="badge badge-gray">Hidden</span>';
    var toggleSt = t.status === 'tampil' ? 'sembunyikan' : 'tampil';
    var toggleLbl = t.status === 'tampil' ? 'Sembunyikan' : 'Tampilkan';
    return '<div class="card" style="margin:0;border-left:4px solid ' + (t.status === 'tampil' ? 'var(--sage)' : '#94a3b8') + '">'
      + '<div class="card-body">'
      + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">'
      + '<div style="width:48px;height:48px;border-radius:50%;background:var(--sage-subtle);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px">' + fotoHtml + '</div>'
      + '<div style="flex:1"><div style="font-weight:700">' + (t.nama_ortu||'-') + '</div>'
      + '<div style="font-size:12px;color:var(--muted)">Ortu dari ' + (t.nama_anak||'-') + (t.program ? ' &middot; ' + t.program : '') + '</div>'
      + '<div style="color:#f59e0b;font-size:14px">' + stars + '</div></div>' + badge + '</div>'
      + '<p style="font-size:13px;font-style:italic;margin:0 0 12px;line-height:1.6">"' + (t.isi||'') + '"</p>'
      + '<div style="display:flex;gap:8px;justify-content:flex-end">'
      + '<button class="btn btn-sm btn-outline" onclick="toggleStatusTestimoni(' + t.id + ',\'' + toggleSt + '\')">'+toggleLbl+'</button>'
      + '<button class="btn btn-sm btn-outline" onclick="editTestimoni(' + t.id + ')"><i class="bi bi-pencil-fill"></i></button>'
      + '<button class="btn btn-sm btn-danger" onclick="deleteTestimoni(' + t.id + ')"><i class="bi bi-trash-fill"></i></button>'
      + '</div></div></div>';
  }).join('');
}

function openTestimoniForm(t) {
  t = t || null;
  document.getElementById('testi-form-title').textContent = t ? 'Edit Testimoni' : 'Tambah Testimoni';
  ['id','nama_ortu','nama_anak','program','rating','isi','foto','urutan','status'].forEach(function(f) {
    var el = document.getElementById('tf-' + f); if (!el) return;
    if (t && t[f] !== undefined) el.value = t[f];
    else if (f === 'status') el.value = 'tampil';
    else if (f === 'rating') el.value = '5';
    else if (f === 'urutan') el.value = '1';
    else el.value = '';
  });
  var prev = document.getElementById('tf-foto-preview');
  if (prev) prev.innerHTML = (t && t.foto_url) ? '<img src="' + t.foto_url + '" style="width:60px;height:60px;border-radius:8px;object-fit:cover">' : '';
  openModal('testimoniModal');
}
window.openTestimoniForm = openTestimoniForm;

function editTestimoni(id) { openTestimoniForm(allTestimoni.filter(function(t) { return t.id == id; })[0]); }
window.editTestimoni = editTestimoni;

async function saveTestimoni() {
  var id = document.getElementById('tf-id').value;
  var data = {};
  ['nama_ortu','nama_anak','program','rating','isi','foto','urutan','status'].forEach(function(f) {
    var el = document.getElementById('tf-' + f); if (el) data[f] = el.value;
  });
  if (!data.nama_ortu) { toast('Nama orang tua wajib diisi','error'); return; }
  if (!data.isi) { toast('Isi testimoni wajib diisi','error'); return; }
  if (id) data.id = id;
  var r = await apiFetch(TESTI_API, { method: id ? 'PUT' : 'POST', body: JSON.stringify(data) });
  if (r && r.success) { toast('Tersimpan','success'); closeModal('testimoniModal'); await loadTestimoni(); }
  else toast((r && r.message) || 'Gagal simpan','error');
}
window.saveTestimoni = saveTestimoni;

async function toggleStatusTestimoni(id, newStatus) {
  var t = allTestimoni.filter(function(x) { return x.id == id; })[0]; if (!t) return;
  var data = { id: id, status: newStatus, nama_ortu: t.nama_ortu, nama_anak: t.nama_anak, program: t.program, rating: t.rating, isi: t.isi, foto: t.foto, urutan: t.urutan };
  var r = await apiFetch(TESTI_API, { method: 'PUT', body: JSON.stringify(data) });
  if (r && r.success) { toast('Status diubah','success'); await loadTestimoni(); }
  else toast('Gagal ubah status','error');
}
window.toggleStatusTestimoni = toggleStatusTestimoni;

async function deleteTestimoni(id) {
  var t = allTestimoni.filter(function(x) { return x.id == id; })[0];
  var nama = t ? t.nama_ortu : 'ini';
  showConfirm('Hapus Testimoni', 'Hapus testimoni dari ' + nama + '?', async function() {
    var r = await apiFetch(TESTI_API, { method: 'DELETE', body: JSON.stringify({ id: id }) });
    if (r && r.success) { toast('Dihapus','success'); await loadTestimoni(); }
    else toast('Gagal hapus','error');
  });
}
window.deleteTestimoni = deleteTestimoni;
