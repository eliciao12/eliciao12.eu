// ============================================================
// eliciao12.eu — Tokyo Cyber Engine
// System-Aware Theme + Live Last.fm & CET Clock
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
