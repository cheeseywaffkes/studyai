import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';

export default function UploadNotes() {
  const { setMaterial } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const pendingMethod = location.state?.pendingMethod || null;
  const [pasted, setPasted] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadPdf(file);
      setMaterial(data);
      if (data.fellBackToSample) {
        setError('Could not extract text from that PDF — using the sample notes instead.');
      }
      afterMaterialReady();
    } catch (e) {
      setError('PDF upload failed. Some scanned or secured PDFs can\'t be text-extracted — try the sample notes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="eyebrow">Step 2</div>
      <h2>Add your material</h2>
      <p className="lede">Use the built-in sample notes for a guaranteed-working demo, or paste / upload your own.</p>

      <div className="card stack" style={{ maxWidth: 640 }}>
        <div>
          <button className="btn btn-primary" onClick={useSample} disabled={loading}>
            📄 Use Sample Notes — "Network Security, Week 5"
          </button>
        </div>

        <div className="divider" style={{ margin: '6px 0' }}></div>

        <div>
          <label>Upload a PDF</label>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf"
            onChange={handleFile}
            disabled={loading}
          />
        </div>

        <div className="divider" style={{ margin: '6px 0' }}></div>

        <div>
          <label>Or paste your own notes</label>
          <textarea
            rows={6}
            placeholder="Paste any study material here…"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
          />
        </div>
        <div>
          <button className="btn btn-secondary btn-block" onClick={usePasted} disabled={loading}>
            Use this text instead
          </button>
        </div>

        {error && <p style={{ color: 'var(--rust)', fontSize: '0.85rem' }}>{error}</p>}
      </div>
    </section>
  );
}
