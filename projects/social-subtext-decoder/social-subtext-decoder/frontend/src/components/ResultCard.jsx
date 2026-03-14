import { motion } from 'framer-motion'
import { Eye, MessageCircle, Smile, Reply, Zap, RotateCcw } from 'lucide-react'
import clsx from 'clsx'

const TONE_COLORS = {
  'Friendly':        'bg-green-50  text-green-700  border-green-200',
  'Neutral':         'bg-gray-50   text-gray-600   border-gray-200',
  'Sarcastic':       'bg-orange-50 text-orange-700 border-orange-200',
  'Dismissive':      'bg-red-50    text-red-700    border-red-200',
  'Sincere':         'bg-blue-50   text-blue-700   border-blue-200',
  'Polite but Cold': 'bg-slate-50  text-slate-600  border-slate-200',
  'Enthusiastic':    'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Concerned':       'bg-purple-50 text-purple-700 border-purple-200',
  'Uncomfortable':   'bg-pink-50   text-pink-700   border-pink-200',
  'Joking':          'bg-teal-50   text-teal-700   border-teal-200',
}

const CONFIDENCE_LABELS = {
  high:   { label: 'Clear meaning',      color: 'text-green-600' },
  medium: { label: 'Context-dependent',  color: 'text-amber-600' },
  low:    { label: 'Ambiguous phrase',   color: 'text-red-500'   },
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.35, ease: 'easeOut' } },
}

function Section({ icon: Icon, label, color, children }) {
  return (
    <motion.div variants={item} className="card p-4 space-y-2">
      <div className={clsx('flex items-center gap-2 text-xs font-semibold uppercase tracking-wider', color)}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      {children}
    </motion.div>
  )
}

export default function ResultCard({ result, onReset }) {
  const { phrase, decoded } = result
  const { literal, social, tone, suggestedResponses, confidence, tip } = decoded

  const toneStyle   = TONE_COLORS[tone?.label] || TONE_COLORS['Neutral']
  const confInfo    = CONFIDENCE_LABELS[confidence] || CONFIDENCE_LABELS['medium']

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {/* Phrase banner */}
      <motion.div variants={item} className="card px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-soft-muted font-medium uppercase tracking-wider mb-1">Decoded phrase</p>
          <p className="font-display font-semibold text-gray-900">"{phrase}"</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={clsx('badge border', toneStyle)}>
            {tone?.label}
          </span>
          <span className={clsx('text-xs font-medium', confInfo.color)}>
            {confInfo.label}
          </span>
        </div>
      </motion.div>

      {/* Literal meaning */}
      <Section icon={Eye} label="Literal meaning" color="text-decode-literal">
        <p className="text-gray-700 text-sm leading-relaxed">{literal}</p>
      </Section>

      {/* Social meaning */}
      <Section icon={MessageCircle} label="What they really mean" color="text-decode-social">
        <p className="text-gray-700 text-sm leading-relaxed">{social}</p>
      </Section>

      {/* Tone explanation */}
      <Section icon={Smile} label="Emotional tone" color="text-decode-tone">
        <p className="text-gray-700 text-sm leading-relaxed">{tone?.explanation}</p>
      </Section>

      {/* Suggested responses */}
      <Section icon={Reply} label="How you could respond" color="text-decode-respond">
        <div className="space-y-2.5">
          {suggestedResponses?.map((r, i) => (
            <div key={i} className="bg-soft-bg rounded-xl p-3 border border-soft-border">
              <p className="text-gray-800 text-sm font-medium">"{r.text}"</p>
              <p className="text-soft-muted text-xs mt-1">{r.context}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Tip */}
      {tip && (
        <motion.div variants={item}
          className="flex gap-3 items-start bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3">
          <Zap className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
          <p className="text-sm text-primary-700">{tip}</p>
        </motion.div>
      )}

      {/* Reset */}
      <motion.div variants={item} className="flex justify-center pt-2">
        <button onClick={onReset} className="btn-ghost flex items-center gap-2 text-sm">
          <RotateCcw className="w-3.5 h-3.5" />
          Decode another phrase
        </button>
      </motion.div>
    </motion.div>
  )
}
