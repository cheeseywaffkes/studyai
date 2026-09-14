import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

const START_SECONDS = 25 * 60;

export default function Pomodoro() {
  const { material, logSession } = useApp();
  const [seconds, setSeconds] = useState(START_SECONDS);
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState(() => material.concepts.map((c) => ({ label: 'Review: ' + c.name, done: false })));
  const [reflectionShown, setReflectionShown] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setReflectionShown(true);
            logSession('Pomodoro');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [running]);

  function toggle() { setRunning((r) => !r); }
  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(START_SECONDS);
    setReflectionShown(false);
    setReflectionSaved(false);
    setReflectionText('');
  }
  function toggleTask(i) {
    setTasks((t) => t.map((task, idx) => (idx === i ? { ...task, done: !task.done } : task)));
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <section>
      <div className="eyebrow">⏱️ Pomodoro</div>
      <h2>Focused 25-minute sprint</h2>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="card" style={{ flex: 1, minWidth: 240, textAlign: 'center' }}>
          <div className="timer-display">{mm}:{ss}</div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
            <button className="btn btn-primary" onClick={toggle}>{running ? 'Pause' : seconds < START_SECONDS ? 'Resume' : 'Start'}</button>
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 240 }}>
          <h4 style={{ marginBottom: 10 }}>Task checklist</h4>
          {tasks.map((t, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.9rem' }}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(i)} />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {reflectionShown && (
        <>
          <div className="divider" />
          <div className="card">
            <h3>Time's up — quick reflection</h3>
            {!reflectionSaved ? (
              <>
                <label>What's one thing that clicked this session?</label>
                <textarea rows={3} placeholder="Write a sentence or two…" value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} />
                <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => setReflectionSaved(true)}>
                  Save reflection
                </button>
              </>
            ) : (
              <p>✅ Reflection saved. Nice work — take a short break before your next sprint.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
