/**
 * Temporal Smoothing Service
 * Stabilizes emotion predictions by averaging predictions over multiple frames
 * Prevents jittering and improves accuracy (Step 8 in algorithm)
 */

class EmotionBuffer {
  constructor(bufferSize = 10) {
    this.bufferSize = bufferSize
    this.buffer = []
    this.emotionCounts = {}
  }

  /**
   * Add emotion prediction to buffer
   */
  addPrediction(emotion, confidence) {
    this.buffer.push({ emotion, confidence, timestamp: Date.now() })

    // Keep buffer size fixed
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift()
    }

    // Recalculate emotion counts from buffer (don't just increment)
    // This ensures old emotions are forgotten when removed from buffer
    this.emotionCounts = {}
    for (const pred of this.buffer) {
      this.emotionCounts[pred.emotion] = (this.emotionCounts[pred.emotion] || 0) + 1
    }
  }

  /**
   * Get most frequent emotion (temporal smoothing)
   * Returns: { emotion, confidence, frequency, allCounts }
   */
  getFinalEmotion() {
    if (this.buffer.length === 0) {
      return { emotion: 'Uncertain', confidence: 0, frequency: 0, allCounts: {} }
    }

    // Find most common emotion
    let maxEmotion = null
    let maxCount = 0

    for (const [emotion, count] of Object.entries(this.emotionCounts)) {
      if (count > maxCount) {
        maxCount = count
        maxEmotion = emotion
      }
    }

    // Calculate average confidence for this emotion
    const predictions = this.buffer.filter(p => p.emotion === maxEmotion)
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length

    const frequency = (maxCount / this.buffer.length) * 100

    console.log(`\n📊 === TEMPORAL SMOOTHING (${this.buffer.length}/${this.bufferSize} frames) ===`)
    console.log(`   Most common emotion: ${maxEmotion} (${maxCount}/${this.buffer.length} = ${frequency.toFixed(1)}%)`)
    console.log(`   Average confidence: ${(avgConfidence * 100).toFixed(1)}%`)
    console.log(`   All emotions in buffer:`)
    for (const [emotion, count] of Object.entries(this.emotionCounts)) {
      console.log(`     ${emotion}: ${count}x (${((count / this.buffer.length) * 100).toFixed(1)}%)`)
    }

    return {
      emotion: maxEmotion,
      confidence: avgConfidence,
      frequency,
      allCounts: { ...this.emotionCounts }
    }
  }

  /**
   * Clear buffer (when starting new analysis)
   */
  clear() {
    this.buffer = []
    this.emotionCounts = {}
  }

  /**
   * Get buffer statistics
   */
  getStats() {
    return {
      bufferSize: this.bufferSize,
      currentSize: this.buffer.length,
      isEmpty: this.buffer.length === 0,
      isFull: this.buffer.length >= this.bufferSize,
      emotionCounts: { ...this.emotionCounts }
    }
  }
}

export { EmotionBuffer }
