import { useState, useEffect, useCallback } from 'react'
import { fetchHistory, deleteHistoryEntry, clearAllHistory } from '@utils/api'

export function useHistory(sessionId) {
  const [history,  setHistory]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHistory(sessionId)
      setHistory(data.history || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    load()
  }, [load])

  const remove = useCallback(async (id) => {
    try {
      await deleteHistoryEntry(id, sessionId)
      setHistory(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }, [sessionId])

  const clear = useCallback(async () => {
    try {
      await clearAllHistory(sessionId)
      setHistory([])
    } catch (err) {
      setError(err.message)
    }
  }, [sessionId])

  return { history, loading, error, load, remove, clear }
}
