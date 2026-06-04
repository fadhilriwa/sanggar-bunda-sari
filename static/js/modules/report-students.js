window["module_report-students"] = async function(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left">
        <select class="form-control" id="rpt-type" onchange="loadStudentReport()" style="width:200px">
          <option value="all">Daftar Semua Siswa</option>
          <option value="demografi">Statistik Demografi</option>
          <option value="growth">Laporan Pertumbuhan</option>
        </select>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-outline" onclick="window.print()"><i class="bi bi-printer"></i> Cetak PDF</button>
        <button class="btn btn-outline" onclick="exportReport()"><i class="bi bi-file-earmark-excel"></i> Export Excel</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header" style="background:var(--sage);color:#fff">
        <div>
          <div style="font-family:'Nunito',sans-serif;font-size:18px;font-weight:800">Sanggar Bunda Sari</div>
          <div style="font-size:13px;opacity:.85" id="rpt-subtitle">Laporan Data Siswa</div>
        </div>
        <div style="text-align:right;font-size:12px;opacity:.8">
          <div>Dicetak: ${new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}</div>
          <div id="rpt-printed-by">Oleh: Admin</div>
        </div>
      </div>
      <div id="rpt-content" style="padding:20px"><div class="loading-spinner"></div></div>
    </div>`;
  await loadStudentReport();
};
window["module_report_students"] = window["module_report-students"];

async function loadStudentReport(){
  const type=(document.getElementById('rpt-type')||{}).value||'all';
  const el=document.getElementById('rpt-content');
  if(!el) return;
  el.innerHTML='<div class="loading-spinner"></div>';
  try{
    const [sa,ca,ra]=await Promise.all([apiFetch('/php/api/students.php'),apiFetch('/php/api/classes.php'),apiFetch('/php/api/registrations.php')]);
    const students=Array.isArray(sa)?sa:[];
    if(type==='all'){
      document.getElementById('rpt-subtitle').textContent='Laporan Daftar Seluruh Siswa';
      el.innerHTML=`<div style="font-size:13px;color:var(--muted);margin-bottom:12px">Total: ${students.length} siswa</div>
        <table class="data-table"><thead><tr><th>No</th><th>Nama</th><th>Email</th><th>Telepon</th><th>Gender</th><th>Usia</th><th>Tgl Daftar</th></tr></thead>
        <tbody>${students.map((s,i)=>`<tr><td>${i+1}</td><td style="font-weight:700">${s.name}</td><td>${s.email||'-'}</td><td>${s.phone||'-'}</td><td>${s.gender||'-'}</td><td>${s.age||'-'}</td><td>${fmtDate(s.created_at)}</td></tr>`).join('')}</tbody></table>`;
    } else if(type==='demografi'){
      document.getElementById('rpt-subtitle').textContent='Laporan Statistik Demografi';
      const male=students.filter(s=>s.gender==='Laki-laki').length;
      const female=students.filter(s=>s.gender==='Perempuan').length;
      const sdCount=students.filter(s=>s.education_level==='SD').length;
      const smpCount=students.filter(s=>s.education_level==='SMP').length;
      el.innerHTML=`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div><div style="font-weight:700;margin-bottom:12px">Distribusi Gender</div>
            <div style="display:flex;gap:12px">
              <div style="padding:16px;border-radius:10px;background:#dbeafe;flex:1;text-align:center"><div style="font-size:28px;font-weight:800;color:#1d4ed8">${male}</div><div style="font-size:12px">Laki-laki</div></div>
              <div style="padding:16px;border-radius:10px;background:#ffe4e6;flex:1;text-align:center"><div style="font-size:28px;font-weight:800;color:#be123c">${female}</div><div style="font-size:12px">Perempuan</div></div>
            </div>
          </div>
          <div><div style="font-weight:700;margin-bottom:12px">Tingkat Pendidikan</div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${[['SD',sdCount],['SMP',smpCount],['Lainnya',students.length-sdCount-smpCount]].map(([l,c])=>`
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:60px;font-size:13px;font-weight:600">${l}</div>
                  <div style="flex:1;height:20px;background:var(--border);border-radius:10px;overflow:hidden"><div style="width:${students.length?c/students.length*100:0}%;height:100%;background:var(--sage);border-radius:10px"></div></div>
                  <div style="font-weight:700;font-size:13px">${c}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>`;
    } else {
      document.getElementById('rpt-subtitle').textContent='Laporan Pertumbuhan Siswa';
      const now=new Date();
      const months=[];const counts=[];
      for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;months.push(d.toLocaleDateString('id-ID',{month:'short',year:'2-digit'}));counts.push(students.filter(s=>(s.created_at||'').startsWith(k)).length);}
      el.innerHTML=`<div style="height:280px"><canvas id="rpt-growth-chart"></canvas></div>
        <table class="data-table" style="margin-top:16px"><thead><tr><th>Bulan</th><th>Siswa Baru</th><th>Kumulatif</th></tr></thead>
        <tbody>${months.map((m,i)=>{const cum=counts.slice(0,i+1).reduce((a,b)=>a+b,0);return`<tr><td>${m}</td><td><strong>${counts[i]}</strong></td><td>${cum}</td></tr>`;}).join('')}</tbody></table>`;
      setTimeout(()=>{const ctx=document.getElementById('rpt-growth-chart');if(ctx)new Chart(ctx,{type:'bar',data:{labels:months,datasets:[{label:'Siswa Baru',data:counts,backgroundColor:'rgba(74,124,89,0.7)',borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}}}});},100);
    }
  }catch(e){el.innerHTML='<div class="empty-state"><i class="bi bi-exclamation-circle"></i><p>Gagal memuat laporan</p></div>';}
}
window.loadStudentReport=loadStudentReport;
function exportReport(){toast('Export laporan dalam pengembangan','info');}
window.exportReport=exportReport;

window["module_report-activity"] = async function(container) {
  container.innerHTML = `<div class="card"><div class="card-header"><span class="card-title"><i class="bi bi-activity"></i> Laporan Aktivitas Sistem</span></div>
    <div class="card-body"><div class="empty-state"><i class="bi bi-activity"></i><p>Laporan aktivitas akan ditampilkan di sini</p></div></div></div>`;
};
window["module_report_activity"] = window["module_report-activity"];

window["module_finance-report"] = async function(container) {
  container.innerHTML = `
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card green"><div class="stat-icon green"><i class="bi bi-cash-stack" style="font-size:22px"></i></div><div class="stat-info"><div class="stat-value">Rp 0</div><div class="stat-label">Pendapatan Bulan Ini</div></div></div>
      <div class="stat-card red"><div class="stat-icon red" style="background:#fee2e2;color:#dc2626"><i class="bi bi-exclamation-circle" style="font-size:22px"></i></div><div class="stat-info"><div class="stat-value">Rp 0</div><div class="stat-label">Total Tunggakan</div></div></div>
      <div class="stat-card blue"><div class="stat-icon blue"><i class="bi bi-percent" style="font-size:22px"></i></div><div class="stat-info"><div class="stat-value">0%</div><div class="stat-label">Tingkat Kolektibilitas</div></div></div>
    </div>
    <div class="card"><div class="card-header"><span class="card-title"><i class="bi bi-bar-chart"></i> Grafik Pendapatan 12 Bulan</span></div>
      <div class="card-body"><div class="chart-container"><canvas id="finance-chart"></canvas></div></div>
    </div>`;
  const ctx=document.getElementById('finance-chart');
  const months=[];for(let i=11;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);months.push(d.toLocaleDateString('id-ID',{month:'short',year:'2-digit'}));}
  if(ctx)new Chart(ctx,{type:'bar',data:{labels:months,datasets:[{label:'Pendapatan (Rp)',data:months.map(()=>Math.floor(Math.random()*5000000+1000000)),backgroundColor:'rgba(74,124,89,0.7)',borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:v=>'Rp'+v.toLocaleString('id-ID')}}}}});
};
window["module_finance_report"] = window["module_finance-report"];

window.module_installments = async function(container) {
  container.innerHTML = `<div class="card"><div class="card-header"><span class="card-title"><i class="bi bi-credit-card-2-front"></i> Manajemen Cicilan</span><button class="btn btn-primary" onclick="toast('Form cicilan akan segera tersedia','info')"><i class="bi bi-plus-lg"></i> Buat Cicilan</button></div>
    <div class="card-body"><div class="empty-state"><i class="bi bi-credit-card-2-front"></i><p>Belum ada data cicilan</p></div></div></div>`;
};
