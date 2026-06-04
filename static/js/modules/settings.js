window.module_settings = async function(container) {
  container.innerHTML = `
    <div class="tab-bar" style="max-width:500px">
      <button class="tab-btn active" onclick="switchSettTab(this,'set-profil')">Profil Sanggar</button>
      <button class="tab-btn" onclick="switchSettTab(this,'set-notif')">Notifikasi</button>
      <button class="tab-btn" onclick="switchSettTab(this,'set-payment')">Payment Gateway</button>
      <button class="tab-btn" onclick="switchSettTab(this,'set-audit')">Audit Log</button>
    </div>
    <!-- PROFIL -->
    <div class="tab-pane active" id="set-profil">
      <div class="card"><div class="card-header"><span class="card-title"><i class="bi bi-building"></i> Profil Sanggar</span></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">Logo Sanggar</label>
            <div style="display:flex;align-items:center;gap:16px">
              <div style="width:80px;height:80px;border-radius:12px;background:var(--sage-subtle);border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;font-size:28px">??</div>
              <button class="btn btn-outline"><i class="bi bi-upload"></i> Upload Logo</button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Nama Sanggar</label><input class="form-control" id="st-nama" value="Sanggar Bunda Sari"></div>
            <div class="form-group"><label class="form-label">Tagline</label><input class="form-control" id="st-tagline" value="Kembangkan Bakat Si Kecil"></div>
          </div>
          <div class="form-group"><label class="form-label">Tanggal Jatuh Tempo SPP (setiap tanggal)</label>
            <input class="form-control" type="number" id="st-jatuh_tempo" min="1" max="28" value="10" style="width:100px"></div>
          <button class="btn btn-primary" onclick="saveSettings()"><i class="bi bi-save"></i> Simpan Profil</button>
        </div>
      </div>
    </div>
    <!-- NOTIFIKASI -->
    <div class="tab-pane" id="set-notif">
      <div class="card"><div class="card-header"><span class="card-title"><i class="bi bi-whatsapp"></i> WhatsApp Business API</span></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">API Key (Fonnte/WAblas)</label>
            <div style="display:flex;gap:8px"><input class="form-control" id="st-wa_key" type="password" placeholder="Masukkan API key..."><button class="btn btn-outline" onclick="toggleWAKey()"><i class="bi bi-eye"></i></button></div>
          </div>
          <div class="divider"></div>
          <div style="font-weight:700;font-size:14px;margin-bottom:12px">Template Pesan Otomatis</div>
          ${[{id:'tpl-daftar',label:'Konfirmasi Pendaftaran Baru',val:'Selamat! Pendaftaran {nama} di Sanggar Bunda Sari berhasil. Kami akan segera menghubungi Anda.'},
             {id:'tpl-tagihan',label:'Tagihan SPP Bulanan',val:'Halo {nama_ortu}, tagihan SPP {nama} bulan {periode} sebesar {jumlah} telah dibuat. Mohon dibayar sebelum tanggal {jatuh_tempo}.'},
             {id:'tpl-reminder',label:'Reminder Jatuh Tempo',val:'Pengingat: Tagihan SPP {nama} bulan {periode} jatuh tempo dalam 3 hari. Segera lakukan pembayaran.'},
             {id:'tpl-lunas',label:'Konfirmasi Pembayaran',val:'? Pembayaran SPP {nama} bulan {periode} berhasil! Terima kasih.'}].map(t=>`
            <div class="form-group"><label class="form-label">${t.label}</label>
              <textarea class="form-control" id="${t.id}" rows="2">${t.val}</textarea>
            </div>`).join('')}
          <button class="btn btn-primary" onclick="toast('Pengaturan WA disimpan','success')"><i class="bi bi-save"></i> Simpan</button>
        </div>
      </div>
    </div>
    <!-- PAYMENT -->
    <div class="tab-pane" id="set-payment">
      <div class="card"><div class="card-header"><span class="card-title"><i class="bi bi-credit-card-fill"></i> Midtrans Payment Gateway</span></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label">Mode</label>
            <div style="display:flex;gap:12px">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="mid-mode" value="sandbox" checked> Sandbox (Testing)</label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="radio" name="mid-mode" value="production"> Production</label>
            </div>
          </div>
          <div class="form-group"><label class="form-label">Server Key</label>
            <div style="display:flex;gap:8px"><input class="form-control" id="st-server_key" type="password" placeholder="sk_test_..."><button class="btn btn-outline"><i class="bi bi-eye"></i></button></div>
          </div>
          <div class="form-group"><label class="form-label">Client Key</label>
            <div style="display:flex;gap:8px"><input class="form-control" id="st-client_key" type="password" placeholder="pk_test_..."><button class="btn btn-outline"><i class="bi bi-eye"></i></button></div>
          </div>
          <div class="form-group"><label class="form-label">Webhook URL</label>
            <div style="display:flex;gap:8px">
              <input class="form-control" id="st-webhook" value="https://domain-anda.com/php/api/midtrans_notification.php" readonly style="background:#f8faf9">
              <button class="btn btn-outline" onclick="navigator.clipboard.writeText(document.getElementById('st-webhook').value);toast('URL disalin','success')"><i class="bi bi-clipboard"></i></button>
            </div>
          </div>
          <div class="form-group"><label class="form-label" style="margin-bottom:10px">Metode Pembayaran Aktif</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              ${['QRIS','Virtual Account BCA','Virtual Account BRI','Virtual Account BNI','Virtual Account Mandiri','GoPay','ShopeePay','Alfamart/Indomaret'].map(m=>`<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" checked> ${m}</label>`).join('')}
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-outline" onclick="toast('Koneksi berhasil!','success')"><i class="bi bi-plug"></i> Test Koneksi</button>
            <button class="btn btn-primary" onclick="toast('Konfigurasi disimpan','success')"><i class="bi bi-save"></i> Simpan</button>
          </div>
        </div>
      </div>
    </div>
    <!-- AUDIT LOG -->
    <div class="tab-pane" id="set-audit">
      <div class="card"><div class="card-header"><span class="card-title"><i class="bi bi-journal-text"></i> Audit Log Aktivitas</span></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Waktu</th><th>User</th><th>Aksi</th><th>Detail</th><th>IP</th></tr></thead>
            <tbody id="audit-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>`;
  renderAuditLog();
};
function switchSettTab(btn,id){
  document.querySelectorAll('.tab-pane[id^="set-"]').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}
window.switchSettTab=switchSettTab;
function saveSettings(){toast('Pengaturan berhasil disimpan','success');}
window.saveSettings=saveSettings;
function toggleWAKey(){const el=document.getElementById('st-wa_key');el.type=el.type==='password'?'text':'password';}
window.toggleWAKey=toggleWAKey;
function renderAuditLog(){
  const tbody=document.getElementById('audit-tbody');
  if(!tbody) return;
  const logs=[
    {time:'2026-05-10 14:30','user':'Admin','aksi':'LOGIN','detail':'Login berhasil','ip':'127.0.0.1'},
    {time:'2026-05-10 14:25','user':'Admin','aksi':'TAMBAH_SISWA','detail':'Menambah siswa: Budi Santoso','ip':'127.0.0.1'},
    {time:'2026-05-10 14:20','user':'Admin','aksi':'REKAM_BAYAR','detail':'Rekam pembayaran SPP Mei 2026','ip':'127.0.0.1'},
    {time:'2026-05-10 14:10','user':'Admin','aksi':'EDIT_KELAS','detail':'Update kelas Matematika Kelas 3','ip':'127.0.0.1'},
  ];
  tbody.innerHTML=logs.map(l=>`<tr>
    <td style="font-size:12px;color:var(--muted)">${l.time}</td>
    <td style="font-weight:700;font-size:13px">${l.user}</td>
    <td><span class="badge badge-blue" style="font-size:11px">${l.aksi}</span></td>
    <td style="font-size:13px">${l.detail}</td>
    <td style="font-size:12px;color:var(--muted)">${l.ip}</td>
  </tr>`).join('');
}
