// =====================================================
// SBS Admin Panel - Main App Router
// =====================================================
const API = '/WEB/Website-Sanggar-Bunda-Sari';
let currentModule = null;
let adminData = { name: 'Admin', role: 'superadmin', initial: 'A' };

// ---- AUTH CHECK ----
(async function init() {
  try {
    const r = await fetch(`${API}/php/api/check_auth.php`);
    const d = await r.json();
    if (!d.authenticated) { window.location.href = '/WEB/Website-Sanggar-Bunda-Sari/templates/login.html'; return; }
    if (d.user) {
      adminData.name = d.user.name || d.user.username || 'Admin';
      adminData.role = d.user.role || 'admin';
      adminData.initial = adminData.name.charAt(0).toUpperCase();
    }
    document.getElementById('adminName').textContent = adminData.name;
    document.getElementById('adminRole').textContent = capitalize(adminData.role);
    document.getElementById('adminInitial').textContent = adminData.initial;
    checkResponsive();
    navigate('dashboard');
    loadPendingBadge();
  } catch(e) { window.location.href = '/WEB/Website-Sanggar-Bunda-Sari/templates/login.html'; }
})();

function capitalize(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : ''; }

// ---- NAVIGATION ----
const ROUTES = {
  dashboard: { title: 'Dashboard', file: 'dashboard' },
  students: { title: 'Data Siswa', file: 'students' },
  classes: { title: 'Kelas & Program', file: 'classes' },
  registrations: { title: 'Registrasi', file: 'registrations' },
  billing: { title: 'Tagihan & Pembayaran', file: 'billing' },
  installments: { title: 'Manajemen Cicilan', file: 'installments' },
  'finance-report': { title: 'Laporan Keuangan', file: 'finance-report' },
  apriori: { title: 'Analisis Apriori', file: 'apriori' },
  'report-students': { title: 'Laporan Siswa', file: 'report-students' },
  'report-activity': { title: 'Laporan Aktivitas', file: 'report-activity' },
  'cms-banner': { title: 'Banner & Foto', file: 'cms-banner' },
  'cms-pengumuman': { title: 'Pengumuman', file: 'cms-pengumuman' },
  'cms-galeri': { title: 'Galeri Kegiatan', file: 'cms-galeri' },
  'cms-testimoni': { title: 'Testimoni', file: 'cms-testimoni' },
  'cms-lokasi': { title: 'Lokasi Sanggar', file: 'cms-lokasi' },
  users: { title: 'Manajemen User', file: 'users' },
  settings: { title: 'Pengaturan', file: 'settings' },
};

async function navigate(page) {
  const route = ROUTES[page];
  if (!route) return;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + page.replace('-','_').replace('-','_'));
  if (navEl) navEl.classList.add('active');
  document.getElementById('page-title').textContent = route.title;
  document.getElementById('breadcrumb-current').textContent = route.title;
  const content = document.getElementById('page-content');
  content.innerHTML = '<div class="loading-spinner"></div>';
  closeSidebar();
  try {
    await loadModule(route.file, content);
  } catch(e) {
    content.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p>Modul belum tersedia: ${route.title}</p><p style="font-size:12px;margin-top:8px">${e.message}</p></div>`;
  }
}

async function loadModule(name, container) {
  const mod = window[`module_${name.replace(/-/g,'_')}`];
  if (typeof mod === 'function') { await mod(container); return; }
  throw new Error('Module not loaded: ' + name);
}

// ---- SIDEBAR TOGGLE ----
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebarOverlay');
  s.classList.toggle('open');
  o.style.display = s.classList.contains('open') ? 'block' : 'none';
}
function closeSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebarOverlay');
  s.classList.remove('open');
  o.style.display = 'none';
}
function checkResponsive() {
  const btn = document.getElementById('menuBtn');
  if (window.innerWidth < 1024) { btn.style.display = 'flex'; }
  else { btn.style.display = 'none'; closeSidebar(); }
}
window.addEventListener('resize', checkResponsive);

// ---- LOGOUT ----
async function handleLogout() {
  showConfirm('Keluar', 'Apakah Anda yakin ingin keluar dari sistem?', async () => {
    await fetch(`${API}/php/api/logout.php`);
    window.location.href = '/WEB/Website-Sanggar-Bunda-Sari/templates/login.html';
  }, 'Keluar', 'btn-orange');
}

// ---- TOAST ----
function toast(msg, type='success', dur=3000) {
  const icons = { success:'check-circle-fill', error:'x-circle-fill', info:'info-circle-fill', warning:'exclamation-triangle-fill' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="bi bi-${icons[type]||'info-circle-fill'} toast-icon" style="color:${type==='success'?'#22c55e':type==='error'?'#ef4444':type==='warning'?'#f59e0b':'#3B7DD8'}"></i><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(() => t.remove(), dur);
}
window.toast = toast;

// ---- CONFIRM MODAL ----
let confirmCb = null;
function showConfirm(title, msg, cb, btnText='Hapus', btnClass='btn-danger') {
  confirmCb = cb;
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = msg;
  const btn = document.getElementById('confirmBtn');
  btn.textContent = btnText;
  btn.className = `btn ${btnClass}`;
  document.getElementById('confirmModal').classList.add('open');
}
function closeConfirm() { document.getElementById('confirmModal').classList.remove('open'); confirmCb = null; }
document.getElementById('confirmBtn').onclick = async () => { if(confirmCb) await confirmCb(); closeConfirm(); };
window.showConfirm = showConfirm;

// ---- HELPERS ----
window.API = API;
function fmtRp(n) { return 'Rp ' + Number(n||0).toLocaleString('id-ID'); }
function fmtDate(d) { if(!d) return '-'; return new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtPeriode(p) { if(!p) return '-'; const [y,m]=p.split('-'); const ms=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']; return (ms[parseInt(m)-1]||m)+' '+y; }
window.fmtRp = fmtRp; window.fmtDate = fmtDate; window.fmtPeriode = fmtPeriode;

async function apiFetch(url, opts={}) {
  const r = await fetch(API + url, { headers:{'Content-Type':'application/json'}, ...opts });
  const d = await r.json();
  return d;
}
window.apiFetch = apiFetch;

async function loadPendingBadge() {
  try {
    const d = await apiFetch('/php/api/registrations.php');
    const pend = Array.isArray(d) ? d.filter(r => r.status==='pending').length : 0;
    const b = document.getElementById('badge-reg');
    if(b) { b.textContent = pend; b.style.display = pend > 0 ? 'inline-flex' : 'none'; }
  } catch(e){}
}
window.loadPendingBadge = loadPendingBadge;

// ---- MODAL HELPER ----
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
window.openModal = openModal; window.closeModal = closeModal;


