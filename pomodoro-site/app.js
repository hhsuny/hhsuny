/* app.js — 番茄钟主逻辑 */

const DEFAULTS = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  autoBreak: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  notifyEnabled: true,
  soundEnabled: true,
};

function loadConfig() {
  try {
    return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('pomo_config') || '{}'));
  } catch { return { ...DEFAULTS }; }
}

function saveStreak() {
  const today = new Date().toDateString();
  const data = JSON.parse(localStorage.getItem('pomo_streak') || '{"last":"","count":0}');
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (data.last === today) return data.count;
  data.count = data.last === yesterday ? data.count + 1 : 1;
  data.last = today;
  localStorage.setItem('pomo_streak', JSON.stringify(data));
  return data.count;
}

function getStreak() {
  const data = JSON.parse(localStorage.getItem('pomo_streak') || '{"last":"","count":0}');
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (data.last === today || data.last === yesterday) return data.count;
  return 0;
}

// ── State ──────────────────────────────────────────────
let cfg = loadConfig();
let MODES;

function buildModes() {
  MODES = {
    focus: { label: '专注时间', secs: cfg.focusMin * 60, color: 'var(--accent-focus)' },
    short: { label: '短休息',   secs: cfg.shortMin * 60, color: 'var(--accent-short)' },
    long:  { label: '长休息',   secs: cfg.longMin * 60,  color: 'var(--accent-long)'  },
  };
}

buildModes();

let mode = 'focus';
let total = MODES.focus.secs;
let remaining = total;
let running = false;
let timer = null;
let pomoDone = 0;
let totalFocusSecs = 0;

// ── DOM refs ───────────────────────────────────────────
const circumference = 2 * Math.PI * 114;
const ring = document.getElementById('ring');
ring.style.strokeDasharray = circumference;

// ── Render ─────────────────────────────────────────────
function updateDisplay() {
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  document.getElementById('display').textContent =
    String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  document.title = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} · 番茄钟`;

  const pct = remaining / total;
  ring.style.strokeDashoffset = circumference * (1 - pct);
  ring.style.stroke = MODES[mode].color;
}

function updateStats() {
  document.getElementById('count').textContent = pomoDone;
  document.getElementById('totalMin').textContent = Math.floor(totalFocusSecs / 60);
  document.getElementById('streakCount').textContent = getStreak();
}

// ── Mode ───────────────────────────────────────────────
function setMode(m, autoStart = false) {
  clearInterval(timer);
  running = false;
  document.getElementById('playIcon').className = 'ti ti-player-play';
  document.querySelectorAll('.mode-btn').forEach((b, i) =>
    b.classList.toggle('active', ['focus', 'short', 'long'][i] === m)
  );
  mode = m;
  cfg = loadConfig();
  buildModes();
  total = MODES[m].secs;
  remaining = total;
  document.getElementById('mode-label').textContent = MODES[m].label;
  updateDisplay();
  if (autoStart) startTimer();
}

// ── Timer ──────────────────────────────────────────────
function startTimer() {
  running = true;
  document.getElementById('playIcon').className = 'ti ti-player-pause';
  timer = setInterval(() => {
    if (mode === 'focus') totalFocusSecs++;
    remaining--;
    updateDisplay();
    updateStats();
    if (remaining <= 0) onDone();
  }, 1000);
}

function toggleTimer() {
  if (running) {
    clearInterval(timer);
    running = false;
    document.getElementById('playIcon').className = 'ti ti-player-play';
  } else {
    startTimer();
    if (cfg.notifyEnabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

function resetTimer() {
  clearInterval(timer);
  running = false;
  remaining = total;
  document.getElementById('playIcon').className = 'ti ti-player-play';
  updateDisplay();
}

function skipTimer() {
  clearInterval(timer);
  running = false;
  remaining = 0;
  onDone();
}

function onDone() {
  clearInterval(timer);
  running = false;
  document.getElementById('playIcon').className = 'ti ti-player-play';
  remaining = 0;
  updateDisplay();

  if (mode === 'focus') {
    pomoDone++;
    saveStreak();
    updateStats();
    playSound(880);
    notify('专注完成！', '休息一下吧 🎉');
    const nextMode = pomoDone % cfg.autoBreak === 0 ? 'long' : 'short';
    showToast(`第 ${pomoDone} 个番茄完成！`);
    setTimeout(() => setMode(nextMode, cfg.autoStartBreak), 800);
  } else {
    playSound(660);
    notify('休息结束', '准备好继续了吗？');
    showToast('休息结束，继续加油！');
    setTimeout(() => setMode('focus', cfg.autoStartFocus), 800);
  }
}

// ── Sound ──────────────────────────────────────────────
function playSound(freq) {
  cfg = loadConfig();
  if (!cfg.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {}
}

// ── Notification ───────────────────────────────────────
function notify(title, body) {
  cfg = loadConfig();
  if (!cfg.notifyEnabled) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'https://cdn.jsdelivr.net/npm/twemoji@latest/2/72x72/1f345.png' });
  }
}

// ── Toast ──────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Init ───────────────────────────────────────────────
updateDisplay();
updateStats();
