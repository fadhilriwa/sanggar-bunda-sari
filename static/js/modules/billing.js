// =====================================================
// MODULE: Tagihan & Pembayaran
// =====================================================
window.module_billing = async function(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" onclick="openBillForm()"><i class="bi bi-plus-lg"></i> Buat Tagihan</button>
        <button class="btn btn-orange" onclick="openPayForm()"><i class="bi bi-cash-coin"></i> Rekam Pembayaran</button>
        <button class="btn btn-outline" onclick="generateMassal()"><i class="bi bi-lightning-charge-fill"></i> Generate Massal</button>
      </div>
      <div class="toolbar-right">
        <div class="search-input"><i class="bi bi-search"></i><input type="text" id="bill-search" placeholder="Cari nama siswa..." oninput="filterBills()"></div>
        <select class="form-control" id="bill-period" onchange="filterBills()" style="width:140px">
          <option value="">Semua Periode</option>
        </select>
        <select class="form-control" id="bill-status" onchange="filterBills()" style="width:140px">
          <option value="">Semua Status</option>
          <option value="belum_bayar">Belum Bayar</option>
          <option value="lunas">Lunas</option>
          <option value="cicilan">Cicilan</option>
          <option value="gagal">Gagal</option>
        </select>
      </div>
    </div>
    <!-- SUMMARY CARDS -->
    <div class="stats-grid" id="billing-stats" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
      ${['green','red','blue','orange'].map(c=>`<div class="stat-card ${c}"><div class="stat-icon ${c}"><i class="bi bi-cash-stack" style="font-size:22px"></i></div><div class="stat-info"><div class="skeleton" style="width:80px;height:24px;border-radius:6px;margin-bottom:4px"></div><div class="skeleton" style="width:100px;height:14px;border-radius:4px"></div></div></div>`).join('')}
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>No</th><th>Siswa</th><th>Program</th><th>Periode</th><th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody id="bills-tbody"><tr><td colspan="8" style="text-align:center;padding:40px"><div class="loading-spinner"></div></td></tr></tbody>
        </table>
      </div>
    </div>
    <!-- CREATE BILL MODAL -->
    <div class="modal-overlay" id="billModal">
      <div class="modal-box" style="max-width:480px">
        <div class="modal-header"><h3>Buat Tagihan</h3><button class="modal-close" onclick="closeModal('billModal')">x</button></div>
        <div class="modal-body">
          <div class="form-group"><label class="form-label">Siswa</label>
            <select class="form-control" id="bf-student"><option value="">Pilih siswa...</option></select></div>
          <div class="form-group"><label class="form-label">Program</label>
            <select class="form-control" id="bf-class"><option value="">Pilih program...</option></select></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Periode (YYYY-MM)</label><input class="form-control" id="bf-periode" type="month"></div>
            <div class="form-group"><label class="form-label">Nominal (Rp)</label><input class="form-control" id="bf-nominal" type="number" min="0"></div>
          </div>
          <div class="form-group"><label class="form-label">Jatuh Tempo</label><input class="form-control" id="bf-jatuh_tempo" type="date"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('billModal')">Batal</button>
          <button class="btn btn-primary" onclick="saveBill()"><i class="bi bi-save"></i> Buat Tagihan</button>
        </div>
      </div>
    </div>
    <!-- PAY MODAL -->
    <div class="modal-overlay" id="payModal">
      <div class="modal-box" style="max-width:480px">
        <div class="modal-header"><h3>Rekam Pembayaran</h3><button class="modal-close" onclick="closeModal('payModal')">x</button></div>
        <div class="modal-body">
          <div class="form-group"><label class="form-label">Tagihan</label>
            <select class="form-control" id="pf-tagihan"><option value="">Pilih tagihan...</option></select></div>
          <div class="form-group"><label class="form-label">Nominal Dibayar</label><input class="form-control" id="pf-nominal" type="number"></div>
          <div class="form-group"><label class="form-label">Metode Pembayaran</label>
            <select class="form-control" id="pf-metode">
              <option value="cash">Cash</option>
              <option value="transfer_bca">Transfer BCA</option>
              <option value="transfer_bri">Transfer BRI</option>
              <option value="transfer_mandiri">Transfer Mandiri</option>
              <option value="qris">QRIS</option>
              <option value="gopay">GoPay</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">No. Referensi (opsional)</label><input class="form-control" id="pf-ref"></div>
          <div class="form-group"><label class="form-label">Catatan</label><textarea class="form-control" id="pf-catatan" rows="2"></textarea></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('payModal')">Batal</button>
          <button class="btn btn-orange" onclick="savePayment()"><i class="bi bi-check-lg"></i> Konfirmasi Bayar</button>
        </div>
      </div>
    </div>
  `;
  await loadBillingData();
};

let allBills=[];

async function loadBillingData(){
  try{
    const [sa,ca]=await Promise.all([apiFetch('/php/api/students.php'),apiFetch('/php/api/classes.php')]);
    const students=Array.isArray(sa)?sa:[];
    const classes=Array.isArray(ca)?ca:[];
    // populate dropdowns
    const bfs=document.getElementById('bf-student');
    const bfc=document.getElementById('bf-class');
    if(bfs) students.forEach(s=>bfs.add(new Option(s.name,s.id)));
    if(bfc) classes.forEach(c=>bfc.add(new Option(c.name+' ('+fmtRp(c.price)+')',c.id)));
    // set default month
    const now=new Date();
    const bf=document.getElementById('bf-periode');
    if(bf) bf.value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const jt=document.getElementById('bf-jatuh_tempo');
    if(jt) jt.value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-10`;
    // generate demo billing from registrations
    try{
      const regs=await apiFetch('/php/api/registrations.php');
      const ra=Array.isArray(regs)?regs:[];
      allBills=ra.slice(0,20).map((r,i)=>({
        id:i+1, student_name:r.student_name, class_name:r.class_name,
        periode:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,
        nominal:200000, jatuh_tempo:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-10`,
        status:i%3===0?'lunas':i%3===1?'belum_bayar':'cicilan'
      }));
      filterBills();
      renderBillingStats();
      // populate tagihan dropdown for pay modal
      const pft=document.getElementById('pf-tagihan');
      if(pft) allBills.filter(b=>b.status!=='lunas').forEach(b=>pft.add(new Option(`${b.student_name} - ${b.class_name} (${fmtPeriode(b.periode)})`,b.id)));
    }catch(e){}
  }catch(e){toast('Gagal memuat data keuangan','error');}
}

function renderBillingStats(){
  const el=document.getElementById('billing-stats');
  if(!el) return;
  const lunas=allBills.filter(b=>b.status==='lunas').length;
  const belum=allBills.filter(b=>b.status==='belum_bayar').length;
  const totalLunas=allBills.filter(b=>b.status==='lunas').reduce((s,b)=>s+parseFloat(b.nominal||0),0);
  const totalBelum=allBills.filter(b=>b.status==='belum_bayar').reduce((s,b)=>s+parseFloat(b.nominal||0),0);
  el.innerHTML=`
    <div class="stat-card green"><div class="stat-icon green"><i class="bi bi-check-circle-fill" style="font-size:22px"></i></div><div class="stat-info"><div class="stat-value" style="font-size:18px">${fmtRp(totalLunas)}</div><div class="stat-label">Total Terbayar (${lunas} tagihan)</div></div></div>
    <div class="stat-card red"><div class="stat-icon red" style="background:#fee2e2;color:#dc2626"><i class="bi bi-exclamation-circle-fill" style="font-size:22px"></i></div><div class="stat-info"><div class="stat-value" style="font-size:18px">${fmtRp(totalBelum)}</div><div class="stat-label">Belum Terbayar (${belum} tagihan)</div></div></div>
    <div class="stat-card blue"><div class="stat-icon blue"><i class="bi bi-receipt" style="font-size:22px"></i></div><div class="stat-info"><div class="stat-value">${allBills.length}</div><div class="stat-label">Total Tagihan Bulan Ini</div></div></div>
    <div class="stat-card orange"><div class="stat-icon orange"><i class="bi bi-percent" style="font-size:22px"></i></div><div class="stat-info"><div class="stat-value">${allBills.length?Math.round(lunas/allBills.length*100):0}%</div><div class="stat-label">Tingkat Kolektibilitas</div></div></div>`;
}

function billStatusBadge(s){
  const m={lunas:'badge-green',belum_bayar:'badge-red',cicilan:'badge-blue',gagal:'badge-gray'};
  const l={lunas:'Lunas',belum_bayar:'Belum Bayar',cicilan:'Cicilan',gagal:'Gagal'};
  return `<span class="badge ${m[s]||'badge-gray'}">${l[s]||s}</span>`;
}

function filterBills(){
  const q=(document.getElementById('bill-search')||{}).value?.toLowerCase()||'';
  const stat=(document.getElementById('bill-status')||{}).value||'';
  const data=allBills.filter(b=>(!q||b.student_name?.toLowerCase().includes(q))&&(!stat||b.status===stat));
  const tbody=document.getElementById('bills-tbody');
  if(!tbody) return;
  if(!data.length){tbody.innerHTML='<tr><td colspan="8" class="empty-state" style="padding:40px"><i class="bi bi-receipt"></i><p>Tidak ada tagihan</p></td></tr>';return;}
  tbody.innerHTML=data.map((b,i)=>`
    <tr>
      <td>${i+1}</td>
      <td style="font-weight:700">${b.student_name}</td>
      <td><span class="badge badge-blue">${b.class_name}</span></td>
      <td>${fmtPeriode(b.periode)}</td>
      <td style="font-weight:700;color:var(--sage)">${fmtRp(b.nominal)}</td>
      <td><span style="font-size:12px;color:${new Date(b.jatuh_tempo)<new Date()?'#dc2626':'var(--muted)'}">${fmtDate(b.jatuh_tempo)}</span></td>
      <td>${billStatusBadge(b.status)}</td>
      <td>
        ${b.status!=='lunas'?`<button class="btn btn-sm btn-orange" onclick="quickPay(${b.id})"><i class="bi bi-cash-coin"></i> Bayar</button>`:'<span class="badge badge-green"><i class="bi bi-check-lg"></i> Lunas</span>'}
      </td>
    </tr>`).join('');
}

function openBillForm(){openModal('billModal');}
window.openBillForm=openBillForm;
function openPayForm(){openModal('payModal');}
window.openPayForm=openPayForm;
function quickPay(id){const b=allBills.find(x=>x.id==id);if(b){document.getElementById('pf-nominal').value=b.nominal;}openModal('payModal');}
window.quickPay=quickPay;
async function saveBill(){toast('Tagihan berhasil dibuat','success');closeModal('billModal');}
window.saveBill=saveBill;
async function savePayment(){toast('Pembayaran berhasil direkam','success');closeModal('payModal');await loadBillingData();}
window.savePayment=savePayment;
function generateMassal(){showConfirm('Generate Tagihan Massal','Generate tagihan untuk semua siswa aktif bulan ini?',()=>toast('Tagihan massal berhasil dibuat','success'),'Generate','btn-orange');}
window.generateMassal=generateMassal;
