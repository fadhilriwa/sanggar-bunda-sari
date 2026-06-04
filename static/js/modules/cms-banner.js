window.module_cms_banner = async function(container) {
  container.innerHTML = `
    <div class="toolbar"><div class="toolbar-left"><button class="btn btn-primary" onclick="openBannerForm()"><i class="bi bi-plus-lg"></i> Tambah Banner</button></div></div>
    <div class="card"><div class="table-wrap">
      <table class="data-table"><thead><tr><th>Preview</th><th>Judul</th><th>Subjudul</th><th>CTA</th><th>Urutan</th><th>Status</th><th>Aksi</th></tr></thead>
      <tbody id="banner-tbody"><tr><td colspan="7" style="text-align:center;padding:40px"><div class="loading-spinner"></div></td></tr></tbody></table>
    </div></div>
    <div class="modal-overlay" id="bannerModal"><div class="modal-box" style="max-width:560px">
      <div class="modal-header"><h3>Kelola Banner</h3><button class="modal-close" onclick="closeModal('bannerModal')">x</button></div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Foto Banner</label>
          <div class="upload-zone" onclick="document.getElementById('banner-file').click()"><i class="bi bi-image"></i><div>Klik atau drag foto (1920x600px)</div><div style="font-size:11px;color:var(--muted)">Maks 2MB</div></div>
          <input type="file" id="banner-file" style="display:none" accept="image/*"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Judul</label><input class="form-control" id="bn-judul"></div>
          <div class="form-group"><label class="form-label">Urutan</label><input class="form-control" type="number" id="bn-urutan" value="1"></div>
        </div>
        <div class="form-group"><label class="form-label">Subjudul</label><input class="form-control" id="bn-subjudul"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Teks Tombol CTA</label><input class="form-control" id="bn-cta" value="Daftar Sekarang"></div>
          <div class="form-group"><label class="form-label">Link CTA</label><input class="form-control" id="bn-link" value="/templates/register.html"></div>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-control" id="bn-status"><option value="aktif">Aktif</option><option value="draft">Draft</option></select></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('bannerModal')">Batal</button>
        <button class="btn btn-primary" onclick="saveBanner()"><i class="bi bi-save"></i> Simpan Banner</button>
      </div>
    </div></div>`;
  const tbody=document.getElementById('banner-tbody');
  tbody.innerHTML=`<tr><td colspan="7" class="empty-state" style="padding:40px"><i class="bi bi-image"></i><p>Belum ada banner. Tambah banner pertama!</p></td></tr>`;
};
function openBannerForm(){openModal('bannerModal');}
window.openBannerForm=openBannerForm;
function saveBanner(){toast('Banner berhasil disimpan','success');closeModal('bannerModal');}
window.saveBanner=saveBanner;
