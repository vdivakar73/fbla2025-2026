// Study Companion app.js — local-first SPA implementing many features
(function(){
  const DB = { tasks:[], notes:[], cards:[], sessions:[], resources:[], stats:{sessions:0,streak:0,cardsReviewed:0}, achievements:[] };
  const $ = id => document.getElementById(id);
  function save() { localStorage.setItem('sc:db', JSON.stringify(DB)); }
  function load(){ try{ const raw = localStorage.getItem('sc:db'); if(raw) Object.assign(DB, JSON.parse(raw)); }catch(e){} }
  load();

  // --- Utilities ---
  function showToast(msg, time=1800){ const t = document.createElement('div'); t.textContent=msg; t.style.position='fixed'; t.style.right='18px'; t.style.bottom='18px'; t.style.padding='10px 14px'; t.style.background='rgba(0,0,0,0.8)'; t.style.color='#fff'; t.style.borderRadius='8px'; document.body.appendChild(t); setTimeout(()=>t.remove(),time); }
  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function estimateReadingTime(text,wpm=200){ return Math.max(1, Math.round((text||'').split(/\s+/).filter(Boolean).length / wpm)); }

  // --- Navigation ---
  document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click', ()=>{ document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); const sec = b.dataset.section; document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active')); document.getElementById(sec).classList.add('active'); }));

  // --- Theme + prefs ---
  const themeToggle = $('themeToggle'); themeToggle.addEventListener('click', ()=>{ document.documentElement.classList.toggle('dark'); const on = document.documentElement.classList.contains('dark'); themeToggle.setAttribute('aria-pressed', on); localStorage.setItem('sc:dark', on?'1':'0'); });
  if(localStorage.getItem('sc:dark')==='1') document.documentElement.classList.add('dark');

  // --- Planner features (auto-plan, schedule, export ICS) ---
  function renderTasks(){ const ul = $('taskList'); ul.innerHTML=''; DB.tasks.sort((a,b)=> (a.due||'') > (b.due||'') ? 1:-1).forEach(t=>{ const li=document.createElement('li'); li.innerHTML=`<strong>${t.title}</strong> <div class="small">Due: ${t.due||'—'} • Effort: ${t.effort}m</div><div style="margin-top:6px;"><button class='btn' data-id='${t.id}' data-act='done'>Done</button> <button class='btn' data-id='${t.id}' data-act='edit'>Edit</button> <button class='btn' data-id='${t.id}' data-act='del'>Delete</button></div>`; ul.appendChild(li); });
  }
  $('addTaskBtn').addEventListener('click', ()=>{ const t={ id: uid(), title: $('taskTitle').value||'Untitled', notes: $('taskNotes').value||'', due: $('taskDue').value||null, effort: parseInt($('taskEffort').value,10)||30, priority: parseInt($('taskPriority')?.value||2,10), created: Date.now() }; DB.tasks.push(t); save(); renderTasks(); showToast('Task added'); });
  // export tasks as simple ICS calendar
  function exportTasksICS(){ try{ if(!DB.tasks.length) return showToast('No tasks to export'); const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//StudyCompanion//EN']; DB.tasks.forEach(t=>{ const dt = t.due ? (t.due.replace(/-/g,'')+'T090000') : (new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'); lines.push('BEGIN:VEVENT'); lines.push('UID:'+t.id); lines.push('DTSTART:'+dt); lines.push('SUMMARY:'+ (t.title||'Task')); if(t.notes) lines.push('DESCRIPTION:'+ (t.notes.replace(/\n/g,'\\n')) ); lines.push('END:VEVENT'); }); lines.push('END:VCALENDAR'); const blob=new Blob([lines.join('\r\n')],{type:'text/calendar'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='tasks-'+Date.now()+'.ics'; a.click(); showToast('ICS exported'); }catch(e){ console.warn(e); showToast('ICS export failed'); } }
  $('exportICSBtn')?.addEventListener('click', exportTasksICS);
  $('taskList').addEventListener('click',(e)=>{ if(e.target.dataset.act==='del'){ const id=e.target.dataset.id; DB.tasks=DB.tasks.filter(t=>t.id!==id); save(); renderTasks(); showToast('Deleted'); } if(e.target.dataset.act==='done'){ const id=e.target.dataset.id; DB.tasks=DB.tasks.map(t=> t.id===id? Object.assign({},t,{done:true,completed:Date.now()}):t); save(); renderTasks(); showToast('Marked done'); } });

  // Auto-plan: distribute tasks into today's sessions (simple greedy by due date)
  $('autoPlanBtn').addEventListener('click', ()=>{ // create session blocks in DB.sessions
    const today = new Date().toISOString().slice(0,10); const open = DB.tasks.filter(t=>!t.done); open.sort((a,b)=> (a.due||'9999') > (b.due||'9999')?1:-1); let tslot=0; open.forEach(t=>{ const sessionCount = Math.max(1, Math.round(t.effort / 25)); for(let i=0;i<sessionCount;i++){ DB.sessions.push({ id: uid(), taskId: t.id, plannedFor: today, duration: Math.min(25, t.effort), created:Date.now(), status:'pending' }); } }); save(); showToast('Auto-plan created ('+DB.sessions.filter(s=>s.plannedFor===today).length+' sessions)'); });

  // --- Notes features: CRUD, summarize, keywords, export/import, search ---
  function renderNotes(){ const ul=$('notesList'); ul.innerHTML=''; DB.notes.forEach(n=>{ const li=document.createElement('li'); const tags = (n.tags||[]).slice(0,5).map(t=>`<span style="display:inline-block;padding:4px 8px;margin-right:6px;background:linear-gradient(90deg,var(--primary),var(--accent));color:#fff;border-radius:999px;font-size:0.8rem">${t}</span>`).join(' '); li.innerHTML=`<strong>${n.title}</strong><div class='small'>${estimateReadingTime(n.body)} min • ${n.tags ? 'Tags: '+(n.tags.join(', ')) : ''}</div><div style="margin-top:8px;">${renderMarkdownPreview(n.body)}</div><div style="margin-top:6px;"><button class='btn' data-id='${n.id}' data-act='open'>Open</button> <button class='btn' data-id='${n.id}' data-act='tofc'>To Flashcards</button> <button class='btn' data-id='${n.id}' data-act='export'>Export</button></div>`; ul.appendChild(li); }); }
  $('saveNoteBtn').addEventListener('click', ()=>{ const tags = ($('noteTags')?.value||'').split(',').map(s=>s.trim()).filter(Boolean); const n={ id: uid(), title: $('noteTitle').value||'Untitled', body: $('noteBody').value||'', tags: tags, created:Date.now() }; DB.notes.push(n); save(); renderNotes(); showToast('Note saved'); });
  // export single note
  $('notesList').addEventListener('click',(e)=>{ const id=e.target.dataset.id; const act=e.target.dataset.act; if(act==='open'){ const it=DB.notes.find(x=>x.id===id); if(it){ $('noteTitle').value=it.title; $('noteBody').value=it.body; $('noteTags').value = (it.tags||[]).join(', '); showToast('Note loaded'); } } if(act==='tofc'){ const it=DB.notes.find(x=>x.id===id); if(it){ generateFlashcardsFromText(it.body); showToast('Flashcards generated from note'); } } if(act==='export'){ const it=DB.notes.find(x=>x.id===id); if(it){ const blob=new Blob([it.body],{type:'text/markdown'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(it.title||'note')+'.md'; a.click(); showToast('Note exported'); } } });
  $('notesList').addEventListener('click',(e)=>{ const id=e.target.dataset.id; const act=e.target.dataset.act; if(act==='open'){ const it=DB.notes.find(x=>x.id===id); if(it){ $('noteTitle').value=it.title; $('noteBody').value=it.body; showToast('Note loaded'); } } if(act==='tofc'){ const it=DB.notes.find(x=>x.id===id); if(it){ generateFlashcardsFromText(it.body); showToast('Flashcards generated from note'); } } });

  // Summarizer (simple extractive)
  function simpleSummarize(text,max=3){ if(!text) return ''; const sents = text.match(/[^.!?]+[.!?]?/g)||[text]; const freq={}; text.split(/\s+/).forEach(w=>{ const k=w.toLowerCase().replace(/[^a-z0-9]/g,''); if(k.length<3) return; freq[k]=(freq[k]||0)+1; }); const scored=sents.map(s=>({s,score: (s.split(/\s+/).reduce((a,w)=> a + (freq[w.toLowerCase().replace(/[^a-z0-9]/g,'')]||0),0))})); scored.sort((a,b)=>b.score-a.score); return scored.slice(0,max).map(x=>x.s.trim()).join(' '); }
  $('summarizeBtn').addEventListener('click', ()=>{ const text=$('noteBody').value||''; const out=simpleSummarize(text,4); showToast('Summary: '+out.slice(0,120),7000); });

  // Minimal markdown preview (very small subset: headings, bold, italics, links, linebreaks)
  function renderMarkdownPreview(md){ if(!md) return ''; try{ let out = md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); out = out.replace(/^### (.*$)/gm, '<strong style="font-size:0.95rem">$1</strong>'); out = out.replace(/^## (.*$)/gm, '<strong style="font-size:1rem">$1</strong>'); out = out.replace(/^# (.*$)/gm, '<strong style="font-size:1.1rem">$1</strong>'); out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); out = out.replace(/\*(.*?)\*/g, '<em>$1</em>'); out = out.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>'); out = out.replace(/\n/g, '<br>'); return out; }catch(e){ return md.slice(0,200); } }

  // Keyword extraction (top repeated words)
  function topKeywords(text,n=8){ const freq={}; (text||'').toLowerCase().split(/\s+/).forEach(w=>{ const k=w.replace(/[^a-z0-9]/g,''); if(k.length<4) return; freq[k]=(freq[k]||0)+1; }); return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0]); }

  // --- Flashcards (SM-2 like simplified) ---
  function generateFlashcardsFromText(text){ const lines = (text||'').split(/\n|\.\s+/).map(s=>s.trim()).filter(Boolean).slice(0,200); lines.forEach(s=>{ const question = s.split(/[:\-–—]/)[0].slice(0,120); const answer = s; const card = { id: uid(), q: question, a: answer, ef:2.5, interval:1, repetitions:0, due: Date.now(), created:Date.now() }; DB.cards.push(card); }); save(); renderCardStats(); }
  function renderCardStats(){ /* update UI quickly */ }
  $('flashcardsFromNoteBtn').addEventListener('click', ()=>{ const t=$('noteBody').value||''; generateFlashcardsFromText(t); showToast('Flashcards generated'); });

  // SRS review flow
  let currentCard=null;
  function nextCard(){ const now=Date.now(); const due = DB.cards.filter(c=> (c.due||0) <= now); if(!due.length){ $('fcCard').textContent='No cards due'; return; } currentCard = due[0]; $('fcCard').innerHTML = `<strong>Q:</strong> ${currentCard.q}<div style='margin-top:10px;'><em>Click Show Answer</em> <button id='showAnswer' class='btn'>Show Answer</button></div>`; document.getElementById('showAnswer').addEventListener('click', ()=>{ $('fcCard').innerHTML += `<div style='margin-top:10px;'><strong>A:</strong> ${currentCard.a}</div>`; }); }
  $('trainFCBtn').addEventListener('click', ()=>{ nextCard(); });
  $('fcGood').addEventListener('click', ()=>{ if(!currentCard) return; // update SM-2-ish
    currentCard.repetitions = (currentCard.repetitions||0) + 1; currentCard.ef = Math.max(1.3, (currentCard.ef||2.5) + 0.1); currentCard.interval = Math.ceil((currentCard.interval||1) * (currentCard.ef||2.5)); currentCard.due = Date.now() + currentCard.interval*24*3600*1000; DB.stats.cardsReviewed++; save(); nextCard(); });
  $('fcWrong').addEventListener('click', ()=>{ if(!currentCard) return; currentCard.repetitions = 0; currentCard.interval = 1; currentCard.due = Date.now() + 1*3600*1000; save(); nextCard(); });

  // --- Quiz generator (MCQ + cloze) ---
  function generateQuizFromNotes(count){ const pool = DB.notes.map(n=>n.body).join('\n').split(/\.|\n/).map(s=>s.trim()).filter(Boolean); const q=[]; for(let i=0;i<count;i++){ const s = pool[Math.floor(Math.random()*pool.length)]||'Sample sentence for practice.'; const words = s.split(/\s+/).filter(w=>w.length>3); const answer = words[Math.floor(Math.random()*words.length)]||'answer'; const choices = [answer]; while(choices.length<4){ const c = words[Math.floor(Math.random()*words.length)]||('alt'+Math.random().toString(36).slice(2,5)); if(!choices.includes(c)) choices.push(c); } choices.sort(()=>Math.random()-0.5); q.push({ prompt: s.replace(new RegExp('\b'+answer+'\b','i'),'_____'), answer, choices}); } return q; }
  $('genQuizBtn').addEventListener('click', ()=>{ const q = generateQuizFromNotes(parseInt($('quizCount').value,10)||10); localStorage.setItem('sc:lastQuiz', JSON.stringify(q)); showToast('Quiz generated'); });
  $('startQuizBtn').addEventListener('click', ()=>{ const raw = localStorage.getItem('sc:lastQuiz'); if(!raw) return showToast('Generate a quiz first'); const q=JSON.parse(raw); const area=$('quizArea'); let idx=0; let score=0; function show(){ const cur=q[idx]; if(!cur){ area.innerHTML=`<div>Quiz complete. Score: ${score}/${q.length}</div>`; return; } area.innerHTML = `<div><div><strong>Q${idx+1}:</strong> ${cur.prompt}</div><div style='margin-top:8px;'>${cur.choices.map((c,i)=>`<button class='btn choice' data-i='${i}'>${c}</button>`).join(' ')}</div></div>`; area.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',(ev)=>{ const chosen = ev.target.textContent; if(chosen===cur.answer) { score++; showToast('Correct'); } else showToast('Wrong — '+cur.answer); idx++; show(); })); } show(); });

  // --- TTS controls ---
  function speak(text){ if(!('speechSynthesis' in window)) return showToast('TTS not supported'); speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); speechSynthesis.speak(u); }
  $('ttsBtn').addEventListener('click', ()=>{ const t = $('noteBody').value||$('fcCard').innerText||''; if(!t) return showToast('No text to read'); speak(t); });

  // --- Pomodoro / Timer ---
  let timerId=null; let timerRemaining=0;
  function renderTimer(){ const mm = Math.floor(timerRemaining/60); const ss = timerRemaining%60; $('timerDisplay').textContent = String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0'); }
  $('startTimerBtn').addEventListener('click', ()=>{ const mins = parseInt($('timerMinutes').value,10)||25; timerRemaining = mins*60; if(timerId) clearInterval(timerId); timerId = setInterval(()=>{ timerRemaining--; renderTimer(); if(timerRemaining<=0){ clearInterval(timerId); timerId=null; const entry = { id:uid(), ts:Date.now(), duration: (mins*60) }; DB.sessions.push(entry); DB.stats.sessions++; save(); renderSessions(); showToast('Timer complete'); notifyUser('Study Companion', 'Timer complete — good job!'); } },1000); renderTimer(); showToast('Timer started'); });
  // notify on timer complete (request permission when needed)
  function notifyUser(title, body){ try{ if (window.Notification && Notification.permission === 'granted') { new Notification(title, { body }); } else if (window.Notification && Notification.permission !== 'denied') { Notification.requestPermission().then(p=>{ if(p==='granted') new Notification(title,{body}); }); } }catch(e){ console.warn('notify', e); } }
  // wrap timer complete to send notification
  const _origStart = null;
  // modify existing completion to notify
  // replace renderSessions call area: (we'll add notify in the interval handler above by adjusting the event)
  $('stopTimerBtn').addEventListener('click', ()=>{ if(timerId) clearInterval(timerId); timerId=null; showToast('Timer stopped'); });
  function renderSessions(){ const ul=$('sessionLog'); ul.innerHTML=''; DB.sessions.slice(-20).reverse().forEach(s=>{ const li=document.createElement('li'); li.textContent = new Date(s.ts).toLocaleString() + ' • ' + Math.round((s.duration||0)/60) + 'm'; ul.appendChild(li); }); $('statsArea').textContent = `Sessions: ${DB.stats.sessions} • Streak: ${DB.stats.streak} days • Cards reviewed: ${DB.stats.cardsReviewed}`; renderStatsChart(); }

  // Render a small stats chart in the progress panel
  function renderStatsChart(){ try{ const c = $('statsChart'); if(!c || !c.getContext) return; const ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height); // simple bar: sessions (left) cardsReviewed (right)
      const s = DB.stats.sessions||0; const r = DB.stats.cardsReviewed||0; const max = Math.max(1,s,r);
      const w = c.width/4; const h = c.height-40; ctx.fillStyle = 'rgba(139,92,246,0.8)'; ctx.fillRect(c.width*0.25 - w/2, c.height-20 - (s/max)*h, w, (s/max)*h); ctx.fillStyle = 'rgba(251,113,133,0.9)'; ctx.fillRect(c.width*0.75 - w/2, c.height-20 - (r/max)*h, w, (r/max)*h);
      ctx.fillStyle='var(--muted)'; ctx.font='14px sans-serif'; ctx.fillText('Sessions', c.width*0.25 - 28, c.height-2); ctx.fillText('Cards', c.width*0.75 - 20, c.height-2);
    }catch(e){console.warn(e);} }

  // --- Resources ---
  $('addResourceBtn').addEventListener('click', ()=>{ const url=$('resourceUrl').value||''; const title=$('resourceTitle').value||url; if(!url) return showToast('Paste URL first'); DB.resources.push({ id:uid(), title, url, added:Date.now() }); save(); renderResources(); showToast('Resource saved'); });
  function renderResources(){ const ul=$('resourcesList'); ul.innerHTML=''; DB.resources.forEach(r=>{ const li=document.createElement('li'); li.innerHTML=`<a href='${r.url}' target='_blank'>${r.title}</a> <div class='small'>${new Date(r.added).toLocaleDateString()}</div>`; ul.appendChild(li); }); }

  // --- Export / Import / Backup ---
  $('exportBtn').addEventListener('click', ()=>{ const data = JSON.stringify(DB,null,2); const blob = new Blob([data],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='study-companion-backup-'+Date.now()+'.json'; a.click(); showToast('Exported'); });
  $('importFile').addEventListener('change', (ev)=>{ const f=ev.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const obj=JSON.parse(r.result); Object.assign(DB,obj); save(); renderAll(); showToast('Imported'); }catch(e){ showToast('Import failed'); }}; r.readAsText(f); });
  document.addEventListener('dragover', e=>e.preventDefault()); document.addEventListener('drop', e=>e.preventDefault());
  // Allow clicking header export to open file chooser for import on long-press
  document.querySelector('#exportBtn').addEventListener('contextmenu', (e)=>{ e.preventDefault(); $('importFile').click(); });

  // --- Search, keywords, repeated phrases ---
  $('noteSearch')?.addEventListener('input', (e)=>{ const q=e.target.value.toLowerCase(); const ul=$('notesList'); ul.innerHTML=''; DB.notes.filter(n=> (n.title+n.body).toLowerCase().includes(q)).forEach(n=>{ const li=document.createElement('li'); li.innerHTML=`<strong>${n.title}</strong><div class='small'>${estimateReadingTime(n.body)}m</div>`; ul.appendChild(li); }); });

  // --- Misc: achievements, stats, onboarding ---
  function grantAchievement(id,title){ if(DB.achievements.find(a=>a.id===id)) return; DB.achievements.push({id,title,ts:Date.now()}); save(); renderAchievements(); showToast('Achievement: '+title,4000); }
  function renderAchievements(){ const ul=$('achievements'); ul.innerHTML=''; DB.achievements.forEach(a=>{ const li=document.createElement('li'); li.textContent = a.title + ' • ' + new Date(a.ts).toLocaleDateString(); ul.appendChild(li); }); }

  // --- Initialization ---
  function renderAll(){ renderTasks(); renderNotes(); renderCardStats(); renderSessions(); renderResources(); renderAchievements(); }
  renderAll();

  // Quick capture modal handlers and shortcut
  try{
    const qc = $('quickCapture'); if(qc){ $('quickCancel').addEventListener('click', ()=>{ qc.style.display='none'; }); $('quickSave').addEventListener('click', ()=>{ const title = $('quickTitle').value||'Quick Note'; const body = $('quickBody').value||''; DB.notes.push({ id:uid(), title, body, tags:[], created:Date.now() }); save(); renderNotes(); qc.style.display='none'; $('quickTitle').value=''; $('quickBody').value=''; showToast('Quick note saved'); });
    window.addEventListener('keydown', (e)=>{ if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='n'){ qc.style.display = qc.style.display==='none'?'block':'none'; $('quickTitle').focus(); } });
  }catch(e){}

  // --- Quick sample data for demo ---
  if(!DB._sample){ DB._sample=true; DB.notes.push({ id:uid(), title:'Sample: Photosynthesis', body:'Photosynthesis converts light energy into chemical energy in plants. Chloroplasts absorb sunlight and produce glucose. The main steps: light absorption, water splitting, oxygen release, ATP formation.'}); DB.cards.push({ id:uid(), q:'What organelle performs photosynthesis?', a:'Chloroplasts', ef:2.5, interval:1, repetitions:0, due:Date.now()}); save(); renderAll(); }

  // Keyboard shortcuts
  window.addEventListener('keydown', (e)=>{ if((e.ctrlKey||e.metaKey)&&e.key==='b'){ document.querySelector('.nav-btn[data-section="planner"]').click(); } if((e.ctrlKey||e.metaKey)&&e.key==='k'){ $('noteSearch').focus(); } });

})();