import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="hero">
        <div className="eyebrow">Your personalised AI study companion</div>
        <h1>Same material.<br />Different learner.</h1>
        <p className="lede">
          StudyAI doesn't hand every student the same summary, flashcard deck, and quiz.
          It starts by asking how you study — then builds the session around you.
        </p>
        <p className="quote">"Same material. Different learner. Personalised study."</p>
        <div className="row" style={{ marginTop: 22 }}>
          <button className="btn btn-primary" onClick={() => navigate('/methods')}>
            Choose a study method →
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/train')}>
            ✨ Try Train My AI
          </button>
        </div>
      </div>

      <div className="row" style={{ alignItems: 'stretch' }}>
        <div className="card" style={{ flex: 1, minWidth: 240 }}>
          <h3>🧠 6 recognised methods</h3>
          <p style={{ fontSize: '0.88rem' }}>
            Active Recall, Spaced Repetition, Pomodoro, Feynman, Cornell notes and the Leitner
            system — each with a genuine, interactive loop, not a static page.
          </p>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 240 }}>
          <h3>✨ Train My AI</h3>
          <p style={{ fontSize: '0.88rem' }}>
            Answer 6 quick questions about how you learn. StudyAI builds a Study Profile and uses
            it to shape explanations, quizzes and flashcards from your notes.
          </p>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 240 }}>
          <h3>🧪 Works with zero setup</h3>
          <p style={{ fontSize: '0.88rem' }}>
            Runs fully in Demo Mode with no API key — every feature is live and interactive,
            using built-in sample "Network Security — Week 5" notes.
          </p>
        </div>
      </div>
    </section>
  );
}
