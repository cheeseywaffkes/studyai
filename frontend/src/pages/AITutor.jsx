import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';

export default function AITutor() {
  const { material, profile, chat, setChat } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (chat.length === 0) {
      const greeting = material
        ? `Hi! Ask me anything about ${material.source === 'sample' ? 'firewalls, IDS, IPS, VPNs, or IPsec' : 'your uploaded notes'}.`
        : 'Hi! Load some notes first (Study Methods → any method → Use Sample Notes) and I can answer questions about them.';
      setChat([{ role: 'ai', text: greeting }]);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [chat]);

  async function send() {
    const q = input.trim();
    if (!q) return;
    setChat((c) => [...c, { role: 'user', text: q }]);
    setInput('');

    if (!material) {
      setChat((c) => [...c, { role: 'ai', text: "I don't have any notes loaded yet — go to Study Methods, pick any method, and choose 'Use Sample Notes'." }]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.tutor(q, material, profile?.style);
      setChat((c) => [...c, { role: 'ai', text: res.answer }]);
    } catch (e) {
      setChat((c) => [...c, { role: 'ai', text: "Couldn't reach the backend just now — make sure the server is running." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="eyebrow">Ask anything about your notes</div>
      <h2>AI Tutor</h2>
      <div className="card">
        <div className="chat-log" ref={logRef}>
          {chat.map((m, i) => (
            <div key={i} className={'msg ' + (m.role === 'user' ? 'user' : 'ai')}>{m.text}</div>
          ))}
          {loading && <div className="msg ai">Thinking… (if the server's been idle, this can take up to a minute to wake up)</div>}
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
