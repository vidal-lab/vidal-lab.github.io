// Shared sub-page chrome — handles nav scrolled state, dropdown, and active tab highlight.
(function(){
  const nav = document.getElementById('nav');
  if(nav){
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const more = document.querySelector('.nav-more');
  if(more){
    const btn = more.querySelector('.nav-more-btn');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = more.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if(!more.contains(e.target)){ more.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
    });
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){ more.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
    });
    more.querySelectorAll('a').forEach(a => a.addEventListener('click', () => more.classList.remove('open')));
  }

  // Active tab from <body data-page="key">
  const key = document.body.dataset.page;
  if(key){
    const link = document.querySelector(`.nav-links [data-key="${key}"]`);
    if(link){
      link.classList.add('active');
      // if it's inside the More menu, also style the More button
      if(link.closest('.nav-more-menu')){
        more.classList.add('has-active');
      }
    }
  }
})();
