function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function getSessionId() {
  let sessionId = localStorage.getItem('5s_session_id');

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('5s_session_id', sessionId);
  }

  return sessionId;
}

export function clearSession() {
  localStorage.removeItem('5s_session_id');
}
