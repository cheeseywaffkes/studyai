import React, { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);
const STORAGE_KEY = 'studyai_state';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not load saved state', e);
  }
  return {};
}

export function AppProvider({ children }) {
  const initial = loadInitial();

  const [profile, setProfile] = useState(initial.profile || null);
  const [material, setMaterial] = useState(initial.material || null);
  const [spaced, setSpaced] = useState(initial.spaced || null);
  const [leitner, setLeitner] = useState(initial.leitner || null);
  const [sessionLog, setSessionLog] = useState(initial.sessionLog || []);
  const [chat, setChat] = useState(initial.chat || []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile, material, spaced, leitner, sessionLog, chat })
      );
    } catch (e) {
      console.warn('Could not save state', e);
    }
  }, [profile, material, spaced, leitner, sessionLog, chat]);

  function logSession(method, extra = {}) {
    setSessionLog((log) => [...log, { date: new Date().toISOString(), method, ...extra }]);
  }

  const value = {
    profile, setProfile,
    material, setMaterial,
    spaced, setSpaced,
    leitner, setLeitner,
    sessionLog, logSession,
    chat, setChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
