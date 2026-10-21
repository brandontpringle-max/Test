// Training tracker: all data is stored on the phone (localStorage).
const KEY = 'training-v1';
const $ = (id) => document.getElementById(id);

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.logs && d.runs) return d;
  } catch {}
  return { logs: {}, runs: {} }; // logs[date] = { day, sets: { exId: [{ w, r }] } }, runs['week-run'] = date
}
function save() { localStorage.setItem(KEY, JSON.stringify(db)); }

let db = load();
const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time
const weekdayOf = (date) => new Date(date + 'T00:00').getDay();
const fmtNum = (n) => String(Math.round(n * 10) / 10);
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const allExercises = () => Object.fromEntries(Object.values(DAYS).flatMap((d) => d.exercises).map((e) => [e.id, e]));

// ---------- Tabs ----------
function showTab(name) {
  document.querySelectorAll('main > section').forEach((s) => { s.hidden = s.id !== 'tab-' + name; });
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  window.scrollTo(0, 0);
  render();
}
document.querySelector('nav').addEventListener('click', (e) => { if (e.target.dataset.tab) showTab(e.target.dataset.tab); });
document.addEventListener('click', (e) => { if (e.target.dataset.goto) showTab(e.target.dataset.goto); });

// ---------- Today ----------
function dayForDate(date) {
  if (db.logs[date]) return db.logs[date].day;
  const wd = weekdayOf(date);
  return Object.keys(DAYS).find((k) => DAYS[k].weekday === wd) || 'rest';
}

function lastSets(exId, before) {
  const date = Object.keys(db.logs).filter((d) => d < before && db.logs[d].sets[exId]?.length).sort().pop();
  return date ? db.logs[date].sets[exId] : null;
}

const setText = (ex, s) => (ex.time ? `${s.r} s` : `${fmtNum(s.w)} ${UNIT} × ${s.r}`);

function renderToday() {
  const date = $('date').value;
  const dayKey = $('day').value;
  const exercises = dayKey === 'rest' ? [SUPERMAN] : DAYS[dayKey].exercises;
  const logged = db.logs[date]?.sets || {};

  $('exercises').innerHTML = (dayKey === 'rest'
    ? '<div class="panel"><h2>Rest day</h2><p class="muted">Stretch and do some Superman holds for your lower back.</p></div>'
    : '') + exercises.map((ex) => {
    const sets = logged[ex.id] || [];
    const last = lastSets(ex.id, date);
    const prev = sets.length ? sets : last;
    const lastW = prev ? prev[prev.length - 1].w : '';
    return `<div class="panel" data-ex="${ex.id}">
      <h3>${ex.name} ${ex.compound ? '<span class="tag">MAIN LIFT</span>' : ''}</h3>
      <p class="muted">${ex.rx}${last ? ' · Last time: ' + last.map((s) => setText(ex, s)).join(', ') : ''}</p>
      <ol class="sets">${sets.map((s, i) => `<li><span>Set ${i + 1}: ${setText(ex, s)}</span>
        <button class="del" data-del="${i}" aria-label="Delete set">✕</button></li>`).join('')}</ol>
      <div class="add${ex.time ? ' time' : ''}">
        ${ex.time ? '' : `<input class="w" type="number" inputmode="decimal" min="0" step="any" placeholder="${UNIT}" value="${lastW}">`}
        <input class="r" type="number" inputmode="numeric" min="1" placeholder="${ex.time ? 'seconds' : 'reps'}">
        <button type="button" data-add>Add set</button>
      </div>
    </div>`;
  }).join('');

  const next = nextRun();
  $('nextRunHint').textContent = next
    ? `Next: Couch to 5K week ${next.week}, run ${next.run} (${fmtTime(sessionSteps(next).reduce((t, s) => t + s.secs, 0))}).`
    : 'Couch to 5K complete!';
}

$('exercises').addEventListener('click', (e) => {
  const card = e.target.closest('[data-ex]');
  if (!card) return;
  const date = $('date').value;
  const exId = card.dataset.ex;
  if (e.target.dataset.add !== undefined) {
    const r = parseInt(card.querySelector('.r').value, 10);
    const wInput = card.querySelector('.w');
    const w = wInput ? parseFloat(wInput.value) || 0 : 0;
    if (!(r > 0)) return card.querySelector('.r').focus();
    const log = (db.logs[date] ||= { day: $('day').value, sets: {} });
    log.day = $('day').value;
    (log.sets[exId] ||= []).push({ w, r });
  } else if (e.target.dataset.del !== undefined) {
    db.logs[date].sets[exId].splice(Number(e.target.dataset.del), 1);
  } else {
    return;
  }
  save();
  renderToday();
});

$('date').addEventListener('change', () => { $('day').value = dayForDate($('date').value); renderToday(); });
$('day').addEventListener('change', () => {
  const log = db.logs[$('date').value];
  if (log) { log.day = $('day').value; save(); }
  renderToday();
});

// ---------- Lifts ----------
const e1rm = (w, r) => (r <= 1 ? w : w * (1 + r / 30)); // Epley formula

function renderLifts() {
  const exs = allExercises();
  const today = todayStr();
  $('lifts').innerHTML = Object.values(exs).filter((ex) => ex.compound).map((ex) => {
    const sessions = Object.keys(db.logs).sort()
      .filter((d) => db.logs[d].sets[ex.id]?.length)
      .map((d) => {
        const sets = db.logs[d].sets[ex.id];
        const top = sets.reduce((a, b) => (e1rm(b.w, b.r) > e1rm(a.w, a.r) ? b : a));
        return { date: d, top, best: e1rm(top.w, top.r) };
      });
    if (!sessions.length) {
      return `<div class="panel"><h3>${ex.name}</h3><p class="muted">No sets logged yet. Your first session sets the starting number.</p></div>`;
    }
    const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
    const first = sessions[0].date;
    const block = Math.floor(days(first, today) / 28);
    const blockStart = new Date(Date.parse(first) + block * 28 * 864e5).toISOString().slice(0, 10);
    const before = sessions.filter((s) => s.date < blockStart);
    const prevBest = before.length ? Math.max(...before.map((s) => s.best)) : sessions[0].best;
    const target = Math.ceil((prevBest + 5) / 2.5) * 2.5;
    const thisBlock = sessions.filter((s) => s.date >= blockStart);
    const blockBest = thisBlock.length ? Math.max(...thisBlock.map((s) => s.best)) : 0;
    const best = Math.max(...sessions.map((s) => s.best));
    const week = Math.min(4, Math.floor(days(blockStart, today) / 7) + 1);
    return `<div class="panel">
      <h3>${ex.name}</h3>
      <div class="stats">
        <div><span>Starting e1RM</span>${fmtNum(sessions[0].best)} ${UNIT}</div>
        <div><span>Best e1RM</span>${fmtNum(best)} ${UNIT}</div>
        <div><span>Block target</span><b class="${blockBest >= target ? 'good' : ''}">${fmtNum(target)} ${UNIT}${blockBest >= target ? ' ✓' : ''}</b></div>
      </div>
      <p class="muted">Block ${block + 1}, week ${week} of 4 · Best this block: ${blockBest ? fmtNum(blockBest) + ' ' + UNIT : '—'}</p>
      <ol class="sets">${sessions.slice(-5).reverse().map((s) =>
        `<li><span>${s.date}</span><span>${setText(ex, s.top)} → ${fmtNum(s.best)}</span></li>`).join('')}</ol>
    </div>`;
  }).join('');
}

// ---------- Couch to 5K ----------
function sessionSteps({ week, run }) {
  const main = C25K[week - 1][run - 1].trim().split(/\s+/)
    .map((t) => ({ label: t[0] === 'r' ? 'Run' : 'Walk', run: t[0] === 'r', secs: Number(t.slice(1)) }));
  return [{ label: 'Warm-up walk', run: false, secs: 300 }, ...main, { label: 'Cool-down walk', run: false, secs: 300 }];
}

function nextRun() {
  for (let w = 1; w <= C25K.length; w++) {
    for (let r = 1; r <= C25K[w - 1].length; r++) if (!db.runs[`${w}-${r}`]) return { week: w, run: r };
  }
  return null;
}

function renderRun() {
  const next = nextRun();
  if (next) {
    const steps = sessionSteps(next);
    const total = steps.reduce((t, s) => t + s.secs, 0);
    const running = steps.filter((s) => s.run).reduce((t, s) => t + s.secs, 0);
    $('nextRunTitle').textContent = `Next: Week ${next.week}, Run ${next.run}`;
    $('nextRunInfo').textContent = `${fmtTime(total)} total · ${fmtTime(running)} running. Do it after your weights.`;
    $('nextRunSteps').innerHTML = steps.map((s) => `<li class="${s.run ? 'r' : ''}">${s.label} ${fmtTime(s.secs)}</li>`).join('');
    $('startRun').hidden = false;
  } else {
    $('nextRunTitle').textContent = 'All 9 weeks done. You can run 5K!';
    $('nextRunInfo').textContent = '';
    $('nextRunSteps').innerHTML = '';
    $('startRun').hidden = true;
  }
  $('runGrid').innerHTML = C25K.map((runs, i) => `<span>Wk ${i + 1}</span>` + runs.map((_, j) => {
    const key = `${i + 1}-${j + 1}`;
    const isNext = next && next.week === i + 1 && next.run === j + 1;
    return `<button type="button" data-run="${key}" class="${db.runs[key] ? 'done' : ''}${isNext ? ' next' : ''}"
      title="${db.runs[key] || ''}">${db.runs[key] ? '✓' : 'Run ' + (j + 1)}</button>`;
  }).join('')).join('');
}

$('runGrid').addEventListener('click', (e) => {
  const key = e.target.dataset.run;
  if (!key) return;
  if (db.runs[key]) delete db.runs[key];
  else db.runs[key] = todayStr();
  save();
  renderRun();
});

// Interval timer: announces each change by voice and vibration, keeps the screen on.
let timer = null;

function announce(text) {
  try { navigator.vibrate?.([300, 150, 300]); } catch {}
  try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch {}
}

async function keepAwake() {
  try { timer.lock = await navigator.wakeLock?.request('screen'); } catch {}
}

const elapsed = () => timer.done + (timer.paused ? 0 : (Date.now() - timer.started) / 1000);

function tick() {
  const steps = timer.steps;
  const t = elapsed();
  let acc = 0;
  const idx = steps.findIndex((s) => (acc += s.secs) > t);
  if (idx === -1) return finishRun();
  const step = steps[idx];
  if (idx !== timer.idx) {
    timer.idx = idx;
    announce(idx === 0 ? 'Start with a brisk walk' : step.label);
  }
  $('timer').classList.toggle('running', step.run);
  $('timerPhase').textContent = step.label;
  $('timerClock').textContent = fmtTime(acc - t + 0.999);
  $('timerNext').textContent = steps[idx + 1] ? `Next: ${steps[idx + 1].label} ${fmtTime(steps[idx + 1].secs)}` : 'Last one!';
  $('timerBar').style.width = (t / timer.total) * 100 + '%';
  $('timerTotal').textContent = `${fmtTime(t)} / ${fmtTime(timer.total)}`;
}

function stopTimer() {
  clearInterval(timer.interval);
  timer.lock?.release?.();
  timer = null;
  $('timer').hidden = true;
}

function finishRun() {
  db.runs[`${timer.session.week}-${timer.session.run}`] = todayStr();
  save();
  announce('Session complete. Well done!');
  stopTimer();
  render();
}

$('startRun').addEventListener('click', () => {
  const session = nextRun();
  const steps = sessionSteps(session);
  timer = { session, steps, total: steps.reduce((t, s) => t + s.secs, 0), done: 0, started: Date.now(), paused: false, idx: -1 };
  $('timerSession').textContent = `Week ${session.week}, Run ${session.run}`;
  $('timerPause').textContent = 'Pause';
  $('timer').hidden = false;
  keepAwake();
  timer.interval = setInterval(tick, 250);
  tick();
});

$('timerPause').addEventListener('click', () => {
  if (timer.paused) { timer.started = Date.now(); timer.paused = false; $('timerPause').textContent = 'Pause'; }
  else { timer.done = elapsed(); timer.paused = true; $('timerPause').textContent = 'Resume'; }
});

$('timerStop').addEventListener('click', () => {
  if (confirm('Stop this run? It will not be marked as done.')) stopTimer();
});

document.addEventListener('visibilitychange', () => {
  if (timer && document.visibilityState === 'visible') keepAwake();
});

// ---------- Plan & data ----------
function renderPlan() {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  $('week').innerHTML = Object.values(DAYS).map((d) => `<div class="panel">
    <h2>${names[d.weekday]}: ${d.name}</h2>
    <ul>${d.exercises.map((ex) => `<li>${ex.compound ? '<b>' + ex.name + '</b>' : ex.name}: ${ex.rx}</li>`).join('')}</ul>
  </div>`).join('');
}

function download(name, type, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

$('exportCsv').addEventListener('click', () => {
  const exs = allExercises();
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [['Date', 'Workout', 'Exercise', 'Set', `Weight (${UNIT})`, 'Reps / seconds']];
  Object.keys(db.logs).sort().forEach((d) => {
    const log = db.logs[d];
    Object.entries(log.sets).forEach(([id, sets]) => sets.forEach((s, i) =>
      rows.push([d, DAYS[log.day]?.name || 'Rest', exs[id]?.name || id, i + 1, s.w, s.r])));
  });
  Object.entries(db.runs).sort().forEach(([key, d]) => {
    const [w, r] = key.split('-');
    rows.push([d, 'Couch to 5K', `Week ${w} Run ${r}`, '', '', '']);
  });
  download(`training-${todayStr()}.csv`, 'text/csv', rows.map((r) => r.map(q).join(',')).join('\n'));
});

$('backup').addEventListener('click', () => {
  download(`training-backup-${todayStr()}.json`, 'application/json', JSON.stringify(db));
});

$('restore').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data.logs || !data.runs) throw new Error();
    if (!confirm('Replace all current data with this backup?')) return;
    db = { logs: data.logs, runs: data.runs };
    save();
    render();
  } catch {
    alert('That file is not a valid backup.');
  } finally {
    e.target.value = '';
  }
});

// ---------- Start ----------
function render() {
  if (!$('tab-today').hidden) renderToday();
  if (!$('tab-lifts').hidden) renderLifts();
  if (!$('tab-run').hidden) renderRun();
  if (!$('tab-plan').hidden) renderPlan();
}

$('day').innerHTML = Object.entries(DAYS).map(([k, d]) => `<option value="${k}">${d.name}</option>`).join('')
  + '<option value="rest">Rest day</option>';
$('date').value = todayStr();
$('day').value = dayForDate(todayStr());
render();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
