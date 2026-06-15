// ═══════════════════════════════════════════════
// GITHUB API CONFIG
// ═══════════════════════════════════════════════
const GITHUB_USER = "Roshan-khatri78";
const GITHUB_REPO = "graphic_designer_portfolio";
const API_BASE = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;

// ═══════════════════════════════════════════════
// CUSTOM CURSOR ENGINE
// ═══════════════════════════════════════════════
const cursorRing = document.getElementById('cursorRing');
const cursorDot = document.getElementById('cursorDot');
const cursorLabel = document.getElementById('cursorLabel');

let mx = 0, my = 0, rx = 0, ry = 0;

// Dot follows instantly
document.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top = my + 'px';
  cursorLabel.style.left = mx + 'px';
  cursorLabel.style.top = my + 'px';
});

// Ring follows with smooth lag
function animateCursor() {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor interactions
function setupCursorListeners() {
  const interactive = document.querySelectorAll('a, button, .g-item, .cert-item, .tab-btn, .c-link');
  interactive.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
  });
}

document.addEventListener('DOMContentLoaded', setupCursorListeners);
setInterval(setupCursorListeners, 2000);

// ═══════════════════════════════════════════════
// NAVIGATION STICKY & ACTIVE LINK
// ═══════════════════════════════════════════════
const nav = document.querySelector('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Sticky nav
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // Active nav link
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 150) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// Smooth nav clicks
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('href');
    document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
  });
});

// Mobile menu
const navBurger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

navBurger.addEventListener('click', () => {
  navBurger.classList.toggle('active');
  mobileMenu.classList.toggle('show');
});

function closeMobileMenu() {
  navBurger.classList.remove('active');
  mobileMenu.classList.remove('show');
}

// ═══════════════════════════════════════════════
// SCROLL REVEAL OBSERVER
// ═══════════════════════════════════════════════
const revealEls = document.querySelectorAll('.reveal, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// ═══════════════════════════════════════════════
// HERO TYPING ANIMATION
// ═══════════════════════════════════════════════
const typingWords = ["VISUAL", "BRAND", "PRINT", "DIGITAL", "POSTER"];
let twi = 0, tci = 0, tDeleting = false;
const typingEl = document.getElementById('typingWord');

function typeHero() {
  if (!typingEl) return;
  const word = typingWords[twi];
  if (!tDeleting) {
    typingEl.textContent = word.slice(0, ++tci);
    if (tci === word.length) { tDeleting = true; setTimeout(typeHero, 2000); return; }
  } else {
    typingEl.textContent = word.slice(0, --tci);
    if (tci === 0) { tDeleting = false; twi = (twi + 1) % typingWords.length; }
  }
  setTimeout(typeHero, tDeleting ? 60 : 120);
}
typeHero();
// ═══════════════════════════════════════════════
function counterAnimation() {
  const counters = document.querySelectorAll('.stat-n');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    let current = 0;
    const increment = target / 60; // 60 frames
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(interval);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, 30);
  });
}

const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      counterAnimation();
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

// ═══════════════════════════════════════════════
// FETCH GITHUB FILES
// ═══════════════════════════════════════════════
async function fetchGithubDirectory(path) {
  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.filter(file => 
        file.type === "file" && 
        !file.name.startsWith('.') && 
        /\.(png|jpe?g|webp|gif|mp4|webm|mov|pdf)$/i.test(file.name)
      );
    }
    return [];
  } catch (error) {
    console.error(`Error fetching [${path}]:`, error);
    return null;
  }
}

function cleanName(filename) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
}

// ═══════════════════════════════════════════════
// SYNC PROFILE PICTURE
// ═══════════════════════════════════════════════
async function syncProfilePicture() {
  const heroPhoto = document.getElementById("heroPhoto");
  const aboutPhoto = document.getElementById("aboutPhoto");
  const files = await fetchGithubDirectory("profile picture");
  
  if (files && files.length > 0) {
    const imgUrl = files[0].download_url;
    
    if (heroPhoto) {
      const placeholder = heroPhoto.querySelector('.hv-placeholder');
      if (placeholder) placeholder.remove();
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = "Roshan Khatri";
      heroPhoto.appendChild(img);
    }
    
    if (aboutPhoto) {
      const placeholder = aboutPhoto.querySelector('.ap-placeholder');
      if (placeholder) placeholder.remove();
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = "Roshan Khatri";
      aboutPhoto.appendChild(img);
    }
  }
}

// ═══════════════════════════════════════════════
// WORKS TAB SYSTEM & GALLERY
// ═══════════════════════════════════════════════
const workFolders = {
  'brand': 'brand graphics',
  'festival': 'festival graphics',
  'training': 'events graphics',
  'designed-certs': 'certificates graphics',
  'videos': 'videos'
};

const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const tabId = btn.getAttribute('data-tab');
    
    // Update active tab
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update active panel
    tabPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(`panel-${tabId}`).classList.add('active');
    
    // Load gallery if not already loaded
    await loadGallery(tabId);
  });
});

async function loadGallery(tabId) {
  const folderPath = workFolders[tabId];
  const galleryId = `gallery-${tabId}`;
  const gallery = document.getElementById(galleryId);
  
  // Check if already loaded
  if (gallery.querySelector('.g-item')) return;
  
  const files = await fetchGithubDirectory(folderPath);
  gallery.innerHTML = '';
  
  if (!files || files.length === 0) {
    gallery.innerHTML = `<div class="g-loading" style="grid-column:1/-1;padding:40px;">No files found in folder.</div>`;
    return;
  }
  
  files.forEach((file, idx) => {
    const isVideo = /\.(mp4|webm|mov)$/i.test(file.name);
    const title = cleanName(file.name);
    const card = document.createElement('div');
    card.className = 'g-item';
    card.style.animationDelay = `${idx * 40}ms`;
    
    if (isVideo) {
      card.innerHTML = `
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--gray-dark);">
          <i class="ti ti-player-play" style="font-size:40px;color:#666;"></i>
        </div>
        <div class="g-overlay" style="gap:0.8rem;">
          <i class="ti ti-player-play" style="font-size:32px;"></i>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(file.download_url, true));
    } else {
      card.innerHTML = `
        <img src="${file.download_url}" alt="${title}" loading="lazy">
        <div class="g-overlay">
          <i class="ti ti-zoom-in"></i>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(file.download_url, false));
    }
    
    gallery.appendChild(card);
  });
}

// Load first tab on page load
window.addEventListener('DOMContentLoaded', async () => {
  await loadGallery('brand');
});

// ═══════════════════════════════════════════════
// SYNC CREDENTIALS
// ═══════════════════════════════════════════════
async function syncExperienceCredentials() {
  const grid = document.getElementById("credentialGrid");
  const files = await fetchGithubDirectory("experience credentials");
  
  grid.innerHTML = '';
  
  if (!files || files.length === 0) {
    grid.innerHTML = `<div class="g-loading" style="grid-column:1/-1;padding:40px;">No credentials found in folder.</div>`;
    return;
  }
  
  files.forEach((file, idx) => {
    const title = cleanName(file.name);
    const isPdf = /\.pdf$/i.test(file.name);
    const item = document.createElement('div');
    item.className = 'cert-item';
    
    if (isPdf) {
      item.innerHTML = `
        <div style="width:100%;height:150px;background:var(--gray-dark);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;">
          <i class="ti ti-file-type-pdf" style="font-size:40px;color:var(--red);"></i>
          <span style="font-size:0.65rem;color:#666;letter-spacing:1px;text-transform:uppercase;">PDF</span>
        </div>
        <div class="cert-foot">
          <i class="ti ti-shield-check"></i>
          <span>${title}</span>
        </div>
      `;
      item.addEventListener('click', () => window.open(file.download_url, '_blank'));
    } else {
      item.innerHTML = `
        <img src="${file.download_url}" alt="${title}" loading="lazy">
        <div class="cert-foot">
          <i class="ti ti-shield-check"></i>
          <span>${title}</span>
        </div>
      `;
      item.addEventListener('click', () => openLightbox(file.download_url, false));
    }
    
    grid.appendChild(item);
    setTimeout(() => item.classList.add('loaded'), idx * 60);
  });
}

// ═══════════════════════════════════════════════
// LIGHTBOX
// ═══════════════════════════════════════════════
const lb = document.getElementById('lb');
const lbImg = document.getElementById('lbImg');
const lbVideo = document.getElementById('lbVideo');
const lbX = document.getElementById('lbX');

function openLightbox(url, isVideo = false) {
  lbImg.style.display = 'none';
  lbVideo.style.display = 'none';
  lbVideo.src = '';
  
  lb.classList.add('open');
  
  if (isVideo) {
    lbVideo.style.display = 'block';
    lbVideo.src = url;
  } else {
    lbImg.style.display = 'block';
    lbImg.src = url;
  }
}

lbX.addEventListener('click', () => {
  lb.classList.remove('open');
  lbVideo.pause();
});

lb.addEventListener('click', (e) => {
  if (e.target === lb) {
    lb.classList.remove('open');
    lbVideo.pause();
  }
});

// ═══════════════════════════════════════════════
// PARALLAX MOUSE EFFECT
// ═══════════════════════════════════════════════
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 15;
  const y = (e.clientY / window.innerHeight - 0.5) * 15;
  
  const heroOrbs = document.querySelectorAll('.hero-orb');
  heroOrbs.forEach(orb => {
    orb.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
  });
});

// ═══════════════════════════════════════════════
// PRELOADER AUTO-HIDE
// ═══════════════════════════════════════════════
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  setTimeout(() => {
    preloader.style.pointerEvents = 'none';
  }, 3000);
});

// ═══════════════════════════════════════════════
// INIT ON DOM READY
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  await syncProfilePicture();
  await syncExperienceCredentials();
});