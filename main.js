/* ============================================================
   MAIN.JS — Una Reserva Natural para cada Ciudad
   ============================================================ */

'use strict';

/* ── 1. NAVBAR SCROLL ── */
const navbar  = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ── 2. THEME TOGGLE ── */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');
let isDark = true;

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.body.classList.toggle('dark-mode', isDark);
  document.body.classList.toggle('light-mode', !isDark);
  themeIcon.textContent = isDark ? '☀️' : '🌙';
});

/* ── 3. PARALLAX HERO ── */
const heroImg = document.getElementById('hero-img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroImg.style.transform = `scale(1.05) translateY(${scrolled * 0.25}px)`;
  }, { passive: true });
}

/* ── 4. SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      // Animate benefit bars when visible
      if (entry.target.classList.contains('benefit-card')) {
        const fill = entry.target.querySelector('.benefit-fill');
        if (fill) {
          setTimeout(() => fill.classList.add('animated'), 300);
        }
      }
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ── 5. ANIMATED COUNTERS ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ── 6. PARTICLE CANVAS ── */
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let animFrame;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x    = Math.random() * canvas.width;
    this.y    = Math.random() * canvas.height;
    this.vx   = (Math.random() - 0.5) * 0.4;
    this.vy   = -Math.random() * 0.6 - 0.1;
    this.radius = Math.random() * 2 + 0.5;
    this.alpha  = Math.random() * 0.35 + 0.05;
    this.color  = Math.random() > 0.5
      ? `rgba(82, 183, 136, ${this.alpha})`
      : `rgba(149, 213, 178, ${this.alpha})`;
    this.life = 0;
    this.maxLife = Math.random() * 200 + 150;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
      this.reset();
      this.y = canvas.height + 5;
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Initialize particles
for (let i = 0; i < 80; i++) {
  const p = new Particle();
  p.y = Math.random() * canvas.height; // start spread
  particles.push(p);
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  animFrame = requestAnimationFrame(animateParticles);
}
animateParticles();

/* ── 7. MAP TOOLTIPS ── */
const tooltip = document.getElementById('map-tooltip');
const mapData = {
  'pin-costanera': 'Reserva Ecológica Costanera Sur\nBuenos Aires, Argentina',
  'pin-ribera':    'Parque Natural Ribera Norte\nSan Isidro, Buenos Aires',
  'pin-cordoba':   'Reserva Nat. y Cultural Cerro Colorado\nCórdoba, Argentina',
  'pin-calafate':  'Laguna Nimez\nEl Calafate, Santa Cruz',
  'pin-ecuador':   'Bosque Protector Cascada de Peguche\nOtavalo, Ecuador',
  'pin-colombia':  'Humedal Córdoba\nBogotá, Colombia',
  'pin-chile':     'Parque Estrecho de Magallanes\nPunta Arenas, Chile',
};

const mapContainer = document.getElementById('latam-map');
if (mapContainer) {
  document.querySelectorAll('.map-pin').forEach(pin => {
    const label = mapData[pin.id] || '';

    pin.addEventListener('mouseenter', (e) => {
      if (!label) return;
      tooltip.innerHTML = label.replace('\n', '<br/>');
      tooltip.classList.add('visible');
    });
    pin.addEventListener('mousemove', (e) => {
      const rect = mapContainer.getBoundingClientRect();
      const x = e.clientX - rect.left + 12;
      const y = e.clientY - rect.top - 10;
      tooltip.style.left = `${Math.min(x, rect.width - 220)}px`;
      tooltip.style.top  = `${Math.max(y, 5)}px`;
    });
    pin.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
    pin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        tooltip.innerHTML = label.replace('\n', '<br/>');
        tooltip.classList.toggle('visible');
      }
    });
  });
}

/* ── 8. SMOOTH SECTION HIGHLIGHTING ── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('#nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        const href = a.getAttribute('href').replace('#','');
        a.style.color = href === id ? 'var(--green-light)' : '';
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

/* ── 9. AMBIENT SOUND (Web Audio API) ── */
const soundBtn  = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');
let audioCtx = null;
let gainNode = null;
let soundNodes = [];
let soundOn = false;

function createAmbientSound() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioCtx.destination);
  }

  // Wind-like noise
  function createWindLayer(freq, gain) {
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.5;

    const g = audioCtx.createGain();
    g.gain.value = gain;

    src.connect(filter);
    filter.connect(g);
    g.connect(gainNode);
    src.start();
    return src;
  }

  soundNodes.push(createWindLayer(200, 0.08));
  soundNodes.push(createWindLayer(600, 0.04));
  soundNodes.push(createWindLayer(1200, 0.02));

  // Gentle water drops (random tones)
  function scheduleDrops() {
    const delay = Math.random() * 2.5 + 0.5;
    setTimeout(() => {
      if (!soundOn) return;
      const osc  = audioCtx.createOscillator();
      const env  = audioCtx.createGain();
      const freq = 400 + Math.random() * 800;
      osc.frequency.value = freq;
      osc.type = 'sine';
      env.gain.setValueAtTime(0, audioCtx.currentTime);
      env.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(env);
      env.connect(gainNode);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
      scheduleDrops();
    }, delay * 1000);
  }
  scheduleDrops();
}

function fadeGain(targetGain, duration) {
  if (!gainNode) return;
  const now = audioCtx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);
  gainNode.gain.linearRampToValueAtTime(targetGain, now + duration);
}

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundIcon.textContent = soundOn ? '🔊' : '🔇';

  if (soundOn) {
    if (!audioCtx) createAmbientSound();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    fadeGain(0.6, 2);
  } else {
    fadeGain(0, 1.5);
  }
});

/* ── 10. ECOSYSTEM CARD TILT EFFECT ── */
document.querySelectorAll('.eco-card, .benefit-card, .infra-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-6px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    card.style.transition = 'transform 0.1s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  });
});

/* ── 11. TIMELINE PULSE on hover ── */
document.querySelectorAll('.timeline-content').forEach(el => {
  el.addEventListener('mouseenter', () => {
    el.style.boxShadow = '0 0 30px rgba(82, 183, 136, 0.25)';
  });
  el.addEventListener('mouseleave', () => {
    el.style.boxShadow = '';
  });
});

/* ── 12. LAZY LOAD IMAGES ── */
if ('loading' in HTMLImageElement.prototype) {
  // Native lazy loading supported — already set in HTML
} else {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const lazyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        lazyObserver.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => lazyObserver.observe(img));
}

/* ── 13. HERO — floating leaves effect ── */
function spawnLeaf() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const leaf = document.createElement('div');
  leaf.innerHTML = ['🍃','🌿','🌱','🍀'][Math.floor(Math.random() * 4)];
  leaf.style.cssText = `
    position:absolute;
    left:${Math.random() * 100}%;
    bottom:-50px;
    font-size:${10 + Math.random() * 14}px;
    opacity:0;
    pointer-events:none;
    z-index:1;
    animation: leafFloat ${6 + Math.random() * 8}s ease-in-out forwards;
  `;
  hero.appendChild(leaf);
  setTimeout(() => leaf.remove(), 15000);
}

// Inject leaf animation keyframe
const styleEl = document.createElement('style');
styleEl.textContent = `
@keyframes leafFloat {
  0%   { transform: translateY(0)   rotate(0deg);   opacity:0; }
  10%  { opacity: 0.6; }
  50%  { transform: translateY(-40vh) rotate(180deg); opacity: 0.4; }
  100% { transform: translateY(-90vh) rotate(360deg); opacity: 0; }
}
`;
document.head.appendChild(styleEl);

setInterval(spawnLeaf, 2500);
spawnLeaf();

/* ── 14. PERFORMANCE: pause particles when tab hidden ── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animFrame);
  } else {
    animateParticles();
  }
});

console.log('%c🌿 Una Reserva Natural para cada Ciudad', 'color:#52b788;font-size:16px;font-weight:bold;');
console.log('%cFundación Azara · Claudio Bertonatti', 'color:#95d5b2;font-size:12px;');
