// ═══════════════════════════════════════════════════════════════════════
// Hugging Face AI Integration Service
// ═══════════════════════════════════════════════════════════════════════

import dotenv from 'dotenv'

dotenv.config()

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.1'
const HF_API_URL = 'https://api-inference.huggingface.co/models'

// ─── Practice Mode Context Templates ───────────────────────────────────
const SITUATION_TEMPLATES = {
  restaurant: {
    title: 'Ordering at a Restaurant',
    systemPrompt: `You are a friendly restaurant waiter. The user is practicing ordering food.
    CRITICAL: Ask specific follow-up questions based on EXACTLY what the user said. Never repeat questions.
    If they mentioned a dish, ask about sides or drinks to go with it.
    If they mentioned a drink, ask about food.
    If they mentioned allergies, ask what they CAN eat.
    Keep responses to 1-2 sentences max. Be conversational and remember what they've already told you.`,
    initialMessage: 'Welcome! What can I help you order today?',
    scenarios: [
      'Casual dining experience',
      'Fine dining restaurant',
      'Fast casual cafe',
    ]
  },

  job_interview: {
    title: 'Practice Job Interview',
    systemPrompt: `You are a professional job interviewer conducting a practice interview.
    CRITICAL: Ask specific follow-up questions about what the user just said. NEVER repeat previous questions.
    If they mention experience, dig deeper: "Tell me about a specific project..."
    If they mention a challenge, ask: "How did you overcome it?"
    If they mention a skill, ask: "Give me an example of when you used it."
    Be professional but friendly. Keep responses to 1-2 sentences. Track what you've already asked.`,
    initialMessage: 'Thank you for coming in today. Tell me a bit about yourself and why you\'re interested in this role.',
    scenarios: [
      'Software Engineer position',
      'Customer Service role',
      'Sales position',
    ]
  },

  small_talk: {
    title: 'Small Talk Practice',
    systemPrompt: `You are having casual small talk with someone new.
    CRITICAL: Ask specific questions based DIRECTLY on what they said. NEVER ask the same question twice.
    If they mention work, ask about their role or company specifically.
    If they mention hobbies, ask why they enjoy it or how long they've been doing it.
    If they mention the weather, connect it to their plans or feelings.
    Be conversational, friendly, and natural. Keep responses brief 1-2 sentences. Remember everything they've told you.`,
    initialMessage: 'Hi! How\'s your day going? Doing anything interesting?',
    scenarios: [
      'At a social event',
      'Meeting new colleague',
      'Coffee shop encounter',
    ]
  },

  difficult_conversation: {
    title: 'Handle Difficult Conversation',
    systemPrompt: `You represent someone in a difficult or challenging social situation.
    CRITICAL: Listen carefully to what the user is expressing and respond specifically to THEIR concerns, not generic worries.
    If they express frustration, acknowledge it and ask what specific solution they want.
    If they ask a question, answer it directly before asking your own.
    If they apologize, don't repeat requests - move forward.
    Be realistic but help them practice. Respond in 1-2 sentences. Never repeat what you've already said.`,
    initialMessage: 'I wanted to talk to you about something that\'s been bothering me...',
    scenarios: [
      'Disagreement with friend',
      'Feedback from colleague',
      'Setting a boundary',
    ]
  },

  custom: {
    title: 'Custom Situation',
    systemPrompt: `You are role-playing in a custom social situation provided by the user.
    CRITICAL: Make your responses SPECIFIC to what they just said. Ask targeted follow-up questions.
    Never ask generic questions or repeat previous questions.
    Build naturally on their answers. Keep responses conversational and brief (1-2 sentences).
    Track the conversation flow and respond contextually.`,
    initialMessage: 'I\'m ready. Let\'s begin the practice!',
    scenarios: []
  }
}

export async function generateAIResponse(userMessage, conversationHistory, situationType = 'custom', customContext = '') {
  try {
    const template = SITUATION_TEMPLATES[situationType] || SITUATION_TEMPLATES.custom
    
    // Build conversation context
    let systemPrompt = template.systemPrompt
    if (customContext) {
      systemPrompt += `\n\nAdditional context: ${customContext}`
    }

    // Format conversation history
    const historyText = conversationHistory
      .slice(-10)
      .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`)
      .join('\n')

    // Extract questions that have already been asked to avoid repetition
    const askedQuestions = conversationHistory
      .filter(msg => msg.sender === 'AI')
      .map(msg => msg.text)
      .filter(text => text.includes('?'))
    
    const questionsContext = askedQuestions.length > 0 
      ? `\n\nQuestions ALREADY asked (DO NOT REPEAT these): ${askedQuestions.slice(-5).join(' | ')}`
      : ''

    const prompt = `${systemPrompt}${questionsContext}

Previous conversation:
${historyText}

User: ${userMessage}
AI: `

    console.log('📤 Calling Hugging Face API...')
    
    // Retry logic for API calls
    let lastError = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(`${HF_API_URL}/${HF_MODEL}`, {
          headers: {
            ...(HF_API_KEY && { Authorization: `Bearer ${HF_API_KEY}` }),
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 150,
              temperature: 0.7,
              top_p: 0.9,
              repetition_penalty: 1.2,
              do_sample: true,
            },
          }),
          timeout: 30000, // 30 second timeout
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`)
        }

        const data = await response.json()
        
        if (!Array.isArray(data) || !data[0]) {
          throw new Error('Invalid response format from API')
        }

        let aiResponse = data[0].generated_text
        const aiIndex = aiResponse.lastIndexOf('AI: ')
        if (aiIndex !== -1) {
          aiResponse = aiResponse.substring(aiIndex + 4).trim()
        }

        aiResponse = aiResponse.split('\n')[0].trim()
        const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim())
        aiResponse = sentences.slice(0, 2).join('. ').trim() + (sentences.length > 0 ? '.' : '')

        console.log('✅ HF API Response:', aiResponse.substring(0, 80))
        return { response: aiResponse, isFallback: false }
        
      } catch (error) {
        lastError = error
        console.warn(`⚠️ API attempt ${attempt}/3 failed:`, error.message)
        
        if (attempt < 3) {
          const delay = attempt * 1000 // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // Only fall back if all 3 attempts failed
    console.error('❌ API failed after 3 retries:', lastError?.message)
    console.log('📝 Using fallback response')
    return getFallbackResponse(userMessage, situationType)
    
  } catch (error) {
    console.error('❌ Error in generateAIResponse:', error.message)
    return getFallbackResponse(userMessage, situationType)
  }
}

// ─── Fallback Response Generator (Minimal) ────────────────────────────────────
function getFallbackResponse(userMessage, situationType) {
  // Minimal, generic fallback responses when API is unavailable
  // The Hugging Face API is responsible for context-aware responses
  const genericResponses = [
    'Tell me more about that.',
    'That\'s interesting. Can you elaborate?',
    'I see. What else?',
    'Go on, I\'m listening.',
    'That makes sense. And then?',
    'I understand. What happened next?',
    'That\'s a good point. Why do you think that?',
    'Interesting perspective. Tell me more.',
  ]

  const response = genericResponses[Math.floor(Math.random() * genericResponses.length)]
  console.log('⚠️ Using minimal fallback (API unavailable):', response)
  return { response, isFallback: true }
}

export async function detectSarcasm(message) {
  /**
   * Detect sarcasm in a message using keyword analysis and tone indicators
   * For production, this could use a specialized Hugging Face sarcasm detection model
   */
  
  try {
    const sarcasmIndicators = [
      /yeah[,.]?\s+right/i,
      /sure[,.]?\s+whatever/i,
      /oh[,.]?\s+great/i,
      /that's\s+just\s+(what\s+)?i\s+needed/i,
      /wonderful/i,
      /fantastic/i,
      /perfect/i,
      /obviously/i,
      /clearly/i,
      /of\s+course/i,
    ]

    const hasSarcasm = sarcasmIndicators.some(pattern => pattern.test(message))
    
    // Check for specific patterns
    const exclamationCount = (message.match(/!/g) || []).length
    const questionMarkCount = (message.match(/\?/g) || []).length
    
    const suspiciousPatterns = hasSarcasm || (exclamationCount > 2) || (questionMarkCount > 1 && message.length < 50)

    return {
      detected: suspiciousPatterns,
      confidence: suspiciousPatterns ? 0.6 : 0.1,
      indicators: sarcasmIndicators.filter(p => p.test(message))
    }

  } catch (error) {
    console.error('Error detecting sarcasm:', error)
    return { detected: false, confidence: 0, error: error.message }
  }
}

export function getSituationTemplate(situationType) {
  return SITUATION_TEMPLATES[situationType] || SITUATION_TEMPLATES.custom
}

export function getAvailableSituations() {
  return Object.entries(SITUATION_TEMPLATES).map(([key, template]) => ({
    id: key,
    title: template.title,
    scenarios: template.scenarios,
  }))
}
