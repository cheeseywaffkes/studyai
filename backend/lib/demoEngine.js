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

// Very simple sentence-extraction heuristic for arbitrary pasted/uploaded
// text. Not a real summarizer or LLM — it's rule-based — but it goes beyond
// "echo the sentence back" by picking a key term out of each sentence and
// turning it into a genuine fill-in-the-blank flashcard/MCQ with plausible
// wrong answers, for anything that's mostly Latin-script text. For other
// scripts (Korean, Japanese, Chinese, etc.) — where safely picking out a
// single "key word" isn't reliable without real tokenization — it falls
// back to the simpler "show the statement" style so it never produces
// garbled or wrong-looking content.
const MAX_CHUNK_LENGTH = 220;

const STOPWORDS = new Set([
  'the','a','an','of','to','in','on','for','and','or','is','are','was','were','with','as','by',
  'that','this','it','be','from','at','into','their','its','these','those','can','will','not',
  'but','if','than','then','so','such','also','which','who','whom','has','have','had','been',
  'do','does','did','you','your','they','them','he','she','his','her','we','our','i','my',
  'all','any','more','most','other','some','no','nor','only','own','same','too','very','just',
  'about','through','during','before','after','above','below','up','down','out','over','under',
  'again','once','here','there','when','where','why','how','each','both','few','because',
]);

function isLatinDominant(text) {
  const letters = text.match(/\p{L}/gu) || [];
  if (letters.length === 0) return true;
  const latin = text.match(/[A-Za-z]/g) || [];
  return latin.length / letters.length > 0.6;
}

function sentenceSplit(text) {
  return text
    .split(/(?<=[.!?。！？])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function cleanLine(line) {
  return line.replace(/\s*\[\d+\]/g, '').trim();
}

function capLength(s) {
  return s.length > MAX_CHUNK_LENGTH ? s.slice(0, MAX_CHUNK_LENGTH).trim() + '…' : s;
}

// Ranks candidate "content-bearing" words in a sentence, best first: prefers
// capitalized words that aren't sentence-initial (likely proper nouns/
// acronyms, e.g. "SQLi", "VPN"), then longer non-stopwords. Returns [] if
// nothing usable is found.
function pickKeyTerms(sentence) {
  const words = [...sentence.matchAll(/[A-Za-z][A-Za-z'-]*/g)].map((m) => ({
    text: m[0],
    index: m.index,
  }));
  if (words.length === 0) return [];

  const candidates = words.filter((w) => w.text.length > 3 && !STOPWORDS.has(w.text.toLowerCase()));
  if (candidates.length === 0) return [];

  const firstIndex = words[0].index;
  const scored = candidates.map((w) => {
    const isMidSentenceCapitalized = w.index !== firstIndex && /^[A-Z]/.test(w.text);
    return { text: w.text, score: (isMidSentenceCapitalized ? 1000 : 0) + w.text.length };
  });
  scored.sort((a, b) => b.score - a.score);

  // De-dupe (case-insensitive) while preserving rank order.
  const seen = new Set();
  const ranked = [];
  for (const c of scored) {
    const key = c.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    ranked.push(c.text);
  }
  return ranked;
}

function makeBlank(sentence, term) {
  const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  return sentence.replace(re, '_____');
}

function deriveTitle(sentence, fallback) {
  const colonIdx = sentence.indexOf(':');
  if (colonIdx > 6 && colonIdx < 55) {
    return sentence.slice(0, colonIdx).trim();
  }
  const words = sentence.split(/\s+/);
  const shortTitle = words.slice(0, 7).join(' ');
  if (shortTitle.length < sentence.length) return shortTitle + '…';
  return shortTitle || fallback;
}

// Generic slide/section headers that carry no real content on their own —
// worth skipping as "concepts" even though they're valid, meaningful-length
// lines (e.g. "Learning Objectives" on a slide by itself).
const GENERIC_HEADER_PATTERNS = [
  /^learning objectives?$/i,
  /^(agenda|overview|outline|introduction|summary|conclusion|references|contents|table of contents|objectives|recap|questions\??)$/i,
];

// A short line that's mostly a course/module code (e.g. "L02 - SQL Injection",
// "CS371: Networking") is almost always a title-slide fragment, not content.
function looksLikeCourseCodeLine(line) {
  return line.length < 40 && /^[A-Z]{1,5}\d{0,4}\s*[-–:]/i.test(line);
}

// A short line where every word starts with a capital letter (Title Case) is
// almost always a heading/label — real sentences use lowercase function
// words ("the", "of", "and") that headers/titles skip. Catches repeated
// slide headers like "SQL Injection Attacks" or "Defences Against SQLi
// Attacks" that otherwise look long enough to be mistaken for content.
function looksLikeHeaderLine(line) {
  if (line.length > 48) return false;
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;
  return words.every((w) => /^[A-Z0-9][A-Za-z0-9'&-]*$/.test(w));
}

// Detects a "Term: Definition" style line — common in vocab lists and
// glossary tables (including the 2-column Excel format produced by
// fileExtract.js). Deliberately conservative: the term must be short and
// not itself look like a full sentence, so this doesn't misfire on normal
// prose that happens to contain an early colon.
const SENTENCE_STARTER_WORDS = /^(for|in|if|consider|when|since|this|these|note|example|here|there|now|so|thus|hence|therefore|during|after|before|while|although|because|with|without|from|as|at|on|by)\b/i;

function parseTermDefinition(line) {
  const idx = line.indexOf(':');
  if (idx < 2 || idx > 30) return null;
  const term = line.slice(0, idx).trim();
  const definition = line.slice(idx + 1).trim();
  if (!term || definition.length < 15) return null;
  if (/[.!?,]$/.test(term)) return null; // a real clause ending in punctuation before the colon — not a term
  if (term.includes(',')) return null; // real terms don't contain commas; clauses often do
  const wordCount = term.split(/\s+/).filter(Boolean).length;
  if (wordCount > 4) return null; // real terms are short noun phrases, not full clauses
  if (SENTENCE_STARTER_WORDS.test(term)) return null; // "For example, ...", "Consider ...", etc. are clauses, not terms
  return { term, definition };
}

function buildGlossaryConcepts(entries) {
  const picked = entries.slice(0, 8); // glossary entries are cleaner/higher-confidence, so allow a few more than generic
  const allDefinitions = picked.map((e) => e.definition);

  return picked.map((entry, i) => {
    const distractorPool = allDefinitions.filter((d) => d !== entry.definition);
    const distractors = distractorPool.sort(() => Math.random() - 0.5).slice(0, 3);
    while (distractors.length < 3) distractors.push('None of these definitions match.');
    const options = [entry.definition, ...distractors].sort(() => Math.random() - 0.5);

    return {
      id: `glossary-${i}`,
      name: entry.term,
      icon: '📗',
      simple: entry.definition,
      detailed: entry.definition,
      analogy: entry.definition,
      keyPoints: [entry.definition],
      keywords: entry.definition
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length > 1 && !STOPWORDS.has(w))
        .slice(0, 8),
      mcqs: [
        {
          q: `What does "${entry.term}" mean?`,
          options,
          answer: options.indexOf(entry.definition),
        },
      ],
      flashcards: [{ front: `What is "${entry.term}"?`, back: entry.definition }],
    };
  });
}

function extractGenericConcepts(text) {
  // Split on real line breaks first — this respects bullet points, slide
  // boundaries, and paragraphs — then split each line into sentences, so
  // both "one bullet per line" content (slides) and "one long paragraph"
  // content (pasted prose) are handled correctly.
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Glossary/vocab-table detection: if at least 2 lines look like
  // "Term: Definition", treat the whole material as a glossary rather than
  // running it through generic sentence-splitting — this is common for
  // vocab lists and Excel term/definition tables, and produces much better
  // flashcards ("What is X?") than blanking a random word mid-sentence.
  const glossaryCandidates = [];
  for (const line of rawLines) {
    if (/^(slide|sheet)\s*\d*:?$/i.test(line)) continue;
    const parsed = parseTermDefinition(cleanLine(line));
    if (parsed) glossaryCandidates.push(parsed);
  }
  if (glossaryCandidates.length >= 2) {
    const seenTerms = new Set();
    const uniqueEntries = glossaryCandidates.filter((e) => {
      const key = e.term.toLowerCase();
      if (seenTerms.has(key)) return false;
      seenTerms.add(key);
      return true;
    });
    return buildGlossaryConcepts(uniqueEntries);
  }

  const rawSentences = [];
  for (const line of rawLines) {
    if (/^(slide|sheet)\s*\d*:?$/i.test(line)) continue; // bare "Slide 3:" header, nothing else
    if (GENERIC_HEADER_PATTERNS.some((re) => re.test(line))) continue; // "Learning Objectives", "Agenda", etc.
    if (looksLikeCourseCodeLine(line)) continue; // "L02 - SQL Injection" style title-slide fragments
    if (looksLikeHeaderLine(line)) continue; // "SQL Injection Attacks" style repeated slide headers
    for (const sentence of sentenceSplit(line)) {
      const cleaned = cleanLine(sentence);
      if (cleaned.length < 18) continue; // too short to carry real, testable content
      rawSentences.push(capLength(cleaned));
    }
  }

  // De-duplicate near-identical lines (common in messy slide exports).
  const seen = new Set();
  const sentences = rawSentences.filter((s) => {
    const key = s.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const picked = sentences.slice(0, 10);
  const latinMode = isLatinDominant(text);

  // First pass: rank candidate terms per sentence (Latin mode only).
  const withCandidates = picked.map((s) => ({ sentence: s, candidates: latinMode ? pickKeyTerms(s) : [] }));

  // Assign each sentence a term, preferring one not already used as another
  // question's answer — keeps a multi-question quiz from repeating the same
  // correct answer over and over when the material offers other options.
  const usedTerms = new Set();
  const withTerms = withCandidates.map(({ sentence, candidates }) => {
    const fresh = candidates.find((c) => !usedTerms.has(c.toLowerCase()));
    const term = fresh || candidates[0] || null;
    if (term) usedTerms.add(term.toLowerCase());
    return { sentence, term };
  });

  // Distractor pool draws from every candidate seen anywhere in the
  // material (not just the ones picked as an answer), for more variety.
  const termPool = [...new Set(withCandidates.flatMap((w) => w.candidates))];

  return withTerms.map(({ sentence, term }, i) => {
    const icon = '📝';
    const id = `generic-${i}`;
    const keywords = sentence
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w))
      .slice(0, 8);

    if (term) {
      const blanked = makeBlank(sentence, term);
      const distractorCandidates = termPool.filter((t) => t.toLowerCase() !== term.toLowerCase());
      const shuffled = distractorCandidates.sort(() => Math.random() - 0.5).slice(0, 3);
      while (shuffled.length < 3) shuffled.push(['a related term', 'an unrelated term', 'none of these'][shuffled.length]);
      const options = [term, ...shuffled].sort(() => Math.random() - 0.5);

      return {
        id,
        name: deriveTitle(sentence, `Key idea ${i + 1}`),
        icon,
        simple: sentence,
        detailed: sentence,
        analogy: sentence,
        keyPoints: [sentence],
        keywords,
        mcqs: [
          {
            q: `Fill in the blank: "${blanked}"`,
            options,
            answer: options.indexOf(term),
          },
        ],
        flashcards: [{ front: blanked, back: sentence }],
      };
    }

    // No usable key term (short sentence, non-Latin script, etc.) — fall
    // back to a straightforward "show the statement" style so nothing
    // looks broken or nonsensical.
    return {
      id,
      name: deriveTitle(sentence, `Key idea ${i + 1}`),
      icon,
      simple: sentence,
      detailed: sentence,
      analogy: sentence,
      keyPoints: [sentence],
      keywords,
      mcqs: [
        {
          q: 'Which statement appears in your notes?',
          options: [sentence, 'This was not in your notes.', 'The opposite is true.', 'Not mentioned.'],
          answer: 0,
        },
      ],
      flashcards: [{ front: `Key idea ${i + 1}`, back: sentence }],
    };
  });
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

// Phrases that signal the student wants the direct answer now, not another
// nudge — e.g. they've already tried and are stuck.
const REVEAL_PHRASES = /\b(just tell me|give me the answer|i don'?t know|idk|i give up|skip|full answer|just answer|reveal|show me|no idea|not sure)\b/i;

// Builds a guiding hint instead of the full explanation: a partial clue plus
// a nudge to think it through, rather than handing over the complete idea.
function buildHint(concept) {
  const words = concept.simple.split(/\s+/);
  const cutoff = Math.max(4, Math.ceil(words.length * 0.4));
  const partial = words.slice(0, cutoff).join(' ');
  const trailingPunctuation = /[.!?]$/.test(partial) ? '' : '…';
  return `Here's a hint: "${partial}${trailingPunctuation}" — can you take it from there? Try explaining the rest in your own words, or ask me to "reveal the answer" if you'd like the full explanation.`;
}

// Rule-based "AI Tutor" answer: looks for a matching concept by name/keyword,
// otherwise falls back to a sentence-extraction match against the raw text.
// By default it nudges with a hint rather than handing over the full
// explanation — set reveal=true (or ask in a way that matches
// REVEAL_PHRASES) to get the direct answer instead.
function tutorAnswer(question, material, style, { reveal = false } = {}) {
  if (!material || !material.concepts || material.concepts.length === 0) {
    return "I don't have any notes loaded yet — upload some, or use the sample notes, so I have something to answer from.";
  }
  const lower = (question || '').toLowerCase();
  const styleKey = style || 'simple';
  const wantsFullAnswer = reveal || REVEAL_PHRASES.test(lower);

  const scored = material.concepts.map((c) => {
    const firstWord = c.name.toLowerCase().split(' ')[0];
    const firstWordSingular = firstWord.replace(/s$/, '');
    const nameHit = lower.includes(firstWord) || (firstWordSingular.length > 3 && lower.includes(firstWordSingular));
    const keywordHits = (c.keywords || []).filter((k) => lower.includes(String(k).toLowerCase())).length;
    return { concept: c, score: (nameHit ? 5 : 0) + keywordHits };
  });
  scored.sort((a, b) => b.score - a.score);
  const hit = scored[0] && scored[0].score > 0 ? scored[0].concept : null;

  if (hit) {
    return wantsFullAnswer ? (hit[styleKey] || hit.simple) : buildHint(hit);
  }

  const sentences = (material.text || '').split(/(?<=[.!?。！？])\s+/);
  const words = lower.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1 && !STOPWORDS.has(w));
  const match = sentences.find((s) => words.some((w) => s.toLowerCase().includes(w)));

  if (match) {
    if (wantsFullAnswer) return `From your notes: ${match}`;
    const matchWords = match.split(/\s+/);
    const partial = matchWords.slice(0, Math.max(4, Math.ceil(matchWords.length * 0.4))).join(' ');
    return `Here's a hint from your notes: "${partial}…" — want to try finishing that, or should I reveal the rest?`;
  }
  return `I couldn't find that in your current notes — try asking about one of: ${material.concepts.map((c) => c.name).join(', ')}.`;
}

module.exports = {
  getSampleMaterial,
  buildMaterialFromText,
  scoreAnswer,
  feedbackFor,
  tutorAnswer,
};
