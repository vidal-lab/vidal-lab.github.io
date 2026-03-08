document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('publications-container');
  const tabsContainer = document.getElementById('topic-tabs');
  const countEl = document.getElementById('pub-count');
  if (!container) return;

  let data;
  try {
    const resp = await fetch('assets/data/publications.json');
    data = await resp.json();
  } catch (e) {
    container.innerHTML = '<p>Error loading publications.</p>';
    return;
  }

  const ITEMS_PER_PAGE = 50;
  let selectedTopics = new Set();
  let currentPage = 1;

  function renderTabs() {
    const allTopics = ['All', ...data.topics];
    const isAll = selectedTopics.size === 0;
    tabsContainer.innerHTML = allTopics.map(t => {
      const active = t === 'All' ? isAll : selectedTopics.has(t);
      return `<button class="topic-tab${active ? ' active' : ''}" data-topic="${t}">${t}</button>`;
    }).join('');

    tabsContainer.querySelectorAll('.topic-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const topic = btn.dataset.topic;
        if (topic === 'All') {
          selectedTopics.clear();
        } else {
          if (selectedTopics.has(topic)) {
            selectedTopics.delete(topic);
          } else {
            selectedTopics.add(topic);
          }
        }
        currentPage = 1;
        renderTabs();
        renderPublications();
      });
    });
  }

  function getFiltered() {
    if (selectedTopics.size === 0) return data.publications;
    return data.publications.filter(p => {
      if (!p.keywords) return false;
      const kw = p.keywords.split(',').map(k => k.trim().toLowerCase());
      return [...selectedTopics].some(t => kw.includes(t.toLowerCase()));
    });
  }

  function renderPublications() {
    const filtered = getFiltered();
    countEl.textContent = `Showing ${filtered.length} publication${filtered.length !== 1 ? 's' : ''}`;

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    const byYear = {};
    pageItems.forEach(p => {
      const year = p.year || 'Unknown';
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(p);
    });

    const years = Object.keys(byYear).sort((a, b) => b - a);

    let html = '';
    years.forEach(year => {
      html += `<div class="pub-year-group"><h3>${year}</h3>`;
      byYear[year].forEach(p => {
        const venue = p.journal || p.booktitle || '';
        const links = [];
        if (p.bib2html_dl_pdf) links.push(`<a href="${p.bib2html_dl_pdf}" target="_blank">PDF</a>`);
        if (p.bib2html_dl_html) links.push(`<a href="${p.bib2html_dl_html}" target="_blank">Link</a>`);
        if (p.url) links.push(`<a href="${p.url}" target="_blank">URL</a>`);
        if (p.doi) links.push(`<a href="https://doi.org/${p.doi}" target="_blank">DOI</a>`);

        const typeLabel = p.bib2html_pubtype || p.type || '';

        html += `<div class="pub-entry">
          <div class="pub-title">${p.title || ''}${typeLabel ? `<span class="pub-type-badge">${typeLabel}</span>` : ''}</div>
          <div class="pub-authors">${p.author || ''}</div>
          <div class="pub-venue">${venue}${p.volume ? `, vol. ${p.volume}` : ''}${p.pages ? `, pp. ${p.pages}` : ''}${p.year ? `, ${p.year}` : ''}</div>
          ${links.length ? `<div class="pub-links">${links.join('')}</div>` : ''}
        </div>`;
      });
      html += '</div>';
    });

    if (totalPages > 1) {
      html += '<div class="pagination">';
      if (currentPage > 1) html += `<button data-page="${currentPage - 1}">&laquo; Prev</button>`;
      for (let i = 1; i <= totalPages; i++) {
        html += `<button data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
      }
      if (currentPage < totalPages) html += `<button data-page="${currentPage + 1}">Next &raquo;</button>`;
      html += '</div>';
    }

    container.innerHTML = html;

    container.querySelectorAll('.pagination button').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        renderPublications();
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  renderTabs();
  renderPublications();
});
