import { Router } from 'express'
import {
  getHistory,
  deleteHistoryEntry,
  clearHistory,
} from '../controllers/historyController.js'

const router = Router()

// GET    /api/history          — fetch all history for session
// DELETE /api/history          — clear all history for session
// DELETE /api/history/:id      — delete one entry

router.get('/',     getHistory)
router.delete('/',  clearHistory)
router.delete('/:id', deleteHistoryEntry)

export default router
