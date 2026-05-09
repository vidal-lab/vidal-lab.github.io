// Research-page topic tabs and "View Publications" jump.
document.addEventListener('DOMContentLoaded', () => {
  const categoryTabs = document.querySelectorAll('.research-category-tab, .area-tab');

  function activateCategory(cat, opts) {
    const tab = Array.from(categoryTabs).find(t => t.dataset.category === cat);
    if (!tab) return false;
    const currentPanel = document.querySelector('.research-category-panel.active');
    const nextPanel = document.getElementById('panel-' + cat);
    if (currentPanel === nextPanel) return true;

    categoryTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    if (currentPanel) {
      currentPanel.style.opacity = '0';
      currentPanel.style.transform = 'translateY(-12px)';
      setTimeout(() => {
        currentPanel.classList.remove('active');
        currentPanel.style.opacity = '';
        currentPanel.style.transform = '';
        if (nextPanel) nextPanel.classList.add('active');
        if (opts && opts.scroll && tab.scrollIntoView) {
          tab.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
    } else if (nextPanel) {
      nextPanel.classList.add('active');
    }
    return true;
  }

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => activateCategory(tab.dataset.category));
  });

  function syncFromHash() {
    const m = (window.location.hash || '').match(/^#area-([a-z]+)$/);
    if (m) activateCategory(m[1], { scroll: true });
  }
  syncFromHash();
  window.addEventListener('hashchange', syncFromHash);

  document.querySelectorAll('.view-pubs-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const topics = btn.dataset.topics.split(',').map(t => t.trim());
      if (typeof window.setTopicFilter === 'function') {
        window.setTopicFilter(topics);
      }
      const pubSection = document.getElementById('publications-section');
      if (pubSection) {
        pubSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        pubSection.classList.remove('highlight');
        void pubSection.offsetHeight;
        pubSection.classList.add('highlight');
        pubSection.addEventListener('animationend', () => pubSection.classList.remove('highlight'), { once: true });
      }
    });
  });
});
