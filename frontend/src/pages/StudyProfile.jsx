import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const LABELS = {
  style: { simple: 'Simple explanations', detailed: 'Detailed explanations', analogy: 'Analogy-based explanations' },
  length: { short: '15–30 min sessions', medium: '30–60 min sessions', long: '60+ min sessions' },
  goal: { remember: 'Remembering information', understand: 'Understanding concepts', apply: 'Applying it to problems' },
  purpose: { exam: 'Exam preparation', homework: 'Homework / coursework', curiosity: 'General curiosity' },
  challenge: { focus: 'Staying focused', retention: 'Retention', understanding: 'Understanding concepts' },
  formats: { mcq: 'MCQs', flash: 'Flashcards', write: 'Written recall' },
};

export default function StudyProfile() {
  const { profile, material } = useApp();
  const navigate = useNavigate();

  if (!profile) {
    return (
      <section>
        <div className="eyebrow">Your profile</div>
        <h2>AI Study Profile</h2>
        <div className="card empty-state">
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: 10 }}>✨</span>
          <p>No profile yet. Run Train My AI to build one.</p>
          <button className="btn btn-primary" onClick={() => navigate('/train')}>
            Start Train My AI
          </button>
        </div>
      </section>
    );
  }

  function startSession() {
    if (!material) navigate('/upload', { state: { pendingMethod: 'personalized' } });
    else navigate('/session/personalized');
  }

  return (
    <section>
      <div className="eyebrow">Your profile</div>
      <h2>AI Study Profile</h2>

      <div className="card" style={{ marginBottom: 18 }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 16 }}>
          <strong>Heads up:</strong> "Training the AI" doesn't fine-tune any model — it saves your
          answers below as a Study Profile, and passes them as context to every AI-generated
          explanation, quiz, and flashcard set.
        </p>
        <div className="row">
          <div style={{ flex: 1, minWidth: 200 }}><label>Explanation style</label><p>{LABELS.style[profile.style]}</p></div>
          <div style={{ flex: 1, minWidth: 200 }}><label>Practice formats</label><p>{(profile.formats || []).map((f) => LABELS.formats[f]).join(', ')}</p></div>
          <div style={{ flex: 1, minWidth: 200 }}><label>Session length</label><p>{LABELS.length[profile.length]}</p></div>
        </div>
        <div className="row">
          <div style={{ flex: 1, minWidth: 200 }}><label>Main goal</label><p>{LABELS.goal[profile.goal]}</p></div>
          <div style={{ flex: 1, minWidth: 200 }}><label>Studying for</label><p>{LABELS.purpose[profile.purpose]}</p></div>
          <div style={{ flex: 1, minWidth: 200 }}><label>Biggest challenge</label><p>{LABELS.challenge[profile.challenge]}</p></div>
        </div>
      </div>

      <div className="row">
        <button className="btn btn-primary" onClick={startSession}>Start personalised session →</button>
        <button className="btn btn-secondary" onClick={() => navigate('/train')}>Retake questions</button>
      </div>
    </section>
  );
}

export { LABELS };
