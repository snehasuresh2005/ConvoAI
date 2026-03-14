import { Router } from 'express'
import { decodePhrase } from '../controllers/decodeController.js'
import { saveToHistory } from '../controllers/historyController.js'

const router = Router()

// POST /api/decode
// Body: { phrase: string, context?: string }
router.post('/', async (req, res) => {
  // Run the decode
  const originalJson = res.json.bind(res)

  // Intercept the response to auto-save to history on success
  res.json = (body) => {
    if (body?.success && body?.decoded) {
      const sessionId = req.headers['x-session-id'] || 'default'
      saveToHistory(sessionId, body.phrase, body.decoded)
    }
    return originalJson(body)
  }

  await decodePhrase(req, res)
})

export default router
