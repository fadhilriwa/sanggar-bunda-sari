window.module_cms_lokasi = async function(container) {
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="bi bi-geo-alt-fill"></i> Informasi Lokasi</span></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">Alamat Lengkap</label><textarea class="form-control" id="lok-alamat" rows="3">Jl. Greenery Permai No. 06 Blok A, Bojonggede, Kab.Bogor, Jawa Barat 16922</textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Kota/Kabupaten</label><input class="form-control" id="lok-kota" value="Bogor"></div>
            <div class="form-group"><label class="form-label">Kode Pos</label><input class="form-control" id="lok-kodepos" value="16922"></div>
          </div>
          <div class="form-group"><label class="form-label">Google Maps Link</label><input class="form-control" id="lok-maps" value="https://maps.app.goo.gl/D8VmbsGTHezzQqR39"></div>
          <div class="divider"></div>
          <div style="font-size:13px;font-weight:700;color:var(--text-2);margin-bottom:12px">Jam Operasional</div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Senin - Jumat</label><input class="form-control" id="lok-senin" value="08:00 - 17:00"></div>
            <div class="form-group"><label class="form-label">Sabtu</label><input class="form-control" id="lok-sabtu" value="08:00 - 15:00"></div>
          </div>
          <div class="form-group"><label class="form-label">Minggu</label>
            <div style="display:flex;align-items:center;gap:10px"><input class="form-control" id="lok-minggu" value="Tutup" style="flex:1"><label style="display:flex;align-items:center;gap:6px;font-size:13px;white-space:nowrap;cursor:pointer"><input type="checkbox" id="lok-minggu-tutup" checked> Tutup</label></div>
          </div>
          <div class="divider"></div>
          <div style="font-size:13px;font-weight:700;color:var(--text-2);margin-bottom:12px">Kontak & Media Sosial</div>
          <div class="form-row">
            <div class="form-group"><label class="form-label"><i class="bi bi-telephone-fill"></i> Telepon</label><input class="form-control" id="lok-telp" value="0877-8007-4616"></div>
            <div class="form-group"><label class="form-label"><i class="bi bi-whatsapp"></i> WhatsApp</label><input class="form-control" id="lok-wa" value="0877-8007-4616"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label"><i class="bi bi-instagram"></i> Instagram</label><input class="form-control" id="lok-ig" placeholder="@handle"></div>
            <div class="form-group"><label class="form-label"><i class="bi bi-facebook"></i> Facebook</label><input class="form-control" id="lok-fb" placeholder="URL atau nama"></div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px" onclick="saveLokasi()"><i class="bi bi-save"></i> Simpan Lokasi</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="bi bi-map"></i> Preview Maps</span></div>
        <div class="card-body" style="padding:0">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.289049258413!2d106.79452527513155!3d-6.485031993506888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c30033a7a3ab%3A0x7ef44c5b1591c06d!2sSANGGAR%20BUNDA%20SARI%20BOJONGGEDE!5e0!3m2!1sid!2sid" width="100%" height="400" style="border:0;display:block" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
    </div>`;
};
function saveLokasi(){toast('Lokasi berhasil disimpan','success');}
window.saveLokasi=saveLokasi;
