'use strict';

/* ── THEME SYSTEM ────────────────────────────────────────────
   Reads from localStorage, applies immediately, persists choice.
   ─────────────────────────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);

  // Update toggles across the page
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    const thumb = btn.querySelector('.theme-toggle-thumb');
    if (thumb) thumb.textContent = theme === 'dark' ? '🌙' : '☀️';
  });

  // Update meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#03040a' : '#f8faff';
}

document.addEventListener('click', e => {
  const toggle = e.target.closest('.theme-toggle');
  if (!toggle) return;
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Apply initial emoji
document.addEventListener('DOMContentLoaded', () => {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  document.querySelectorAll('.theme-toggle-thumb').forEach(el => {
    el.textContent = theme === 'dark' ? '🌙' : '☀️';
  });
});

/* ── LOADING SCREEN ──────────────────────────────────────────*/
const loadingScreen = document.getElementById('loading-screen');
if (loadingScreen) {
  window.addEventListener('load', () => {
    setTimeout(() => loadingScreen.classList.add('hidden'), 700);
  });
}

/* ── SCROLL PROGRESS BAR ─────────────────────────────────────*/
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }, { passive: true });
}

/* ── CURSOR GLOW ─────────────────────────────────────────────*/
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow) {
  let curX = 0, curY = 0, rafId = null;
  const update = () => {
    cursorGlow.style.left = curX + 'px';
    cursorGlow.style.top  = curY + 'px';
    rafId = null;
  };
  document.addEventListener('mousemove', e => {
    curX = e.clientX; curY = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(update);
  });
  document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursorGlow.style.opacity = '1'; });
}

/* ── NAV SCROLL STATE ────────────────────────────────────────*/
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── MOBILE NAV ──────────────────────────────────────────────*/
const navToggle  = document.querySelector('.nav-toggle');
const navMobile  = document.querySelector('.nav-mobile');
if (navToggle && navMobile) {
  const close = () => {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('open');
    navMobile.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navMobile.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ── INTERSECTION OBSERVER — SCROLL REVEALS ─────────────────
   Handles: .reveal .reveal-left .reveal-right .reveal-scale
   ─────────────────────────────────────────────────────────── */
const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
const revealEls = document.querySelectorAll(revealSelectors);

if (revealEls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ── SKILL BAR ANIMATION ─────────────────────────────────────*/
const skillBars = document.querySelectorAll('.skill-bar');
if (skillBars.length) {
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        // Slight delay so reveal animation completes first
        setTimeout(() => { bar.style.width = bar.dataset.level + '%'; }, 150);
        barObs.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  skillBars.forEach(b => barObs.observe(b));
}

/* ── COUNTER ANIMATION ───────────────────────────────────────*/
const counters = document.querySelectorAll('.achievement-counter');
if (counters.length) {
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const animateCounter = el => {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const isFloat  = el.dataset.float === 'true';
    const duration = 2000;
    const start    = performance.now();
    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      const v = target * easeOutCubic(p);
      el.textContent = prefix + (isFloat ? v.toFixed(1) : Math.floor(v)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cntObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        cntObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cntObs.observe(c));
}

/* ── 3D CARD TILT ────────────────────────────────────────────*/
function initTilt(el) {
  let frame = null;
  el.addEventListener('mouseenter', () => {
    el.style.transition = 'none';
  });
  el.addEventListener('mousemove', e => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5);
      const y = ((e.clientY - rect.top)  / rect.height - 0.5);
      el.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-5px) scale3d(1.02,1.02,1.02)`;
      frame = null;
    });
  });
  el.addEventListener('mouseleave', () => {
    if (frame) { cancelAnimationFrame(frame); frame = null; }
    el.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
    el.style.transform  = '';
    setTimeout(() => { el.style.transition = ''; }, 650);
  });
}
document.querySelectorAll('[data-tilt]').forEach(initTilt);

/* ── TYPEWRITER ──────────────────────────────────────────────*/
const typewriterEl = document.getElementById('typewriter');
if (typewriterEl) {
  const phrases     = typewriterEl.dataset.phrases.split('|');
  let phraseIndex   = 0, charIndex = 0, deleting = false;
  const minDelay    = 55, maxDelay = 115, pauseDelay = 2400, delDelay = 38;

  const tick = () => {
    const cur = phrases[phraseIndex];
    if (deleting) {
      typewriterEl.textContent = cur.slice(0, charIndex--);
      if (charIndex < 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, 380); return;
      }
      setTimeout(tick, delDelay);
    } else {
      typewriterEl.textContent = cur.slice(0, ++charIndex);
      if (charIndex === cur.length) {
        deleting = true;
        setTimeout(tick, pauseDelay); return;
      }
      setTimeout(tick, minDelay + Math.random() * (maxDelay - minDelay));
    }
  };
  tick();
}

/* ── HERO CANVAS PARTICLE NETWORK ────────────────────────────*/
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouseX = -9999, mouseY = -9999;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Track mouse for mouse-repel effect
  canvas.closest('.hero')?.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
  });
  canvas.closest('.hero')?.addEventListener('mouseleave', () => {
    mouseX = -9999; mouseY = -9999;
  });

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x  = initial ? Math.random() * W : (Math.random() > 0.5 ? 0 : W);
      this.y  = initial ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.4 + 0.5;
      this.alpha = Math.random() * 0.45 + 0.12;
      this.color = Math.random() > 0.5 ? '0,212,255' : '124,58,237';
      if (Math.random() > 0.85) this.color = '6,255,165';
    }
    update() {
      // Gentle mouse repel
      const dx = this.x - mouseX, dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.4;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
      // Dampen speed
      this.vx *= 0.99; this.vy *= 0.99;
      this.x += this.vx; this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  const N = Math.min(130, Math.floor(W * H / 7500));
  for (let i = 0; i < N; i++) particles.push(new Particle());

  const drawLines = () => {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = dx * dx + dy * dy;
        if (d < maxDist * maxDist) {
          const t = 1 - Math.sqrt(d) / maxDist;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.09 * t})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  };

  let animating = true;
  const animate = () => {
    if (!animating) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  };
  animate();

  // Pause when tab hidden for performance
  document.addEventListener('visibilitychange', () => {
    animating = !document.hidden;
    if (animating) animate();
  });
}

/* ── PROJECT FILTER ──────────────────────────────────────────*/
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const filter = btn.dataset.filter;
      let delay = 0;
      projectCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !show);
        if (show) {
          card.style.animationDelay = delay * 60 + 'ms';
          card.style.animation = 'fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both';
          delay++;
          // Reset animation
          void card.offsetWidth;
        }
      });
    });
  });
}

/* ── FAQ ACCORDION ───────────────────────────────────────────*/
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const willOpen = !item.classList.contains('open');
    // Close siblings
    item.closest('.faq-list')?.querySelectorAll('.faq-item.open').forEach(open => {
      if (open !== item) {
        open.classList.remove('open');
        open.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  });
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
});

/* ── CONTACT FORM ────────────────────────────────────────────*/
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const statusEl = document.getElementById('form-status');

  contactForm.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value.trim() && input.checkValidity()) {
        input.classList.add('valid');
      } else {
        input.classList.remove('valid');
      }
    });
    // Live validation on input after first blur
    input.addEventListener('input', () => {
      if (input.classList.contains('valid') || input.classList.contains('invalid')) {
        if (input.value.trim() && input.checkValidity()) {
          input.classList.add('valid');
          input.classList.remove('invalid');
        } else {
          input.classList.remove('valid');
        }
      }
    });
  });

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    const origText = btn.textContent;

    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 0.85s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending…`;
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 1600));

    if (statusEl) {
      statusEl.className = 'form-status success';
      statusEl.textContent = '✓ Message sent! I\'ll get back to you within 24 hours.';
      statusEl.focus();
    }
    contactForm.reset();
    contactForm.querySelectorAll('.form-input').forEach(i => i.classList.remove('valid', 'invalid'));
    btn.textContent = origText;
    btn.disabled = false;
  });
}

/* ── SMOOTH ANCHOR SCROLL ────────────────────────────────────*/
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── BUTTON RIPPLE ───────────────────────────────────────────*/
// Inject keyframe once
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple { to { width: 220px; height: 220px; opacity: 0; } }
  @keyframes fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
`;
document.head.appendChild(rippleStyle);

document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const rect   = btn.getBoundingClientRect();
  const x      = e.clientX - rect.left;
  const y      = e.clientY - rect.top;
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position:absolute; left:${x}px; top:${y}px;
    width:0; height:0; border-radius:50%;
    background:rgba(255,255,255,0.22);
    transform:translate(-50%,-50%);
    animation:ripple 0.55s ease-out forwards;
    pointer-events:none; z-index:10;
  `;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}, true);

/* ── STAGGER CHILDREN ────────────────────────────────────────
   Any container with data-stagger will automatically
   add stagger delays to its direct .reveal children.
   ─────────────────────────────────────────────────────────── */
document.querySelectorAll('[data-stagger]').forEach(container => {
  const base = parseFloat(container.dataset.stagger) || 80;
  container.querySelectorAll(':scope > .reveal, :scope > .reveal-left, :scope > .reveal-right, :scope > .reveal-scale').forEach((child, i) => {
    child.style.transitionDelay = (i * base) + 'ms';
  });
});

/* ── MAGNETIC BUTTONS ────────────────────────────────────────
   Subtle magnetic pull on .btn-primary hover.
   ─────────────────────────────────────────────────────────── */
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect   = btn.getBoundingClientRect();
    const x      = e.clientX - rect.left - rect.width / 2;
    const y      = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px) translateY(-2px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ── ACTIVE NAV LINK HIGHLIGHT ───────────────────────────────
   Highlights nav links based on scroll position (single-page mode).
   ─────────────────────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
if (sections.length) {
  const navLinks = document.querySelectorAll('.nav-link');
  const onScroll = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('#' + current)) {
        link.setAttribute('aria-current', 'page');
      } else if (!link.getAttribute('href')?.endsWith('.html')) {
        link.removeAttribute('aria-current');
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}
