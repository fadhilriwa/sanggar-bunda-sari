// =====================================================
// MODULE: Analisis Apriori
// =====================================================
window.module_apriori = async function(container) {
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:300px 1fr;gap:20px">
      <!-- CONFIG PANEL -->
      <div>
        <div class="card">
          <div class="card-header"><span class="card-title"><i class="bi bi-sliders"></i> Parameter Algoritma</span></div>
          <div class="card-body">
            <div class="slider-group">
              <div class="slider-label"><span>Minimum Support</span><span class="slider-value" id="sv-support">30%</span></div>
              <input type="range" id="sl-support" min="5" max="90" value="30" step="5" oninput="document.getElementById('sv-support').textContent=this.value+'%'">
              <div style="font-size:11px;color:var(--muted);margin-top:4px">% transaksi yang mengandung kombinasi ini</div>
            </div>
            <div class="slider-group">
              <div class="slider-label"><span>Minimum Confidence</span><span class="slider-value" id="sv-conf">70%</span></div>
              <input type="range" id="sl-conf" min="10" max="99" value="70" step="5" oninput="document.getElementById('sv-conf').textContent=this.value+'%'">
              <div style="font-size:11px;color:var(--muted);margin-top:4px">% probabilitas A ? B terjadi bersamaan</div>
            </div>
            <div class="slider-group">
              <div class="slider-label"><span>Minimum Lift</span><span class="slider-value" id="sv-lift">1.0</span></div>
              <input type="range" id="sl-lift" min="10" max="30" value="10" step="1" oninput="document.getElementById('sv-lift').textContent=(this.value/10).toFixed(1)">
              <div style="font-size:11px;color:var(--muted);margin-top:4px">Harus > 1 agar asosiasi bermakna</div>
            </div>
            <div class="divider"></div>
            <button class="btn btn-primary" onclick="runApriori()" style="width:100%;justify-content:center"><i class="bi bi-cpu-fill"></i> Jalankan Analisis</button>
            <button class="btn btn-outline" onclick="exportAprioriRules()" style="width:100%;justify-content:center;margin-top:8px"><i class="bi bi-file-earmark-excel"></i> Export Hasil</button>
          </div>
        </div>
        <!-- RIWAYAT -->
        <div class="card" style="margin-top:16px">
          <div class="card-header"><span class="card-title"><i class="bi bi-clock-history"></i> Riwayat Analisis</span></div>
          <div id="apriori-history" style="max-height:300px;overflow-y:auto"></div>
        </div>
        <!-- REKOMENDASI FINDER -->
        <div class="card" style="margin-top:16px">
          <div class="card-header"><span class="card-title"><i class="bi bi-search-heart"></i> Cari Rekomendasi</span></div>
          <div class="card-body">
            <div class="form-group"><label class="form-label">Program yang dipilih:</label>
              <div id="rec-finder-checks" style="display:flex;flex-direction:column;gap:6px"></div>
            </div>
            <button class="btn btn-blue" onclick="findRecs()" style="width:100%;justify-content:center"><i class="bi bi-magic"></i> Cari Rekomendasi</button>
            <div id="rec-finder-result" style="margin-top:12px"></div>
          </div>
        </div>
      </div>
      <!-- RESULTS -->
      <div>
        <div id="apriori-results-area">
          <div class="empty-state" style="padding:60px">
            <i class="bi bi-cpu" style="font-size:48px;color:var(--sage);opacity:.4;display:block;margin-bottom:12px"></i>
            <p style="font-size:15px;font-weight:600;color:var(--text-2)">Belum ada hasil analisis</p>
            <p style="font-size:13px">Atur parameter dan klik "Jalankan Analisis"</p>
          </div>
        </div>
      </div>
    </div>
  `;
  await loadAprioriHistory();
  await loadRecFinderClasses();
};

async function loadAprioriHistory(){
  const el=document.getElementById('apriori-history');
  if(!el) return;
  try{
    const d=await apiFetch('/php/api/apriori_analysis.php?action=history');
    const h=Array.isArray(d)?d:(d.history||[]);
    if(!h.length){el.innerHTML='<div style="padding:16px;font-size:13px;color:var(--muted);text-align:center">Belum ada riwayat</div>';return;}
    el.innerHTML=h.slice(0,10).map((r,i)=>`
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer" onclick="loadHistoryResult(${i})" class="hover-bg">
        <div style="font-size:13px;font-weight:600">${fmtDate(r.run_at)} - ${r.total_rules||0} rules</div>
        <div style="font-size:11px;color:var(--muted)">Sup:${r.min_support} Conf:${r.min_confidence} | ${r.total_transactions||0} transaksi</div>
      </div>`).join('');
  }catch(e){el.innerHTML='<div style="padding:16px;font-size:13px;color:var(--muted)">Gagal memuat riwayat</div>';}
}

async function loadRecFinderClasses(){
  const el=document.getElementById('rec-finder-checks');
  if(!el) return;
  try{
    const d=await apiFetch('/php/api/classes.php');
    const cats=[...new Set((Array.isArray(d)?d:[]).map(c=>c.category))];
    el.innerHTML=cats.map(cat=>`<div style="font-size:11px;font-weight:700;color:var(--muted);margin:4px 0">${cat}</div>`+
      (Array.isArray(d)?d:[]).filter(c=>c.category===cat).map(c=>`<label style="display:flex;gap:8px;align-items:center;font-size:13px;cursor:pointer"><input type="checkbox" name="rec-class" value="${c.id}"> ${c.name}</label>`).join('')).join('');
  }catch(e){}
}

async function findRecs(){
  const checks=Array.from(document.querySelectorAll('input[name="rec-class"]:checked')).map(c=>c.value);
  const el=document.getElementById('rec-finder-result');
  if(!checks.length){el.innerHTML='<div style="font-size:13px;color:var(--muted)">Pilih setidaknya 1 program</div>';return;}
  el.innerHTML='<div class="loading-spinner" style="margin:12px auto"></div>';
  try{
    const d=await apiFetch(`/php/api/recommendations.php?classes=${checks.join(',')}`);
    const recs=Array.isArray(d)?d:(d.recommendations||[]);
    if(!recs.length){el.innerHTML='<div style="font-size:13px;color:var(--muted);text-align:center;padding:12px">Tidak ada rekomendasi ditemukan</div>';return;}
    el.innerHTML=`<div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px">REKOMENDASI:</div>`+
      recs.slice(0,5).map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#f8faf9;border-radius:8px;margin-bottom:6px">
        <div><div style="font-size:13px;font-weight:600">${r.class_name||'Kelas #'+r.class_id}</div><div style="font-size:11px;color:var(--muted)">Confidence: ${Math.round((r.confidence||0)*100)}%</div></div>
        <div style="width:48px;height:48px;border-radius:50%;background:${r.confidence>.8?'#dcfce7':r.confidence>.6?'#fef9c3':'#fee2e2'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:${r.confidence>.8?'#16a34a':r.confidence>.6?'#ca8a04':'#dc2626'}">${Math.round((r.confidence||0)*100)}%</div>
      </div>`).join('');
  }catch(e){el.innerHTML='<div style="font-size:13px;color:var(--muted)">Jalankan analisis terlebih dahulu</div>';}
}
window.findRecs=findRecs;

async function runApriori(){
  const sup=document.getElementById('sl-support').value/100;
  const conf=document.getElementById('sl-conf').value/100;
  const lift=document.getElementById('sl-lift').value/10;
  const area=document.getElementById('apriori-results-area');
  area.innerHTML='<div style="text-align:center;padding:48px"><div class="loading-spinner"></div><p style="margin-top:12px;color:var(--muted)">Menjalankan algoritma Apriori...</p></div>';
  try{
    const d=await apiFetch('/php/api/apriori_analysis.php',{method:'POST',body:JSON.stringify({min_support:sup,min_confidence:conf,min_lift:lift})});
    const rules=d.rules||[];
    const sets=d.frequent_itemsets||{};
    const total=d.total_transactions||0;
    if(!rules.length){
      area.innerHTML='<div class="empty-state" style="padding:48px"><i class="bi bi-exclamation-circle" style="font-size:36px;color:var(--orange)"></i><p style="margin-top:8px">Tidak ada association rules ditemukan</p><p style="font-size:12px">Coba turunkan nilai minimum support atau confidence</p></div>';
      return;
    }
    area.innerHTML=`
      <!-- SUMMARY -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
        <div class="card" style="margin:0"><div class="card-body" style="text-align:center">
          <div style="font-size:28px;font-weight:800;color:var(--sage)">${total}</div><div style="font-size:12px;color:var(--muted)">Total Transaksi</div></div></div>
        <div class="card" style="margin:0"><div class="card-body" style="text-align:center">
          <div style="font-size:28px;font-weight:800;color:var(--blue)">${Object.values(sets).flat().length}</div><div style="font-size:12px;color:var(--muted)">Frequent Itemsets</div></div></div>
        <div class="card" style="margin:0"><div class="card-body" style="text-align:center">
          <div style="font-size:28px;font-weight:800;color:var(--orange)">${rules.length}</div><div style="font-size:12px;color:var(--muted)">Association Rules</div></div></div>
      </div>
      <!-- FREQUENT ITEMSETS -->
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><span class="card-title"><i class="bi bi-collection-fill"></i> Frequent Itemsets</span></div>
        <div class="card-body">
          ${Object.entries(sets).map(([level,items])=>`
            <div style="margin-bottom:14px">
              <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px">${level}-ITEMSET</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${Object.values(items||{}).map(item=>`
                  <div style="padding:8px 14px;background:var(--sage-subtle);border-radius:8px;font-size:13px">
                    <span style="font-weight:700">{${Array.isArray(item.items)?item.items.join(', '):item.items}}</span>
                    <span style="color:var(--sage);margin-left:8px">${Math.round((item.support||0)*100)}%</span>
                    <span style="color:var(--muted);font-size:11px;margin-left:4px">(${item.count||0} siswa)</span>
                  </div>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>
      <!-- RULES TABLE -->
      <div class="card">
        <div class="card-header">
          <span class="card-title"><i class="bi bi-arrow-left-right"></i> Association Rules (${rules.length})</span>
          <div style="display:flex;gap:8px">
            <select class="form-control" id="sort-rules" onchange="sortAprioriRules()" style="width:140px;font-size:12px">
              <option value="confidence">Sort: Confidence</option><option value="support">Sort: Support</option><option value="lift">Sort: Lift</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table" id="rules-table">
            <thead><tr><th>IF (Antecedent)</th><th>THEN (Consequent)</th><th>Support</th><th>Confidence</th><th>Lift</th><th>Kekuatan</th></tr></thead>
            <tbody id="rules-tbody">${renderRulesRows(rules)}</tbody>
          </table>
        </div>
      </div>`;
    window._aprioriRules=rules;
    await loadAprioriHistory();
    toast('Analisis Apriori berhasil! '+rules.length+' rules ditemukan','success');
  }catch(e){area.innerHTML='<div class="empty-state" style="padding:48px"><i class="bi bi-x-circle"></i><p>Gagal menjalankan analisis: '+e.message+'</p></div>';toast('Gagal analisis','error');}
}
window.runApriori=runApriori;

function renderRulesRows(rules){
  return rules.map(r=>{
    const conf=Math.round((r.confidence||0)*100);
    const sup=Math.round((r.support||0)*100);
    const lift=parseFloat(r.lift||0).toFixed(2);
    const strong=r.lift>1.5;
    const ant=Array.isArray(r.antecedent)?r.antecedent.join(' + '):r.antecedent;
    const con=Array.isArray(r.consequent)?r.consequent.join(' + '):r.consequent;
    return `<tr class="rule-row${strong?' strong':''}">
      <td><span style="font-weight:700">{${ant}}</span></td>
      <td>? <span style="font-weight:700;color:var(--sage)">{${con}}</span></td>
      <td><span class="badge badge-blue">${sup}%</span></td>
      <td><div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:6px;background:var(--border);border-radius:3px"><div style="width:${conf}%;height:100%;background:var(--sage);border-radius:3px"></div></div>
        <span style="font-weight:700;font-size:13px">${conf}%</span></div></td>
      <td><span style="font-weight:700;color:${lift>1.5?'#16a34a':lift>1.2?'var(--orange)':'var(--text)'}">${lift}</span></td>
      <td>${strong?'<span class="badge badge-green">?? Kuat</span>':'<span class="badge badge-gray">Normal</span>'}</td>
    </tr>`;
  }).join('');
}

function sortAprioriRules(){
  if(!window._aprioriRules) return;
  const by=document.getElementById('sort-rules').value;
  const sorted=[...window._aprioriRules].sort((a,b)=>(b[by]||0)-(a[by]||0));
  document.getElementById('rules-tbody').innerHTML=renderRulesRows(sorted);
}
window.sortAprioriRules=sortAprioriRules;

function exportAprioriRules(){ toast('Fitur export dalam pengembangan','info'); }
window.exportAprioriRules=exportAprioriRules;
