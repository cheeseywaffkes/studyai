import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { FlipCard } from './shared.jsx';

const BADGE_CLASS = { New: 'badge-new', Review: 'badge-review', Difficult: 'badge-difficult', Mastered: 'badge-mastered' };

export default function SpacedRepetition() {
  const { material, spaced, setSpaced } = useApp();
  const concepts = material.concepts;

  useEffect(() => {
    if (!spaced) {
      const initial = {};
      concepts.forEach((c) => { initial[c.name] = 'New'; });
      setSpaced(initial);
    }
    // eslint-disable-next-line
  }, []);

  if (!spaced) return null;

  function rate(name, status) {
    setSpaced((prev) => ({ ...prev, [name]: status }));
  }

  return (
    <section>
      <div className="eyebrow">🔁 Spaced Repetition</div>
      <h2>Today's Review</h2>
      <div className="stack">
        {concepts.map((c) => (
          <div className="card" key={c.name}>
            <div className="kicker-row">
              <div>
                <strong>{c.icon} {c.name}</strong>{' '}
                <span className={'badge ' + BADGE_CLASS[spaced[c.name] || 'New']}>{spaced[c.name] || 'New'}</span>
              </div>
            </div>
            <FlipCard front={c.flashcards[0].front} back={c.flashcards[0].back} />
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => rate(c.name, 'Difficult')}>Again</button>
              <button className="btn btn-secondary" onClick={() => rate(c.name, 'Difficult')}>Hard</button>
              <button className="btn btn-secondary" onClick={() => rate(c.name, 'Review')}>Good</button>
              <button className="btn btn-primary" onClick={() => rate(c.name, 'Mastered')}>Easy</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
