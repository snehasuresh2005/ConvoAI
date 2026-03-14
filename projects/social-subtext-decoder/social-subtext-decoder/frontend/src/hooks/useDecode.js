import { useState, useCallback } from 'react'
import { decodePhrase } from '@utils/api'

export function useDecode(sessionId) {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const decode = useCallback(async (phrase, context = '') => {
    if (!phrase?.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await decodePhrase(phrase, context, sessionId)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return { result, loading, error, decode, reset }
}
