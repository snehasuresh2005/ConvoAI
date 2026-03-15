import * as tf from '@tensorflow/tfjs'
import { analyzeFacialFeatures } from './facialFeatureAnalyzer'

/**
 * Emotion Classification Service
 * Uses facial feature analysis for emotion detection
 */

const EMOTION_LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

let isInitialized = false

/**
 * Initialize emotion detection system
 */
async function initializeEmotionModel() {
  if (isInitialized) return

  try {
    console.log('🔄 Initializing facial emotion detection...')
    isInitialized = true
    console.log('✅ Emotion detection ready (using facial feature analysis)')
  } catch (err) {
    console.error('❌ Failed to initialize:', err)
    isInitialized = true
  }
}

/**
 * Predict emotion from facial features with simple rules
 */
function predictEmotionFromFeatures(features) {
  const { smile, frown, eyeOpenness, tension, glabellaFurrowing, brightness } = features

  console.log(`\n🧠 === EMOTION CLASSIFICATION START ===`)
  console.log(`📥 Input features:`)
  console.log(`   • Smile: ${smile.toFixed(3)}`)
  console.log(`   • Frown (upside-down): ${frown.toFixed(3)}`)
  console.log(`   • Eye Openness: ${eyeOpenness.toFixed(3)}`)
  console.log(`   • Tension: ${tension.toFixed(3)}`)
  console.log(`   • Glabella Furrowing (eyebrows): ${glabellaFurrowing.toFixed(3)}`)
  console.log(`   • Brightness: ${brightness.toFixed(3)}`)

  // Simple, direct emotion classification based on observable features
  const scores = {}

  // Initialize
  for (const label of EMOTION_LABELS) {
    scores[label] = 0
  }

  console.log(`\n🔍 Evaluating rules:`)

  // NEW RULES: Detect emotions with NEW METRICS
  // frown = upside-down smile (mouth corners pulled down) = SADNESS
  // glabellaFurrowing = eyebrows touching/furrowing = ANGER
  // FIX: Make HAPPY and SURPRISE MUTUALLY EXCLUSIVE to prevent oscillation
  
  // SAD: Strong frown (upside-down smile) = sadness
  if (frown > 0.45) {
    scores.Sad = 0.85
    console.log(`✅ SAD DETECTED: frown=${frown.toFixed(3)} > 0.45 (strong upside-down smile)`)
  }
  // ANGRY: Eyebrows furrowed together (glabella furrowing) + no smile = anger
  else if (glabellaFurrowing > 0.25) {
    scores.Angry = 0.85
    console.log(`✅ ANGRY DETECTED: glabellaFurrowing=${glabellaFurrowing.toFixed(3)} > 0.25 (eyebrows furrowed together)`)
  }
  // HAPPY: Strong smile (>0.55) with moderate eye openness = happiness
  else if (smile > 0.55 && eyeOpenness <= 0.72) {
    scores.Happy = 0.85
    console.log(`✅ HAPPY DETECTED: smile=${smile.toFixed(3)} > 0.55 (strong smile) AND eyeOpenness=${eyeOpenness.toFixed(3)} <= 0.72 (not extreme)`)
  }
  // SURPRISED: EXTREMELY WIDE eyes (>0.72) with minimal frown = genuine surprise
  else if (eyeOpenness > 0.72 && frown < 0.35) {
    scores.Surprise = 0.85
    console.log(`✅ SURPRISED DETECTED: eyeOpenness=${eyeOpenness.toFixed(3)} > 0.72 (EXTREMELY wide eyes) AND frown=${frown.toFixed(3)} < 0.35`)
  }
  // NEUTRAL: Default neutral expression
  else {
    scores.Neutral = 0.70
    console.log(`✅ NEUTRAL DETECTED: smile=${smile.toFixed(3)}, frown=${frown.toFixed(3)}, eyeOpenness=${eyeOpenness.toFixed(3)}, glabellaFurrowing=${glabellaFurrowing.toFixed(3)}`)
  }

  console.log(`\n📊 Raw scores:`, Object.fromEntries(
    Object.entries(scores).filter(([, v]) => v > 0).map(([k, v]) => [k, v.toFixed(3)])
  ))

  // Find max and normalize (simple max-takes-all approach)
  let maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) {
    maxScore = 1
  }

  Object.keys(scores).forEach(key => {
    scores[key] = scores[key] / maxScore
  })

  console.log(`✅ === EMOTION CLASSIFICATION END ===\n`)
  return scores
}

/**
 * Get emotion from scores
 */
function getEmotionFromScores(scores) {
  let maxEmotion = 'Neutral'
  let maxScore = 0

  Object.entries(scores).forEach(([emotion, score]) => {
    if (score > maxScore) {
      maxScore = score
      maxEmotion = emotion
    }
  })

  // Clamp confidence between 0.3 and 0.95
  const confidence = Math.max(0.3, Math.min(maxScore, 0.95))

  return {
    label: maxEmotion,
    confidence,
    scores: EMOTION_LABELS.map(label => ({
      emotion: label,
      score: parseFloat((scores[label] || 0).toFixed(3))
    }))
  }
}

/**
 * Classify emotion from frame or face canvas
 */
async function classifyEmotion(frameCanvas) {
  if (!frameCanvas || !(frameCanvas instanceof HTMLCanvasElement)) {
    return {
      label: 'Unknown',
      confidence: 0,
      error: 'Invalid frame canvas'
    }
  }

  await initializeEmotionModel()

  try {
    // Analyze facial features directly from frame
    const features = analyzeFacialFeatures(frameCanvas)

    // Predict emotion from features
    const emotionScores = predictEmotionFromFeatures(features)
    const emotion = getEmotionFromScores(emotionScores)

    console.log(
      `✅ Final Emotion: ${emotion.label} (${(emotion.confidence * 100).toFixed(0)}%)\n`
    )

    return emotion
  } catch (err) {
    console.error('❌ Emotion classification error:', err)

    return {
      label: 'Neutral',
      confidence: 0.5,
      error: err.message
    }
  }
}

/**
 * Cleanup model resources
 */
function dispose() {
  isInitialized = false
}

export {
  initializeEmotionModel,
  classifyEmotion,
  dispose,
  EMOTION_LABELS
}
