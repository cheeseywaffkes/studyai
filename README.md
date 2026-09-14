# 📚 StudyAI — Prototype

_Your personalised AI study companion._

> "Same material. Different learner. Personalised study."

This is a working 4-day school prototype. It has a React (Vite) frontend and a
Node/Express backend, and it runs fully **without an OpenAI API key** in
**Demo Mode**, using built-in sample responses — so it is always safe to demo.

---

## 1. How to run it

You need [Node.js](https://nodejs.org) installed (v18+ recommended).

```bash
cd studyai
npm run install:all   # installs root, backend, and frontend dependencies
npm run dev           # starts BOTH the backend and frontend together
```

Then open **http://localhost:5173** in your browser.

- Backend runs on `http://localhost:5050`
- Frontend runs on `http://localhost:5173`

If you'd rather run them separately (e.g. in two terminal tabs):

```bash
npm run backend   # just the Express API on :5050
npm run frontend  # just the React app on :5173
```

### Stopping the app

Press `Ctrl+C` in the terminal running `npm run dev`.

---

## 2. Where to put your OpenAI API key (optional)

The app works great with **no key at all** — it runs in Demo Mode automatically.

If you want live AI responses instead of the built-in demo content:

1. Go to `studyai/backend/`
2. Copy `.env.example` to a new file called `.env`
3. Paste your key in:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
4. Restart the backend (`npm run backend`, or `npm run dev` from the root)

You'll see a badge in the top-left sidebar telling you which mode you're
in: **🧪 Demo Mode** or **⚡ Live AI**. If a live API call ever fails (bad
key, no internet, rate limit, etc.), the backend automatically falls back
to Demo Mode for that request so the app never breaks mid-demo.

---

## 3. How Demo Mode works

Demo Mode doesn't just return static text — it's a small rule-based engine
(`backend/lib/demoEngine.js`) that:

- Recognises the built-in **"Network Security — Week 5"** sample notes and
  serves hand-written, high-quality questions, explanations, flashcards,
  Cornell notes, and MCQs for each concept (firewalls, IDS, IPS, VPN, IPsec).
- Falls back to simple sentence-extraction heuristics for **any other**
  pasted/uploaded text, so the app still "works" (just less polished) even
  outside the sample notes.
- Includes a keyword-based answer-scoring system for Active Recall and
  Feynman, so partial-credit feedback ("Good start! You correctly
  identified...") behaves the way you'd expect a real tutor to respond.

This is what makes the whole app demoable on a school laptop with no
internet connection and no API key.

---

## 4. Which files matter most

```
studyai/
├── backend/
│   ├── server.js              → Express app entry point
│   ├── routes/api.js          → All API endpoints (one per feature)
│   ├── lib/aiEngine.js        → Real OpenAI-backed logic (Live Mode)
│   ├── lib/demoEngine.js      → Rule-based logic (Demo Mode)
│   ├── data/sampleNotes.js    → The built-in "Network Security" notes
│   ├── data/demoConcepts.js   → Hand-written demo content per concept
│   └── .env.example           → Copy to .env to add your API key
│
└── frontend/
    └── src/
        ├── App.jsx                   → Sidebar nav + route table
        ├── pages/                    → One file per screen
        │   ├── Welcome.jsx
        │   ├── MethodSelect.jsx      → "How do you study?"
        │   ├── TrainMyAI.jsx         → The 6-question profile builder
        │   ├── StudyProfile.jsx
        │   ├── UploadNotes.jsx
        │   ├── StudySession.jsx      → Routes to the right method below
        │   ├── methods/              → One component per study method
        │   │   ├── ActiveRecall.jsx
        │   │   ├── SpacedRepetition.jsx
        │   │   ├── Pomodoro.jsx
        │   │   ├── Feynman.jsx
        │   │   ├── Cornell.jsx
        │   │   ├── Leitner.jsx
        │   │   └── Personalized.jsx  → The "Train My AI" experience
        │   ├── AITutor.jsx
        │   ├── Dashboard.jsx
        │   └── Progress.jsx
        ├── context/AppContext.jsx    → Profile/material saved to localStorage
        └── lib/api.js                → All calls to the backend
```

---

## 5. What's fully functional

- **Study method selection** — all 6 named methods + Train My AI, as cards
- **Train My AI** — the full 6-question flow, builds and saves a Study
  Profile to `localStorage`
- **Personalised session** — after training, StudyAI generates a short
  explanation (matched to the chosen explanation style), MCQs, and
  flashcards from the *same* uploaded material
- **Active Recall** — question → answer → AI evaluation → gap explanation →
  next question → end-of-session strong/weak topic summary
- **Spaced Repetition** — "Today's Review" with New/Review/Difficult/Mastered
  statuses and Again/Hard/Good/Easy ratings
- **Pomodoro** — real 25-minute countdown timer, task checklist, and a
  reflection step at the end
- **Feynman Technique** — explain-it-simply prompt, AI feedback on accuracy/
  clarity/missing concepts, and a "try again" loop
- **Cornell Method** — auto-generated cues/notes/summary layout
- **Leitner System** — flashcards that move between boxes based on your answer
- **PDF upload** — extracts real text from an uploaded PDF (or falls back to
  the sample notes if extraction fails)
- **Demo Mode** — the entire app works with zero setup and no internet
- **AI Tutor chat** — a chat screen that answers questions using the
  uploaded material and the student's profile
- **Dashboard, Progress** — using your real profile/material where
  available, and clearly-labelled demo data where it isn't (per the brief)

## 6. What's simulated / simplified (by design, per the prototype brief)

- **"Training the AI"** does not fine-tune any model — it saves your answers
  as a Study Profile and passes them as context to every AI call. The app is
  upfront about this on the Study Profile page.
- **Spaced repetition scheduling** is a simple status system (New/Review/
  Difficult/Mastered), not a real spaced-repetition algorithm.
- **Progress / analytics** uses realistic demo numbers, not a real tracking
  database, since building real cross-session analytics was out of scope for
  a 4-day prototype.
- **Weak-area detection** in the Personalised session is a simple message
  based on your stated profile (goal/challenges), not a real diagnostic — the
  Active Recall flow is the one method with genuine weak-topic detection,
  based on your actual answers.

---

## 7. Troubleshooting

- **"Could not reach the backend"** — make sure `npm run dev` (or
  `npm run backend`) is running and nothing else is using port 5050.
- **PDF upload fails** — some PDFs (scanned images, heavily secured files)
  can't be text-extracted. Use "Use Sample Notes" for a guaranteed-working
  demo.
- **Nothing looks personalised** — the Train My AI flow must be completed
  before the Personalised session appears; check "My Study Profile" in the
  sidebar to confirm a profile was saved.
