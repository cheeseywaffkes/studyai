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

  useEffect(() => {
    api.getMode().then((r) => setMode(r.mode)).catch(() => setMode('demo'));
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
