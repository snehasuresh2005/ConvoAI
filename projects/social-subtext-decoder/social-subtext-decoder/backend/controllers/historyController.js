// ─── In-Memory History Store ──────────────────────────────────
// This is a simple in-memory store for development.
// Replace with Supabase calls when you're ready for production.
// See comments marked with [SUPABASE] for where to swap.

const historyStore = new Map() // sessionId → [ ...entries ]

const MAX_ENTRIES_PER_SESSION = 50

// ─── Helpers ──────────────────────────────────────────────────
const getSessionHistory = (sessionId) => {
  if (!historyStore.has(sessionId)) {
    historyStore.set(sessionId, [])
  }
  return historyStore.get(sessionId)
}

// ─── Save a decode result to history ─────────────────────────
export const saveToHistory = (sessionId, phrase, decoded) => {
  const history = getSessionHistory(sessionId)

  const entry = {
    id:        `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    phrase,
    decoded,
    savedAt:   new Date().toISOString(),
  }

  // Prepend (newest first), cap at max
  history.unshift(entry)
  if (history.length > MAX_ENTRIES_PER_SESSION) {
    history.splice(MAX_ENTRIES_PER_SESSION)
  }

  // [SUPABASE] Replace above with:
  // await supabase.from('history').insert({ session_id: sessionId, phrase, decoded })

  return entry
}

// ─── GET /api/history ─────────────────────────────────────────
export const getHistory = (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default'

  // [SUPABASE] Replace with:
  // const { data, error } = await supabase
  //   .from('history')
  //   .select('*')
  //   .eq('session_id', sessionId)
  //   .order('saved_at', { ascending: false })

  const history = getSessionHistory(sessionId)

  return res.json({
    success: true,
    count:   history.length,
    history,
  })
}

// ─── DELETE /api/history/:id ──────────────────────────────────
export const deleteHistoryEntry = (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default'
  const { id } = req.params

  const history = getSessionHistory(sessionId)
  const index = history.findIndex(entry => entry.id === id)

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'History entry not found.',
    })
  }

  history.splice(index, 1)

  // [SUPABASE] Replace with:
  // await supabase.from('history').delete().eq('id', id).eq('session_id', sessionId)

  return res.json({ success: true, deleted: id })
}

// ─── DELETE /api/history ──────────────────────────────────────
export const clearHistory = (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default'
  historyStore.set(sessionId, [])

  // [SUPABASE] Replace with:
  // await supabase.from('history').delete().eq('session_id', sessionId)

  return res.json({ success: true, message: 'History cleared.' })
}
