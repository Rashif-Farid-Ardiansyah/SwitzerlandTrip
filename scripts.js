// scripts.js - versi diperbaiki & defensif
document.addEventListener('DOMContentLoaded', function () {
  // --------------------------
  // 1) Canvas animated background
  // --------------------------
  (function () {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const particles = [];
    const PCOUNT = Math.min(120, Math.floor((w * h) / 50000)); // adapt jumlah partikel
    for (let i = 0; i < PCOUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.05 - Math.random() * 0.35
      });
    }

    function onResize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', onResize);

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#08102a');
      g.addColorStop(0.5, '#071026');
      g.addColorStop(1, '#030015');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;

        ctx.beginPath();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // mountains (simple silhouettes)
      function mountain(yBase, amplitude, color, offset) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 20) {
          const y = h - yBase - Math.abs(Math.sin((x + offset) / 120)) * amplitude - Math.abs(Math.cos((x + offset) / 80)) * (amplitude * 0.3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = color;
        ctx.fill();
      }
      mountain(120, 140, '#041331', 0);
      mountain(40, 90, '#081a3b', 120);

      requestAnimationFrame(draw);
    }
    draw();
  })();

  // --------------------------
  // 2) Carousel (auto + controls)
  // --------------------------
  (function () {
    const carousel = document.querySelector('.carousel');
    const slides = document.querySelector('.slides');
    if (!carousel || !slides) return;

    const slideNodes = slides.querySelectorAll('.slide');
    const total = slideNodes.length || 1;
    let idx = 0;
    const interval = 3000;
    let timerId = null;

    function go(i) {
      idx = ((i % total) + total) % total;
      slides.style.transform = `translateX(-${idx * 100}%)`;
    }
    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }

    const nextBtn = carousel.querySelector('.next');
    const prevBtn = carousel.querySelector('.prev');
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetTimer(); });

    function startTimer() {
      stopTimer();
      timerId = setInterval(next, interval);
    }
    function stopTimer() {
      if (timerId !== null) { clearInterval(timerId); timerId = null; }
    }
    function resetTimer() { stopTimer(); startTimer(); }

    carousel.addEventListener('mouseenter', () => stopTimer());
    carousel.addEventListener('mouseleave', () => startTimer());

    // Accessibility: keyboard arrows
    carousel.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft') { prev(); resetTimer(); }
      if (ev.key === 'ArrowRight') { next(); resetTimer(); }
    });

    // init
    go(0);
    startTimer();
  })();

  // --------------------------
  // 3) Footer year
  // --------------------------
  (function () {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  })();

  // --------------------------
  // 4) Booking form handling (demo localStorage) - only if booking form exists
  // --------------------------
  (function () {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(bookingForm);
      const data = {
        name: fd.get('name') || '',
        email: fd.get('email') || '',
        phone: fd.get('phone') || '',
        pkg: fd.get('pkg') || '',
        date: fd.get('date') || '',
        id: Date.now()
      };
      const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
      existing.push(data);
      localStorage.setItem('bookings', JSON.stringify(existing));
      alert('Booking tersimpan (demo). Cek riwayat pada halaman ini atau localStorage.');
      bookingForm.reset();
      // refresh history if present
      const historyEl = document.getElementById('history');
      if (historyEl) {
        const list = existing.map(b => `<li><strong>${escapeHtml(b.name)}</strong> — ${escapeHtml(b.pkg)} — ${escapeHtml(b.date)} (ID:${b.id})</li>`).join('');
        historyEl.innerHTML = '<ul>' + list + '</ul>';
      }
    });

    // helper escape
    function escapeHtml(str) {
      return (str + '').replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
      });
    }
  })();

  // --------------------------
  // 5) Login page (demo localStorage) - only if login form exists
  // --------------------------
  (function () {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = (loginForm.email && loginForm.email.value) || '';
      const password = (loginForm.password && loginForm.password.value) || '';
      const users = JSON.parse(localStorage.getItem('sw_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('sw_current', JSON.stringify({ email: user.email, name: user.name }));
        alert('Login sukses (demo)');
        window.location.href = 'booking.html';
        return;
      }
      if (confirm('Akun tidak ditemukan. Buat akun baru?')) {
        const name = prompt('Nama lengkap untuk profil');
        if (!name) return alert('Pendaftaran dibatalkan');
        users.push({ email, password, name });
        localStorage.setItem('sw_users', JSON.stringify(users));
        alert('Akun dibuat, silakan login lagi.');
      }
    });
  })();

});
// Dropdown toggle only (not blocking links)
const dropBtn = document.querySelector(".drop-btn");
const dropMenu = document.querySelector(".drop-menu");

dropBtn.addEventListener("click", (e) => {
  e.preventDefault(); // biar tombol tidak refresh halaman
  dropMenu.classList.toggle("show");
});

// Hide when clicked outside
document.addEventListener("click", (e) => {
  if (!dropBtn.contains(e.target) && !dropMenu.contains(e.target)) {
    dropMenu.classList.remove("show");
  }
});
function loginUser(e){
  e.preventDefault();
  localStorage.setItem("user", document.getElementById("email").value);
  alert("Login successful! Welcome 🌟");
  window.location.href="index.html";
}

function guestAccess(e){
  e.preventDefault();
  localStorage.setItem("guest", document.getElementById("guestName").value);
  alert("Welcome guest! Enjoy exploring 🇨🇭✨");
  window.location.href="index.html";
}
document.addEventListener("DOMContentLoaded", () => {
  console.log("Galaxy Neon Login UI Loaded");
});
// Starfield canvas background (lightweight)
(function () {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const numStars = Math.floor((w * h) / 12000); // adapt to screen

  // create stars
  const stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      twinkle: Math.random() * 200
    });
  }

  function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  }
  addEventListener('resize', () => {
    resize();
  });

  let t = 0;
  function draw() {
    t += 0.01;
    // clear with very transparent gradient so nebula effect shows through
    ctx.clearRect(0, 0, w, h);

    // faint color wash (does not use external image)
    const g = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.5, h * 0.5, Math.max(w, h));
    g.addColorStop(0, 'rgba(16,12,40,0.18)');
    g.addColorStop(0.45, 'rgba(10,20,40,0.08)');
    g.addColorStop(1, 'rgba(2,6,18,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // draw stars
    for (let s of stars) {
      // move slightly
      s.x += s.vx * (0.5 + Math.sin(t + s.twinkle) * 0.3);
      s.y += s.vy * (0.5 + Math.cos(t + s.twinkle) * 0.3);
      // wrap
      if (s.x < 0) s.x = w;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
      if (s.y > h) s.y = 0;

      const a = s.alpha * (0.5 + 0.5 * Math.sin((t * 2) + s.twinkle));
      ctx.beginPath();
      ctx.globalAlpha = Math.max(0.15, a);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // small halo
      ctx.beginPath();
      ctx.globalAlpha = Math.max(0.02, a * 0.2);
      ctx.fillStyle = 'rgba(160,220,255,1)';
      ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // subtle parallax stars layer (larger, slower)
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = 'rgba(255,255,255,1)';
    const bigCount = Math.max(3, Math.floor(w / 600));
    for (let i = 0; i < bigCount; i++) {
      const bx = (Math.sin((t * 0.03) + i) * 0.5 + 0.5) * w;
      const by = (Math.cos((t * 0.02) + i * 1.2) * 0.5 + 0.5) * h;
      ctx.beginPath();
      ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();
function toggleMenu() {
  document.getElementById("mobileMenu").classList.toggle("show");
}
