import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Dashboard() {
  const { profile, material, sessionLog } = useApp();
  const navigate = useNavigate();

  return (
    <section>
      <div className="eyebrow">Welcome back</div>
      <h2>Dashboard</h2>

      <div className="stat-grid">
        <div className="stat"><div className="num">{sessionLog.length}</div><div className="lbl">Sessions this device</div></div>
        <div className="stat"><div className="num">{material ? material.concepts.length : 0}</div><div className="lbl">Concepts loaded</div></div>
        <div className="stat"><div className="num">{profile ? '✓' : '—'}</div><div className="lbl">Study Profile set</div></div>
        <div className="stat"><div className="num">4</div><div className="lbl">Demo-data day streak</div></div>
      </div>

      <div className="row">
        <div className="card" style={{ flex: 1, minWidth: 260 }}>
          <h3>Continue where you left off</h3>
          {profile && material ? (
            <>
              <p>Your Study Profile and notes are ready.</p>
              <button className="btn btn-primary" onClick={() => navigate('/session/personalized')}>Resume personalised session →</button>
            </>
          ) : (
            <>
              <p>Set up a Study Profile to unlock personalised sessions.</p>
              <button className="btn btn-primary" onClick={() => navigate('/train')}>Start Train My AI →</button>
            </>
          )}
        </div>
        <div className="card" style={{ flex: 1, minWidth: 260 }}>
          <h3>Recent activity</h3>
          {sessionLog.length ? (
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {sessionLog.slice(-5).reverse().map((s, i) => (
                <li key={i} style={{ fontSize: '0.88rem', marginBottom: 6 }}>{s.method} — {new Date(s.date).toLocaleString()}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
              Demo data — nothing logged yet on this device. Complete a session and it'll show up here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
