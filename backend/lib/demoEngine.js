// backend/lib/demoEngine.js
//
// Demo Mode logic. This never calls out to the network — it always works,
// which is what makes the app demoable with no internet and no API key.
//
// - Recognises the built-in "Network Security — Week 5" sample notes and
//   serves the hand-written content from data/demoConcepts.js.
// - Falls back to simple sentence-extraction heuristics for any other
//   pasted/uploaded text.
// - Includes keyword-based answer scoring for Active Recall / Feynman.

const { CONCEPTS, CONCEPT_ORDER } = require('../data/demoConcepts');
const { SAMPLE_NOTES_TEXT } = require('../data/sampleNotes');

function getSampleMaterial() {
  return {
    source: 'sample',
    text: SAMPLE_NOTES_TEXT,
    concepts: CONCEPT_ORDER.map((key) => CONCEPTS[key]),
  };
}

// Very simple sentence-extraction heuristic for arbitrary pasted text.
// Not a real summarizer — just enough to keep the app "working" outside
// the curated sample notes, per the prototype brief.
function extractGenericConcepts(text) {
  // Split on Latin (.!?) as well as CJK (。！？) terminal punctuation so
  // Korean/Japanese/Chinese sentences are recognised too.
  const sentences = text
    .split(/(?<=[.!?。！？])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12); // shorter threshold: non-Latin scripts pack more meaning per character

  const chunks = sentences.slice(0, 5);

  return chunks.map((s, i) => ({
    id: `generic-${i}`,
    name: `Key idea ${i + 1}`,
    icon: '📝',
    simple: s,
    detailed: s,
    analogy: s,
    keyPoints: [s],
    // \p{L}/\p{N} are Unicode-aware "letter"/"number" classes, so this splits
    // correctly on Hangul, Latin, or any other script — not just ASCII words.
    keywords: s
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 1)
      .slice(0, 8),
    mcqs: [
      {
        q: 'Which statement appears in your notes?',
        options: [s, 'This was not in your notes.', 'The opposite is true.', 'Not mentioned.'],
        answer: 0,
      },
    ],
    flashcards: [{ front: `Key idea ${i + 1}`, back: s }],
  }));
}

function buildMaterialFromText(text) {
  return {
    source: 'pasted',
    text,
    concepts: extractGenericConcepts(text),
  };
}

// Keyword-based scoring used by Active Recall and Feynman.
function scoreAnswer(userAnswer, keywords) {
  const answer = userAnswer || '';
  const lower = answer.toLowerCase();
  const kws = keywords || [];
  const hits = kws.filter((k) => lower.includes(String(k).toLowerCase()));
  const ratio = hits.length / Math.max(1, kws.length);

  if (answer.trim().length < 3) return { level: 'empty', hits, ratio };
  if (ratio >= 0.5) return { level: 'strong', hits, ratio };
  if (ratio >= 0.2) return { level: 'partial', hits, ratio };
  return { level: 'weak', hits, ratio };
}

function feedbackFor(score, concept) {
  const keyPoint = (concept.keyPoints && concept.keyPoints[0]) || 'the core idea';
  if (score.level === 'empty') {
    return `Give it a try — even a rough guess helps. Here's a hint: think about ${keyPoint.toLowerCase()}.`;
  }
  if (score.level === 'strong') {
    return `Good start! You correctly identified ${score.hits.slice(0, 2).join(' and ')}. Here's the fuller picture: ${concept.detailed}`;
  }
  if (score.level === 'partial') {
    return `You're on the right track (mentioned ${score.hits.join(', ') || 'part of it'}), but you're missing a piece. ${concept.simple}`;
  }
  return `Not quite — here's the gap: ${concept.simple}`;
}

// Rule-based "AI Tutor" answer: looks for a matching concept by name/keyword,
// otherwise falls back to a sentence-extraction match against the raw text.
function tutorAnswer(question, material, style) {
  if (!material || !material.concepts || material.concepts.length === 0) {
    return "I don't have any notes loaded yet — upload some, or use the sample notes, so I have something to answer from.";
  }
  const lower = (question || '').toLowerCase();
  const styleKey = style || 'simple';

  const hit = material.concepts.find((c) => {
    const firstWord = c.name.toLowerCase().split(' ')[0];
    const keywordHit = (c.keywords || []).some((k) => lower.includes(String(k).toLowerCase()));
    return lower.includes(firstWord) || keywordHit;
  });

  if (hit) {
    return hit[styleKey] || hit.simple;
  }

  const sentences = (material.text || '').split(/(?<=[.!?。！？])\s+/);
  const words = lower.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1);
  const match = sentences.find((s) => words.some((w) => s.toLowerCase().includes(w)));

  if (match) return `From your notes: ${match}`;
  return `I couldn't find that in your current notes — try asking about one of: ${material.concepts.map((c) => c.name).join(', ')}.`;
}

module.exports = {
  getSampleMaterial,
  buildMaterialFromText,
  scoreAnswer,
  feedbackFor,
  tutorAnswer,
};
