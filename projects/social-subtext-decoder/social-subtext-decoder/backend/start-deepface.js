#!/usr/bin/env node

/**
 * DeepFace Service Launcher (Windows + Virtual Environment)
 * 
 * Launches the Python DeepFace emotion detection service from venv
 * Usage: node start-deepface.js
 */

import { spawn } from 'child_process'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendDir = __dirname
const venvPython = os.platform() === 'win32'
  ? path.join(backendDir, 'venv', 'Scripts', 'python.exe')
  : path.join(backendDir, 'venv', 'bin', 'python')

console.log('🚀 Starting DeepFace Emotion Detection Service...\n')

// Check if venv exists
if (!fs.existsSync(venvPython)) {
  console.error('❌ Virtual environment not found!\n')
  console.error('📝 Setup instructions:')
  console.error('1. cd backend')
  console.error('2. python -m venv venv')
  console.error('3. .\\venv\\Scripts\\pip install -r requirements.txt')
  console.error('4. node start-deepface.js\n')
  process.exit(1)
}

// Clear legacy Keras setting
const env = { ...process.env }
delete env.TF_USE_LEGACY_KERAS

const pythonProcess = spawn(venvPython, ['deepface_service.py'], {
  cwd: backendDir,
  stdio: 'inherit',
  env
})

console.log('✅ DeepFace service starting on http://localhost:5000')
console.log('💡 Keep this terminal open for real-time emotion analysis\n')

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down DeepFace service...')
  pythonProcess.kill()
  process.exit(0)
})

pythonProcess.on('error', (err) => {
  console.error('❌ Failed to start DeepFace service:', err.message)
  process.exit(1)
})
