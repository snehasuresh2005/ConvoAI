import { useState } from 'react'
import { Send, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EXAMPLE_PHRASES = [
  "We should hang out sometime",
  "That's an interesting idea",
  "No worries at all!",
  "I'll keep that in mind",
  "Sure, if you really want to",
  "You're so brave for trying that",
]

export default function DecoderInput({ onDecode, loading }) {
  const [phrase,      setPhrase]      = useState('')
  const [context,     setContext]     = useState('')
  const [showContext, setShowContext] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!phrase.trim() || loading) return
    onDecode(phrase.trim(), context.trim())
  }

  const handleExample = (example) => {
    setPhrase(example)
  }

  const charCount = phrase.length
  const isOverLimit = charCount > 500

  return (
    <div className="card p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">
          What did they say?
        </h1>
        <p className="text-soft-muted text-sm mt-1">
          Paste or type a phrase someone said to you — we'll decode what they really meant.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main input */}
        <div className="relative">
          <textarea
            value={phrase}
            onChange={e => setPhrase(e.target.value)}
            placeholder={"e.g. \"We should hang out sometime\""}
            rows={3}
            maxLength={520}
            className={`input-base pr-4 ${isOverLimit ? 'ring-2 ring-status-error border-status-error' : ''}`}
            aria-label="Phrase to decode"
          />
          <div className={`absolute bottom-3 right-3 text-xs font-mono
            ${isOverLimit ? 'text-status-error' : 'text-soft-muted'}`}>
            {charCount}/500
          </div>
        </div>

        {/* Optional context toggle */}
        <button
          type="button"
          onClick={() => setShowContext(v => !v)}
          className="flex items-center gap-1.5 text-sm text-soft-muted hover:text-primary-500 transition-colors"
        >
          {showContext ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Add context (optional)
        </button>

        <AnimatePresence>
          {showContext && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="Any extra context? e.g. 'Said by my manager after a presentation' or 'Text message from a friend'"
                rows={2}
                maxLength={200}
                className="input-base text-sm"
                aria-label="Optional context"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={!phrase.trim() || isOverLimit || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Decoding...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Decode this phrase
            </>
          )}
        </button>
      </form>

      {/* Example phrases */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 mb-3">
          <Lightbulb className="w-3.5 h-3.5 text-soft-muted" />
          <span className="text-xs text-soft-muted font-medium uppercase tracking-wider">Try an example</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PHRASES.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => handleExample(ex)}
              className="text-xs px-3 py-1.5 rounded-xl border border-soft-border bg-soft-bg
                         text-soft-muted hover:text-primary-600 hover:border-primary-300
                         hover:bg-primary-50 transition-all duration-200"
            >
              "{ex}"
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
