// Study Companion app.js — FIXED to match HTML + styles.css
(function () {
  const DB = {
    tasks: [],
    notes: [],
    cards: [],
    sessions: [],
    resources: [],
    stats: { sessions: 0, streak: 0, cardsReviewed: 0 },
    achievements: []
  };

  const $ = id => document.getElementById(id);

  function save() {
    localStorage.setItem('sc:db', JSON.stringify(DB));
  }

  function load() {
    try {
      const raw = localStorage.getItem('sc:db');
      if (raw) Object.assign(DB, JSON.parse(raw));
    } catch {}
  }
  load();

  /* ---------------- THEME ---------------- */

  const themeToggle = $('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const on = document.body.classList.contains('dark-mode');
      themeToggle.setAttribute('aria-pressed', on);
      localStorage.setItem('sc:dark', on ? '1' : '0');
    });

    if (localStorage.getItem('sc:dark') === '1') {
      document.body.classList.add('dark-mode');
      themeToggle.setAttribute('aria-pressed', 'true');
    }
  }

  /* ---------------- NAVIGATION ---------------- */

  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const sec = btn.dataset.section;
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      const target = document.getElementById(sec);
      if (target) target.classList.add('active');
    });
  });

  /* ---------------- UTIL ---------------- */

  function showToast(msg, time = 1800) {
    const t = document.createElement('div');
    t.id = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), time);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ---------------- PLANNER ---------------- */

  function renderTasks() {
    const ul = $('taskList');
    if (!ul) return;
    ul.innerHTML = '';
    DB.tasks.forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${t.title}</strong>
        <div class="small">Due: ${t.due || '—'} • ${t.effort}m</div>`;
      ul.appendChild(li);
    });
  }

  $('addTaskBtn')?.addEventListener('click', () => {
    DB.tasks.push({
      id: uid(),
      title: $('taskTitle').value || 'Untitled',
      notes: $('taskNotes').value || '',
      due: $('taskDue').value || null,
      effort: parseInt($('taskEffort').value, 10) || 30,
      created: Date.now()
    });
    save();
    renderTasks();
    showToast('Task added');
  });

  /* ---------------- NOTES ---------------- */

  function renderNotes() {
    const ul = $('notesList');
    if (!ul) return;
    ul.innerHTML = '';
    DB.notes.forEach(n => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${n.title}</strong>
        <div class="small">${n.body.slice(0, 120)}…</div>`;
      ul.appendChild(li);
    });
  }

  $('saveNoteBtn')?.addEventListener('click', () => {
    DB.notes.push({
      id: uid(),
      title: $('noteTitle').value || 'Untitled',
      body: $('noteBody').value || '',
      created: Date.now()
    });
    save();
    renderNotes();
    showToast('Note saved');
  });

  /* ---------------- FLASHCARDS ---------------- */

  function generateFlashcardsFromText(text) {
    text.split(/\n|\. /).forEach(s => {
      if (!s.trim()) return;
      DB.cards.push({
        id: uid(),
        q: s.slice(0, 80),
        a: s,
        due: Date.now()
      });
    });
    save();
  }

  $('flashcardsFromNoteBtn')?.addEventListener('click', () => {
    generateFlashcardsFromText($('noteBody').value || '');
    showToast('Flashcards created');
  });

  /* ---------------- TIMER ---------------- */

  let timerId = null;
  let remaining = 0;

  function renderTimer() {
    $('timerDisplay').textContent =
      String(Math.floor(remaining / 60)).padStart(2, '0') +
      ':' +
      String(remaining % 60).padStart(2, '0');
  }

  $('startTimerBtn')?.addEventListener('click', () => {
    remaining = (parseInt($('timerMinutes').value, 10) || 25) * 60;
    clearInterval(timerId);
    timerId = setInterval(() => {
      remaining--;
      renderTimer();
      if (remaining <= 0) {
        clearInterval(timerId);
        showToast('Timer complete');
      }
    }, 1000);
  });

  $('stopTimerBtn')?.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    showToast('Timer stopped');
  });

  /* ---------------- EXPORT / IMPORT ---------------- */

  $('exportHeaderBtn')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'study-companion-backup.json';
    a.click();
  });

  $('importHeaderFile')?.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      Object.assign(DB, JSON.parse(r.result));
      save();
      renderAll();
      showToast('Imported');
    };
    r.readAsText(f);
  });

  /* ---------------- INIT ---------------- */

  function renderAll() {
    renderTasks();
    renderNotes();
  }

  renderAll();
})();
