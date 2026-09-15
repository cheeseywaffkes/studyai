import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.doc,.pptx,.xlsx,.xls,.csv,.txt,.md';

export default function UploadNotes() {
  const { setMaterial } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const pendingMethod = location.state?.pendingMethod || null;
  const [pasted, setPasted] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const fileInput = useRef(null);

  function afterMaterialReady() {
    if (pendingMethod) navigate(`/session/${pendingMethod}`);
    else navigate('/methods');
  }

  async function useSample() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSampleNotes();
      setMaterial(data);
      afterMaterialReady();
    } catch (e) {
      setError('Could not reach the backend — make sure the server is running on :5050.');
    } finally {
      setLoading(false);
    }
  }

  async function usePasted() {
    if (!pasted.trim()) {
      setError('Paste some notes first, or use the sample notes.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadNotes(pasted);
      setMaterial(data);
      afterMaterialReady();
    } catch (e) {
      setError('Could not process that text. Try the sample notes instead.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadFile(file);
      setMaterial(data);
      if (data.fellBackToSample) {
        setError(`Could not extract text from "${file.name}" — using the sample notes instead. Scanned/image-only PDFs and some old .doc files can't be read this way.`);
      }
      afterMaterialReady();
    } catch (e) {
      setError(`Could not upload "${file.name}". Try a different file, or use the sample notes.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="eyebrow">Step 2</div>
      <h2>Add your material</h2>
      <p className="lede">Use the built-in sample notes for a guaranteed-working demo, or paste / upload your own — any language, any of the file types below.</p>

      <div className="card stack" style={{ maxWidth: 640 }}>
        <div>
          <button className="btn btn-primary" onClick={useSample} disabled={loading}>
            📄 Use Sample Notes — "Network Security, Week 5"
          </button>
        </div>

        <div className="divider" style={{ margin: '6px 0' }}></div>

        <div>
          <label>Upload a file</label>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: -2, marginBottom: 8 }}>
            Supports PDF, Word (.docx/.doc), PowerPoint (.pptx), Excel (.xlsx/.xls), CSV, plain text, and Markdown — in any language, including Korean (한글).
          </p>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFile}
            disabled={loading}
          />
          {fileName && !error && <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginTop: 6 }}>Selected: {fileName}</p>}
        </div>

        <div className="divider" style={{ margin: '6px 0' }}></div>

        <div>
          <label>Or paste your own notes</label>
          <textarea
            rows={6}
            placeholder="Paste any study material here… (한국어도 지원됩니다)"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
          />
        </div>
        <div>
          <button className="btn btn-secondary btn-block" onClick={usePasted} disabled={loading}>
            Use this text instead
          </button>
        </div>

        {loading && <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Processing…</p>}
        {error && <p style={{ color: 'var(--rust)', fontSize: '0.85rem' }}>{error}</p>}
      </div>
    </section>
  );
}
