// Research-page topic tabs and "View Publications" jump.
document.addEventListener('DOMContentLoaded', () => {
  const categoryTabs = document.querySelectorAll('.research-category-tab');

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const currentPanel = document.querySelector('.research-category-panel.active');
      const nextPanel = document.getElementById('panel-' + tab.dataset.category);
      if (currentPanel === nextPanel) return;

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
        }, 250);
      } else if (nextPanel) {
        nextPanel.classList.add('active');
      }
    });
  });

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
