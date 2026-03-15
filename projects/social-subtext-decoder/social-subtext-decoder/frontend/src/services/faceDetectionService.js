import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

/**
 * Face Detection Service using MediaPipe
 * Detects faces and extracts face regions from images
 */
let faceLandmarker = null
let isInitialized = false

/**
 * Initialize MediaPipe FaceLandmarker
 */
async function initializeFaceDetector() {
  if (isInitialized) return

  try {
    console.log('🔄 Initializing MediaPipe FaceLandmarker...')

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm'
    )

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker.task'
      },
      runningMode: 'IMAGE',
      numFaces: 1 // Detect only 1 face (primary speaker)
    })

    isInitialized = true
    console.log('✅ MediaPipe FaceLandmarker initialized')
  } catch (err) {
    console.error('❌ Failed to initialize FaceLandmarker:', err)
    throw err
  }
}

/**
 * Detect faces in an image
 * @param {HTMLImageElement} image - Image element to detect faces in
 * @returns {Array} Array of detected faces with landmarks
 */
async function detectFaces(image) {
  if (!faceLandmarker) {
    await initializeFaceDetector()
  }

  try {
    const detections = faceLandmarker.detect(image)
    console.log(`🎯 Face detection result:`, detections)
    return detections.faceLandmarks || []
  } catch (err) {
    console.error('❌ Face detection error:', err)
    return []
  }
}

/**
 * Extract face region from image
 * @param {HTMLCanvasElement} canvas - Canvas with image
 * @param {Array} landmarks - Face landmarks from MediaPipe
 * @returns {HTMLCanvasElement} Canvas containing extracted face
 */
function extractFaceRegion(canvas, landmarks) {
  if (!landmarks || landmarks.length === 0) return null

  try {
    // Get bounding box from landmarks
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity

    landmarks.forEach(point => {
      const x = point.x * canvas.width
      const y = point.y * canvas.height

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    })

    // Add padding
    const padding = 20
    minX = Math.max(0, minX - padding)
    minY = Math.max(0, minY - padding)
    maxX = Math.min(canvas.width, maxX + padding)
    maxY = Math.min(canvas.height, maxY + padding)

    const faceWidth = maxX - minX
    const faceHeight = maxY - minY

    // Create new canvas for face region
    const faceCanvas = document.createElement('canvas')
    faceCanvas.width = faceWidth
    faceCanvas.height = faceHeight

    const ctx = faceCanvas.getContext('2d')
    ctx.drawImage(
      canvas,
      minX,
      minY,
      faceWidth,
      faceHeight,
      0,
      0,
      faceWidth,
      faceHeight
    )

    return faceCanvas
  } catch (err) {
    console.error('❌ Face extraction error:', err)
    return null
  }
}

/**
 * Detect faces and extract their regions
 * @param {string} base64Image - Base64 encoded image
 * @returns {Array} Array of {canvas, landmarks} objects
 */
async function detectAndExtractFaces(base64Image) {
  try {
    // Convert base64 to image
    const img = new Image()
    img.src = base64Image

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    // Create canvas and draw image
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    console.log(`📽️ Image loaded: ${img.width}x${img.height}px`)

    // Detect faces
    const faceLandmarksList = await detectFaces(canvas)

    if (faceLandmarksList.length === 0) {
      console.warn('⚠️ No faces detected in image')
      return []
    }

    // Extract face regions
    const faceRegions = faceLandmarksList.map((landmarks, idx) => {
      const extracted = extractFaceRegion(canvas, landmarks)
      if (extracted) {
        console.log(`✅ Face ${idx + 1} extracted: ${extracted.width}x${extracted.height}px`)
      } else {
        console.warn(`⚠️ Face ${idx + 1} extraction failed`)
      }
      return {
        canvas: extracted,
        landmarks,
        confidence: 0.95 // MediaPipe confidence (estimated)
      }
    })

    console.log(`✅ Detected and extracted ${faceRegions.filter(f => f.canvas).length} valid face(s)`)
    return faceRegions
  } catch (err) {
    console.error('❌ Face detection and extraction error:', err)
    return []
  }
}

export { initializeFaceDetector, detectFaces, extractFaceRegion, detectAndExtractFaces }
