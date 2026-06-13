

'use strict';

const loadingScreen = document.getElementById('loading-screen');
if (loadingScreen) {
  window.addEventListener('load', () => {
    setTimeout(() => loadingScreen.classList.add('hidden'), 600);
  });
}

const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow) {
  let curX = 0, curY = 0, rafId;
  document.addEventListener('mousemove', (e) => {
    curX = e.clientX; curY = e.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        cursorGlow.style.left = curX + 'px';
        cursorGlow.style.top  = curY + 'px';
        rafId = null;
      });
    }
  });
  document.addEventListener('mouseleave', () => cursorGlow.style.opacity = '0');
  document.addEventListener('mouseenter', () => cursorGlow.style.opacity = '1');
}

const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

const navToggle = document.querySelector('.nav-toggle');
const navMobile = document.querySelector('.nav-mobile');
if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('open');
    navMobile.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navMobile.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navMobile.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObserver.observe(el));
}

const skillBars = document.querySelectorAll('.skill-bar');
if (skillBars.length) {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.dataset.level + '%';
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  skillBars.forEach(bar => barObserver.observe(bar));
}

const counters = document.querySelectorAll('.achievement-counter');
if (counters.length) {
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();
    const isFloat = el.dataset.float === 'true';
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = target * easeOut(progress);
      el.textContent = prefix + (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));
}

document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
    setTimeout(() => card.style.transition = '', 500);
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'none';
  });
});

const typewriterEl = document.getElementById('typewriter');
if (typewriterEl) {
  const phrases = typewriterEl.dataset.phrases.split('|');
  let phraseIndex = 0, charIndex = 0, deleting = false;
  const minDelay = 60, maxDelay = 120, pauseDelay = 2200, deleteDelay = 40;
  const type = () => {
    const current = phrases[phraseIndex];
    if (deleting) {
      typewriterEl.textContent = current.slice(0, charIndex--);
      if (charIndex < 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 400);
        return;
      }
      setTimeout(type, deleteDelay);
    } else {
      typewriterEl.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(type, pauseDelay);
        return;
      }
      setTimeout(type, minDelay + Math.random() * (maxDelay - minDelay));
    }
  };
  type();
}

const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const resize = () => {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '0,212,255' : '124,58,237';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  const N = Math.min(120, Math.floor((W * H) / 8000));
  for (let i = 0; i < N; i++) particles.push(new Particle());

  const drawLines = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist/100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  };
  animate();
}

const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const filter = btn.dataset.filter;
      projectCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
        card.style.animation = match ? 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both' : '';
      });
    });
  });
}

document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  if (btn) {
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  }
});

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
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 1500));

    statusEl.className = 'form-status success';
    statusEl.textContent = '✓ Message sent! I\'ll get back to you within 24 hours.';
    contactForm.reset();
    contactForm.querySelectorAll('.form-input').forEach(i => i.classList.remove('valid'));
    btn.textContent = 'Send Message';
    btn.disabled = false;
    statusEl.focus();
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;
      width:0;height:0;border-radius:50%;
      background:rgba(255,255,255,0.25);
      transform:translate(-50%,-50%);
      animation:ripple 0.5s ease-out forwards;
      pointer-events:none;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

const style = document.createElement('style');
style.textContent = `@keyframes ripple{to{width:200px;height:200px;opacity:0;}}`;
document.head.appendChild(style);
