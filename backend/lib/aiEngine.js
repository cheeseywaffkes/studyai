// backend/lib/aiEngine.js
//
// Live Mode logic. Only used when OPENAI_API_KEY is set in backend/.env.
// Every function here can throw (missing key, bad key, no internet, rate
// limit, malformed response) — routes/api.js always wraps these calls in
// try/catch and falls back to lib/demoEngine.js on any failure, so the app
// never breaks mid-demo.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

function requireApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !key.startsWith('sk-')) {
    throw new Error('No valid OPENAI_API_KEY configured');
  }
  return key;
}

async function callOpenAI(messages, { temperature = 0.5, max_tokens = 400 } = {}) {
  const apiKey = requireApiKey();

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, messages, temperature, max_tokens }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`OpenAI request failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI response had no content');
  return text.trim();
}

const STYLE_PROMPT = {
  simple: 'Explain it in short, plain language a beginner could follow in under 60 words.',
  detailed: 'Give a precise, technically complete explanation in 2-3 sentences.',
  analogy: 'Explain it using a single clear real-world analogy, in 2-3 sentences.',
};

async function explainConcept(concept, style) {
  const instruction = STYLE_PROMPT[style] || STYLE_PROMPT.simple;
  const messages = [
    { role: 'system', content: 'You are a concise, encouraging study tutor. Answer only with the explanation itself, no preamble.' },
    { role: 'user', content: `Concept: "${concept.name}".\nContext notes: ${concept.detailed}\n\n${instruction}` },
  ];
  return callOpenAI(messages, { temperature: 0.4, max_tokens: 220 });
}

async function scoreAnswerAI(userAnswer, concept) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a supportive tutor grading a short recall answer. Respond ONLY with strict JSON: {"level":"strong"|"partial"|"weak"|"empty","feedback":"..."}. Feedback should be 1-2 sentences, start encouragingly, and fill in any gap.',
    },
    {
      role: 'user',
      content: `Concept: "${concept.name}".\nReference explanation: ${concept.detailed}\nStudent's answer: "${userAnswer}"\n\nGrade the answer.`,
    },
  ];
  const text = await callOpenAI(messages, { temperature: 0.3, max_tokens: 200 });
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.level || !parsed.feedback) throw new Error('Malformed grading response');
  return parsed;
}

async function tutorAnswerAI(question, material, style, { reveal = false, history = [] } = {}) {
  const context = (material.concepts || [])
    .map((c) => `${c.name}: ${c.detailed}`)
    .join('\n');
  const styleInstruction = STYLE_PROMPT[style] || STYLE_PROMPT.simple;

  const socraticInstruction = reveal
    ? 'The student has asked you to reveal the answer (or is stuck) — give the direct, complete answer now, clearly and helpfully.'
    : 'Act as a Socratic tutor: do NOT give the full answer right away. Instead, respond with a short guiding hint, a leading question, or a partial clue that helps the student reason toward the answer themselves, using the notes as your source of truth. Keep it to 1-3 sentences. If the student\'s message shows they\'re already stuck, frustrated, or explicitly asking for the answer (e.g. "I don\'t know", "just tell me", "give up"), give the full answer instead of another hint.';

  const messages = [
    {
      role: 'system',
      content: `You are an AI study tutor. Answer only using the notes provided below — if the question isn't covered by the notes, say so plainly rather than using outside knowledge. ${styleInstruction} ${socraticInstruction}\n\nNotes:\n${context}`,
    },
    ...history
      .filter((m) => m && m.text && (m.role === 'user' || m.role === 'ai'))
      .slice(-6) // keep the prompt small — just enough recent context to judge whether the student is stuck
      .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: question },
  ];
  return callOpenAI(messages, { temperature: 0.5, max_tokens: 300 });
}

module.exports = { explainConcept, scoreAnswerAI, tutorAnswerAI };
