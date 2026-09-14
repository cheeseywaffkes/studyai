import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const QUESTIONS = [
  { key: 'style', title: 'How do you like things explained?', options: [
      { v: 'simple', icon: '🔹', label: 'Simple', sub: 'Short, plain-language explanations' },
      { v: 'detailed', icon: '📘', label: 'Detailed', sub: 'Full technical explanations' },
      { v: 'analogy', icon: '🌉', label: 'Analogy-based', sub: 'Real-world comparisons' },
  ]},
  { key: 'formats', title: 'What kind of practice do you want?', multi: true, options: [
      { v: 'mcq', icon: '☑️', label: 'MCQs', sub: 'Multiple-choice questions' },
      { v: 'flash', icon: '🗂️', label: 'Flashcards', sub: 'Quick front/back review' },
      { v: 'write', icon: '✍️', label: 'Written recall', sub: 'Type answers from memory' },
  ]},
  { key: 'length', title: 'How long is your session, usually?', options: [
      { v: 'short', icon: '⏳', label: '15–30 min', sub: 'Quick review' },
      { v: 'medium', icon: '⏱️', label: '30–60 min', sub: 'Focused session' },
      { v: 'long', icon: '🕰️', label: '60+ min', sub: 'Deep study block' },
  ]},
  { key: 'goal', title: "What's your main goal right now?", options: [
      { v: 'remember', icon: '🧩', label: 'Remembering information', sub: 'Facts and definitions' },
      { v: 'understand', icon: '💡', label: 'Understanding concepts', sub: 'The "why" behind it' },
      { v: 'apply', icon: '⚙️', label: 'Applying it', sub: 'Using it in problems' },
  ]},
  { key: 'purpose', title: 'What are you studying for?', options: [
      { v: 'exam', icon: '📝', label: 'Exam preparation', sub: 'A test or quiz coming up' },
      { v: 'homework', icon: '📚', label: 'Homework / coursework', sub: 'Ongoing classwork' },
      { v: 'curiosity', icon: '🔭', label: 'General curiosity', sub: 'No deadline, just learning' },
  ]},
  { key: 'challenge', title: "What's your biggest study challenge?", options: [
      { v: 'focus', icon: '🎯', label: 'Staying focused', sub: 'Getting distracted easily' },
      { v: 'retention', icon: '🧠', label: 'Retention', sub: 'Forgetting things quickly' },
      { v: 'understanding', icon: '🤔', label: 'Understanding', sub: 'Concepts feel confusing' },
  ]},
];

export default function TrainMyAI() {
  const { setProfile } = useApp();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const q = QUESTIONS[index];
  const selected = answers[q.key] || (q.multi ? [] : null);
  const hasAnswer = q.multi ? selected.length > 0 : !!selected;

  function pick(val) {
    setAnswers((prev) => {
      if (!q.multi) return { ...prev, [q.key]: val };
      const arr = prev[q.key] || [];
      const next = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
      return { ...prev, [q.key]: next };
    });
  }

  function next() {
    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1);
    } else {
      setProfile({ ...answers, createdAt: new Date().toISOString() });
      navigate('/profile');
    }
  }

  function back() {
    if (index > 0) setIndex(index - 1);
  }

  return (
    <section>
      <div className="eyebrow">✨ Train My AI</div>
      <h2>{q.title}</h2>

      <div className="step-track">
        {QUESTIONS.map((_, i) => (
          <React.Fragment key={i}>
            <div className={'step-dot' + (i < index ? ' done' : i === index ? ' current' : '')}>
              {i < index ? '✓' : i + 1}
            </div>
            {i < QUESTIONS.length - 1 && <div className="step-line" />}
          </React.Fragment>
        ))}
      </div>

      <div className="choice-grid">
        {q.options.map((o) => {
          const isSel = q.multi ? selected.includes(o.v) : selected === o.v;
          return (
            <button key={o.v} className={'choice' + (isSel ? ' selected' : '')} onClick={() => pick(o.v)}>
              <span className="c-icon">{o.icon}</span>
              <strong>{o.label}</strong>
              <br />
              <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{o.sub}</span>
            </button>
          );
        })}
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" disabled={index === 0} onClick={back}>
          ← Back
        </button>
        <button className="btn btn-primary" disabled={!hasAnswer} onClick={next}>
          {index === QUESTIONS.length - 1 ? 'Build my profile →' : 'Next →'}
        </button>
      </div>
    </section>
  );
}
