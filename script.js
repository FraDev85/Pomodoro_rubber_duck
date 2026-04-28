// ─── Audio ────────────────────────────────────────────────────────────────────

/** Crea un breve trillo sintetizzato con WebAudio API */
const playBell = (() => {
  let ctx = null;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  /**
   * @param {'work'|'break'|'quack'} type
   */
  return (type = 'work') => {
    const ac = getCtx();

    const configs = {
      work: [
        { freq: 880, time: 0,    dur: 0.18 },
        { freq: 1100, time: 0.2, dur: 0.18 },
        { freq: 1320, time: 0.4, dur: 0.28 },
      ],
      break: [
        { freq: 660, time: 0,    dur: 0.22 },
        { freq: 550, time: 0.25, dur: 0.22 },
        { freq: 440, time: 0.5,  dur: 0.32 },
      ],
      quack: [
        { freq: 300, time: 0,    dur: 0.06 },
        { freq: 180, time: 0.06, dur: 0.10 },
        { freq: 220, time: 0.16, dur: 0.08 },
      ],
    };

    const notes = configs[type] ?? configs.work;
    const now   = ac.currentTime;

    for (const { freq, time, dur } of notes) {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.type = type === 'quack' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.28, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    }
  };
})();

// ─── Toast ────────────────────────────────────────────────────────────────────

const showToast = (() => {
  let el   = null;
  let tid  = null;

  return (msg) => {
    if (!el) {
      el = Object.assign(document.createElement('div'), { className: 'toast' });
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(tid);
    tid = setTimeout(() => el.classList.remove('show'), 2400);
  };
})();

// ─── Timer state ──────────────────────────────────────────────────────────────

const WORK_SECS  = 20 * 60;
const BREAK_SECS = 5  * 60;

const timer = {
  running:  false,
  elapsed:  0,
  phase:    'work',   // 'work' | 'break'
  sessions: 0,
  color:    '#e34a30',
  intervalId: null,
};

const pad  = (n) => String(Math.floor(n)).padStart(2, '0');
const fmt  = (s) => `${pad(s / 60)}:${pad(s % 60)}`;
const totalSecs = () => timer.phase === 'work' ? WORK_SECS : BREAK_SECS;
const remaining = () => Math.max(0, totalSecs() - timer.elapsed);

// DOM refs (pomodoro)
const timerDisplay = document.getElementById('timerDisplay');
const phaseLabel   = document.getElementById('phaseLabel');
const startBtn     = document.getElementById('startBtn');

const updateDisplay = () => {
  timerDisplay.textContent = fmt(remaining());
};

const updatePips = () => {
  for (let i = 0; i < 4; i++) {
    document.getElementById(`pip${i}`)
      .classList.toggle('done', i < timer.sessions);
  }
};

const tick = () => {
  timer.elapsed++;

  if (timer.elapsed >= totalSecs()) {
    // Phase transition
    clearInterval(timer.intervalId);
    timer.running = false;
    startBtn.textContent = 'avvia';

    if (timer.phase === 'work') {
      timer.sessions = Math.min(4, timer.sessions + 1);
      updatePips();
      timer.phase   = 'break';
      timer.elapsed = 0;
      phaseLabel.textContent = 'pausa · 5 min';
      playBell('break');
      showToast('🎉 sessione completata! prenditi una pausa.');
    } else {
      timer.phase   = 'work';
      timer.elapsed = 0;
      phaseLabel.textContent = 'concentrazione';
      playBell('work');
      showToast('💪 pausa finita! torna al lavoro.');
    }
  }

  updateDisplay();
  drawPomodoro();
};

export const toggleTimer = () => {
  if (timer.running) {
    clearInterval(timer.intervalId);
    timer.running = false;
    startBtn.textContent = 'avvia';
  } else {
    timer.running = true;
    startBtn.textContent = 'pausa';
    timer.intervalId = setInterval(tick, 1000);
    playBell('work');
  }
};

export const resetTimer = () => {
  clearInterval(timer.intervalId);
  timer.running  = false;
  timer.elapsed  = 0;
  timer.phase    = 'work';
  timer.sessions = 0;
  startBtn.textContent   = 'avvia';
  phaseLabel.textContent = 'concentrazione';
  updateDisplay();
  updatePips();
  drawPomodoro();
};

export const selectColor = (el) => {
  document.querySelectorAll('.color-dot')
    .forEach((d) => d.classList.remove('selected'));
  el.classList.add('selected');
  timer.color = el.dataset.color;
  drawPomodoro();
};

// ─── Pomodoro canvas ──────────────────────────────────────────────────────────

const pomodoroCanvas = document.getElementById('timerCanvas');
const pCtx = pomodoroCanvas.getContext('2d');

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const drawPomodoro = () => {
  const W = 480, H = 480, cx = 240, cy = 250;
  pCtx.clearRect(0, 0, W, H);

  const isBreak  = timer.phase === 'break';
  const col      = isBreak ? '#999' : timer.color;
  const [r, g, b] = hexToRgb(col);
  const dark  = `rgb(${Math.floor(r * .6)},${Math.floor(g * .6)},${Math.floor(b * .6)})`;
  const light = `rgb(${Math.min(255, r + 60)},${Math.min(255, g + 40)},${Math.min(255, b + 40)})`;

  const R        = 100;
  const progress = timer.elapsed / totalSecs();

  // Shadow
  pCtx.beginPath();
  pCtx.ellipse(cx, cy + R - 6, R * .82, 14, 0, 0, Math.PI * 2);
  pCtx.fillStyle = 'rgba(0,0,0,.07)';
  pCtx.fill();

  // Liquid fill (clipped to circle)
  if (progress > 0) {
    pCtx.save();
    pCtx.beginPath();
    pCtx.arc(cx, cy, R, 0, Math.PI * 2);
    pCtx.clip();

    const fillH = progress * (R * 2 + 20);
    pCtx.fillStyle = col;
    pCtx.fillRect(cx - R - 4, cy + R - fillH, R * 2 + 8, fillH + 8);

    // Wave highlight
    if (progress > 0.05 && progress < 0.97) {
      const wy  = cy + R - fillH + 6;
      const now = Date.now() * 0.002;
      pCtx.beginPath();
      pCtx.moveTo(cx - R - 4, wy);
      for (let x = cx - R - 4; x <= cx + R + 4; x += 3) {
        pCtx.lineTo(x, wy + Math.sin(x * .045 + now) * 5);
      }
      pCtx.lineTo(cx + R + 4, wy + 18);
      pCtx.lineTo(cx - R - 4, wy + 18);
      pCtx.closePath();
      pCtx.fillStyle = light;
      pCtx.globalAlpha = .28;
      pCtx.fill();
      pCtx.globalAlpha = 1;
    }
    pCtx.restore();
  }

  // Circle border
  pCtx.beginPath();
  pCtx.arc(cx, cy, R, 0, Math.PI * 2);
  pCtx.strokeStyle = dark;
  pCtx.lineWidth   = 2.5;
  pCtx.stroke();

  // Shine
  pCtx.beginPath();
  pCtx.arc(cx - 26, cy - 26, 18, 0, Math.PI * 2);
  pCtx.fillStyle = 'rgba(255,255,255,.15)';
  pCtx.fill();

  // Stem
  pCtx.save();
  pCtx.strokeStyle = '#3a7a20';
  pCtx.lineWidth   = 5;
  pCtx.lineCap     = 'round';
  pCtx.beginPath();
  pCtx.moveTo(cx, cy - R - 16);
  pCtx.bezierCurveTo(cx + 4, cy - R - 42, cx + 18, cy - R - 52, cx + 8, cy - R - 60);
  pCtx.stroke();

  // Leaves
  pCtx.fillStyle = '#4a9a28';
  pCtx.beginPath();
  pCtx.ellipse(cx - 10, cy - R - 38, 16, 9, -.6, 0, Math.PI * 2);
  pCtx.fill();
  pCtx.beginPath();
  pCtx.ellipse(cx + 20, cy - R - 34, 15, 8, .5, 0, Math.PI * 2);
  pCtx.fill();
  pCtx.restore();

  // Break label
  if (isBreak) {
    pCtx.save();
    pCtx.font        = '500 12px DM Mono, monospace';
    pCtx.fillStyle   = 'rgba(120,120,120,.8)';
    pCtx.textAlign   = 'center';
    pCtx.fillText('riposati', cx, cy + 6);
    pCtx.restore();
  }
};

// Continuous wave animation
setInterval(drawPomodoro, 80);

// ─── Duck state ───────────────────────────────────────────────────────────────

const duck = {
  frame:   0,
  blink:   false,
  talking: false,
  squish:  0,
};

const QUACKS = [
  'quack!',
  'quack quack!',
  'quaaaaack.',
  'quack quack quack!',
  '...quack.',
  'QUACK!',
  'quack? quack.',
  'quack! (ti capisco, quack)',
  'mhm. quack.',
  'quack! interessante.',
  '(annuisce) quack.',
  'quack!! sono tutto orecchie.',
  '...quack. continua.',
  'quack quack — ottima osservazione.',
];

const randomQuack = () => QUACKS[Math.floor(Math.random() * QUACKS.length)];

// ─── Duck canvas ──────────────────────────────────────────────────────────────

const duckCanvas = document.getElementById('duckCanvas');
const dCtx = duckCanvas.getContext('2d');

const drawDuck = () => {
  const W = 480, H = 480;
  dCtx.clearRect(0, 0, W, H);

  const cx  = 240;
  const cy  = 275;
  const bob = Math.sin(duck.frame * .04) * 5;
  const sq  = duck.squish;
  const sx  = 1 - sq * .08;
  const sy  = 1 + sq * .16;

  dCtx.save();
  dCtx.translate(cx, cy + bob);
  dCtx.scale(sx, sy);

  // Shadow
  dCtx.beginPath();
  dCtx.ellipse(0, 112, 65, 12, 0, 0, Math.PI * 2);
  dCtx.fillStyle = 'rgba(0,0,0,.09)';
  dCtx.fill();

  // Body
  dCtx.beginPath();
  dCtx.ellipse(0, 18, 88, 68, 0, 0, Math.PI * 2);
  dCtx.fillStyle   = '#f5c842';
  dCtx.fill();
  dCtx.strokeStyle = '#c8961a';
  dCtx.lineWidth   = 2.5;
  dCtx.stroke();

  // Head
  dCtx.beginPath();
  dCtx.ellipse(-4, -58, 48, 44, -.07, 0, Math.PI * 2);
  dCtx.fillStyle   = '#f5c842';
  dCtx.fill();
  dCtx.strokeStyle = '#c8961a';
  dCtx.lineWidth   = 2.5;
  dCtx.stroke();

  // Eye
  const eyeOpen = duck.blink ? .06 : 1;
  dCtx.beginPath();
  dCtx.ellipse(26, -68, 9, 9 * eyeOpen, 0, 0, Math.PI * 2);
  dCtx.fillStyle = '#1a1a1a';
  dCtx.fill();
  if (!duck.blink) {
    dCtx.beginPath();
    dCtx.arc(29, -71, 2.5, 0, Math.PI * 2);
    dCtx.fillStyle = 'white';
    dCtx.fill();
  }

  // Beak
  dCtx.beginPath();
  if (duck.talking) {
    dCtx.ellipse(44, -52, 20, 10, .3, 0, Math.PI * 2);
  } else {
    dCtx.ellipse(44, -50, 20, 6, .3, 0, Math.PI * 2);
  }
  dCtx.fillStyle   = '#e8820a';
  dCtx.fill();
  dCtx.strokeStyle = '#b05a04';
  dCtx.lineWidth   = 1.5;
  dCtx.stroke();

  if (duck.talking) {
    dCtx.beginPath();
    dCtx.moveTo(30, -50);
    dCtx.lineTo(57, -50);
    dCtx.strokeStyle = '#b05a04';
    dCtx.lineWidth   = 1.5;
    dCtx.stroke();
  }

  // Wings
  for (const [ex, sign] of [[-66, -1], [66, 1]]) {
    dCtx.beginPath();
    dCtx.ellipse(ex, 46, 26, 13, sign * .3, 0, Math.PI * 2);
    dCtx.fillStyle   = '#e8a80a';
    dCtx.fill();
    dCtx.strokeStyle = '#c8961a';
    dCtx.lineWidth   = 1.5;
    dCtx.stroke();
  }

  // Feet
  for (const fx of [-28, 28]) {
    dCtx.beginPath();
    dCtx.ellipse(fx, 86, 23, 9, 0, 0, Math.PI * 2);
    dCtx.fillStyle = '#e8820a';
    dCtx.fill();
  }

  dCtx.restore();
};

const animateDuck = () => {
  if (currentMode !== 'duck') return;

  duck.frame++;

  // Decay squish
  if (duck.squish > 0) duck.squish = Math.max(0, duck.squish - .07);

  // Random blink
  if (duck.frame % 200 === 0) {
    duck.blink = true;
    setTimeout(() => { duck.blink = false; }, 140);
  }

  drawDuck();
  requestAnimationFrame(animateDuck);
};

// ─── Duck interactions ────────────────────────────────────────────────────────

export const quackClick = () => {
  duck.squish  = 1;
  duck.talking = true;
  playBell('quack');
  setTimeout(() => { duck.talking = false; }, 600);
  addMessage(randomQuack(), 'duck');
};

export const sendMsg = () => {
  const input = document.getElementById('chatInput');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  addMessage(text, 'user');

  duck.squish  = 1;
  duck.talking = true;
  setTimeout(() => {
    duck.talking = false;
    playBell('quack');
    addMessage(randomQuack(), 'duck');
  }, 700);
};

const addMessage = (text, who) => {
  const box = document.getElementById('chatMessages');
  const el  = Object.assign(document.createElement('div'), {
    className: `msg msg-${who === 'user' ? 'user' : 'duck'}`,
    textContent: text,
  });
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
};

// ─── Mode switching ───────────────────────────────────────────────────────────

let currentMode = 'pomodoro';

export const switchMode = (mode) => {
  currentMode = mode;

  const pomodoro = document.getElementById('pomodoroMode');
  const duckSec  = document.getElementById('duckMode');

  if (mode === 'pomodoro') {
    pomodoro.hidden = false;
    duckSec.hidden  = true;
  } else {
    pomodoro.hidden = true;
    duckSec.hidden  = false;
    requestAnimationFrame(animateDuck);
  }

  document.getElementById('btnPomodoro').classList.toggle('active', mode === 'pomodoro');
  document.getElementById('btnPomodoro').setAttribute('aria-selected', mode === 'pomodoro');
  document.getElementById('btnDuck').classList.toggle('active', mode === 'duck');
  document.getElementById('btnDuck').setAttribute('aria-selected', mode === 'duck');
};

// ─── Init ─────────────────────────────────────────────────────────────────────

// Expose functions to HTML onclick handlers (modules don't pollute global scope)
Object.assign(window, {
  toggleTimer,
  resetTimer,
  selectColor,
  switchMode,
  quackClick,
  sendMsg,
});

drawPomodoro();
updateDisplay();
