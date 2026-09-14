import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../lib/api.js';

export default function Feynman() {
  const { material, logSession } = useApp();
  const concepts = material.concepts;
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  const concept = concepts[idx];

  async function submit() {
    setLoading(true);
    try {
      const res = await api.scoreAnswer(concept, answer);
      const missing = (concept.keyPoints || []).filter(
        (kp) => !answer.toLowerCase().includes(kp.split(' ')[0].toLowerCase())
      );
      setFeedback({
        accuracy: res.level === 'strong' ? 'High — your explanation lines up well with the material.'
          : res.level === 'partial' ? 'Partial — some core ideas are there.'
          : 'Low — worth revisiting the source material.',
        clarity: answer.length > 40 ? 'Reasonably clear — a beginner could mostly follow this.' : 'Try adding a bit more detail so a beginner could follow it.',
        missing: missing.slice(0, 2),
      });
      logSession('Feynman', { concept: concept.name, level: res.level });
    } catch (e) {
      setFeedback({ accuracy: "Couldn't reach the backend for grading.", clarity: '', missing: [] });
    } finally {
      setLoading(false);
    }
  }

  function retry() { setAnswer(''); setFeedback(null); }
  function nextConcept() {
    setAnswer(''); setFeedback(null);
    if (idx < concepts.length - 1) setIdx(idx + 1);
    else setFinished(true);
  }
  function restart() { setIdx(0); setAnswer(''); setFeedback(null); setFinished(false); }

  if (finished) {
    return (
      <section>
        <div className="eyebrow">🗣️ Feynman Technique</div>
        <h2>Done for this session</h2>
        <p>You explained every concept in your own words. That's the whole point of the method — if you can teach it simply, you understand it.</p>
        <button className="btn btn-primary" onClick={restart}>Go again</button>
      </section>
    );
  }

  return (
    <section>
      <div className="eyebrow">🗣️ Feynman Technique — {idx + 1} of {concepts.length}</div>
      <h2>Explain "{concept.name}" like you're teaching a beginner</h2>
      <div className="card">
        <textarea rows={5} placeholder="Explain it in your own, simplest words…" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        {!feedback && (
          <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={submit} disabled={loading}>
            {loading ? 'Grading…' : 'Get feedback'}
          </button>
        )}

        {feedback && (
          <>
            <div className="divider" />
            <div className="row">
              <div className="card" style={{ flex: 1 }}><h4>Accuracy</h4><p>{feedback.accuracy}</p></div>
              <div className="card" style={{ flex: 1 }}><h4>Clarity</h4><p>{feedback.clarity}</p></div>
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <h4>Missing concepts</h4>
              <p>{feedback.missing.length ? feedback.missing.join(' · ') : 'Nothing major missing — nice work.'}</p>
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn btn-secondary" onClick={retry}>Try again</button>
              <button className="btn btn-primary" onClick={nextConcept}>{idx < concepts.length - 1 ? 'Next concept →' : 'Finish →'}</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
