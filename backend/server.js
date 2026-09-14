// backend/server.js — Express app entry point
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'studyai-backend' });
});

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  const mode = process.env.OPENAI_API_KEY?.startsWith('sk-') ? '⚡ Live AI' : '🧪 Demo Mode';
  console.log(`StudyAI backend running on http://localhost:${PORT}  (${mode})`);
});
