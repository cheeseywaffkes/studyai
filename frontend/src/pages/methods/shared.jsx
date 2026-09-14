import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function FlipCard({ front, back, style }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={'flip-card' + (flipped ? ' flipped' : '')} style={style} onClick={() => setFlipped((f) => !f)}>
      <div className="flip-inner">
        <div className="flip-face">{front}</div>
        <div className="flip-face flip-back">{back}</div>
      </div>
    </div>
  );
}

export function Mcq({ question }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <p style={{ fontWeight: 600, marginBottom: 12 }}>{question.q}</p>
      {question.options.map((opt, i) => {
        let cls = 'mcq-option';
        if (selected !== null) {
          if (i === question.answer) cls += ' correct';
          else if (i === selected) cls += ' incorrect';
        }
        return (
          <button
            key={i}
            className={cls}
            disabled={selected !== null}
            onClick={() => setSelected(i)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function BackToMethods() {
  const navigate = useNavigate();
  return (
    <button className="btn btn-secondary" onClick={() => navigate('/methods')}>
      ← Choose a different method
    </button>
  );
}
