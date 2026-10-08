
function updateCETClock() {
  const clockElement = document.getElementById('cet-clock');
  const dateElement = document.getElementById('cet-date');
  if (!clockElement) return;

  const now = new Date();

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

const LASTFM_USER = 'eliciao';

function getThemedLastFMUrl(theme) {
  const isLight = theme === 'light';
  const textColor = isLight ? '111827' : 'f1f5f9';
  const artistColor = isLight ? '4b5563' : '94a3b8';
  const metaColor = isLight ? '9ca3af' : '64748b';
  const accentColor = isLight ? 'e11d48' : 'f43f5e';

  return `https://lastfm-recently-played.jeffreyca.workers.dev/svg?user=${LASTFM_USER}&count=1&theme=transparent&text_color=${textColor}&artist_color=${artistColor}&meta_color=${metaColor}&accent_color=${accentColor}&width=380&_t=${Date.now()}`;
}

function updateLastFMWidget() {
  const img = document.getElementById('lastfm-svg');
  if (!img) return;

  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  img.src = getThemedLastFMUrl(theme);
}

setInterval(updateLastFMWidget, 30000);

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

setTheme(getInitialTheme());

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  if (!localStorage.getItem('user-theme')) {
    setTheme(event.matches ? 'dark' : 'light');
  }
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const current = rootElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
  });
}

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
    } catch {
      showToast('Contact: web@eliciao12.eu');
    }
  });
}

(function initTypingAnimation() {
  const el = document.getElementById('typed-name');
  const cursor = document.querySelector('.type-cursor');
  if (!el) return;

  const text = 'eliciao12';
  let index = 0;

  function type() {
    if (index <= text.length) {
      el.textContent = text.slice(0, index);
      index += 1;
      setTimeout(type, index === 1 ? 600 : 90 + Math.random() * 40);
    } else if (cursor) {
      cursor.classList.add('blink');
    }
  }

  setTimeout(type, 400);
})();

async function fetchGitHubStats() {
  const reposEl = document.getElementById('gh-repos');
  const starsEl = document.getElementById('gh-stars');
  const followersEl = document.getElementById('gh-followers');

  if (!reposEl) return;

  try {
    const userResponse = await fetch('https://api.github.com/users/eliciao12');
    const user = await userResponse.json();

    reposEl.textContent = user.public_repos ?? '—';
    followersEl.textContent = user.followers ?? '—';

    const reposResponse = await fetch('https://api.github.com/users/eliciao12/repos?per_page=100');
    const repos = await reposResponse.json();

    if (Array.isArray(repos)) {
      const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      if (starsEl) {
        starsEl.textContent = totalStars.toLocaleString();
      }
    }
  } catch {
    reposEl.textContent = '—';
    if (starsEl) starsEl.textContent = '—';
    if (followersEl) followersEl.textContent = '—';
  }
}

fetchGitHubStats();

(function fetchVisitorCount() {
  const el = document.getElementById('visitor-count');
  if (!el) return;

  const endpoints = [
    'https://counter.eliciao12.eu/count',
    'https://api.counterapi.dev/v1/eliciao12eu/visits/up',
  ];

  const loadCount = async () => {
    for (const url of endpoints) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) continue;

        const data = await response.json();
        const target = Number(data?.count ?? data?.total ?? 0);

        if (Number.isFinite(target)) {
          const start = Math.max(0, target - Math.min(40, Math.floor(target * 0.08)));
          let current = start;
          const step = Math.ceil((target - start) / 20) || 1;

          const animate = () => {
            current = Math.min(current + step, target);
            el.textContent = current.toLocaleString();
            if (current < target) {
              requestAnimationFrame(animate);
            }
          };

          animate();
          return;
        }
      } catch {
        // continue to next fallback
      }
    }

    el.textContent = '—';
  };

  loadCount();
})();

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
