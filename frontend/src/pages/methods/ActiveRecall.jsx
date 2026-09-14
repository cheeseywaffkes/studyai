import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { api } from '../../lib/api.js';

export default function ActiveRecall() {
  const { material, logSession } = useApp();
  const concepts = material.concepts;
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const concept = concepts[idx];

  async function submit() {
    setLoading(true);
    try {
      const res = await api.scoreAnswer(concept, answer);
      setFeedback(res);
      setResults((r) => [...r, { concept: concept.name, level: res.level }]);
    } catch (e) {
      setFeedback({ level: 'weak', feedback: "Couldn't reach the backend for grading — check that it's running." });
    } finally {
      setLoading(false);
    }
  }

  function next() {
    setAnswer('');
    setFeedback(null);
    if (idx < concepts.length - 1) setIdx(idx + 1);
    else {
      setDone(true);
      const strong = results.filter((r) => r.level === 'strong').length;
      const weak = results.filter((r) => r.level === 'weak' || r.level === 'empty').length;
      logSession('Active Recall', { strong, weak });
    }
  }

  function restart() {
    setIdx(0); setAnswer(''); setFeedback(null); setResults([]); setDone(false);
  }

  if (done) {
    const strong = results.filter((r) => r.level === 'strong').map((r) => r.concept);
    const partial = results.filter((r) => r.level === 'partial').map((r) => r.concept);
    const weak = results.filter((r) => r.level === 'weak' || r.level === 'empty').map((r) => r.concept);
    return (
      <section>
        <div className="eyebrow">🧠 Active Recall — session complete</div>
        <h2>Here's how it went</h2>
        <div className="row">
          <div className="card" style={{ flex: 1 }}><h4>💪 Strong topics</h4><p>{strong.length ? strong.join(', ') : "None yet — that's okay, keep practicing."}</p></div>
          <div className="card" style={{ flex: 1 }}><h4>🟡 Partial</h4><p>{partial.length ? partial.join(', ') : '—'}</p></div>
          <div className="card" style={{ flex: 1 }}><h4>🔺 Needs work</h4><p>{weak.length ? weak.join(', ') : 'None — nice work!'}</p></div>
        </div>
        <div className="row" style={{ marginTop: 20 }}>
          <button className="btn btn-primary" onClick={restart}>Try again</button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="eyebrow">🧠 Active Recall — question {idx + 1} of {concepts.length}</div>
      <h2>Explain: {concept.name}</h2>
      <div className="card">
        <label>Write what you remember, from memory — no peeking.</label>
        <textarea rows={4} placeholder="Type your answer…" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <div className="row" style={{ marginTop: 14 }}>
          {!feedback && (
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? 'Checking…' : 'Submit answer'}
            </button>
          )}
        </div>

        {feedback && (
          <>
            <div className="divider" />
            <p>
              <strong>
                {feedback.level === 'strong' ? '✅ Good start!' : feedback.level === 'partial' ? '🟡 Partial credit' : '🔺 Gap found'}
              </strong>
            </p>
            <p>{feedback.feedback}</p>
            <button className="btn btn-primary" onClick={next}>
              {idx < concepts.length - 1 ? 'Next question →' : 'See summary →'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
