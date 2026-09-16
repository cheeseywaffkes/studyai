import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';

export default function AITutor() {
  const { material, profile, chat, setChat } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingNote, setLoadingNote] = useState(null);
  const [hintMode, setHintMode] = useState(true);
  const logRef = useRef(null);

  useEffect(() => {
    if (chat.length === 0) {
      const greeting = material
        ? `Hi! Ask me anything about ${material.source === 'sample' ? 'firewalls, IDS, IPS, VPNs, or IPsec' : 'your uploaded notes'}. I'll usually nudge you with a hint first rather than giving the full answer right away — ask me to "reveal the answer" any time you want it straight.`
        : 'Hi! Load some notes first (Study Methods → any method → Use Sample Notes) and I can answer questions about them.';
      setChat([{ role: 'ai', text: greeting }]);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [chat, loadingNote]);

  function recentHistory(list) {
    // A lightweight window of recent turns, so Live Mode can tell whether the
    // student seems stuck (without sending the whole conversation every time).
    return list.slice(-6).map((m) => ({ role: m.role, text: m.text }));
  }

  async function askTutor(question, { reveal }) {
    if (!material) {
      setChat((c) => [...c, { role: 'ai', text: "I don't have any notes loaded yet — go to Study Methods, pick any method, and choose 'Use Sample Notes'." }]);
      return;
    }
    setLoading(true);
    setLoadingNote(null);
    try {
      const history = recentHistory(chat);
      const onRetry = (attempt, total) =>
        setLoadingNote(`Still waking up the server (attempt ${attempt} of ${total + 1}) — this can take up to a minute on a free hosting tier…`);
      const res = await api.tutor(question, material, profile?.style, { reveal, history, onRetry });
      setChat((c) => [...c, { role: 'ai', text: res.answer, question, revealed: reveal }]);
    } catch (e) {
      setChat((c) => [...c, { role: 'ai', text: "Couldn't reach the backend after several tries — it may be down, or your network/VPN might be blocking it. Try again in a moment, or check that the backend is deployed and running." }]);
    } finally {
      setLoading(false);
      setLoadingNote(null);
    }
  }

  async function send() {
    const q = input.trim();
    if (!q) return;
    setChat((c) => [...c, { role: 'user', text: q }]);
    setInput('');
    await askTutor(q, { reveal: !hintMode });
  }

  async function revealAnswer(index) {
    const msg = chat[index];
    if (!msg?.question) return;
    setChat((c) => c.map((m, i) => (i === index ? { ...m, revealed: true } : m)));
    await askTutor(msg.question, { reveal: true });
  }

  return (
    <section>
      <div className="eyebrow">Ask anything about your notes</div>
      <div className="kicker-row">
        <h2 style={{ margin: 0 }}>AI Tutor</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--ink-soft)', fontWeight: 600 }}>
          <input type="checkbox" checked={hintMode} onChange={(e) => setHintMode(e.target.checked)} />
          Hint mode — guide me, don't just tell me
        </label>
      </div>
      <div className="card">
        <div className="chat-log" ref={logRef}>
          {chat.map((m, i) => (
            <div key={i} className={'msg ' + (m.role === 'user' ? 'user' : 'ai')} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span>{m.text}</span>
              {m.role === 'ai' && m.question && !m.revealed && (
                <button
                  className="btn btn-secondary"
                  style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => revealAnswer(i)}
                  disabled={loading}
                >
                  Reveal full answer
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div className="msg ai">
              {loadingNote || "Thinking… (if the server's been idle, this can take up to a minute to wake up)"}
            </div>
          )}
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Ask about firewalls, IDS, VPNs…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button className="btn btn-primary" onClick={send} disabled={loading}>Send</button>
        </div>
      </div>
    </section>
  );
}
