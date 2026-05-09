// People page renderer

function el(html){ const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

function renderPI(){
  const pi = window.PI;
  const root = document.getElementById('pi-card');
  root.innerHTML = `
    <div class="pi-photo">
      <span class="pi-badge">PI · Director</span>
      <img src="${pi.img}" alt="${pi.name}" loading="lazy"/>
    </div>
    <div class="pi-text">
      <h3 class="pi-name"><a href="${pi.url}" target="_blank" rel="noopener">${pi.name}<span style="color:var(--accent)">↗</span></a></h3>
      <ul class="pi-titles">${pi.titles.map(t=>`<li>${t}</li>`).join('')}</ul>
      <p class="pi-bio">${pi.bio}</p>
    </div>
  `;
}

function personCard(p){
  const inner = `
    <div class="person-photo">${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'"/>` : ''}</div>
    <div class="person-arrow">↗</div>
    <h4 class="person-name">${p.name}</h4>
    <p class="person-meta">${p.role || p.dept || ''}</p>
  `;
  return p.url
    ? `<a class="person" href="${p.url}" target="_blank" rel="noopener">${inner}</a>`
    : `<div class="person">${inner}</div>`;
}

function renderGrid(id, list){
  const root = document.getElementById(id);
  root.innerHTML = list.map(personCard).join('');
}

function renderAlumni(tab){
  const list = tab === 'phd' ? window.ALUMNI_PHD : window.ALUMNI_POSTDOCS;
  const root = document.getElementById('alumni-list');
  root.innerHTML = list.map(a => `
    <div class="alumni-row">
      <span class="yr">${a.years}</span>
      <span class="nm">${a.url ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>` : a.name}</span>
      <span class="nt">${a.note}</span>
      <span class="ar">↗</span>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderPI();
  renderGrid('staff-grid', window.STAFF);
  renderGrid('phd-grid', window.PHDS);
  renderAlumni('phd');

  const total = window.STAFF.length + window.PHDS.length + 1;
  document.getElementById('member-count').textContent = `${total} active members · 50+ alumni`;

  document.querySelectorAll('.alumni-tab').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.alumni-tab').forEach(x => x.classList.toggle('active', x===b));
      renderAlumni(b.dataset.tab);
    });
  });
});
