// ─── Input Sanitizer Middleware ───────────────────────────────
// Strips dangerous characters from string fields before they
// reach controllers. Lightweight — not a replacement for proper
// input validation in controllers.

export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Remove null bytes and control characters (except newlines/tabs)
        req.body[key] = req.body[key]
          .replace(/\0/g, '')
          .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          .trim()
      }
    }
  }
  next()
}

// ─── Session ID Middleware ─────────────────────────────────────
// Ensures every request has an x-session-id header.
// Frontend generates this once per browser session.

export const requireSessionId = (req, res, next) => {
  const sessionId = req.headers['x-session-id']
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid x-session-id header.',
    })
  }
  next()
}
