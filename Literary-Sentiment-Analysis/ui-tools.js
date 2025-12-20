// Shared UI utilities for the app
(function(){
  if (window.__ui_tools_loaded) return; window.__ui_tools_loaded = true;

  // Simple toast implementation
  function showToast(msg, type='info', duration=3000) {
    try {
      let container = document.getElementById('ui-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'ui-toast-container';
        container.style.position = 'fixed';
        container.style.right = '16px';
        container.style.bottom = '16px';
        container.style.zIndex = 99999;
        document.body.appendChild(container);
      }
      const t = document.createElement('div');
      t.className = 'ui-toast ui-toast-' + type;
      t.style.background = (type==='error') ? '#ffe6e6' : (type==='info' ? '#eef2ff' : '#f0fff4');
      t.style.color = '#111';
      t.style.padding = '10px 14px';
      t.style.border = '1px solid rgba(0,0,0,0.06)';
      t.style.borderRadius = '8px';
      t.style.marginTop = '8px';
      t.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
      t.textContent = msg;
      container.appendChild(t);
      setTimeout(()=>{ t.style.transition='opacity 300ms'; t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, duration);
    } catch(e){ console.log('Toast:', msg); }
  }

  // Non-blocking confirm using modal; falls back to window.confirm
  function showConfirm(message, onConfirm) {
    try {
      const modal = document.createElement('div');
      modal.style.position = 'fixed'; modal.style.left=0; modal.style.top=0; modal.style.right=0; modal.style.bottom=0;
      modal.style.background='rgba(0,0,0,0.45)'; modal.style.display='flex'; modal.style.alignItems='center'; modal.style.justifyContent='center'; modal.style.zIndex=100000;
      const box = document.createElement('div'); box.style.background='white'; box.style.padding='18px'; box.style.borderRadius='10px'; box.style.maxWidth='420px'; box.style.boxShadow='0 12px 30px rgba(0,0,0,0.2)';
      const p = document.createElement('div'); p.textContent = message; p.style.marginBottom='12px';
      const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='8px'; actions.style.justifyContent='flex-end';
      const ok = document.createElement('button'); ok.textContent='OK'; ok.className='btn'; ok.onclick = ()=>{ modal.remove(); if (typeof onConfirm==='function') onConfirm(); };
      const cancel = document.createElement('button'); cancel.textContent='Cancel'; cancel.className='btn'; cancel.onclick = ()=> modal.remove();
      actions.appendChild(cancel); actions.appendChild(ok);
      box.appendChild(p); box.appendChild(actions); modal.appendChild(box); document.body.appendChild(modal);
    } catch(e){ if (confirm(message)) onConfirm(); }
  }

  // Expose lightweight wrappers if not already provided
  if (!window.showToast) window.showToast = showToast;
  if (!window.showConfirm) window.showConfirm = showConfirm;
  if (!window.notify) window.notify = (msg, opts)=> showToast(msg, opts && opts.type || 'info', opts && opts.delay || 3000);

  // Debounce helper
  function debounce(fn, ms){ let t; return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), ms); }; }
  window.__ui_debounce = debounce;

  // Autosave draft for a textarea/input element by id
  function autosaveDraft(id, storageKey, intervalMs=1500) {
    const el = document.getElementById(id); if (!el) return;
    // load
    try { const saved = localStorage.getItem(storageKey); if (saved) el.value = saved; } catch(e){}
    const save = debounce(()=>{ try{ localStorage.setItem(storageKey, el.value); showToast('Draft saved', 'info', 900);}catch(e){} }, intervalMs);
    el.addEventListener('input', save);
    // Ctrl+S
    el.addEventListener('keydown', (ev)=>{ if ((ev.ctrlKey||ev.metaKey) && ev.key.toLowerCase()==='s'){ ev.preventDefault(); try{ localStorage.setItem(storageKey, el.value); showToast('Draft saved', 'info', 900);}catch(e){} } });
    return { clear: ()=>localStorage.removeItem(storageKey) };
  }
  window.autosaveDraft = autosaveDraft;

  // Export/import annotations (advancedAnnotations key)
  function exportAnnotations() {
    try{
      const raw = localStorage.getItem('advancedAnnotations')||'[]';
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='annotations.json'; a.click(); URL.revokeObjectURL(url); showToast('Annotations exported', 'info', 1500);
    }catch(e){ showToast('Export failed','error',2500); console.error(e); }
  }
  function importAnnotationsFile(file){
    const r=new FileReader(); r.onload = (e)=>{ try{ const json=JSON.parse(e.target.result); if(!Array.isArray(json)) throw new Error('Invalid format'); localStorage.setItem('advancedAnnotations', JSON.stringify(json)); showToast('Annotations imported', 'info', 1500); if (typeof renderAllAnnotations==='function') renderAllAnnotations(); }catch(err){ showToast('Import failed','error',2500); console.error(err);} };
    r.readAsText(file);
  }
  window.exportAnnotations = exportAnnotations; window.importAnnotationsFile = importAnnotationsFile;

  // Simple extractive summarizer: pick top 3 sentences by word overlap frequency
  function simpleSummarize(text, maxSentences=3){ if(!text) return ''; const sents = text.match(/[^.!?]+[.!?]?/g) || []; if(sents.length<=maxSentences) return sents.join(' ');
    const freq = {}; text.split(/\s+/).forEach(w=>{ const k=w.toLowerCase().replace(/[^a-z0-9]/g,''); if(k.length<3) return; freq[k]=(freq[k]||0)+1; });
    const scored = sents.map(s=>({s,score: (s.split(/\s+/).reduce((acc,w)=> acc + (freq[(w.toLowerCase().replace(/[^a-z0-9]/g,'')||'')]||0),0))}));
    scored.sort((a,b)=>b.score-a.score);
    return scored.slice(0,maxSentences).map(x=>x.s.trim()).join(' ');
  }
  window.simpleSummarize = simpleSummarize;

  // Copy link / permalink helper
  function copyPermalink() { try{ const encoded = encodeURIComponent(window.currentText||''); const url = window.location.href.split('?')[0] + '?text=' + encoded; navigator.clipboard.writeText(url).then(()=>showToast('Permalink copied', 'info', 1500)); }catch(e){ console.warn(e);} }
  window.copyPermalink = copyPermalink;

  // Download word frequency as CSV from latestAnalysisData.wordsList
  function downloadWordFreqCSV() {
    try{
      const data = window.latestAnalysisData || {};
      const list = data.wordsList || (data.words || []);
      if(!list || !list.length) { showToast('No word data to export','error',2000); return; }
      const freq = {};
      list.forEach(w=>{ const k=(w||'').toLowerCase().replace(/[^a-z0-9]/g,''); if(!k) return; freq[k]=(freq[k]||0)+1; });
      const rows = [['word','count']].concat(Object.entries(freq).sort((a,b)=>b[1]-a[1]));
      const csv = rows.map(r=>r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='wordfreq.csv'; a.click(); URL.revokeObjectURL(url); showToast('Word frequency downloaded', 'info', 1500);
    }catch(e){ console.error(e); showToast('Export failed','error',2000); }
  }
  window.downloadWordFreqCSV = downloadWordFreqCSV;

  // Export annotated HTML: wraps annotated snippets from advancedAnnotations into spans
  function exportAnnotatedHTML() {
    try{
      const text = window.currentText || localStorage.getItem('lastText') || '';
      if (!text) { showToast('No text to export', 'error'); return; }
      const anns = JSON.parse(localStorage.getItem('advancedAnnotations')||'[]');
      let out = text;
      anns.forEach(a=>{
        if (!a.text) return;
        const esc = a.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(esc);
        out = out.replace(re, `<span class="annotation-export" title="${(a.title||'').replace(/\"/g,'&quot;')}">${a.text}</span>`);
      });
      const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="styles.css"></head><body><pre>${out}</pre></body></html>`;
      const blob = new Blob([html], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='annotated.html'; a.click(); URL.revokeObjectURL(url); showToast('Annotated HTML exported', 'info', 1500);
    }catch(e){ console.error(e); showToast('Export failed','error'); }
  }
  window.exportAnnotatedHTML = exportAnnotatedHTML;

  // Find repeated phrases (simple n-gram frequency)
  function findRepeatedPhrases(text, n=3, top=10) {
    if (!text) return [];
    const words = text.toLowerCase().split(/\s+/).map(w=>w.replace(/[^a-z0-9]/g,'' )).filter(Boolean);
    const counts = {};
    for (let i=0;i<words.length - (n-1);i++){ const gram = words.slice(i,i+n).join(' '); counts[gram]=(counts[gram]||0)+1; }
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,top).map(x=>({phrase:x[0],count:x[1]}));
  }
  window.findRepeatedPhrases = findRepeatedPhrases;

  // Copy annotations JSON to clipboard
  function copyAnnotationsToClipboard() {
    try{
      const raw = localStorage.getItem('advancedAnnotations') || '[]';
      navigator.clipboard.writeText(raw).then(()=>showToast('Annotations copied to clipboard', 'info', 1200));
    }catch(e){ console.error(e); showToast('Copy failed','error'); }
  }
  window.copyAnnotationsToClipboard = copyAnnotationsToClipboard;

  // Non-blocking prompt modal that returns value via callback
  function showPrompt(message, defaultValue, cb) {
    try {
      const modal = document.createElement('div');
      modal.style.position='fixed'; modal.style.left=0; modal.style.top=0; modal.style.right=0; modal.style.bottom=0; modal.style.background='rgba(0,0,0,0.45)'; modal.style.zIndex=100000; modal.style.display='flex'; modal.style.alignItems='center'; modal.style.justifyContent='center';
      const box = document.createElement('div'); box.style.background='white'; box.style.padding='12px'; box.style.borderRadius='8px'; box.style.maxWidth='560px'; box.style.width='90%';
      box.innerHTML = `<div style="font-weight:700;margin-bottom:8px;">${message}</div><input id="__ui_prompt_input" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-bottom:8px;" value="${(defaultValue||'').replace(/"/g,'&quot;')}"><div style="text-align:right"><button id="__ui_prompt_cancel" class="btn">Cancel</button> <button id="__ui_prompt_ok" class="btn btn-primary">OK</button></div>`;
      modal.appendChild(box); document.body.appendChild(modal);
      const inp = document.getElementById('__ui_prompt_input'); inp.focus();
      document.getElementById('__ui_prompt_cancel').onclick = ()=>{ modal.remove(); if (typeof cb === 'function') cb(null); };
      document.getElementById('__ui_prompt_ok').onclick = ()=>{ const v=inp.value; modal.remove(); if (typeof cb === 'function') cb(v); };
    } catch(e){ const r = prompt(message, defaultValue); if (typeof cb === 'function') cb(r); }
  }
  window.showPrompt = showPrompt;

  // Estimate reading time in minutes for a text
  function estimateReadingTime(text, wpm=200) { if (!text) return 0; const words = text.split(/\s+/).filter(Boolean).length; return Math.max(1, Math.round(words / wpm)); }
  window.estimateReadingTime = estimateReadingTime;

  // Advanced summarizer: extractive + key-phrases snippet
  function advancedSummarize(text, sentences=3) {
    const s = simpleSummarize(text, sentences);
    const phrases = findRepeatedPhrases(text, 2, 5).map(p => p.phrase);
    return { summary: s, keyPhrases: phrases };
  }
  window.advancedSummarize = advancedSummarize;

  // Schedule periodic autosave reminders (returns cancel function)
  function scheduleAutosaveReminder(intervalMs=600000) {
    const id = setInterval(()=>{ showToast('Reminder: consider saving your draft', 'info', 2500); }, intervalMs);
    return ()=>clearInterval(id);
  }
  window.scheduleAutosaveReminder = scheduleAutosaveReminder;

  // Theme toggle
  function toggleTheme() { try{
      // If a page defines its own toggleDarkMode handler, prefer calling it (so page state stays in sync)
      if (typeof window.toggleDarkMode === 'function' && window.toggleDarkMode !== toggleTheme) {
        try { window.toggleDarkMode(); return; } catch (e) { /* fallback below */ }
      }
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', isDark ? 'true' : 'false');
      // reflect aria-pressed on any theme-toggle buttons
      try { document.querySelectorAll('.theme-toggle').forEach(b => b.setAttribute('aria-pressed', isDark)); } catch (e) {}
      showToast(isDark ? 'Dark mode on' : 'Dark mode off', 'info', 900);
    } catch (e) {}
  }
  window.toggleTheme = toggleTheme;
  // Provide backward-compatible alias
  if (!window.toggleDarkMode) window.toggleDarkMode = toggleTheme;

  // Clear caches / reset localStorage keys used by app
  function clearAppData() {
    showConfirm('Clear app data (history, annotations, drafts)?', ()=>{
      try{ localStorage.removeItem('analysisHistory'); localStorage.removeItem('advancedAnnotations'); localStorage.removeItem('lastText'); showToast('App data cleared','info',1500); if(typeof renderAllAnnotations==='function') renderAllAnnotations(); }catch(e){ console.error(e); showToast('Failed to clear','error',2000); }
    });
  }
  window.clearAppData = clearAppData;

  // Keyboard shortcuts (global): Ctrl+Enter -> analyze (if analyzeText exists)
  function setupGlobalShortcuts() {
    window.addEventListener('keydown', (ev)=>{
      if ((ev.ctrlKey||ev.metaKey) && ev.key === 'Enter') {
        if (typeof analyzeText === 'function') { ev.preventDefault(); const b=document.getElementById('mainAnalyzeBtn'); analyzeText(b); }
      }
      if ((ev.ctrlKey||ev.metaKey) && ev.key.toLowerCase()==='s') {
        // save current draft if textarea present
        const t = document.querySelector('textarea#mainText') || document.querySelector('textarea#textInput'); if(t){ ev.preventDefault(); try{ localStorage.setItem('lastText', t.value); showToast('Draft saved', 'info', 900);}catch(e){} }
      }
    });
  }
  setupGlobalShortcuts();

  // Initialize theme based on localStorage (apply early)
  try{ if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode'); }catch(e){}
  // Ensure any theme-toggle buttons reflect initial state immediately
  try { const pressed = document.body.classList.contains('dark-mode'); document.querySelectorAll('.theme-toggle').forEach(b => b.setAttribute('aria-pressed', pressed)); } catch(e){}

  // Attach autosave and word/char counter for common textarea ids
  document.addEventListener('DOMContentLoaded', ()=>{
    // common textarea ids used across pages
    const mainIds = ['textInput','text-input','text-input-main','text-input-area','mainText','textInputMain'];
    let bound = false;
    for (const id of mainIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      // autosave with key
      try{ autosaveDraft(el.id, 'draft:' + el.id, 1200); }catch(e){}
      // word/char counter
      const counter = document.createElement('div'); counter.className='word-counter'; counter.setAttribute('aria-live','polite');
      el.parentNode.insertBefore(counter, el.nextSibling);
      const update = ()=>{ const text = el.value||''; const words = (text.match(/\S+/g)||[]).length; const chars = text.length; counter.textContent = words + ' words • ' + chars + ' chars • ' + estimateReadingTime(text) + ' min read'; };
      el.addEventListener('input', debounce(update, 120)); update(); bound = true; break;
    }

    // Add skip-to-content link when header exists
    const header = document.querySelector('.app-header'); if (header && !document.querySelector('.skip-link')) {
      const skip = document.createElement('a'); skip.href='#main-content'; skip.className='skip-link'; skip.textContent='Skip to content'; document.body.insertBefore(skip, document.body.firstChild);
      // ensure main content has id
      const main = document.querySelector('main') || document.querySelector('.container'); if (main && !main.id) main.id = 'main-content';
    }
    // Set initial aria state for any theme-toggle buttons
    try { const pressed = document.body.classList.contains('dark-mode'); document.querySelectorAll('.theme-toggle').forEach(b => b.setAttribute('aria-pressed', pressed)); } catch(e){}

    // Add colorful accents: apply badge to logo and underline accent to headings
    try {
      document.querySelectorAll('.logo').forEach(el=> el.classList.add('brand-badge'));
      document.querySelectorAll('h1,h2').forEach(h=>{ if(!h.classList.contains('accent-underline')) h.classList.add('accent-underline'); });
    } catch(e) { /* non-fatal */ }
  });

  // Provide safe no-op wrappers for commonly used actions if not defined
  const safeActions = {
    pasteFromClipboard: ()=>{ navigator.clipboard?.readText().then(t=>{ const el = document.getElementById('textInput') || document.querySelector('textarea'); if(el){ el.value = (el.value? el.value + '\n' : '') + t; showToast('Pasted from clipboard','info',1200); } else showToast('No input found to paste into','error'); }).catch(()=>showToast('Paste failed','error')); },
    loadExample: (name)=>{ try{ if (typeof window.loadExample === 'function') return window.loadExample(name); const el = document.getElementById('textInput') || document.querySelector('textarea'); if (!el) return showToast('No input found','error'); const EX = (window.examples || {}); if (name && EX[name]) el.value = EX[name]; else el.value = EX['frost'] || Object.values(EX)[0] || el.value; showToast('Example loaded','info',900); },
    generatePermalink: ()=>{ if (typeof copyPermalink==='function') copyPermalink(); else showToast('Permalink not available','error'); },
    saveAnalysis: ()=>{ try{ localStorage.setItem('lastText', (document.getElementById('textInput')||{value:''}).value); showToast('Analysis saved locally', 'info', 1200); }catch(e){showToast('Save failed','error')} },
    clearAll: ()=>{ try{ const el=document.getElementById('textInput')||document.querySelector('textarea'); if(el) el.value=''; showToast('Cleared','info',900); }catch(e){showToast('Clear failed','error')} },
    splitIntoChunks: ()=>{ showToast('Split into chunks not implemented in UI-tools', 'info', 1200); },
    analyzeAllChunks: ()=>{ showToast('Analyze chunks not implemented here', 'info', 1200); },
    exportChunksCSV: ()=>{ showToast('Export chunks not implemented here', 'info', 1200); },
    speakAllChunks: ()=>{ showToast('Text-to-speech not available', 'info', 1200); },
    runSummaryMode: ()=>{ try{ const t=document.getElementById('textInput')||document.querySelector('textarea'); if(!t) return showToast('No text','error'); const s = simpleSummarize(t.value, 3); document.getElementById('summaryContent') && (document.getElementById('summaryContent').innerText = s); showToast('Summary generated (simple)', 'info', 1400); }catch(e){showToast('Summary failed','error')} },
    exportAsMarkdown: ()=>{ try{ const s = document.getElementById('summaryContent')?.innerText || ''; const blob = new Blob([s], { type: 'text/markdown' }); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='summary.md'; a.click(); showToast('Markdown exported','info',1100); }catch(e){showToast('Export failed','error')} },
    askAI: ()=>{ showToast('AI Q&A not configured to run locally', 'info', 1400); }
  };
  Object.keys(safeActions).forEach(k=>{ if (!window[k]) window[k] = safeActions[k]; });

  // Text-to-speech for current text input or latest analysis
  function speakCurrentText() {
    try {
      const text = (document.getElementById('textInput') && document.getElementById('textInput').value) || window.currentText || (document.querySelector('textarea') && document.querySelector('textarea').value) || '';
      if (!text) { showToast('No text to read', 'error'); return; }
      if (!('speechSynthesis' in window)) { showToast('Speech synthesis not supported in this browser', 'error'); return; }
      try { speechSynthesis.cancel(); } catch (e) {}
      const ut = new SpeechSynthesisUtterance(text);
      ut.rate = 1.0; ut.pitch = 1.0; ut.volume = 1.0;
      ut.onend = ()=> showToast('Finished reading', 'info', 900);
      speechSynthesis.speak(ut);
      showToast('Reading started', 'info', 900);
    } catch (e) { console.warn(e); showToast('Unable to start reading', 'error'); }
  }
  window.speakCurrentText = speakCurrentText;

  // TTS Controls: pause / resume / stop
  function ttsPause() { try{ if (speechSynthesis && speechSynthesis.speaking) { speechSynthesis.pause(); showToast('Reading paused','info',800); } }catch(e){}};
  function ttsResume() { try{ if (speechSynthesis && speechSynthesis.paused) { speechSynthesis.resume(); showToast('Reading resumed','info',800); } }catch(e){} };
  function ttsStop() { try{ if (speechSynthesis) { speechSynthesis.cancel(); showToast('Reading stopped','info',800); } }catch(e){} };
  window.ttsPause = ttsPause; window.ttsResume = ttsResume; window.ttsStop = ttsStop;

  // Font size controls (persisted)
  function applyFontSize(size) { try{ document.documentElement.style.fontSize = size + 'px'; localStorage.setItem('uiFontSize', String(size)); }catch(e){} }
  function increaseFontSize() { try{ const cur = parseInt(getComputedStyle(document.documentElement).fontSize,10)||16; const n = Math.min(24, cur + 1); applyFontSize(n); showToast('Font increased', 'info', 800); }catch(e){} }
  function decreaseFontSize() { try{ const cur = parseInt(getComputedStyle(document.documentElement).fontSize,10)||16; const n = Math.max(12, cur - 1); applyFontSize(n); showToast('Font decreased', 'info', 800); }catch(e){} }
  function resetFontSize() { try{ applyFontSize(16); showToast('Font reset', 'info', 800); }catch(e){} }
  window.increaseFontSize = increaseFontSize; window.decreaseFontSize = decreaseFontSize; window.resetFontSize = resetFontSize;

  // Apply stored font size on load
  try { const fs = parseInt(localStorage.getItem('uiFontSize'),10); if (fs && !isNaN(fs)) document.documentElement.style.fontSize = fs + 'px'; } catch (e) {}

  // Rebind inline onclick attributes to safe listeners (handles simple args and `this`)
  function rebindInlineOnclicks() {
    try {
      const elems = Array.from(document.querySelectorAll('[onclick]'));
      elems.forEach(el => {
        try {
          if (el.dataset.onclickRebound) return; // skip already rebound
          const code = el.getAttribute('onclick');
          if (!code) return;
          // remove inline handler to avoid double-calls
          el.removeAttribute('onclick');
          // create a wrapper that executes the inline code with 'this' bound to element and provides event
          let fn;
          try {
            fn = new Function('event', 'with(this){\n' + code + '\n}');
          } catch (e) {
            // fallback: wrap in try/catch
            fn = function(event){ try { (function(){ /* original code */ }).call(this, event); } catch(e) { console.warn('inline onclick failed', e); } };
          }
          el.addEventListener('click', function(ev){ try { const ret = fn.call(el, ev); if (ret && typeof ret.then === 'function') ret.catch(e=>console.warn('Async handler error', e)); } catch(e){ console.warn('onclick exec error', e); } });
          el.dataset.onclickRebound = '1';
        } catch (e) { console.warn('rebind element failed', e); }
      });
    } catch (e) { console.warn('rebindInlineOnclicks failed', e); }
  }
  document.addEventListener('DOMContentLoaded', rebindInlineOnclicks);
  // If script loaded after DOMContentLoaded, invoke immediately to avoid missed bindings
  try { if (document.readyState !== 'loading') rebindInlineOnclicks(); } catch(e){}
  // expose for manual calls
  window.rebindInlineOnclicks = rebindInlineOnclicks;

  // Observe DOM mutations and rebind new inline onclick attributes automatically
  try {
    const mo = new MutationObserver((mutList) => {
      let found = false;
      for (const m of mutList) {
        if (m.addedNodes && m.addedNodes.length) { found = true; break; }
        if (m.type === 'attributes' && m.attributeName === 'onclick') { found = true; break; }
      }
      if (found) {
        // small debounce to batch rapid mutations
        clearTimeout(window.__rebind_timeout);
        window.__rebind_timeout = setTimeout(() => { try { rebindInlineOnclicks(); } catch(e){} }, 80);
      }
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['onclick'] });
  } catch (e) { /* ignore if MutationObserver not available */ }

  // Attach critical handlers for analyze/theme buttons to ensure they work
  function attachCriticalButtonHandlers() {
    try {
      // Theme toggle buttons
      document.querySelectorAll('.theme-toggle').forEach(btn => {
        // avoid duplicate listeners
        if (btn.dataset._themeBound) return; btn.dataset._themeBound = '1';
        btn.addEventListener('click', (ev) => { try { if (typeof toggleTheme === 'function') toggleTheme(); else if (typeof toggleDarkMode === 'function') toggleDarkMode(); } catch(e) { console.error('theme toggle', e); showToast('Theme toggle failed','error'); } });
      });

      // Analyze buttons (common ids/classes)
      const analyzeTargets = new Set();
      ['mainAnalyzeBtn','toolbarAnalyzeBtn'].forEach(id=>{ const el=document.getElementById(id); if(el) analyzeTargets.add(el); });
      document.querySelectorAll('button').forEach(b=>{ const txt = (b.innerText||'').toLowerCase(); if(txt.includes('analy') || b.classList.contains('analyze') ) analyzeTargets.add(b); });
      analyzeTargets.forEach(b=>{
        if (b.dataset._analyzeBound) return; b.dataset._analyzeBound = '1';
        b.addEventListener('click', (ev)=>{
          try {
            if (typeof analyzeText === 'function') { analyzeText(b); }
            else { showToast('Analyze function not available', 'error'); }
          } catch (err) {
            console.error('analyze handler error', err);
            showToast('Analyze failed: ' + (err && err.message ? err.message : 'error'), 'error', 2500);
          }
        });
      });
    } catch (e) { console.warn('attachCriticalButtonHandlers failed', e); }
  }
  // run now and on DOM mutations
  try { attachCriticalButtonHandlers(); } catch(e){}
  // lightweight observer to re-run bindings when new nodes appear
  try {
    const _mo = new MutationObserver(() => { try { attachCriticalButtonHandlers(); } catch(e){} });
    _mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  } catch(e) {}

  // --- Safe global stubs for page-specific functions ---
  function _noopNotify(name){ return function(){ showToast(name + ' not available on this page', 'info', 1400); }; }

  if (!window.removeTopFixedOverlay) window.removeTopFixedOverlay = function(){ try{ const el = document.getElementById('__top_fixed_overlay'); if(el) el.remove(); else showToast('No overlay to close','info',900); }catch(e){ showToast('Close overlay failed','error'); } };

  if (!window.dashCompare) window.dashCompare = function(){ try{ const a = document.getElementById('dashA')?.value || ''; const b = document.getElementById('dashB')?.value || ''; if(!a||!b) return showToast('Paste both texts to compare','error'); const ana = (typeof performAnalysis==='function')?performAnalysis(a):{wordCount:a.split(/\s+/).filter(Boolean).length}; const anb = (typeof performAnalysis==='function')?performAnalysis(b):{wordCount:b.split(/\s+/).filter(Boolean).length}; const out = `A: ${ana.wordCount} words • ${ana.sentiment||'unknown'}\nB: ${anb.wordCount} words • ${anb.sentiment||'unknown'}`; const el = document.getElementById('dashCompareResults'); if(el) el.innerText = out; else showToast(out,'info',3000); }catch(e){ showToast('Compare failed','error'); } };

  if (!window.openCompareModal) window.openCompareModal = _noopNotify('Compare modal');
  if (!window.openAPIStub) window.openAPIStub = _noopNotify('API Stub');
  if (!window.showHistory) window.showHistory = function(){ try{ const hist = JSON.parse(localStorage.getItem('analysisHistory')||'[]'); showToast('History entries: ' + hist.length, 'info', 1200); }catch(e){ showToast('No history','info'); } };

  if (!window.saveAnnotation) window.saveAnnotation = function(){ try{ const title = document.getElementById('annotationTitle')?.value || 'Annotation'; const content = document.getElementById('annotationContent')?.value || ''; const arr = JSON.parse(localStorage.getItem('advancedAnnotations')||'[]'); const id = 'ann-' + Math.random().toString(36).slice(2,9); arr.push({ id, title, content, timestamp: Date.now() }); localStorage.setItem('advancedAnnotations', JSON.stringify(arr)); showToast('Annotation saved', 'info', 1200); if (typeof renderAllAnnotations === 'function') renderAllAnnotations(); }catch(e){ showToast('Save failed','error'); } };

  if (!window.exportResults) window.exportResults = function(){ try{ const txt = window.currentText || document.getElementById('textInput')?.value || ''; const blob = new Blob([txt], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'analysis.txt'; a.click(); showToast('Exported text', 'info'); }catch(e){ showToast('Export failed','error'); } };

  if (!window.saveAnnotationTitle) window.saveAnnotationTitle = function(id){ try{ const el = document.getElementById('ann-title-' + id); const arr = JSON.parse(localStorage.getItem('advancedAnnotations')||'[]'); const it = arr.find(x=>String(x.id)===String(id)); if(it && el){ it.title = el.innerText; localStorage.setItem('advancedAnnotations', JSON.stringify(arr)); showToast('Title saved','info'); } }catch(e){ showToast('Save title failed','error'); } };

  if (!window.saveAnnotationContent) window.saveAnnotationContent = function(id){ try{ const el = document.getElementById('ann-content-' + id); const arr = JSON.parse(localStorage.getItem('advancedAnnotations')||'[]'); const it = arr.find(x=>String(x.id)===String(id)); if(it && el){ it.content = el.innerText; localStorage.setItem('advancedAnnotations', JSON.stringify(arr)); showToast('Content saved','info'); } }catch(e){ showToast('Save content failed','error'); } };

  // ensure renderAllAnnotations exists as a friendly no-op
  if (!window.renderAllAnnotations) window.renderAllAnnotations = function(){ try{ const raw = localStorage.getItem('advancedAnnotations'); if(!raw) return; const list = JSON.parse(raw); const container = document.getElementById('annotations-container'); if(!container) return; container.innerHTML = list.map(a=>`<div class="list-item"><strong>${a.title}</strong><div>${a.content}</div></div>`).join(''); }catch(e){ console.warn('renderAllAnnotations noop', e); } };

  // Fallback analyzeText: call page's performAnalysis, or POST to /analyze if server available, or simple summarize
  if (!window.analyzeText) window.analyzeText = function(caller){ try{ const ta = document.getElementById('textInput') || document.querySelector('textarea'); const text = ta ? ta.value.trim() : (window.currentText || ''); if(!text) return showToast('Please enter some text to analyze','error'); if (typeof performAnalysis === 'function') { const res = performAnalysis(text); window.currentAnalysis = res; try{ document.getElementById('summaryContent') && (document.getElementById('summaryContent').innerText = simpleSummarize(text,3)); }catch(e){} showToast('Analysis (local) complete','info',1200); return; } // try server
      fetch('/analyze',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text, type: 'general' }) }).then(r=>r.json()).then(data=>{ if(data && data.success){ window.currentAnalysis = data.results; document.getElementById('summaryContent') && (document.getElementById('summaryContent').innerText = data.summary || ''); showToast('Analysis complete','info',1200);} else { showToast('Server analysis failed','error'); } }).catch(()=>{ // fallback
        const s = simpleSummarize(text,3); document.getElementById('summaryContent') && (document.getElementById('summaryContent').innerText = s); showToast('Analysis (fallback) complete','info',1200);
      }); }catch(e){ showToast('Analyze failed','error'); } };

  // Share to Twitter with permalink or summary
  function shareToTwitter(text) {
    try {
      const url = window.location.href.split('?')[0];
      const summary = text || (document.getElementById('summaryContent') && document.getElementById('summaryContent').innerText) || '';
      const q = encodeURIComponent((summary || '').slice(0,240) + ' ' + url);
      const tw = 'https://twitter.com/intent/tweet?text=' + q;
      window.open(tw, '_blank', 'noopener');
    } catch (e) { showToast('Unable to open Twitter','error'); }
  }
  window.shareToTwitter = shareToTwitter;

  // Download current analysis or latestAnalysisData as JSON
  function downloadJSONAnalysis() {
    try {
      const data = window.latestAnalysisData || window.currentAnalysis || { text: window.currentText || '' };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='analysis.json'; a.click(); URL.revokeObjectURL(url); showToast('Analysis exported (JSON)','info',1400);
    } catch (e) { console.error(e); showToast('Export failed','error'); }
  }
  window.downloadJSONAnalysis = downloadJSONAnalysis;

  // High-contrast mode toggle for accessibility
  function toggleHighContrast() { try{ document.documentElement.classList.toggle('high-contrast'); const on = document.documentElement.classList.contains('high-contrast'); localStorage.setItem('highContrast', on ? 'true' : 'false'); showToast(on ? 'High contrast on' : 'High contrast off','info',900); }catch(e){} }
  window.toggleHighContrast = toggleHighContrast;

  // Apply saved high-contrast
  try{ if (localStorage.getItem('highContrast') === 'true') document.documentElement.classList.add('high-contrast'); }catch(e){}

  // Highlight top repeated phrases in the visible textarea
  function highlightTopPhrases(n=5) {
    try{
      const el = document.getElementById('textInput') || document.querySelector('textarea'); if(!el) { showToast('No text to highlight','error'); return; }
      const phrases = findRepeatedPhrases(el.value, 2, 20).slice(0,n).map(p=>p.phrase);
      if (!phrases.length) { showToast('No repeated phrases found','info'); return; }
      // Create overlay view
      const overlayId = '__phrase_highlight_overlay'; let overlay = document.getElementById(overlayId);
      if (overlay) overlay.remove();
      overlay = document.createElement('div'); overlay.id = overlayId; overlay.className = 'card'; overlay.style.marginTop = '12px'; overlay.innerHTML = '<h3>Top phrases</h3>' + phrases.map(p=>`<div style="padding:6px;border-bottom:1px solid var(--border);">${p}</div>`).join('');
      el.parentNode.insertBefore(overlay, el.nextSibling);
      showToast('Top phrases highlighted below input','info',1400);
    }catch(e){ console.error(e); showToast('Highlight failed','error'); }
  }
  window.highlightTopPhrases = highlightTopPhrases;

  // Save/load UI presets (e.g., font size, dark mode)
  function saveUIPreset(name) { try{ const preset = { fontSize: getComputedStyle(document.documentElement).fontSize, darkMode: document.body.classList.contains('dark-mode'), highContrast: document.documentElement.classList.contains('high-contrast') }; localStorage.setItem('uiPreset:' + name, JSON.stringify(preset)); showToast('Preset saved','info',900); }catch(e){ showToast('Save preset failed','error'); } }
  function loadUIPreset(name) { try{ const raw = localStorage.getItem('uiPreset:' + name); if(!raw) return showToast('Preset not found','error'); const p = JSON.parse(raw); if(p.fontSize) document.documentElement.style.fontSize = p.fontSize; if(p.darkMode) document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode'); if(p.highContrast) document.documentElement.classList.add('high-contrast'); else document.documentElement.classList.remove('high-contrast'); showToast('Preset loaded','info',900); }catch(e){ showToast('Load preset failed','error'); } }
  window.saveUIPreset = saveUIPreset; window.loadUIPreset = loadUIPreset;

  // Mock batch analyze for a set of sample texts (non-blocking, lightweight)
  function batchAnalyzeMock(items) {
    try{
      const texts = items || (localStorage.getItem('batchTexts') ? JSON.parse(localStorage.getItem('batchTexts')) : []);
      if(!texts.length) { showToast('No texts provided for batch analyze','error'); return; }
      const results = texts.map((t, i) => ({ id: i+1, words: (t.match(/\S+/g)||[]).length, sentiment: (t.match(/love|happy|joy|good/i) ? 'positive' : 'neutral') }));
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' }); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='batch-results.json'; a.click(); URL.revokeObjectURL(a.href); showToast('Batch analysis complete (mock)', 'info', 1500);
    }catch(e){ console.error(e); showToast('Batch analyze failed','error'); }
  }
  window.batchAnalyzeMock = batchAnalyzeMock;

  // Feedback modal
  function openFeedbackModal(){
    const modal = document.createElement('div'); modal.style.position='fixed'; modal.style.left=0; modal.style.top=0; modal.style.right=0; modal.style.bottom=0; modal.style.background='rgba(0,0,0,0.45)'; modal.style.zIndex=100000; modal.style.display='flex'; modal.style.alignItems='center'; modal.style.justifyContent='center';
    const box = document.createElement('div'); box.style.background='white'; box.style.padding='16px'; box.style.borderRadius='10px'; box.style.maxWidth='560px'; box.style.width='90%';
    box.innerHTML = `<h3>Feedback</h3><p style="color:#444">Tell us what's wrong or suggest improvements.</p><textarea id="uiFeedbackText" style="width:100%;min-height:120px;margin-bottom:8px;"></textarea><div style="display:flex;gap:8px;justify-content:flex-end;"><button id="uiFeedbackCancel" class="btn">Cancel</button><button id="uiFeedbackSend" class="btn btn-primary">Send</button></div>`;
    modal.appendChild(box); document.body.appendChild(modal);
    document.getElementById('uiFeedbackCancel').onclick = ()=> modal.remove();
    document.getElementById('uiFeedbackSend').onclick = ()=>{ const v = document.getElementById('uiFeedbackText').value.trim(); if(!v){ showToast('Please enter feedback','error',1500); return; } const fb = JSON.parse(localStorage.getItem('localFeedback')||'[]'); fb.push({text:v, ts: Date.now(), page: window.location.pathname}); localStorage.setItem('localFeedback', JSON.stringify(fb)); showToast('Thanks — feedback saved locally', 'info', 2000); modal.remove(); };
  }
  window.openFeedbackModal = openFeedbackModal;

})();
