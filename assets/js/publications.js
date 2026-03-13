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

  // Assign a distinct color to each topic
  const TOPIC_COLORS = {};
  const palette = [
    { bg: '#dbeafe', fg: '#1e40af' },  // blue
    { bg: '#fce7f3', fg: '#9d174d' },  // pink
    { bg: '#d1fae5', fg: '#065f46' },  // green
    { bg: '#fef3c7', fg: '#92400e' },  // amber
    { bg: '#ede9fe', fg: '#5b21b6' },  // violet
    { bg: '#ffedd5', fg: '#9a3412' },  // orange
    { bg: '#e0e7ff', fg: '#3730a3' },  // indigo
    { bg: '#ccfbf1', fg: '#115e59' },  // teal
    { bg: '#fce4ec', fg: '#880e4f' },  // rose
    { bg: '#f3e8ff', fg: '#6b21a8' },  // purple
    { bg: '#e8f5e9', fg: '#1b5e20' },  // light green
    { bg: '#fff8e1', fg: '#f57f17' },  // yellow
    { bg: '#e3f2fd', fg: '#0d47a1' },  // light blue
    { bg: '#fbe9e7', fg: '#bf360c' },  // deep orange
    { bg: '#f1f8e9', fg: '#33691e' },  // lime
    { bg: '#e8eaf6', fg: '#283593' },  // deep indigo
    { bg: '#fff3e0', fg: '#e65100' },  // orange2
    { bg: '#e0f2f1', fg: '#004d40' },  // dark teal
    { bg: '#fce4ec', fg: '#ad1457' },  // magenta
    { bg: '#f3e5f5', fg: '#6a1b9a' },  // deep purple
    { bg: '#e1f5fe', fg: '#01579b' },  // cyan
  ];
  data.topics.forEach((topic, i) => {
    TOPIC_COLORS[topic.toLowerCase()] = palette[i % palette.length];
  });

  function getTopicBadge(topic) {
    const color = TOPIC_COLORS[topic.toLowerCase()] || { bg: '#f3f4f6', fg: '#374151' };
    return `<span class="pub-tag" style="background:${color.bg};color:${color.fg}" data-topic="${topic}">${topic}</span>`;
  }

  function renderTabs() {
    const allTopics = ['All', ...data.topics];
    const isAll = selectedTopics.size === 0;
    tabsContainer.innerHTML = allTopics.map(t => {
      const active = t === 'All' ? isAll : selectedTopics.has(t);
      const color = TOPIC_COLORS[t.toLowerCase()];
      let style = '';
      if (active && t !== 'All' && color) {
        style = ` style="background:${color.bg};color:${color.fg};border-color:${color.bg}"`;
      } else if (active && t === 'All') {
        style = '';
      }
      return `<button class="topic-tab${active ? ' active' : ''}" data-topic="${t}"${style}>${t}</button>`;
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

        const kwTags = p.keywords
          ? p.keywords.split(',').map(k => k.trim()).filter(Boolean).map(k => getTopicBadge(k)).join('')
          : '';

        html += `<div class="pub-entry">
          <div class="pub-title">${p.title || ''}${typeLabel ? `<span class="pub-type-badge">${typeLabel}</span>` : ''}</div>
          <div class="pub-authors">${p.author || ''}</div>
          <div class="pub-venue">${venue}${p.volume ? `, vol. ${p.volume}` : ''}${p.pages ? `, pp. ${p.pages}` : ''}${p.year ? `, ${p.year}` : ''}</div>
          ${kwTags ? `<div class="pub-tags">${kwTags}</div>` : ''}
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

    container.classList.add('fade-out');
    setTimeout(() => {
      container.innerHTML = html;
      container.classList.remove('fade-out');

      container.querySelectorAll('.pub-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const topic = tag.dataset.topic;
          selectedTopics.clear();
          selectedTopics.add(topic);
          currentPage = 1;
          renderTabs();
          renderPublications();
          tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      container.querySelectorAll('.pagination button').forEach(btn => {
        btn.addEventListener('click', () => {
          currentPage = parseInt(btn.dataset.page);
          renderPublications();
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }, 150);
  }

  window.setTopicFilter = function(topics) {
    selectedTopics.clear();
    topics.forEach(t => selectedTopics.add(t));
    currentPage = 1;
    renderTabs();
    renderPublications();
  };

  renderTabs();
  renderPublications();
});
