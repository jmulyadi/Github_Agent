import { v4 as uuidv4 } from "uuid";

export const getSessionId = () => {
  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId = uuidv4(); // Generate a new session ID
    localStorage.setItem("session_id", sessionId); // Save it for persistence
  }
  return sessionId;
};
