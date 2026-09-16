// backend/routes/api.js
//
// Every route tries Live AI first (if OPENAI_API_KEY is set), and falls
// back to Demo Mode automatically if the live call fails for any reason.
// Each response includes `mode: "live" | "demo"` so the frontend can show
// the right badge.

const express = require('express');
const multer = require('multer');

const demoEngine = require('../lib/demoEngine');
const aiEngine = require('../lib/aiEngine');
const fileExtract = require('../lib/fileExtract');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function hasLiveKey() {
  return !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'));
}

// GET /api/mode — tells the frontend whether a key is configured at all
router.get('/mode', (req, res) => {
  res.json({ mode: hasLiveKey() ? 'live' : 'demo' });
});

// GET /api/sample-notes — the built-in "Network Security — Week 5" material
router.get('/sample-notes', (req, res) => {
  res.json({ mode: 'demo', ...demoEngine.getSampleMaterial() });
});

// POST /api/upload-notes  { text }
router.post('/upload-notes', (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  res.json({ mode: 'demo', ...demoEngine.buildMaterialFromText(text) });
});

// POST /api/upload-file  (multipart form field "file")
// Supports PDF, Word (.docx/.doc), PowerPoint (.pptx), Excel (.xlsx/.xls),
// CSV, plain text, and Markdown — with UTF-8 decoding throughout so
// non-Latin scripts (Korean/Hangul, Japanese, Chinese, etc.) come through
// correctly.
router.post('/upload-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  try {
    const text = await fileExtract.extractText(req.file.buffer, req.file.originalname);
    if (!text || !text.trim()) throw new Error('No extractable text');
    res.json({
      mode: 'demo',
      fileName: req.file.originalname,
      ...demoEngine.buildMaterialFromText(text),
    });
  } catch (err) {
    // If extraction fails (unsupported/corrupt/scanned-image file), fall
    // back to the sample notes so the demo never breaks.
    res.json({ mode: 'demo', fellBackToSample: true, ...demoEngine.getSampleMaterial() });
  }
});

// POST /api/upload-pdf — kept as an alias for backwards compatibility;
// new code should use /api/upload-file, which handles PDFs too.
router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  try {
    const text = await fileExtract.extractText(req.file.buffer, req.file.originalname || 'upload.pdf');
    if (!text || !text.trim()) throw new Error('No extractable text');
    res.json({ mode: 'demo', ...demoEngine.buildMaterialFromText(text) });
  } catch (err) {
    res.json({ mode: 'demo', fellBackToSample: true, ...demoEngine.getSampleMaterial() });
  }
});

// POST /api/explain  { concept, style }
router.post('/explain', async (req, res) => {
  const { concept, style } = req.body || {};
  if (!concept) return res.status(400).json({ error: 'concept is required' });

  if (hasLiveKey()) {
    try {
      const text = await aiEngine.explainConcept(concept, style);
      return res.json({ mode: 'live', text });
    } catch (err) {
      // fall through to demo
    }
  }
  res.json({ mode: 'demo', text: concept[style] || concept.simple });
});

// POST /api/score-answer  { concept, answer }
router.post('/score-answer', async (req, res) => {
  const { concept, answer } = req.body || {};
  if (!concept) return res.status(400).json({ error: 'concept is required' });

  if (hasLiveKey()) {
    try {
      const result = await aiEngine.scoreAnswerAI(answer, concept);
      return res.json({ mode: 'live', ...result });
    } catch (err) {
      // fall through to demo
    }
  }
  const score = demoEngine.scoreAnswer(answer, concept.keywords || []);
  const feedback = demoEngine.feedbackFor(score, concept);
  res.json({ mode: 'demo', level: score.level, feedback });
});

// POST /api/tutor  { question, material, style, reveal, history }
router.post('/tutor', async (req, res) => {
  const { question, material, style, reveal, history } = req.body || {};
  if (!question) return res.status(400).json({ error: 'question is required' });
  if (!material) return res.status(400).json({ error: 'material is required' });

  if (hasLiveKey()) {
    try {
      const answer = await aiEngine.tutorAnswerAI(question, material, style, { reveal, history });
      return res.json({ mode: 'live', answer });
    } catch (err) {
      // fall through to demo
    }
  }
  const answer = demoEngine.tutorAnswer(question, material, style, { reveal });
  res.json({ mode: 'demo', answer });
});

module.exports = router;
