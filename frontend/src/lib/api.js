// frontend/src/lib/api.js — every call the frontend makes to the backend.

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Free hosting tiers (e.g. Render's free plan) put the backend to sleep
// after inactivity, so the first request after a while can fail or time out
// while it wakes up. Rather than surfacing that as an error immediately, we
// retry several times with a growing delay — cold starts can take up to
// 60s, so the retry window needs real headroom, not just a couple of quick
// attempts.
async function fetchWithRetry(url, options, { retries = 5, retryDelayMs = 8000, onRetry } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) return res; // don't retry real 4xx errors, only server/network issues
      lastError = new Error(`Server responded ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt < retries) {
      if (onRetry) onRetry(attempt + 1, retries);
      await delay(retryDelayMs);
    }
  }
  throw lastError;
}

async function request(path, options = {}, retryOptions = {}) {
  const res = await fetchWithRetry(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }, retryOptions);
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
    const res = await fetchWithRetry(`${BASE_URL}/upload-file`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('File upload failed');
    return res.json();
  },

  explain: (concept, style) =>
    request('/explain', { method: 'POST', body: JSON.stringify({ concept, style }) }),

  scoreAnswer: (concept, answer) =>
    request('/score-answer', { method: 'POST', body: JSON.stringify({ concept, answer }) }),

  tutor: (question, material, style, { reveal, history, onRetry } = {}) =>
    request('/tutor', { method: 'POST', body: JSON.stringify({ question, material, style, reveal, history }) }, { onRetry }),
};
