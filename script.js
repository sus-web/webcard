// =====================================================================
//  notrealmf.sys — dreamcore / cybercore demo scene
//  boot · canvas flow field · scramble reveals · 3d tilt ·
//  cursor spotlight · glitch slams · sparkle trail · live status
// =====================================================================
(() => {
  'use strict';

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;

  // ------- util -------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const rand   = (a, b) => a + Math.random() * (b - a);
  const choose = (arr) => arr[(Math.random() * arr.length) | 0];
  const pad    = (n, w = 2) => String(n).padStart(w, '0');

  const PALETTE = [
    '#ff2d8a', '#ff5fb7', '#00e0ff', '#4affd8',
    '#8a5cff', '#c7a8ff', '#9fff4a', '#ffffff',
  ];

  // =====================================================================
  //  1. boot sequence (terminal typer)
  // =====================================================================
  const bootLines = [
    '> notrealmf.sys v3.14  [dreamcore build]',
    '> mounting /dev/dreams .................. [ok]',
    '> linking libneon, libvoid, libcrt ...... [ok]',
    '> opening port 4am ...................... [listen]',
    '> warming up crt @ 6144hz ............... [ok]',
    '> compile shaders: flowfield, glitch .... [ok]',
    '> seeding rng with 0xDEADBEEF ........... [ok]',
    '> rendering ............................. [ok]',
    '> hello, stranger.',
  ];

  function boot() {
    const overlay = $('#boot');
    const log     = $('#boot-log');
    const hint    = $('#boot-hint');
    if (!overlay || !log) { revealEverything(); return; }

    if (REDUCED_MOTION) {
      log.textContent = bootLines.join('\n');
      setTimeout(endBoot, 300);
      return;
    }

    let li = 0, ci = 0;
    let skipped = false;
    function skip() {
      if (skipped) return;
      skipped = true;
      log.textContent = bootLines.join('\n');
      setTimeout(endBoot, 180);
    }
    overlay.addEventListener('click', skip, { once: true });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip();
    });

    function type() {
      if (skipped) return;
      if (li >= bootLines.length) { setTimeout(endBoot, 400); return; }
      const line = bootLines[li];
      if (ci < line.length) {
        log.textContent += line[ci++];
        setTimeout(type, 8 + Math.random() * 28);
      } else {
        log.textContent += '\n';
        ci = 0;
        li++;
        // artificial [ok] pause feels good after [ok]/[listen]
        const pause = /\[(ok|listen)\]\s*$/.test(line) ? 90 + Math.random() * 140 : 40;
        setTimeout(type, pause);
      }
    }

    function endBoot() {
      overlay.classList.add('done');
      setTimeout(() => overlay.remove(), 1300);
      revealEverything();
      if (hint) hint.remove();
    }

    setTimeout(type, 180);
  }

  // =====================================================================
  //  2. canvas flow field  (neon smoke driven by pseudo-noise)
  // =====================================================================
  function initFlow() {
    const canvas = $('#flow');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let W = 0, H = 0, DPR = 1;
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      // blank canvas with ink so particles blend over it
      ctx.fillStyle = 'rgba(6,4,13,1)';
      ctx.fillRect(0, 0, W, H);
    }
    resize();
    window.addEventListener('resize', resize);

    // flow field — sampled from a cheap mix of trig, evolves with time
    function flow(x, y, t) {
      return (
        Math.sin(x * 0.0032 + t * 0.00045) +
        Math.cos(y * 0.0041 + t * 0.00060) +
        Math.sin((x + y) * 0.0018 - t * 0.00025)
      ) * Math.PI;
    }

    const COUNT = REDUCED_MOTION ? 0 : Math.min(180, Math.floor((W * H) / 9000));
    const particles = [];

    function spawn(p) {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      p.px = p.x;
      p.py = p.y;
      p.age = 0;
      p.maxAge = 220 + Math.random() * 480;
      p.color = choose(PALETTE);
      p.speed = 0.45 + Math.random() * 1.35;
      p.size  = 0.45 + Math.random() * 1.75;
      return p;
    }
    for (let i = 0; i < COUNT; i++) particles.push(spawn({}));

    // mouse influence — particles bend toward cursor within a radius
    let mx = -9999, my = -9999;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    window.addEventListener('mouseleave', () => { mx = my = -9999; });

    let t = 0;
    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) loop();
    });

    function loop() {
      if (!running) return;
      t++;
      // soft trail fade — near-black with alpha builds up layers
      ctx.fillStyle = 'rgba(6, 4, 13, 0.10)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particles) {
        p.px = p.x;
        p.py = p.y;

        let a = flow(p.x, p.y, t);

        // cursor attraction/repulsion
        const dx = mx - p.x, dy = my - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 240 * 240) {
          const d = Math.sqrt(d2) + 0.0001;
          const pull = (1 - d / 240) * 0.9;
          a = a * (1 - pull) + Math.atan2(dy, dx) * pull;
        }

        p.x += Math.cos(a) * p.speed;
        p.y += Math.sin(a) * p.speed;
        p.age++;

        const life = 1 - p.age / p.maxAge;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0, life) * 0.75;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (p.age > p.maxAge ||
            p.x < -20 || p.x > W + 20 ||
            p.y < -20 || p.y > H + 20) {
          spawn(p);
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }

    if (COUNT > 0) loop();
  }

  // =====================================================================
  //  3. cursor spotlight + card 3d tilt (driven from single mousemove)
  // =====================================================================
  function initMouseFx() {
    const root = document.documentElement;
    const card = $('.card');
    const halo = $('.card-glow');

    let targetTX = 0, targetTY = 0, currentTX = 0, currentTY = 0;
    let floatPhase = Math.random() * TAU;

    // default cursor at center until moved
    let lastMX = window.innerWidth / 2;
    let lastMY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
      lastMX = e.clientX;
      lastMY = e.clientY;
      root.style.setProperty('--mx', e.clientX + 'px');
      root.style.setProperty('--my', e.clientY + 'px');
      const nx = e.clientX / window.innerWidth  - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetTY = nx *  10;
      targetTX = ny * -8;
      if (halo) {
        halo.style.transform = `translate(${nx * -24}px, ${ny * -24}px) scale(1.08)`;
      }
    }, { passive: true });

    if (REDUCED_MOTION || !card) return;

    function tickTilt(now) {
      currentTX += (targetTX - currentTX) * 0.08;
      currentTY += (targetTY - currentTY) * 0.08;
      floatPhase += 0.008;
      const drift = Math.sin(floatPhase) * 4;
      card.style.transform =
        `perspective(1100px) rotateX(${currentTX.toFixed(3)}deg) ` +
        `rotateY(${currentTY.toFixed(3)}deg) translateY(${drift.toFixed(2)}px)`;
      requestAnimationFrame(tickTilt);
    }
    requestAnimationFrame(tickTilt);
  }

  // =====================================================================
  //  4. scramble text reveal
  // =====================================================================
  const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#█▓▒░01Xx$@';

  function scramble(el, { duration = 1100, delay = 0 } = {}) {
    if (!el) return;
    const target = el.textContent.trim();
    const len = target.length;
    el.textContent = '';
    el.classList.add('is-scrambling');

    const start = performance.now() + delay;

    function frame(now) {
      if (now < start) { requestAnimationFrame(frame); return; }
      const t = Math.min((now - start) / duration, 1);
      // ease out
      const eased = 1 - Math.pow(1 - t, 3);
      const reveal = Math.floor(eased * len);
      let out = '';
      for (let i = 0; i < len; i++) {
        const ch = target[i];
        if (i < reveal || ch === ' ' || ch === '\n' || ch === '\t') {
          out += ch;
        } else {
          out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
        }
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(frame);
      else {
        el.textContent = target;
        el.classList.remove('is-scrambling');
      }
    }
    requestAnimationFrame(frame);
  }

  function runReveals() {
    if (REDUCED_MOTION) return;
    const targets = [
      { sel: '.window-title',        delay: 0   },
      { sel: '.status',              delay: 120 },
      { sel: '.name',                delay: 200 },
      { sel: '.subtitle',            delay: 500 },
    ];
    for (const { sel, delay } of targets) {
      scramble($(sel), { duration: 900, delay });
    }
    // stagger all section titles
    $$('.section-title').forEach((el, i) => {
      scramble(el, { duration: 650, delay: 900 + i * 90 });
    });
  }

  // =====================================================================
  //  5. glitch "slam" — random brief screen-wide RGB shift
  // =====================================================================
  function scheduleGlitchSlams() {
    if (REDUCED_MOTION) return;
    const body = document.body;
    function one() {
      const cls = Math.random() < 0.3 ? 'glitch-slam-strong' : 'glitch-slam';
      body.classList.add(cls);
      setTimeout(() => body.classList.remove(cls), cls === 'glitch-slam-strong' ? 520 : 360);
      // also momentarily upgrade the name filter
      const name = $('.name');
      if (name && cls === 'glitch-slam-strong') {
        name.style.filter = 'url(#glitch-burst)';
        setTimeout(() => { name.style.filter = ''; }, 380);
      }
      setTimeout(one, 6000 + Math.random() * 14000);
    }
    setTimeout(one, 9000 + Math.random() * 8000);
  }

  // name: stronger glitch on hover
  function initNameHoverGlitch() {
    const name = $('.name');
    if (!name || REDUCED_MOTION) return;
    name.addEventListener('mouseenter', () => {
      name.style.filter = 'url(#glitch-burst)';
    });
    name.addEventListener('mouseleave', () => {
      name.style.filter = '';
    });
  }

  // =====================================================================
  //  6. sparkle trail (cursor + click)
  // =====================================================================
  function initSparkles() {
    const symbols = ['✦', '✧', '★', '✢', '+', '×', '◈', '▲', '·'];
    let last = 0;
    const throttle = 45;

    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - last < throttle) return;
      last = now;
      spawn(e.clientX, e.clientY, false);
    });

    document.addEventListener('click', (e) => {
      for (let i = 0; i < 10; i++) {
        const a = (TAU * i) / 10;
        spawn(e.clientX + Math.cos(a) * 36, e.clientY + Math.sin(a) * 36, true);
      }
    });

    function spawn(x, y, big) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = choose(symbols);
      s.style.left = x + 'px';
      s.style.top  = y + 'px';
      s.style.color = choose(PALETTE);
      s.style.fontSize = (big ? 1.8 : 0.7 + Math.random() * 1.1) + 'rem';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1050);
    }
  }

  // =====================================================================
  //  7. status strip — uptime / now playing / visitors
  // =====================================================================
  function initStatus() {
    // uptime
    const uptimeEl = $('#uptime');
    if (uptimeEl) {
      const start = Date.now();
      const tick = () => {
        const d = Math.floor((Date.now() - start) / 1000);
        uptimeEl.textContent = `${pad(Math.floor(d / 3600))}:${pad(Math.floor((d % 3600) / 60))}:${pad(d % 60)}`;
      };
      tick();
      setInterval(tick, 1000);
    }

    // visitors (pseudo)
    const visEl = $('#visitors');
    if (visEl) {
      let n = parseInt(visEl.textContent, 10) || 133700;
      n += ((Math.random() * 7) | 0) + 1;
      visEl.textContent = String(n).padStart(8, '0');
      const bump = () => {
        n += ((Math.random() * 3) | 0) + 1;
        visEl.textContent = String(n).padStart(8, '0');
        setTimeout(bump, 12000 + Math.random() * 22000);
      };
      setTimeout(bump, 7000);
    }

    // now playing rotator
    const tracks = [
      '— cybergirl // dreamwave',
      '— fallout — rez infinite ost',
      '— boards of canada // roygbiv',
      '— burial // archangel',
      '— 2814 // 新しい日の誕生',
      '— aphex twin // #3',
      '— dj shadow // midnight in a perfect world',
      '— hyroglifics // 4am',
      '— slowdive // crazy for you',
    ];
    const trackEl = $('#track');
    if (trackEl) {
      trackEl.style.transition = 'opacity .3s';
      let i = 0;
      setInterval(() => {
        i = (i + 1) % tracks.length;
        trackEl.style.opacity = '0';
        setTimeout(() => {
          trackEl.textContent = tracks[i];
          trackEl.style.opacity = '1';
        }, 280);
      }, 6200);
    }
  }

  // =====================================================================
  //  master boot
  // =====================================================================
  function revealEverything() {
    document.body.classList.add('is-ready');
    runReveals();
    scheduleGlitchSlams();
  }

  function start() {
    initFlow();
    initMouseFx();
    initSparkles();
    initStatus();
    initNameHoverGlitch();
    boot(); // kicks off reveal via endBoot()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
