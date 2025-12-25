/* =========================================================
   DEEP CONTEXT SUMMARY ENGINE
   Human-Grade • Verification-Based • Narrative-First
   ========================================================= */

/* ===================== STATE ===================== */

window.DeepSummaryEngine = {
  text: '',
  paragraphs: [],
  summaries: [],
  entities: {},
};

/* ===================== DOM ===================== */

function getSummaryContainer() {
  return document.getElementById('summary-container');
}

/* ===================== INGEST ===================== */

function loadSourceText() {
  const t =
    localStorage.getItem('lastText') ||
    localStorage.getItem('pendingExample') ||
    '';
  DeepSummaryEngine.text = t.trim();
  return DeepSummaryEngine.text;
}

/* ===================== STRUCTURE ===================== */

function splitIntoParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 60);
}

function splitIntoSentences(p) {
  return p
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
}

/* ===================== ENTITY EXTRACTION ===================== */

function extractEntities(sentences) {
  const map = {};

  sentences.forEach(s => {
    const names = s.match(/\b[A-Z][a-z]{2,}\b/g) || [];
    names.forEach(n => {
      if (!map[n]) map[n] = { count: 0, acts: 0 };
      map[n].count++;
      if (/\b(did|said|defended|killed|decided|represented)\b/i.test(s)) {
        map[n].acts++;
      }
    });
  });

  return Object.entries(map)
    .filter(([_, v]) => v.count > 1 || v.acts > 0)
    .map(([k]) => k);
}

/* ===================== INDICATOR CLUSTERS ===================== */

function detectViolenceCluster(sentences) {
  const signals = {
    action: false,
    victim: false,
    consequence: false
  };

  sentences.forEach(s => {
    if (/\b(killed|shot|murdered|assaulted)\b/i.test(s)) signals.action = true;
    if (/\b(man|woman|child|him|her)\b/i.test(s)) signals.victim = true;
    if (/\b(dead|trial|arrest|charged)\b/i.test(s)) signals.consequence = true;
  });

  return Object.values(signals).filter(Boolean).length >= 2;
}

function detectInstitutionConstraint(sentences) {
  let law = 0, limit = 0;

  sentences.forEach(s => {
    if (/\b(court|trial|plea|lawyer|judge)\b/i.test(s)) law++;
    if (/\b(nothing|could not|limited|only)\b/i.test(s)) limit++;
  });

  return law > 0 && limit > 0;
}

/* ===================== POWER & CONTEXT ===================== */

function inferPowerDynamics(sentences) {
  if (detectInstitutionConstraint(sentences)) {
    return 'Legal procedure is present, but it restricts meaningful intervention rather than enabling justice.';
  }
  return '';
}

/* ===================== CORE INTERPRETATION ===================== */

function summarizeParagraph(paragraph) {
  const sentences = splitIntoSentences(paragraph);
  const entities = extractEntities(sentences);

  let summary = '';

  if (detectViolenceCluster(sentences)) {
    summary +=
      'A serious act of violence has already occurred, and the paragraph focuses less on the act itself than on how it is formally processed afterward. ';
  }

  const power = inferPowerDynamics(sentences);
  if (power) summary += power + ' ';

  if (entities.length) {
    summary +=
      entities.slice(0, 2).join(' and ') +
      ' are central to this moment, with their roles defined more by institutional position than personal choice. ';
  }

  if (!summary) {
    summary =
      'The paragraph provides situational context that frames later events and explains why options are constrained from the outset.';
  }

  return summary.trim();
}

/* ===================== MAIN ENTRY ===================== */

window.generateSummary = function () {
  const text = loadSourceText();
  const container = getSummaryContainer();

  if (!container) return;

  if (!text) {
    container.innerHTML = '<small class="muted">No text available.</small>';
    return;
  }

  DeepSummaryEngine.paragraphs = splitIntoParagraphs(text);
  DeepSummaryEngine.summaries = [];

  DeepSummaryEngine.paragraphs.forEach(p => {
    DeepSummaryEngine.summaries.push(summarizeParagraph(p));
  });

  renderSummary();
};

/* ===================== RENDER ===================== */

function renderSummary() {
  const c = getSummaryContainer();
  if (!c) return;

  c.innerHTML = `
    <div class="summary-card">
      ${DeepSummaryEngine.summaries.map(s => `<p>${s}</p>`).join('')}
    </div>
  `;
}
