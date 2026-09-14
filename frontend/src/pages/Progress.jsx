import React from 'react';
import { useApp } from '../context/AppContext.jsx';

const CONCEPT_META = [
  { name: 'Firewalls', icon: '🧱' },
  { name: 'Intrusion Detection (IDS)', icon: '🔍' },
  { name: 'Intrusion Prevention (IPS)', icon: '🛡️' },
  { name: 'VPN', icon: '🔒' },
  { name: 'IPsec', icon: '🔗' },
];

const METHOD_META = [
  { icon: '✨', name: 'Train My AI', match: 'personalised' },
  { icon: '🧠', name: 'Active Recall', match: 'active recall' },
  { icon: '🔁', name: 'Spaced Repetition', match: 'spaced' },
  { icon: '⏱️', name: 'Pomodoro', match: 'pomodoro' },
  { icon: '🗣️', name: 'Feynman Technique', match: 'feynman' },
  { icon: '📓', name: 'Cornell Notes', match: 'cornell' },
  { icon: '🗂️', name: 'Leitner System', match: 'leitner' },
];

const BADGE_CLASS = { New: 'badge-new', Review: 'badge-review', Difficult: 'badge-difficult', Mastered: 'badge-mastered' };

export default function Progress() {
  const { spaced, sessionLog } = useApp();
  const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const demoData = [20, 45, 30, 60, 15, 70, 40]; // clearly-labelled demo numbers, per prototype scope

  return (
    <section>
      <div className="eyebrow">Across all sessions</div>
      <h2>Progress</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
        <em>Demo data below — realistic sample numbers, not a real cross-session tracking database (per prototype scope).</em>
      </p>

      <div className="card" style={{ marginBottom: 18 }}>
        <h3>Minutes studied this week</h3>
        <div className="bar-chart">
          {demoData.map((v, i) => (
            <div className="bar-wrap" key={i}>
              <div className="bar" style={{ height: v + '%' }} />
              <div className="bar-label">{week[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="row">
        <div className="card" style={{ flex: 1 }}>
          <h3>Topic mastery (demo)</h3>
          {CONCEPT_META.map((c) => {
            const status = (spaced && spaced[c.name]) || 'New';
            return (
              <div className="kicker-row" style={{ marginBottom: 8 }} key={c.name}>
                <span>{c.icon} {c.name}</span>
                <span className={'badge ' + BADGE_CLASS[status]}>{status}</span>
              </div>
            );
          })}
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h3>Sessions by method (this device)</h3>
          {METHOD_META.map((m) => {
            const count = sessionLog.filter((s) => s.method.toLowerCase().includes(m.match)).length;
            return (
              <div className="kicker-row" style={{ marginBottom: 6, fontSize: '0.88rem' }} key={m.name}>
                <span>{m.icon} {m.name}</span>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
