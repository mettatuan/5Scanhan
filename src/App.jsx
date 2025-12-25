import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getSessionId } from './lib/session';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import DailyMode from './components/DailyMode';
import WeeklyReview from './components/WeeklyReview';
import S1Filter from './components/S1Filter';
import S2Organize from './components/S2Organize';
import S3Clean from './components/S3Clean';
import S4Standardize from './components/S4Standardize';
import S5Sustain from './components/S5Sustain';
import './App.css';

function App() {
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSession();
  }, []);

  async function loadUserSession() {
    const sessionId = getSessionId();

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('Error loading session:', error);
    }

    if (data) {
      setUserSession(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  const needsOnboarding = !userSession || !userSession.onboarding_completed;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/onboarding"
          element={<Onboarding onComplete={loadUserSession} />}
        />
        <Route
          path="/dashboard"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Dashboard userSession={userSession} />
            )
          }
        />
        <Route
          path="/daily"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <DailyMode userSession={userSession} />
            )
          }
        />
        <Route
          path="/review"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <WeeklyReview userSession={userSession} />
            )
          }
        />
        <Route
          path="/area/:areaName/s1"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <S1Filter userSession={userSession} />
            )
          }
        />
        <Route
          path="/area/:areaName/s2"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <S2Organize userSession={userSession} />
            )
          }
        />
        <Route
          path="/area/:areaName/s3"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <S3Clean userSession={userSession} />
            )
          }
        />
        <Route
          path="/area/:areaName/s4"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <S4Standardize userSession={userSession} />
            )
          }
        />
        <Route
          path="/area/:areaName/s5"
          element={
            needsOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <S5Sustain userSession={userSession} />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
