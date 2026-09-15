import React, { useEffect, useState } from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import { api } from './lib/api.js';

import Welcome from './pages/Welcome.jsx';
import MethodSelect from './pages/MethodSelect.jsx';
import TrainMyAI from './pages/TrainMyAI.jsx';
import StudyProfile from './pages/StudyProfile.jsx';
import UploadNotes from './pages/UploadNotes.jsx';
import StudySession from './pages/StudySession.jsx';
import AITutor from './pages/AITutor.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Progress from './pages/Progress.jsx';

const NAV = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/methods', label: 'Study Methods', icon: '🧭' },
  { to: '/upload', label: 'Upload Notes', icon: '📄' },
  { to: '/profile', label: 'My Study Profile', icon: '✨' },
  { to: '/tutor', label: 'AI Tutor', icon: '💬' },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/progress', label: 'Progress', icon: '📈' },
];

export default function App() {
  const [mode, setMode] = useState('demo');
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'ok' | 'waking'

  useEffect(() => {
    let cancelled = false;

    function ping() {
      api.getMode()
        .then((r) => { if (!cancelled) { setMode(r.mode); setBackendStatus('ok'); } })
        .catch(() => { if (!cancelled) setBackendStatus('waking'); });
    }

    // Free hosting tiers (e.g. Render's free plan) spin the backend down after
    // ~15 minutes idle, so the very first request after a while can take
    // 30-60s to "wake up". Pinging right away starts that wake-up early,
    // and re-pinging periodically keeps it awake during an active session.
    ping();
    const keepAlive = setInterval(ping, 8 * 60 * 1000); // every 8 minutes

    return () => { cancelled = true; clearInterval(keepAlive); };
  }, []);

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="brand">
          <div className="brand-mark">📚 StudyAI</div>
          <div className="brand-sub">Same material. Different learner.</div>
          <span className="mode-badge">{mode === 'live' ? '⚡ Live AI' : '🧪 Demo Mode'}</span>
        </div>
        <div className="nav-group">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="main">
        {backendStatus === 'waking' && (
          <div className="card" style={{ marginBottom: 20, background: 'var(--accent-soft)', borderColor: 'var(--accent)' }}>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              ⏳ Waking up the server — this can take up to a minute on a free hosting tier after it's been idle. Things will work normally once it responds; feel free to try again in a moment.
            </p>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/methods" element={<MethodSelect />} />
          <Route path="/train" element={<TrainMyAI />} />
          <Route path="/profile" element={<StudyProfile />} />
          <Route path="/upload" element={<UploadNotes />} />
          <Route path="/session/:methodId" element={<StudySession />} />
          <Route path="/tutor" element={<AITutor />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
    </div>
  );
}
