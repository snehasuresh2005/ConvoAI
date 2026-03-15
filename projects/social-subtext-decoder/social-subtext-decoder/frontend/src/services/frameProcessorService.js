import { EmotionBuffer } from './temporalSmoothingService'

/**
 * Real-time Conversation Processing Service
 * Analyzes video frames using DeepFace emotion detection
 * Pipeline: Frame → DeepFace Service → Temporal Smoothing → Response
 */

let processingInProgress = false
let emotionBuffer = new EmotionBuffer(10)  // Store 10 frames for smoothing
const MAX_PROCESSING_TIME = 150 // Target <150ms per frame

/**
 * Process a video frame for facial expressions and emotions
 * Simple pipeline:
 * 1. Convert frame to base64
 * 2. Send to DeepFace service
 * 3. Apply temporal smoothing (10-frame buffer)
 * 4. Generate interpretation and suggestions
 */
async function processFrame(base64Frame, audioChunks = []) {
  if (processingInProgress) {
    console.warn('⚠️ Frame processing already in progress, skipping frame')
    return null
  }

  const startTime = performance.now()
  processingInProgress = true

  try {
    // Extract base64 data (remove data URI prefix if present)
    const frameBase64 = base64Frame.includes(',') 
      ? base64Frame.split(',')[1] 
      : base64Frame

    console.log('📸 Processing frame via DeepFace...')

    // Send frame to DeepFace service
    const response = await fetch('http://localhost:5000/analyze-emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame: frameBase64 }),
      timeout: 5000
    })

    if (!response.ok) {
      throw new Error(`DeepFace service error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      console.warn('⚠️ DeepFace could not detect face')
      return null
    }

    // Map DeepFace emotion codes to display names
    const emotionMap = {
      'angry': 'Angry',
      'disgust': 'Disgust',
      'fear': 'Fear',
      'happy': 'Happy',
      'neutral': 'Neutral',
      'sad': 'Sad',
      'surprise': 'Surprise'
    }

    const prediction = {
      emotion: emotionMap[result.emotion] || result.emotion,
      confidence: result.confidence,
      allScores: result.all_emotions
    }

    console.log(`✅ DeepFace: ${prediction.emotion} (${(prediction.confidence * 100).toFixed(1)}%)`)

    // Add to temporal buffer for smoothing
    emotionBuffer.addPrediction(prediction.emotion, prediction.confidence)

    // Get final emotion with temporal smoothing
    const finalEmotion = emotionBuffer.getFinalEmotion()

    // Generate interpretation and suggestions
    const interpretation = generateInterpretation(finalEmotion.emotion)
    const suggestedResponses = generateSuggestions(finalEmotion.emotion)

    const latency = performance.now() - startTime
    console.log(`✅ Frame processed in ${latency.toFixed(0)}ms`)

    return {
      success: true,
      detected: true,
      emotion: finalEmotion.emotion,
      confidence: finalEmotion.confidence,
      frequency: finalEmotion.frequency,
      rawPrediction: prediction.emotion,
      rawConfidence: prediction.confidence,
      allEmotionScores: prediction.allScores,
      interpretation,
      suggestedResponses,
      latency,
      timestamp: new Date().toISOString()
    }
  } catch (err) {
    console.error('❌ Frame processing error:', err.message)
    return {
      success: false,
      error: err.message,
      latency: performance.now() - startTime
    }
  } finally {
    processingInProgress = false
  }
}

/**
 * Generate context-aware interpretation of emotion
 * @param {Object} emotion - Emotion object with label and confidence
 * @returns {string} Interpretation text
 */
function generateInterpretation(emotion) {
  const { label, confidence } = emotion

  if (confidence < 0.4) {
    return 'Expression is unclear or mixed. Try asking a clarifying question.'
  }

  const interpretations = {
    Happy: [
      'They appear happy and positive about this topic.',
      'The positive response suggests agreement or enthusiasm.',
      'Their happiness indicates they\'re enjoying this conversation.'
    ],
    Sad: [
      'They seem sad or disappointed. Consider being more supportive.',
      'Their expression suggests they might be struggling with this topic.',
      'Pay attention - they may need more emotional support.'
    ],
    Angry: [
      'They appear frustrated or upset. Consider taking a break.',
      'Their anger might indicate disagreement or frustration.',
      'This topic seems to upset them. Approach with care.'
    ],
    Surprised: [
      'They seem surprised or shocked by what was said.',
      'Their expression suggests they weren\'t expecting this.',
      'This information or comment caught them off guard.'
    ],
    Fear: [
      'They appear anxious or afraid. Be reassuring.',
      'Their expression suggests concern or worry.',
      'They might be nervous about this topic.'
    ],
    Neutral: [
      'Their expression is neutral - they\'re listening.',
      'No strong emotion detected. They seem composed.',
      'Their response is measured and thoughtful.'
    ],
    Disgust: [
      'They seem unhappy about this. Consider addressing their concerns.',
      'Their expression suggests disapproval.',
      'They might not agree with what was said.'
    ]
  }

  const emotionInterpretations = interpretations[label] || [
    `They appear to be expressing ${label}.`
  ]
  return emotionInterpretations[Math.floor(Math.random() * emotionInterpretations.length)]
}

/**
 * Generate suggested responses based on detected emotion
 */
function generateSuggestions(emotionLabel) {
  const suggestions = {
    Happy: [
      'That\'s wonderful! Tell me more.',
      'I\'m glad to hear that!',
      'Your enthusiasm is great. What else?'
    ],
    Sad: [
      'I understand. That must be difficult.',
      'How can I help you feel better?',
      'Take your time. I\'m here to listen.'
    ],
    Angry: [
      'I hear your frustration. Let\'s take a step back.',
      'Your feelings are valid. What would help?',
      'Let\'s talk through this together.'
    ],
    Surprise: [
      'That was unexpected, wasn\'t it?',
      'Interesting! What are your thoughts?',
      'Did that surprise you?'
    ],
    Fear: [
      'It\'s okay, you\'re safe here.',
      'What\'s worrying you? I\'m here to help.',
      'Let\'s work through this together.'
    ],
    Neutral: [
      'What are you thinking?',
      'That\'s an interesting point.',
      'Tell me more about that.'
    ],
    Disgust: [
      'I understand your concern.',
      'What\'s bothering you about this?',
      'Your feelings matter. Let\'s discuss it.'
    ],
    Uncertain: [
      'Can you tell me more?',
      'I\'m here to listen.',
      'What\'s on your mind?'
    ]
  }

  return suggestions[emotionLabel] || [
    'Could you tell me more about that?',
    'What are you thinking?'
  ]
}

export { processFrame, generateInterpretation, generateSuggestions, EmotionBuffer }
