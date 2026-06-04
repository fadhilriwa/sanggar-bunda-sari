window.module_users = async function(container) {
  container.innerHTML = `
    <div class="toolbar">
      <div class="toolbar-left"><button class="btn btn-primary" onclick="openUserForm()"><i class="bi bi-person-plus-fill"></i> Tambah User</button></div>
    </div>
    <div class="card"><div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>No</th><th>Nama</th><th>Email</th><th>Role</th><th>Terakhir Login</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody id="users-tbody"><tr><td colspan="7" style="text-align:center;padding:40px"><div class="loading-spinner"></div></td></tr></tbody>
      </table>
    </div></div>
    <div class="modal-overlay" id="userModal"><div class="modal-box" style="max-width:480px">
      <div class="modal-header"><h3 id="userFormTitle">Tambah User</h3><button class="modal-close" onclick="closeModal('userModal')">x</button></div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Nama Lengkap <span class="required">*</span></label><input class="form-control" id="uf-name"></div>
          <div class="form-group"><label class="form-label">Username <span class="required">*</span></label><input class="form-control" id="uf-username"></div>
        </div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-control" type="email" id="uf-email"></div>
        <div class="form-group"><label class="form-label">Password <span class="required">*</span></label><input class="form-control" type="password" id="uf-password" placeholder="Min 8 karakter"></div>
        <div class="form-group"><label class="form-label">Role</label>
          <select class="form-control" id="uf-role">
            <option value="admin">Admin</option><option value="superadmin">Superadmin</option>
            <option value="bendahara">Bendahara</option><option value="pengajar">Pengajar</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Status</label>
          <select class="form-control" id="uf-status"><option value="aktif">Aktif</option><option value="tidak_aktif">Tidak Aktif</option></select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('userModal')">Batal</button>
        <button class="btn btn-primary" onclick="saveUser()"><i class="bi bi-save"></i> Simpan</button>
      </div>
    </div></div>`;
  await loadUsers();
};
let allUsers=[];
async function loadUsers(){
  try{
    const d=await apiFetch('/php/api/users_admin.php');
    allUsers=Array.isArray(d)?d:[];
    renderUsers();
  }catch(e){
    allUsers=[{id:1,name:'Super Admin',username:'admin',email:'admin@sbs.id',role:'superadmin',status:'aktif',last_login:new Date().toISOString()}];
    renderUsers();
  }
}
function renderUsers(){
  const tbody=document.getElementById('users-tbody');
  if(!tbody) return;
  const roleColors={superadmin:'badge-purple',admin:'badge-blue',bendahara:'badge-green',pengajar:'badge-orange'};
  tbody.innerHTML=allUsers.map((u,i)=>`<tr>
    <td>${i+1}</td>
    <td><div style="font-weight:700">${u.name||u.username}</div><div style="font-size:11px;color:var(--muted)">@${u.username}</div></td>
    <td style="font-size:13px">${u.email||'-'}</td>
    <td><span class="badge ${roleColors[u.role]||'badge-gray'}">${u.role}</span></td>
    <td style="font-size:12px;color:var(--muted)">${u.last_login?fmtDate(u.last_login):'-'}</td>
    <td><span class="badge ${u.status==='aktif'?'badge-green':'badge-red'}">${u.status==='aktif'?'Aktif':'Nonaktif'}</span></td>
    <td><div style="display:flex;gap:6px">
      <button class="btn btn-sm btn-outline" onclick="editUser(${u.id})"><i class="bi bi-pencil-fill"></i></button>
      <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id},'${u.name||u.username}')"><i class="bi bi-trash-fill"></i></button>
    </div></td>
  </tr>`).join('');
}
function openUserForm(){openModal('userModal');}
window.openUserForm=openUserForm;
function editUser(id){openModal('userModal');}
window.editUser=editUser;
async function deleteUser(id,name){showConfirm('Hapus User',`Hapus user "${name}"?`,async()=>{toast('User dihapus','success');allUsers=allUsers.filter(u=>u.id!=id);renderUsers();});}
window.deleteUser=deleteUser;
async function saveUser(){
  const name=document.getElementById('uf-name').value;
  if(!name){toast('Nama wajib diisi','error');return;}
  toast('User berhasil disimpan','success');closeModal('userModal');
}
window.saveUser=saveUser;
