function analyzeTextCore(text) {
  if (!text || !text.trim()) return null;

  const words = text.match(/\b[\w']+\b/g) || [];
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [];

  return {
    text,
    words,
    sentences,
    wordCount: words.length,
    sentenceCount: sentences.length,
    structure: {
      hasNarration: /\b(I|he|she|they)\b/i.test(text),
      hasConflict: /but|however|yet|although/i.test(text),
      hasJudgment: /should|must|guilty|innocent|wrong|right/i.test(text)
    }
  };
}


/* ---------- STRUCTURE ---------- */

function detectStructure(sentences) {
  return {
    hasNarration: sentences.some(s => /\bI\b|\bhe\b|\bshe\b/i.test(s)),
    hasJudgment: sentences.some(s => /should|must|wrong|right|guilty|innocent/i.test(s)),
    hasConflict: sentences.some(s => /but|however|yet|although/i.test(s))
  };
}

/* ---------- THEMES ---------- */

function extractThemes(sentences) {
  const themes = [];

  if (sentences.some(s => /law|court|trial|judge|guilty/i.test(s)))
    themes.push('justice');

  if (sentences.some(s => /race|black|white|colored/i.test(s)))
    themes.push('race');

  if (sentences.some(s => /father|mother|child|family/i.test(s)))
    themes.push('family');

  if (sentences.some(s => /fear|afraid|danger/i.test(s)))
    themes.push('fear');

  return themes;
}

/* ---------- CLAIMS ---------- */

function extractClaims(sentences) {
  return sentences.filter(s =>
    /is|was|means|shows|proves|because/i.test(s)
  ).slice(0, 6);
}
