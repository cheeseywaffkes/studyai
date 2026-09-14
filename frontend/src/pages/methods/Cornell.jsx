import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { BackToMethods } from './shared.jsx';

export default function Cornell() {
  const { material, logSession } = useApp();
  const concepts = material.concepts;

  useEffect(() => { logSession('Cornell Notes'); }, []); // eslint-disable-line

  return (
    <section>
      <div className="eyebrow">📓 Cornell Method</div>
      <h2>Auto-generated notes layout</h2>
      {concepts.map((c) => (
        <div className="cornell-grid" style={{ marginBottom: 18 }} key={c.name}>
          <div className="cornell-cues">
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-soft)' }}>Cues</h4>
            <p>{c.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>{c.icon} Key term</p>
          </div>
          <div className="cornell-notes">
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-soft)' }}>Notes</h4>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {c.keyPoints.map((k, i) => <li key={i} style={{ marginBottom: 6, fontSize: '0.9rem' }}>{k}</li>)}
            </ul>
          </div>
          <div className="cornell-summary">
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-soft)' }}>Summary</h4>
            <p style={{ margin: 0 }}>{c.simple}</p>
          </div>
        </div>
      ))}
      <BackToMethods />
    </section>
  );
}
