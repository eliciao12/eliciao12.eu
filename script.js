// ============================================================
// eliciao12.eu — Tokyo Cyber Engine
// System-Aware Theme + Live Last.fm & CET Clock + New Features
// ============================================================

// 1. Live CET Clock
function updateCETClock() {
  const clockElement = document.getElementById('cet-clock');
  const dateElement = document.getElementById('cet-date');
  if (!clockElement) return;

  const now = new Date();

  // Central European Time (Europe/Paris)
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  clockElement.textContent = timeFormatter.format(now);
  if (dateElement) {
    dateElement.textContent = dateFormatter.format(now);
  }
}

setInterval(updateCETClock, 1000);
updateCETClock();

// 2. Themed Last.fm Live Listening
const LASTFM_USER = 'eliciao';

function getThemedLastFMUrl(effectiveTheme) {
  const isLight = effectiveTheme === 'light';
  const textColor = isLight ? '111827' : 'f1f5f9';
  const artistColor = isLight ? '4b5563' : '94a3b8';
  const metaColor = isLight ? '9ca3af' : '64748b';
  const accentColor = isLight ? 'e11d48' : 'f43f5e';

  return `https://lastfm-recently-played.jeffreyca.workers.dev/svg?user=${LASTFM_USER}&count=1&theme=transparent&text_color=${textColor}&artist_color=${artistColor}&meta_color=${metaColor}&accent_color=${accentColor}&width=380&_t=${Date.now()}`;
}

function updateLastFMWidget() {
  const img = document.getElementById('lastfm-svg');
  if (!img) return;
  const effectiveTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  img.src = getThemedLastFMUrl(effectiveTheme);
}

// Auto-refresh Last.fm activity every 30 seconds
setInterval(updateLastFMWidget, 30000);

// 3. Simple Theme Toggle Button (Automatic Default + One-Click Toggle)
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIconEl = themeToggleBtn ? themeToggleBtn.querySelector('.theme-icon') : null;
const themeLabelEl = themeToggleBtn ? themeToggleBtn.querySelector('.theme-label') : null;
const rootElement = document.documentElement;

function getInitialTheme() {
  const saved = localStorage.getItem('user-theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function setTheme(theme, notify = false) {
  rootElement.setAttribute('data-theme', theme);
  localStorage.setItem('user-theme', theme);

  if (themeIconEl && themeLabelEl) {
    if (theme === 'dark') {
      themeIconEl.textContent = '🌙';
      themeLabelEl.textContent = 'Dark';
    } else {
      themeIconEl.textContent = '☀️';
      themeLabelEl.textContent = 'Light';
    }
  }

  updateLastFMWidget();

  if (notify) {
    showToast(`Switched to ${theme.toUpperCase()} mode ✨`);
  }
}

// Initial theme setup (auto-detects system if first visit)
setTheme(getInitialTheme(), false);

// Listen to OS theme changes if user hasn't manually set one yet
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('user-theme')) {
    setTheme(e.matches ? 'dark' : 'light', false);
  }
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const current = rootElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
  });
}

// 4. Copy Email with Toast Feedback
const copyBtn = document.getElementById('copy-email-btn');
const toast = document.getElementById('toast');
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2400);
}

if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const email = 'web@eliciao12.eu';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Copied web@eliciao12.eu to clipboard ✓');
    } catch (err) {
      showToast('Contact: web@eliciao12.eu');
    }
  });
}

// 5. Typing Animation
(function initTypingAnimation() {
  const el = document.getElementById('typed-name');
  const cursor = document.querySelector('.type-cursor');
  if (!el) return;

  const text = 'eliciao12';
  let i = 0;

  function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, i === 1 ? 600 : 90 + Math.random() * 40);
    } else {
      // Done typing — fade cursor to blinking
      if (cursor) cursor.classList.add('blink');
    }
  }

  // Small delay before starting
  setTimeout(type, 400);
})();

// 6. GitHub Stats (public API, no auth needed)
(function fetchGitHubStats() {
  const reposEl = document.getElementById('gh-repos');
  const starsEl = document.getElementById('gh-stars');
  const followersEl = document.getElementById('gh-followers');
  if (!reposEl) return;

  fetch('https://api.github.com/users/eliciao12')
    .then((r) => r.json())
    .then((user) => {
      if (reposEl) reposEl.textContent = user.public_repos ?? '—';
      if (followersEl) followersEl.textContent = user.followers ?? '—';

      // Fetch stars by summing across repos
      return fetch('https://api.github.com/users/eliciao12/repos?per_page=100');
    })
    .then((r) => r.json())
    .then((repos) => {
      if (!Array.isArray(repos)) return;
      const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
      if (starsEl) starsEl.textContent = totalStars;
    })
    .catch(() => {
      if (reposEl) reposEl.textContent = '—';
      if (starsEl) starsEl.textContent = '—';
      if (followersEl) followersEl.textContent = '—';
    });
})();

// 7. Visitor Counter (using api.counterapi.dev — free, no key needed)
(function fetchVisitorCount() {
  const el = document.getElementById('visitor-count');
  if (!el) return;

  const namespace = 'eliciao12eu';
  const key = 'visits';

  fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`)
    .then((r) => r.json())
    .then((data) => {
      if (data && data.count !== undefined) {
        // Animate the number counting up
        const target = data.count;
        const start = Math.max(0, target - Math.min(40, Math.floor(target * 0.08)));
        let current = start;
        const step = Math.ceil((target - start) / 20);

        function countUp() {
          current = Math.min(current + step, target);
          el.textContent = current.toLocaleString();
          if (current < target) {
            requestAnimationFrame(countUp);
          }
        }
        countUp();
      }
    })
    .catch(() => {
      if (el) el.textContent = '—';
    });
})();

// 9. Scroll-to-Top Button
(function initScrollTop() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
