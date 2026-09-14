import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { FlipCard } from './shared.jsx';

export default function Leitner() {
  const { material, leitner, setLeitner } = useApp();
  const [current, setCurrent] = useState(null);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (!leitner) {
      const cards = material.concepts.flatMap((c) => c.flashcards.map((f) => ({ ...f, concept: c.name })));
      setLeitner({ box1: cards, box2: [], box3: [] });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (leitner) drawNext();
    // eslint-disable-next-line
  }, [leitner]);

  function drawNext() {
    const pool = [1, 2, 3].flatMap((n) => leitner['box' + n].map((c) => ({ ...c, box: n })));
    if (pool.length === 0) { setCurrent(null); return; }
    setCurrent(pool[Math.floor(Math.random() * pool.length)]);
    setFlipKey((k) => k + 1);
  }

  function answer(correct) {
    const next = { box1: [...leitner.box1], box2: [...leitner.box2], box3: [...leitner.box3] };
    ['box1', 'box2', 'box3'].forEach((b) => { next[b] = next[b].filter((c) => c.front !== current.front); });
    if (correct) {
      const nextBox = Math.min(3, current.box + 1);
      next['box' + nextBox].push({ front: current.front, back: current.back, concept: current.concept });
    } else {
      next.box1.push({ front: current.front, back: current.back, concept: current.concept });
    }
    setLeitner(next);
  }

  if (!leitner) return null;

  const boxesUI = (
    <div className="leitner-boxes">
      <div className="leitner-box"><span className="count">{leitner.box1.length}</span>Box 1 · daily</div>
      <div className="leitner-box"><span className="count">{leitner.box2.length}</span>Box 2 · every few days</div>
      <div className="leitner-box"><span className="count">{leitner.box3.length}</span>Box 3 · mastered</div>
    </div>
  );

  if (!current) {
    return (
      <section>
        <div className="eyebrow">🗂️ Leitner System</div>
        <h2>All cards mastered!</h2>
        {boxesUI}
        <button className="btn btn-primary" onClick={() => setLeitner(null)}>Reset deck</button>
      </section>
    );
  }

  return (
    <section>
      <div className="eyebrow">🗂️ Leitner System</div>
      <h2>Review a card</h2>
      {boxesUI}
      <FlipCard key={flipKey} front={current.front} back={current.back} style={{ maxWidth: 420 }} />
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn btn-secondary" onClick={() => answer(false)}>❌ Didn't know it</button>
        <button className="btn btn-primary" onClick={() => answer(true)}>✅ Knew it</button>
      </div>
    </section>
  );
}
