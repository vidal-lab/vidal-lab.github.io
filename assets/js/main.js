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

  // Hero banner slideshow
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 1) {
    let heroIdx = 0;
    setInterval(() => {
      heroSlides[heroIdx].classList.remove('active');
      heroIdx = (heroIdx + 1) % heroSlides.length;
      heroSlides[heroIdx].classList.add('active');
    }, 5000);
  }

  // Carousels (project highlights, group photos)
  document.querySelectorAll('.carousel-track').forEach(track => {
    const root = track.closest('.project-carousel, .group-carousel') || track.parentElement;
    const dots = root.querySelectorAll('.carousel-dots button');
    const count =
      track.querySelectorAll('.project-slide').length ||
      track.querySelectorAll('.carousel-slide').length ||
      track.querySelectorAll(':scope > img').length;
    if (!count) return;

    let current = 0;
    function goTo(i) {
      current = ((i % count) + count) % count;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    root.querySelector('.carousel-btn.prev')?.addEventListener('click', () => goTo(current - 1));
    root.querySelector('.carousel-btn.next')?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    setInterval(() => goTo(current + 1), 6000);
  });

  // Research Topics category tabs
  const categoryTabs = document.querySelectorAll('.research-category-tab');
  const categoryPanels = document.querySelectorAll('.research-category-panel');

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
          if (nextPanel) {
            nextPanel.classList.add('active');
            // Re-trigger item animations
            nextPanel.querySelectorAll('.research-topic-item').forEach(item => {
              item.style.animation = 'none';
              item.offsetHeight; // force reflow
              item.style.animation = '';
            });
          }
        }, 250);
      } else if (nextPanel) {
        nextPanel.classList.add('active');
      }
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
        pubSection.classList.remove('highlight');
        void pubSection.offsetHeight;
        pubSection.classList.add('highlight');
        pubSection.addEventListener('animationend', () => pubSection.classList.remove('highlight'), { once: true });
      }
    });
  });
});
