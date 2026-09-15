// frontend/src/lib/api.js — every call the frontend makes to the backend.

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${path} failed (${res.status}): ${body}`);
  }
  return res.json();
}

export const api = {
  getMode: () => request('/mode'),

  getSampleNotes: () => request('/sample-notes'),

  uploadNotes: (text) =>
    request('/upload-notes', { method: 'POST', body: JSON.stringify({ text }) }),

  // Supports PDF, Word (.docx/.doc), PowerPoint (.pptx), Excel (.xlsx/.xls),
  // CSV, plain text, and Markdown — any script/language, including Korean.
  uploadFile: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE_URL}/upload-file`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('File upload failed');
    return res.json();
  },

  explain: (concept, style) =>
    request('/explain', { method: 'POST', body: JSON.stringify({ concept, style }) }),

  scoreAnswer: (concept, answer) =>
    request('/score-answer', { method: 'POST', body: JSON.stringify({ concept, answer }) }),

  tutor: (question, material, style) =>
    request('/tutor', { method: 'POST', body: JSON.stringify({ question, material, style }) }),
};
