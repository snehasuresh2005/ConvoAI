import { motion } from 'framer-motion'

function SkeletonBlock({ h = 'h-4', w = 'w-full', className = '' }) {
  return <div className={`skeleton ${h} ${w} ${className}`} />
}

function SkeletonCard({ children }) {
  return (
    <div className="card p-4 space-y-3">
      {children}
    </div>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function LoadingSkeleton() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3"
      aria-label="Loading result..."
      role="status"
    >
      {/* Banner */}
      <motion.div variants={item} className="card px-5 py-4 flex justify-between items-center gap-4">
        <div className="space-y-2 flex-1">
          <SkeletonBlock h="h-3" w="w-24" />
          <SkeletonBlock h="h-5" w="w-3/4" />
        </div>
        <SkeletonBlock h="h-6" w="w-24" className="rounded-full" />
      </motion.div>

      {/* Section cards */}
      {[1, 2, 3].map(i => (
        <motion.div key={i} variants={item}>
          <SkeletonCard>
            <SkeletonBlock h="h-3" w="w-28" />
            <SkeletonBlock h="h-4" w="w-full" />
            <SkeletonBlock h="h-4" w="w-5/6" />
          </SkeletonCard>
        </motion.div>
      ))}

      {/* Responses */}
      <motion.div variants={item}>
        <SkeletonCard>
          <SkeletonBlock h="h-3" w="w-36" />
          <div className="space-y-2">
            <SkeletonBlock h="h-14" />
            <SkeletonBlock h="h-14" />
          </div>
        </SkeletonCard>
      </motion.div>

      {/* Tip */}
      <motion.div variants={item} className="h-12 skeleton rounded-2xl" />
    </motion.div>
  )
}
