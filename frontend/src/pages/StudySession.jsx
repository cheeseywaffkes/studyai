import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

import Personalized from './methods/Personalized.jsx';
import ActiveRecall from './methods/ActiveRecall.jsx';
import SpacedRepetition from './methods/SpacedRepetition.jsx';
import Pomodoro from './methods/Pomodoro.jsx';
import Feynman from './methods/Feynman.jsx';
import Cornell from './methods/Cornell.jsx';
import Leitner from './methods/Leitner.jsx';

const COMPONENTS = {
  personalized: Personalized,
  activeRecall: ActiveRecall,
  spaced: SpacedRepetition,
  pomodoro: Pomodoro,
  feynman: Feynman,
  cornell: Cornell,
  leitner: Leitner,
};

export default function StudySession() {
  const { methodId } = useParams();
  const { material } = useApp();

  if (!material) {
    return <Navigate to="/upload" state={{ pendingMethod: methodId }} replace />;
  }

  const Component = COMPONENTS[methodId];
  if (!Component) return <Navigate to="/methods" replace />;

  return <Component />;
}
