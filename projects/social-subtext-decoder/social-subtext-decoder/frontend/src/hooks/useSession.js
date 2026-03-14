import { useState, useEffect } from 'react'

const SESSION_KEY = 'ssd_session_id'

// Generates a random session ID and stores in sessionStorage
// So each browser tab/session gets its own history
function generateSessionId() {
  return `ssd-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function useSession() {
  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const fresh = generateSessionId()
    sessionStorage.setItem(SESSION_KEY, fresh)
    return fresh
  })

  return sessionId
}
