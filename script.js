// sparkle trail за курсором — мастхэв y2k
(() => {
  const symbols = ['✦', '✧', '★', '˚', '⋆', '♡', '✨'];
  const colors = ['#ff71ce', '#01cdfe', '#05ffa1', '#fffb96', '#b967ff', '#ffffff'];
  let last = 0;
  const throttle = 45; // ms между спарками

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - last < throttle) return;
    last = now;
    spawn(e.clientX, e.clientY);
  });

  document.addEventListener('click', (e) => {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const dx = Math.cos(angle) * 30;
      const dy = Math.sin(angle) * 30;
      spawn(e.clientX + dx, e.clientY + dy, true);
    }
  });

  function spawn(x, y, big = false) {
    const s = document.createElement('span');
    s.className = 'spark';
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.color = colors[Math.floor(Math.random() * colors.length)];
    s.style.fontSize = (big ? 1.6 : 0.7 + Math.random() * 0.9) + 'rem';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
})();
