document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Active nav link
  const path = window.location.pathname.replace(/\/$/, '');
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '');
    if (path.endsWith(href) || (href === 'index.html' && (path === '' || path.endsWith('/')))) {
      a.classList.add('active');
    }
  });

  // Group photo carousel
  const track = document.querySelector('.carousel-track');
  if (track) {
    const images = track.querySelectorAll('img');
    const dots = document.querySelectorAll('.carousel-dots button');
    let current = 0;

    function goTo(i) {
      current = ((i % images.length) + images.length) % images.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    document.querySelector('.carousel-btn.prev')?.addEventListener('click', () => goTo(current - 1));
    document.querySelector('.carousel-btn.next')?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    setInterval(() => goTo(current + 1), 5000);
  }

  // Research Topics category tabs
  const categoryTabs = document.querySelectorAll('.research-category-tab');
  const categoryPanels = document.querySelectorAll('.research-category-panel');

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      categoryPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById('panel-' + tab.dataset.category);
      if (panel) panel.classList.add('active');
    });
  });

  // "View Publications" buttons set topic filters and scroll to publications
  document.querySelectorAll('.view-pubs-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const topics = btn.dataset.topics.split(',').map(t => t.trim());
      if (typeof window.setTopicFilter === 'function') {
        window.setTopicFilter(topics);
      }
      const pubSection = document.getElementById('publications-section');
      if (pubSection) {
        pubSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
