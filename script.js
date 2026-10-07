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

// 3. Automatic & Manual Theme Switcher (Auto / Dark / Light)
const systemDarkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const themeButtons = document.querySelectorAll('.theme-segment-btn');
const rootElement = document.documentElement;

function getEffectiveTheme(mode) {
  if (mode === 'auto') {
    return systemDarkQuery.matches ? 'dark' : 'light';
  }
  return mode;
}

function applyThemeMode(mode, showNotification = false) {
  const effectiveTheme = getEffectiveTheme(mode);
  rootElement.setAttribute('data-theme', effectiveTheme);
  rootElement.setAttribute('data-theme-mode', mode);
  localStorage.setItem('theme-mode', mode);

  // Update active state in segmented control
  themeButtons.forEach((btn) => {
    if (btn.getAttribute('data-mode') === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  updateLastFMWidget();

  if (showNotification) {
    const label = mode === 'auto' ? `Auto (System ${effectiveTheme})` : `${mode.toUpperCase()} mode`;
    showToast(`Theme: ${label}`);
  }
}

// Listen for OS system theme changes
systemDarkQuery.addEventListener('change', () => {
  const currentMode = localStorage.getItem('theme-mode') || 'auto';
  if (currentMode === 'auto') {
    applyThemeMode('auto');
  }
});

// Segmented button click handlers
themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const selectedMode = btn.getAttribute('data-mode');
    if (selectedMode) {
      applyThemeMode(selectedMode, true);
    }
  });
});

// Initial boot: default to 'auto' (automatic system detection)
const initialMode = localStorage.getItem('theme-mode') || 'auto';
applyThemeMode(initialMode, false);

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
