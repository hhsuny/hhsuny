/* settings.js — 设置页面逻辑 */

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

function applyToUI(cfg) {
  document.getElementById('focusMin').value = cfg.focusMin;
  document.getElementById('shortMin').value = cfg.shortMin;
  document.getElementById('longMin').value = cfg.longMin;
  document.getElementById('autoBreak').value = cfg.autoBreak;
  document.getElementById('autoStartBreak').checked = cfg.autoStartBreak;
  document.getElementById('autoStartFocus').checked = cfg.autoStartFocus;
  document.getElementById('notifyEnabled').checked = cfg.notifyEnabled;
  document.getElementById('soundEnabled').checked = cfg.soundEnabled;
}

function readFromUI() {
  return {
    focusMin: clamp(parseInt(document.getElementById('focusMin').value) || 25, 1, 90),
    shortMin: clamp(parseInt(document.getElementById('shortMin').value) || 5,  1, 30),
    longMin:  clamp(parseInt(document.getElementById('longMin').value)  || 15, 1, 60),
    autoBreak: clamp(parseInt(document.getElementById('autoBreak').value) || 4, 1, 10),
    autoStartBreak: document.getElementById('autoStartBreak').checked,
    autoStartFocus: document.getElementById('autoStartFocus').checked,
    notifyEnabled: document.getElementById('notifyEnabled').checked,
    soundEnabled: document.getElementById('soundEnabled').checked,
  };
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function step(id, delta) {
  const el = document.getElementById(id);
  const min = parseInt(el.min), max = parseInt(el.max);
  el.value = clamp((parseInt(el.value) || 0) + delta, min, max);
}

function saveSettings() {
  const cfg = readFromUI();
  // Fix values within bounds before saving
  cfg.focusMin = clamp(cfg.focusMin, 1, 90);
  cfg.shortMin = clamp(cfg.shortMin, 1, 30);
  cfg.longMin  = clamp(cfg.longMin,  1, 60);
  cfg.autoBreak = clamp(cfg.autoBreak, 1, 10);

  if (cfg.notifyEnabled && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  localStorage.setItem('pomo_config', JSON.stringify(cfg));
  applyToUI(cfg);
  showToast('设置已保存 ✓');
}

function resetSettings() {
  applyToUI(DEFAULTS);
  showToast('已恢复默认设置');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Init
applyToUI(loadConfig());
