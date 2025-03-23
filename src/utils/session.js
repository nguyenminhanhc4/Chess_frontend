export function getSessionId() {
  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2, 11);
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}
