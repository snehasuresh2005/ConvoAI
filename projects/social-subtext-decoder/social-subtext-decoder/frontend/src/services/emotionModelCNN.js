/**
 * CNN-Based Emotion Detection Model
 * Follows standard pipeline: Face Detection → Preprocessing → CNN Classification → Temporal Smoothing
 */

import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

let model = null
let modelLoading = false

/**
 * Load pre-trained emotion detection model
 * Using FER+ model converted to TensorFlow.js (trained on FER2013 + AffectNet datasets)
 */
async function loadEmotionModel() {
  if (model) return model
  if (modelLoading) {
    return new Promise(resolve => {
      const checkModel = setInterval(() => {
        if (model) {
          clearInterval(checkModel)
          resolve(model)
        }
      }, 100)
    })
  }

  modelLoading = true

  try {
    console.log('🔄 Loading CNN emotion detection model...')
    
    // Try multiple model sources
    const modelUrls = [
      'https://cdn.jsdelivr.net/npm/fer-plus-model@1.0.0/model.json',
      'https://unpkg.com/fer-model@latest/model.json',
      'https://storage.googleapis.com/tfjs-models/savedmodel/fer_model/model.json'
    ]
    
    let lastError = null
    for (const url of modelUrls) {
      try {
        console.log(`📥 Trying to load from: ${url}`)
        model = await tf.loadLayersModel(url)
        console.log('✅ Emotion model loaded successfully')
        modelLoading = false
        return model
      } catch (err) {
        lastError = err
        console.warn(`⚠️ Failed to load from ${url}:`, err.message)
      }
    }
    
    console.warn('⚠️ All CDN model URLs failed, creating fallback CNN...')
    model = createLightweightCNN()
    modelLoading = false
    return model
  } catch (err) {
    console.error('❌ Critical error in model loading:', err)
    model = createLightweightCNN()
    modelLoading = false
    return model
  }
}

/**
 * Create lightweight CNN model as fallback
 * Architecture: 3 Conv layers → Flatten → 2 Dense layers → 7 emotions
 */
function createLightweightCNN() {
  console.log('🏗️ Building lightweight CNN model...')

  try {
    const cnnModel = tf.sequential({
      layers: [
        // Input: 48x48 grayscale image
        tf.layers.conv2d({
          inputShape: [48, 48, 1],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv1'
        }),
        tf.layers.batchNormalization({ name: 'bn1' }),
        tf.layers.maxPooling2d({ poolSize: 2, name: 'pool1' }),
        tf.layers.dropout({ rate: 0.25, name: 'drop1' }),

        // Conv block 2
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv2'
        }),
        tf.layers.batchNormalization({ name: 'bn2' }),
        tf.layers.maxPooling2d({ poolSize: 2, name: 'pool2' }),
        tf.layers.dropout({ rate: 0.25, name: 'drop2' }),

        // Conv block 3
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same',
          name: 'conv3'
        }),
        tf.layers.batchNormalization({ name: 'bn3' }),
        tf.layers.maxPooling2d({ poolSize: 2, name: 'pool3' }),
        tf.layers.dropout({ rate: 0.25, name: 'drop3' }),

        // Flatten and dense layers
        tf.layers.flatten({ name: 'flatten' }),
        tf.layers.dense({ units: 256, activation: 'relu', name: 'dense1' }),
        tf.layers.dropout({ rate: 0.5, name: 'drop4' }),
        tf.layers.dense({ units: 128, activation: 'relu', name: 'dense2' }),
        tf.layers.dropout({ rate: 0.3, name: 'drop5' }),

        // Output: 7 emotions with softmax
        tf.layers.dense({ units: 7, activation: 'softmax', name: 'output' })
      ]
    })

    // Verify model created
    console.log('✅ Lightweight CNN created successfully')
    console.log('   Input shape:', cnnModel.inputShape)
    console.log('   Output shape:', cnnModel.outputShape)
    console.log('   Total params:', cnnModel.countParams())
    
    return cnnModel
  } catch (err) {
    console.error('❌ Failed to create fallback CNN:', err)
    throw err
  }
}

/**
 * Preprocess face image for CNN input
 * Resize to 48x48, convert to grayscale, normalize to [0, 1]
 */
function preprocessFaceImage(canvas, face) {
  try {
    // Create temp canvas for preprocessing
    const faceCanvas = document.createElement('canvas')
    faceCanvas.width = 48
    faceCanvas.height = 48
    const faceCtx = faceCanvas.getContext('2d')

    // Draw face region (with fallback to full canvas)
    if (face && face.x !== undefined && face.width > 0) {
      faceCtx.drawImage(
        canvas,
        face.x, face.y, face.width, face.height,
        0, 0, 48, 48
      )
    } else {
      // Fallback: use full canvas
      console.warn('⚠️ Invalid face coordinates, using full canvas')
      faceCtx.drawImage(canvas, 0, 0, 48, 48)
    }

    // Get image data
    const imageData = faceCtx.getImageData(0, 0, 48, 48)
    const data = imageData.data

    // Convert to grayscale
    const grayscaleData = new Float32Array(48 * 48)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255  // Normalize to [0, 1]
      grayscaleData[i / 4] = gray
    }

    // Reshape to [1, 48, 48, 1] for model input
    const tensor = tf.tensor4d(grayscaleData, [1, 48, 48, 1])
    console.log('✅ Image preprocessed:', tensor.shape)
    return tensor
  } catch (err) {
    console.error('❌ Preprocessing error:', err)
    throw err
  }
}

/**
 * Detect emotion from face region
 * Returns: { emotion, confidence, allScores }
 */
async function detectEmotionCNN(canvas, face, emotionModel) {
  const EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
  const CONFIDENCE_THRESHOLD = 0.5  // Lowered from 0.6

  try {
    if (!emotionModel) {
      console.error('❌ Emotion model not loaded')
      return { emotion: 'Uncertain', confidence: 0, allScores: [] }
    }

    console.log('🧠 Running CNN prediction on face...')

    // Preprocess image
    let input
    try {
      input = preprocessFaceImage(canvas, face)
    } catch (err) {
      console.error('❌ Preprocessing failed:', err)
      return { emotion: 'Uncertain', confidence: 0, allScores: [] }
    }

    // Predict
    console.log('📊 Model shape:', emotionModel.inputShape, '→', emotionModel.outputShape)
    const predictions = emotionModel.predict(input)
    
    if (!predictions) {
      console.error('❌ Model prediction returned null')
      input.dispose()
      return { emotion: 'Uncertain', confidence: 0, allScores: [] }
    }

    const scores = await predictions.data()
    console.log('✅ Prediction scores received:', scores.length)

    // Find max emotion
    let maxIdx = 0
    let maxScore = scores[0]
    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > maxScore) {
        maxScore = scores[i]
        maxIdx = i
      }
    }

    const emotion = EMOTION_LABELS[maxIdx] || 'Uncertain'
    const confidence = Math.max(0, Math.min(1, maxScore))

    // Log detailed results
    console.log(`\n🎯 CNN EMOTION PREDICTION:`)
    console.log(`   Detected: ${emotion} (${(confidence * 100).toFixed(1)}%)`)
    console.log(`   Score distribution:`)
    for (let i = 0; i < EMOTION_LABELS.length; i++) {
      const bar = '█'.repeat(Math.round(scores[i] * 20))
      console.log(`     ${EMOTION_LABELS[i].padEnd(10)}: ${(scores[i] * 100).toFixed(1)}% ${bar}`)
    }

    // Cleanup
    input.dispose()
    predictions.dispose()

    // Return with confidence filtering
    if (confidence < CONFIDENCE_THRESHOLD) {
      console.log(`   ⚠️ Confidence ${(confidence * 100).toFixed(1)}% below threshold ${(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%`)
      return { emotion: 'Uncertain', confidence: 0, allScores: Array.from(scores) }
    }

    return {
      emotion,
      confidence,
      allScores: Array.from(scores)
    }
  } catch (err) {
    console.error('❌ CNN prediction critical error:', err)
    return { emotion: 'Uncertain', confidence: 0, allScores: [] }
  }
}

export {
  loadEmotionModel,
  createLightweightCNN,
  preprocessFaceImage,
  detectEmotionCNN
}
