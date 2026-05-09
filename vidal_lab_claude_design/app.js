/* ────────────────────────  NAV scroll state  ──────────────────────── */
const nav = document.getElementById('nav');
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 12);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* nav More dropdown */
(function(){
  const more = document.querySelector('.nav-more');
  if(!more) return;
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
})();

/* ────────────────────────  CLOCK  ──────────────────────── */
const clockEl = document.getElementById('clock');
function tickClock(){
  const now = new Date();
  // Philadelphia is UTC-5 / -4. Approximate via locale.
  const t = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit', timeZone:'America/New_York', hour12:false});
  clockEl.textContent = t + ' EST';
}
tickClock(); setInterval(tickClock, 1000);

/* ────────────────────────  WORD ROTATOR  ──────────────────────── */
(function(){
  const el = document.querySelector('.rot');
  if(!el) return;
  const words = JSON.parse(el.dataset.words);
  let i = 0;
  setInterval(() => {
    el.classList.add('out');
    setTimeout(() => {
      i = (i+1) % words.length;
      el.textContent = words[i];
      el.classList.remove('out');
      el.classList.add('in');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.remove('in'));
      });
    }, 450);
  }, 2400);
})();

/* ────────────────────────  COUNTERS  ──────────────────────── */
(function(){
  const counters = document.querySelectorAll('.num');
  const animate = (el) => {
    const target = +el.dataset.count;
    const duration = 1400;
    const start = performance.now();
    const pad = String(target).length >= 2;
    function step(now){
      const t = Math.min(1, (now - start)/duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(target * eased);
      el.textContent = pad ? String(v).padStart(2,'0') : String(v);
      if(t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
      if(e.isIntersecting){ animate(e.target); io.unobserve(e.target); }
    });
  },{threshold: 0.4});
  counters.forEach(c => io.observe(c));
})();

/* ────────────────────────  REVEAL on scroll  ──────────────────────── */
(function(){
  // mark common targets
  document.querySelectorAll('.section-head, .pillar, .pub, .hl-stage, .cta-inner, .about-grid, .affiliations').forEach(el => el.setAttribute('data-reveal',''));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  },{threshold: 0.12});
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
})();

/* ────────────────────────  TICKER seamless loop  ──────────────────────── */
(function(){
  const track = document.getElementById('ticker-track');
  if(!track) return;
  const row = track.querySelector('.ticker-row');
  const clone = row.cloneNode(true);
  track.appendChild(clone);
})();

/* ────────────────────────  HERO FLOW FIELD  ────────────────────────
   A vector-field / particle flow representing dynamics + learning.
*/
(function(){
  const cv = document.getElementById('flow');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, DPR;
  const N = 140;
  const particles = [];
  let t = 0;

  function resize(){
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  function reset(p){
    p.x = Math.random()*W;
    p.y = Math.random()*H;
    p.l = 0;
    p.life = 60 + Math.random()*180;
  }
  function init(){
    resize();
    particles.length = 0;
    for(let i=0;i<N;i++){
      const p = {};
      reset(p);
      particles.push(p);
    }
  }
  // pseudo-curl flow field
  function field(x, y, time){
    const sx = x * 0.0035;
    const sy = y * 0.0035;
    const a = Math.sin(sx + time*0.0006) + Math.cos(sy*1.2 - time*0.0004);
    const b = Math.cos(sx*1.4 - time*0.0005) + Math.sin(sy + time*0.0003);
    const ang = Math.atan2(b, a);
    return ang;
  }
  function draw(){
    t++;
    // fade trails
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0,0,W,H);

    for(const p of particles){
      const ang = field(p.x, p.y, t);
      const speed = 0.7 + 0.4*Math.sin(t*0.01 + p.x*0.01);
      const nx = p.x + Math.cos(ang)*speed;
      const ny = p.y + Math.sin(ang)*speed;

      // color along curve: reddish when fast, navy when slow
      const k = (Math.sin(ang)+1)/2;
      const col = k > 0.5
        ? `rgba(153, 0, 0, ${0.10 + k*0.18})`
        : `rgba(1, 31, 91, ${0.10 + (1-k)*0.20})`;

      ctx.strokeStyle = col;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(nx, ny);
      ctx.stroke();

      p.x = nx; p.y = ny; p.l++;
      if(p.l > p.life || p.x < -10 || p.x > W+10 || p.y < -10 || p.y > H+10){
        reset(p);
      }
    }
    raf = requestAnimationFrame(draw);
  }

  let raf;
  init();
  draw();
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); init(); draw(); });
})();

/* ────────────────────────  HIGHLIGHT CAROUSEL  ──────────────────────── */
(function(){
  const stage = document.getElementById('hl-stage');
  const cards = document.getElementById('hl-cards');
  const dots = document.getElementById('hl-dots');
  const cur = stage.querySelector('.cur');
  const tot = stage.querySelector('.tot');
  const data = window.HIGHLIGHTS || [];
  let idx = 0;
  let timer;

  tot.textContent = String(data.length).padStart(2,'0');

  // build cards
  data.forEach((d, i) => {
    const card = document.createElement('article');
    card.className = 'hl-card' + (i===0?' active':'');
    card.innerHTML = `
      <div class="hl-text">
        <div class="hl-tag">${d.venue}</div>
        <h3 class="hl-title">${d.title}</h3>
        ${d.sub ? `<p class="hl-sub">${d.sub}</p>` : ''}
        <p class="hl-authors">${d.authors.map((a,j)=>{
          const last = a==='René Vidal';
          return last ? `<b>${a}</b>` : a;
        }).join(', ')}</p>
        <p class="hl-desc">${d.desc}</p>
        <div class="hl-actions">
          ${d.project ? `<a class="btn btn-primary" href="${d.project}" target="_blank" rel="noopener">Project page <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M9 7h8v8"/></svg></a>` : ''}
          ${d.paper ? `<a class="btn btn-ghost" href="${d.paper}" target="_blank" rel="noopener">Read paper</a>` : ''}
        </div>
      </div>
      <div class="hl-visual">
        <canvas data-motif="${d.motif}" data-c1="${d.palette[0]}" data-c2="${d.palette[1]}"></canvas>
        <div class="hl-meta">
          <span>${String(i+1).padStart(2,'0')} / ${String(data.length).padStart(2,'0')}</span>
          <span>${d.venue}</span>
        </div>
      </div>
    `;
    cards.appendChild(card);

    const dot = document.createElement('button');
    dot.className = 'd' + (i===0?' active':'');
    dot.setAttribute('aria-label', `Highlight ${i+1}`);
    dot.addEventListener('click', () => go(i));
    dots.appendChild(dot);
  });

  // initialize visual canvases
  setTimeout(initVisuals, 50);

  function go(n){
    idx = (n + data.length) % data.length;
    cards.querySelectorAll('.hl-card').forEach((c,i)=> c.classList.toggle('active', i===idx));
    dots.querySelectorAll('.d').forEach((c,i)=> c.classList.toggle('active', i===idx));
    cur.textContent = String(idx+1).padStart(2,'0');
    restart();
  }

  document.querySelectorAll('.hl-btn').forEach(b => {
    b.addEventListener('click', () => go(idx + (+b.dataset.dir)));
  });

  function restart(){ clearInterval(timer); timer = setInterval(()=> go(idx+1), 6000); }
  restart();

  function initVisuals(){
    document.querySelectorAll('.hl-visual canvas').forEach(cv => drawMotif(cv));
    window.addEventListener('resize', () => {
      document.querySelectorAll('.hl-visual canvas').forEach(cv => drawMotif(cv));
    });
  }

  function drawMotif(cv){
    const ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w*dpr; cv.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const motif = cv.dataset.motif;
    const c1 = cv.dataset.c1, c2 = cv.dataset.c2;

    if(motif === 'lattice') drawLattice(ctx, w, h, c1, c2);
    else if(motif === 'wave') drawWave(ctx, w, h, c1, c2);
    else drawNoise(ctx, w, h, c1, c2);
  }

  function drawLattice(ctx, w, h, c1, c2){
    const cx = w/2, cy = h/2;
    const N = 14;
    ctx.translate(cx, cy);
    for(let i=0;i<N;i++){
      ctx.rotate(Math.PI*2/N);
      ctx.beginPath();
      for(let r=20;r<Math.max(w,h);r+=22){
        ctx.lineTo(r, Math.sin(r*0.05 + i*0.5)*8);
      }
      ctx.strokeStyle = i%2===0 ? color(c1, 0.45) : color(c2, 0.65);
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    // points
    for(let i=0;i<60;i++){
      const a = Math.random()*Math.PI*2;
      const r = Math.random() * Math.max(w,h)/2;
      ctx.beginPath();
      ctx.arc(Math.cos(a)*r, Math.sin(a)*r, 1.4, 0, Math.PI*2);
      ctx.fillStyle = color(c1, 0.9);
      ctx.fill();
    }
  }

  function drawWave(ctx, w, h, c1, c2){
    for(let layer=0; layer<24; layer++){
      const y0 = (h/24)*layer;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      for(let x=0;x<=w;x+=8){
        const y = y0 + Math.sin(x*0.018 + layer*0.6) * (8 + layer*0.6);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = layer%2===0 ? color(c1, 0.35 + layer*0.02) : color(c2, 0.28 + layer*0.02);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  function drawNoise(ctx, w, h, c1, c2){
    // grid of glyphs
    const step = 28;
    for(let y=step/2;y<h;y+=step){
      for(let x=step/2;x<w;x+=step){
        const v = Math.sin(x*0.04 + y*0.03) + Math.cos(y*0.05 - x*0.02);
        const col = v > 0 ? c1 : c2;
        ctx.strokeStyle = color(col, 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        if(v > 0.3){
          ctx.arc(x, y, 5, 0, Math.PI*2);
        } else if(v < -0.3){
          ctx.moveTo(x-6, y-6); ctx.lineTo(x+6, y+6);
          ctx.moveTo(x+6, y-6); ctx.lineTo(x-6, y+6);
        } else {
          ctx.moveTo(x-6, y); ctx.lineTo(x+6, y);
          ctx.moveTo(x, y-6); ctx.lineTo(x, y+6);
        }
        ctx.stroke();
      }
    }
  }

  function color(hex, a){
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }
})();

/* ────────────────────────  PUB GRID  ──────────────────────── */
(function(){
  const grid = document.getElementById('pub-grid');
  if(!grid) return;
  const data = window.PUBLICATIONS || [];
  data.forEach((p,i) => {
    const el = document.createElement('article');
    el.className = 'pub';
    el.innerHTML = `
      <div class="pub-head">
        <span class="pub-tag">${p.tag}</span>
        <span class="pub-arrow">↗</span>
      </div>
      <canvas class="pub-thumb" data-motif="${p.motif}"></canvas>
      <h3 class="pub-title">${p.title}</h3>
      <p class="pub-authors">${p.authors}</p>
    `;
    grid.appendChild(el);
  });
  // draw thumbnails
  setTimeout(() => {
    const palettes = [
      ['#990000','#011F5B'],
      ['#011F5B','#990000'],
      ['#990000','#C8102E'],
      ['#011F5B','#5C7AB8'],
      ['#990000','#011F5B'],
      ['#011F5B','#990000'],
      ['#C8102E','#011F5B'],
      ['#990000','#5C7AB8'],
      ['#011F5B','#C8102E'],
    ];
    grid.querySelectorAll('.pub-thumb').forEach((cv, i) => {
      const ctx = cv.getContext('2d');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = cv.clientWidth, h = cv.clientHeight;
      cv.width = w*dpr; cv.height = h*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const [c1,c2] = palettes[i % palettes.length];
      // bg
      ctx.fillStyle = '#F4F6FB';
      ctx.fillRect(0,0,w,h);
      // motif: streamlines
      const seed = (i+1)*0.43;
      for(let y=0;y<h;y+=10){
        ctx.beginPath();
        ctx.moveTo(0, y);
        for(let x=0;x<=w;x+=6){
          const yy = y + Math.sin(x*0.025 + y*0.04 + seed) * 8 + Math.cos(x*0.012 + seed*2) * 4;
          ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = (Math.floor(y/10) % 3 === 0) ? c1 : c2;
        ctx.globalAlpha = 0.55 + Math.sin(y*0.05 + seed)*0.2;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // accent dot
      ctx.fillStyle = c1;
      ctx.beginPath(); ctx.arc(w-22, 22, 5, 0, Math.PI*2); ctx.fill();
    });
  }, 80);
})();
