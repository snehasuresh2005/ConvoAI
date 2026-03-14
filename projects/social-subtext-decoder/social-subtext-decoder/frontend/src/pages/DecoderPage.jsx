import { AnimatePresence } from 'framer-motion'
import { useSession } from '@hooks/useSession'
import { useDecode }  from '@hooks/useDecode'
import DecoderInput   from '@components/DecoderInput'
import ResultCard     from '@components/ResultCard'
import LoadingSkeleton from '@components/LoadingSkeleton'
import ErrorBanner    from '@components/ErrorBanner'

export default function DecoderPage() {
  const sessionId = useSession()
  const { result, loading, error, decode, reset } = useDecode(sessionId)

  return (
    <div className="space-y-5">
      {/* Input — hide once we have a result */}
      {!result && !loading && (
        <DecoderInput onDecode={decode} loading={loading} />
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <ErrorBanner message={error} onDismiss={reset} />
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading && <LoadingSkeleton />}

      {/* Result */}
      {result && !loading && (
        <ResultCard result={result} onReset={reset} />
      )}
    </div>
  )
}
