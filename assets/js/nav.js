// Shared nav: scrolled state, More dropdown, active highlight
(function(){
  function init(){
    const nav = document.getElementById('nav');
    if(nav){
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    const more = document.querySelector('.nav-more');
    if(more){
      const btn = more.querySelector('.nav-more-btn');
      if(btn){
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const open = !more.classList.contains('open');
          more.classList.toggle('open', open);
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
      document.addEventListener('click', (e) => {
        if(!more.contains(e.target)){
          more.classList.remove('open');
          if(btn) btn.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
          more.classList.remove('open');
          if(btn) btn.setAttribute('aria-expanded', 'false');
        }
      });
      more.querySelectorAll('a').forEach(a => a.addEventListener('click', () => more.classList.remove('open')));
    }

    const key = document.body.dataset.page;
    if(key){
      const link = document.querySelector(`.nav-links [data-key="${key}"]`);
      if(link){
        link.classList.add('active');
        if(link.closest('.nav-more-menu') && more){
          more.classList.add('has-active');
        }
      }
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
