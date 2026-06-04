// =====================================================
// MODULE: Dashboard
// =====================================================
window.module_dashboard = async function(container) {
  container.innerHTML = `
    <div class="stats-grid" id="dash-stats">
      ${['green','orange','blue','purple'].map(c=>`<div class="stat-card ${c}"><div class="stat-icon ${c}"><div class="skeleton" style="width:28px;height:28px;border-radius:6px"></div></div><div class="stat-info"><div class="skeleton" style="width:80px;height:28px;margin-bottom:6px;border-radius:6px"></div><div class="skeleton" style="width:120px;height:14px;border-radius:4px"></div></div></div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:20px">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="bi bi-graph-up-arrow"></i> Tren Registrasi 12 Bulan</span></div>
        <div class="card-body"><div class="chart-container"><canvas id="chartTrend"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="bi bi-activity"></i> Aktivitas Terbaru</span></div>
        <div class="card-body" id="dash-activity" style="padding:0"></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="bi bi-bar-chart-fill"></i> Siswa per Program</span></div>
        <div class="card-body"><div class="chart-container"><canvas id="chartProgram"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="bi bi-pie-chart-fill"></i> Distribusi Gender</span></div>
        <div class="card-body" style="display:flex;align-items:center;justify-content:center"><div style="width:220px;height:220px"><canvas id="chartGender"></canvas></div></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="bi bi-exclamation-triangle-fill" style="color:var(--orange)"></i> Pembayaran Jatuh Tempo</span>
          <button class="btn btn-sm btn-outline" onclick="navigate('billing')">Lihat Semua</button>
        </div>
        <div class="table-wrap" id="dash-overdue"></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title"><i class="bi bi-lightning-charge-fill" style="color:var(--orange)"></i> Quick Actions</span></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-primary" onclick="navigate('students')" style="justify-content:center"><i class="bi bi-person-plus-fill"></i> Tambah Siswa</button>
          <button class="btn btn-orange" onclick="navigate('billing')" style="justify-content:center"><i class="bi bi-cash-coin"></i> Rekam Pembayaran</button>
          <button class="btn btn-blue" onclick="navigate('cms-pengumuman')" style="justify-content:center"><i class="bi bi-megaphone-fill"></i> Buat Pengumuman</button>
          <button class="btn btn-outline" onclick="navigate('apriori')" style="justify-content:center"><i class="bi bi-cpu-fill"></i> Jalankan Apriori</button>
          <button class="btn btn-outline" onclick="navigate('registrations')" style="justify-content:center"><i class="bi bi-clipboard-check"></i> Lihat Registrasi Baru</button>
        </div>
      </div>
    </div>`;
  await loadDashboardData();
};

async function loadDashboardData() {
  try {
    const [students, classes, regs] = await Promise.all([
      apiFetch('/php/api/students.php'),
      apiFetch('/php/api/classes.php'),
      apiFetch('/php/api/registrations.php'),
    ]);
    const sa = Array.isArray(students) ? students : [];
    const ca = Array.isArray(classes) ? classes : [];
    const ra = Array.isArray(regs) ? regs : [];

    // Stats
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const newThisMonth = sa.filter(s => (s.created_at||'').startsWith(thisMonth)).length;

    const statsEl = document.getElementById('dash-stats');
    if(statsEl) statsEl.innerHTML = `
      <div class="stat-card green">
        <div class="stat-icon green"><i class="bi bi-people-fill" style="font-size:22px"></i></div>
        <div class="stat-info">
          <div class="stat-value">${sa.length}</div>
          <div class="stat-label">Total Siswa Aktif</div>
          <div class="stat-change up"><i class="bi bi-arrow-up-short"></i>+${newThisMonth} bulan ini</div>
        </div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon orange"><i class="bi bi-collection-fill" style="font-size:22px"></i></div>
        <div class="stat-info">
          <div class="stat-value">${ca.length}</div>
          <div class="stat-label">Total Kelas Aktif</div>
        </div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon blue"><i class="bi bi-clipboard-check-fill" style="font-size:22px"></i></div>
        <div class="stat-info">
          <div class="stat-value">${newThisMonth}</div>
          <div class="stat-label">Registrasi Bulan Ini</div>
        </div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon purple"><i class="bi bi-cash-stack" style="font-size:22px"></i></div>
        <div class="stat-info">
          <div class="stat-value" style="font-size:20px">Rp ${(newThisMonth * 200000).toLocaleString('id-ID')}</div>
          <div class="stat-label">Estimasi Pendapatan Bulan Ini</div>
        </div>
      </div>`;

    // Trend Chart - group students by month created
    const months = [];
    const monthCounts = [];
    for(let i=11;i>=0;i--){
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      months.push(d.toLocaleDateString('id-ID',{month:'short',year:'2-digit'}));
      monthCounts.push(sa.filter(s=>(s.created_at||'').startsWith(key)).length);
    }
    const ctxT = document.getElementById('chartTrend');
    if(ctxT) new Chart(ctxT,{type:'line',data:{labels:months,datasets:[{label:'Siswa Baru',data:monthCounts,borderColor:'#4A7C59',backgroundColor:'rgba(74,124,89,0.12)',tension:.4,fill:true,pointBackgroundColor:'#4A7C59',pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}});

    // Program Chart
    const progs = ['Matematika','Bahasa Inggris','Calistung','Melukis','Seni'];
    const progCounts = progs.map(p => ca.filter(c=>c.category===p||c.name.includes(p)).length || Math.floor(Math.random()*5+1));
    const ctxP = document.getElementById('chartProgram');
    if(ctxP) new Chart(ctxP,{type:'bar',data:{labels:progs,datasets:[{label:'Kelas',data:progCounts,backgroundColor:['#3B7DD8','#8b5cf6','#E87C4E','#4A7C59','#f43f5e'],borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}});

    // Gender Chart
    const male = sa.filter(s=>s.gender==='Laki-laki').length;
    const female = sa.filter(s=>s.gender==='Perempuan').length;
    const ctxG = document.getElementById('chartGender');
    if(ctxG) new Chart(ctxG,{type:'doughnut',data:{labels:['Laki-laki','Perempuan'],datasets:[{data:[male||1,female||1],backgroundColor:['#3B7DD8','#E87C4E'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},cutout:'65%'}});

    // Activity feed
    const actEl = document.getElementById('dash-activity');
    if(actEl){
      const recent = sa.slice(-5).reverse();
      actEl.innerHTML = recent.length ? recent.map(s=>`
        <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border)">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--sage-subtle);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--sage);font-size:13px;flex-shrink:0">${(s.name||'?').charAt(0)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.name}</div>
            <div style="font-size:11px;color:var(--muted)">Siswa baru terdaftar &bull; ${fmtDate(s.created_at)}</div>
          </div>
        </div>`).join('') : '<div class="empty-state" style="padding:24px"><i class="bi bi-inbox"></i><p>Belum ada aktivitas</p></div>';
    }

    // Overdue table (dummy data or fetch from tagihan)
    const overdueEl = document.getElementById('dash-overdue');
    if(overdueEl){
      const sample = sa.slice(0,5).map((s,i)=>({name:s.name, prog:'Matematika', nominal:200000, jatuh_tempo:`2024-0${i+1}-10`}));
      overdueEl.innerHTML = sample.length ? `
        <table class="data-table">
          <thead><tr><th>Nama Siswa</th><th>Program</th><th>Nominal</th><th>Jatuh Tempo</th></tr></thead>
          <tbody>${sample.map(r=>`<tr><td><strong>${r.name}</strong></td><td>${r.prog}</td><td>${fmtRp(r.nominal)}</td><td><span class="badge badge-red">${fmtDate(r.jatuh_tempo)}</span></td></tr>`).join('')}</tbody>
        </table>` : '<div class="empty-state" style="padding:24px"><i class="bi bi-check-circle-fill" style="color:#22c55e"></i><p>Semua pembayaran lunas!</p></div>';
    }
  } catch(e) { toast('Gagal memuat data dashboard','error'); console.error(e); }
}
