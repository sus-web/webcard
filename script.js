// ==============================================
//  notrealmf.sys — client script
// ==============================================
(() => {
  // -------- sparkle trail ----------
  const symbols = ['✦', '✧', '★', '˚', '⋆', '♡', '✨', '◈'];
  const colors  = ['#ff0099', '#00eaff', '#c6ff00', '#ffe600', '#9d00ff', '#ffffff', '#ff4fc3'];
  let last = 0;
  const throttle = 40;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - last < throttle) return;
    last = now;
    spawn(e.clientX, e.clientY);
  });

  document.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
      const a  = (Math.PI * 2 * i) / 8;
      const dx = Math.cos(a) * 36;
      const dy = Math.sin(a) * 36;
      spawn(e.clientX + dx, e.clientY + dy, true);
    }
  });

  function spawn(x, y, big = false) {
    const s = document.createElement('span');
    s.className   = 'spark';
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    s.style.left  = x + 'px';
    s.style.top   = y + 'px';
    s.style.color = colors[Math.floor(Math.random() * colors.length)];
    s.style.fontSize = (big ? 1.8 : 0.8 + Math.random() * 0.9) + 'rem';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }

  // -------- uptime ----------
  const start = Date.now();
  const uptimeEl = document.getElementById('uptime');
  function pad(n) { return String(n).padStart(2, '0'); }
  function tickUptime() {
    const d = Math.floor((Date.now() - start) / 1000);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = d % 60;
    uptimeEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  setInterval(tickUptime, 1000);
  tickUptime();

  // -------- visitor counter (псевдо) ----------
  const visEl = document.getElementById('visitors');
  let n = parseInt(visEl.textContent, 10) || 13337;
  n += Math.floor(Math.random() * 7) + 1;
  visEl.textContent = String(n).padStart(8, '0');
  // тик раз в ~12-30 сек
  function bump() {
    n += Math.floor(Math.random() * 3) + 1;
    visEl.textContent = String(n).padStart(8, '0');
    setTimeout(bump, 12000 + Math.random() * 18000);
  }
  setTimeout(bump, 8000);

  // -------- ротация now playing ----------
  const tracks = [
    '— cybergirl // dreamwave',
    '— neon dust // aphex twin',
    '— star 69 // fatboy slim',
    '— sandstorm // darude',
    '— around the world // daft punk',
    '— porcelain // moby',
    '— better off alone // alice deejay',
    '— california // phantom planet',
  ];
  const trackEl = document.getElementById('track');
  let ti = 0;
  setInterval(() => {
    ti = (ti + 1) % tracks.length;
    trackEl.style.opacity = '0';
    setTimeout(() => {
      trackEl.textContent = tracks[ti];
      trackEl.style.opacity = '1';
    }, 250);
  }, 5000);
  trackEl.style.transition = 'opacity .25s';
})();
