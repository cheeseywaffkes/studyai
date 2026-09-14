import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { FlipCard, Mcq, BackToMethods } from './shared.jsx';

const STYLE_LABEL = { simple: 'Simple explanations', detailed: 'Detailed explanations', analogy: 'Analogy-based explanations' };

export default function Personalized() {
  const { profile, material, logSession } = useApp();
  const styleKey = profile?.style || 'simple';
  const concepts = material.concepts;

  useEffect(() => { logSession('Personalised (Train My AI)'); }, []); // eslint-disable-line

  return (
    <section>
      <div className="eyebrow">✨ Personalised, from your Study Profile</div>
      <h2>Your session — {STYLE_LABEL[styleKey]}</h2>

      <div className="stack">
        {concepts.map((c) => (
          <div className="card" key={c.id || c.name}>
            <h3>{c.icon} {c.name}</h3>
            <p>{c[styleKey] || c.simple}</p>
          </div>
        ))}
      </div>

      <div className="divider" />
      <h3>Quick check — MCQs</h3>
      {concepts.flatMap((c) => c.mcqs || []).map((m, i) => <Mcq key={i} question={m} />)}

      <div className="divider" />
      <h3>Flashcards</h3>
      <div className="row">
        {concepts.flatMap((c) => c.flashcards || []).map((f, i) => (
          <FlipCard key={i} front={f.front} back={f.back} style={{ flex: 1, minWidth: 220 }} />
        ))}
      </div>

      <div className="row" style={{ marginTop: 24 }}>
        <BackToMethods />
      </div>
    </section>
  );
}
