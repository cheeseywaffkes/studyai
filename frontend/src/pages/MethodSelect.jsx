import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export const METHODS = [
  { id: 'personalized', icon: '✨', name: 'Train My AI', desc: 'Answer 6 quick questions and get a session built around exactly how you learn.', featured: true },
  { id: 'activeRecall', icon: '🧠', name: 'Active Recall', desc: 'Answer questions from memory, get AI feedback, and see your gaps closed.' },
  { id: 'spaced', icon: '🔁', name: 'Spaced Repetition', desc: 'A daily review queue that adapts to how well you know each card.' },
  { id: 'pomodoro', icon: '⏱️', name: 'Pomodoro', desc: '25-minute focused sprints with a task checklist and reflection.' },
  { id: 'feynman', icon: '🗣️', name: 'Feynman Technique', desc: 'Explain it in plain words, then see what you missed.' },
  { id: 'cornell', icon: '📓', name: 'Cornell Notes', desc: 'Auto-structured cues, notes, and summary layout.' },
  { id: 'leitner', icon: '🗂️', name: 'Leitner System', desc: 'Flashcards that move between boxes based on how well you know them.' },
];

export default function MethodSelect() {
  const navigate = useNavigate();
  const { profile, material } = useApp();

  function selectMethod(id) {
    if (id === 'personalized') {
      if (!profile) return navigate('/train');
      if (!material) return navigate('/upload', { state: { pendingMethod: 'personalized' } });
      return navigate('/session/personalized');
    }
    if (!material) return navigate('/upload', { state: { pendingMethod: id } });
    return navigate(`/session/${id}`);
  }

  return (
    <section>
      <div className="eyebrow">Step 1</div>
      <h2>How do you want to study?</h2>
      <p className="lede">
        Pick a recognised method to jump straight in — or let StudyAI build a session
        personalised to exactly how you learn.
      </p>
      <div className="method-grid">
        {METHODS.map((m) => (
          <div
            key={m.id}
            className={'method-card' + (m.featured ? ' featured' : '')}
            onClick={() => selectMethod(m.id)}
          >
            <span className="m-icon">{m.icon}</span>
            <h3>{m.name}</h3>
            <p>{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
