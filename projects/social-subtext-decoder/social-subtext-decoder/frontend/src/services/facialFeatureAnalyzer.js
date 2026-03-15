/**
 * Facial Feature Analyzer
 * Analyzes facial features to improve emotion detection accuracy
 */

/**
 * Get face center - use canvas center as face is typically centered in webcam
 */
function getFaceCenter(canvas) {
  // For webcam feeds, face is typically in the center of the frame
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  
  console.log(`🎯 Face center: (${centerX.toFixed(0)}, ${centerY.toFixed(0)}) [canvas center]`)
  return { x: centerX, y: centerY }
}

/**
 * Detect mouth movement/smile AND frown - analyzes lower face region
 */
function detectSmile(canvas) {
  try {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    console.log(`🔍 Canvas size: ${canvas.width}x${canvas.height}`)

    // Use center-based proportions for mouth region
    const faceCenter = getFaceCenter(canvas)
    
    // Mouth is significantly below face center (offset by ~30% of height)
    const mouthCenterY = faceCenter.y + (canvas.height * 0.15)
    const mouthCenterX = faceCenter.x

    const mouthTop = Math.floor(mouthCenterY - canvas.height * 0.1)
    const mouthBottom = Math.floor(mouthCenterY + canvas.height * 0.08)
    const mouthLeft = Math.floor(mouthCenterX - canvas.width * 0.15)
    const mouthRight = Math.floor(mouthCenterX + canvas.width * 0.15)

    // Clamp to canvas bounds
    const mt = Math.max(0, Math.min(mouthTop, canvas.height - 1))
    const mb = Math.max(0, Math.min(mouthBottom, canvas.height - 1))
    const ml = Math.max(0, Math.min(mouthLeft, canvas.width - 1))
    const mr = Math.max(0, Math.min(mouthRight, canvas.width - 1))

    console.log(`📍 Mouth region: y[${mt}-${mb}] x[${ml}-${mr}]`)

    // Sample pixels and analyze
    let brightnessValues = []
    let totalBrightness = 0
    let pixelCount = 0

    for (let y = mt; y < mb; y += 1) {
      for (let x = ml; x < mr; x += 1) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const brightness = (r + g + b) / 3
        
        totalBrightness += brightness
        pixelCount++
        
        if (brightnessValues.length < 20) {
          brightnessValues.push(brightness)
        }
      }
    }

    const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 128
    console.log(`📊 Mouth region brightness:`)
    console.log(`   Average: ${avgBrightness.toFixed(1)}`)
    console.log(`   Sample values: ${brightnessValues.map(b => b.toFixed(0)).join(', ')}`)
    console.log(`   Range: ${Math.min(...brightnessValues).toFixed(0)} to ${Math.max(...brightnessValues).toFixed(0)}`)

    // RECALIBRATED: Smile detection based on proportion of dark pixels in ENTIRE mouth region
    // Open mouth = many dark pixels from inside mouth (20-100 brightness)
    // Closed mouth = mostly face color (140-200 brightness)
    
    // Count ALL dark pixels in the mouth region (not just first 20)
    const darkPixelThreshold = 110  // Increased from 100 to catch more mouth interior
    let darkPixelCount = 0
    let topHalfDark = 0  // For frown detection
    let bottomHalfDark = 0  // For frown detection
    let totalPixels = 0

    const mouthMidY = (mt + mb) / 2

    for (let y = mt; y < mb; y += 1) {
      for (let x = ml; x < mr; x += 1) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const brightness = (r + g + b) / 3
        
        totalPixels++
        if (brightness < darkPixelThreshold) {
          darkPixelCount++
          if (y < mouthMidY) topHalfDark++
          else bottomHalfDark++
        }
      }
    }
    
    // Smile score = proportion of dark pixels in entire mouth region
    const smileScore = Math.max(0, Math.min(1, (darkPixelCount / totalPixels) * 2))  // *2 to amplify range
    
    // Frown detection: sad mouth (upside-down smile) has more dark pixels at TOP (mouth corners pulled down)
    // When frowning, the mouth shape is inverted, so upper part darker than lower part
    const frownScore = topHalfDark > bottomHalfDark ? (topHalfDark - bottomHalfDark) / (topHalfDark + bottomHalfDark) : 0
    
    console.log(`😊 Smile score: ${(smileScore * 100).toFixed(1)}% (${darkPixelCount}/${totalPixels} dark pixels, threshold: <${darkPixelThreshold})  |  ☹️ Frown: ${(frownScore * 100).toFixed(1)}% (top:${topHalfDark} vs bottom:${bottomHalfDark})`)
    
    return { smileScore, frownScore }
  } catch (err) {
    console.warn('⚠️ Smile detection error:', err)
    return { smileScore: 0.5, frownScore: 0 }
  }
}

/**
 * Detect eye openness - analyzes upper face region
 */
function detectEyeOpenness(canvas) {
  try {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Use centered proportions for eye region
    const faceCenter = getFaceCenter(canvas)

    // Eyes are above face center - use tighter region (eyes are narrower vertically)
    const eyeCenterY = faceCenter.y - (canvas.height * 0.20)  // Moved up more
    const eyeCenterX = faceCenter.x

    const eyeTop = Math.floor(eyeCenterY - canvas.height * 0.06)    // Smaller vertical region
    const eyeBottom = Math.floor(eyeCenterY + canvas.height * 0.06) // Smaller vertical region
    const eyeLeft = Math.floor(eyeCenterX - canvas.width * 0.18)
    const eyeRight = Math.floor(eyeCenterX + canvas.width * 0.18)

    // Clamp to canvas bounds
    const et = Math.max(0, Math.min(eyeTop, canvas.height - 1))
    const eb = Math.max(0, Math.min(eyeBottom, canvas.height - 1))
    const el = Math.max(0, Math.min(eyeLeft, canvas.width - 1))
    const er = Math.max(0, Math.min(eyeRight, canvas.width - 1))

    // Sample brightness in eyes region
    let brightnessValues = []
    let totalBrightness = 0
    let pixelCount = 0

    for (let y = et; y < eb; y += 1) {
      for (let x = el; x < er; x += 1) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const brightness = (r + g + b) / 3

        totalBrightness += brightness
        pixelCount++
        
        if (brightnessValues.length < 20) {
          brightnessValues.push(brightness)
        }
      }
    }

    const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 128
    console.log(`👁️ Eye region analysis:`)
    console.log(`   Average brightness: ${avgBrightness.toFixed(1)}`)
    console.log(`   Sample values: ${brightnessValues.map(b => b.toFixed(0)).join(', ')}`)
    console.log(`   Range: ${Math.min(...brightnessValues).toFixed(0)} to ${Math.max(...brightnessValues).toFixed(0)}`)

    // Eyes open = pupils visible (dark pixels ~30-100 brightness)
    // Eyes closed = uniform eyelid (all ~140-180 brightness)
    // Count dark pixels in eye region
    
    const darkPixelThreshold = 120  // Pupils are much darker than eyelids
    let darkPixelCount = 0
    
    for (let y = et; y < eb; y += 1) {
      for (let x = el; x < er; x += 1) {
        const idx = (y * canvas.width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const brightness = (r + g + b) / 3
        
        if (brightness < darkPixelThreshold) {
          darkPixelCount++
        }
      }
    }
    
    // Eye openness = proportion of dark pixels (pupils visible when open)
    const eyePixelCount = (eb - et) * (er - el)
    const eyeOpenness = Math.max(0, Math.min(1, darkPixelCount / eyePixelCount))  // No amplification - just raw proportion
    
    console.log(`👁️ Eye openness: ${(eyeOpenness * 100).toFixed(1)}% (${darkPixelCount}/${eyePixelCount} dark pixels, pupils when open)`)
    
    return eyeOpenness
  } catch (err) {
    console.warn('⚠️ Eye detection error:', err)
    return 0.5
  }
}

/**
 * Detect head tilt/pose AND eyebrow furrowing - analyzes symmetry and edges
 */
function detectFacialTension(canvas) {
  try {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Use face center for region selection
    const faceCenter = getFaceCenter(canvas)

    // Forehead/upper face area for furrowing
    const tensionTop = Math.floor(faceCenter.y - canvas.height * 0.15)
    const tensionBottom = Math.floor(faceCenter.y + canvas.height * 0.1)
    const tensionLeft = Math.floor(faceCenter.x - canvas.width * 0.2)
    const tensionRight = Math.floor(faceCenter.x + canvas.width * 0.2)

    // Clamp to canvas bounds
    const tt = Math.max(0, Math.min(tensionTop, canvas.height - 1))
    const tb = Math.max(0, Math.min(tensionBottom, canvas.height - 1))
    const tl = Math.max(0, Math.min(tensionLeft, canvas.width - 1))
    const tr = Math.max(0, Math.min(tensionRight, canvas.width - 1))

    // GLABELLA FURROWING: Detect eyebrows touching (angry frown)
    // Sample narrow strip between eyebrows to detect high edge density
    const glabellaLeft = Math.floor(faceCenter.x - canvas.width * 0.05)  // Narrow region
    const glabellaRight = Math.floor(faceCenter.x + canvas.width * 0.05)
    const glabellaTop = Math.floor(faceCenter.y - canvas.height * 0.12)
    const glabellaBottom = Math.floor(faceCenter.y - canvas.height * 0.05)

    const gl = Math.max(0, Math.min(glabellaLeft, canvas.width - 1))
    const gr = Math.max(0, Math.min(glabellaRight, canvas.width - 1))
    const gt = Math.max(0, Math.min(glabellaTop, canvas.height - 1))
    const gb = Math.max(0, Math.min(glabellaBottom, canvas.height - 1))

    // Count edges in glabella (between eyebrows) - angry = eyebrows meeting = lots of edges
    let glabellaEdgeCount = 0
    const edgeThreshold = 30

    for (let y = gt; y < gb - 1; y++) {
      for (let x = gl; x < gr - 1; x++) {
        const idx1 = (y * canvas.width + x) * 4
        const idx2 = ((y + 1) * canvas.width + x) * 4
        
        const b1 = (data[idx1] + data[idx1 + 1] + data[idx1 + 2]) / 3
        const b2 = (data[idx2] + data[idx2 + 1] + data[idx2 + 2]) / 3
        const vEdge = Math.abs(b1 - b2)

        if (vEdge > edgeThreshold) {
          glabellaEdgeCount++
        }
      }
    }

    const glabellaSize = (gb - gt) * (gr - gl)
    const glabellaFurrowing = Math.max(0, Math.min(1, glabellaEdgeCount / (glabellaSize * 0.1)))

    // Look for general edges in forehead (overall tension)
    let edgeCount = 0

    for (let y = tt; y < tb - 1; y++) {
      for (let x = tl; x < tr - 1; x++) {
        // Sample vertical edge
        const idx1 = (y * canvas.width + x) * 4
        const idx2 = ((y + 1) * canvas.width + x) * 4
        
        const b1 = (data[idx1] + data[idx1 + 1] + data[idx1 + 2]) / 3
        const b2 = (data[idx2] + data[idx2 + 1] + data[idx2 + 2]) / 3
        const vEdge = Math.abs(b1 - b2)

        if (vEdge > edgeThreshold) {
          edgeCount++
        }
      }
    }

    // Normalize tension: more edges = more muscle activation
    const regionSize = (tb - tt) * (tr - tl)
    const tension = Math.max(0, Math.min(1, edgeCount / (regionSize * 0.15)))
    
    console.log(`💪 Facial tension: ${(tension * 100).toFixed(1)}% (edges: ${edgeCount})  |  🤨 Glabella furrowing: ${(glabellaFurrowing * 100).toFixed(1)}% (eyebrows meeting)`)
    
    return { tension, glabellaFurrowing }
  } catch (err) {
    console.warn('⚠️ Tension detection error:', err)
    return { tension: 0.1, glabellaFurrowing: 0 }
  }
}

/**
 * Analyze overall face brightness
 */
function analyzeBrightness(canvas) {
  try {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let totalBrightness = 0
    let sampleCount = 0

    // Sample every 4th pixel
    for (let i = 0; i < data.length; i += 16) {
      if (i % 4 === 3) continue // Skip alpha

      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3
      sampleCount++
    }

    const brightness = totalBrightness / sampleCount / 255
    console.log(`🌟 Brightness: ${(brightness * 100).toFixed(1)}%`)
    return brightness
  } catch (err) {
    console.warn('⚠️ Brightness analysis error:', err)
    return 0.5
  }
}

/**
 * Get comprehensive facial features
 */
function analyzeFacialFeatures(canvas) {
  const smileData = detectSmile(canvas)
  const tensorData = detectFacialTension(canvas)
  
  const features = {
    smile: smileData.smileScore,
    frown: smileData.frownScore,
    eyeOpenness: detectEyeOpenness(canvas),
    tension: tensorData.tension,
    glabellaFurrowing: tensorData.glabellaFurrowing,
    brightness: analyzeBrightness(canvas)
  }

  console.log('🔍 Face Features:', {
    smile: features.smile.toFixed(2),
    frown: features.frown.toFixed(2),
    eyeOpenness: features.eyeOpenness.toFixed(2),
    tension: features.tension.toFixed(2),
    glabellaFurrowing: features.glabellaFurrowing.toFixed(2),
    brightness: features.brightness.toFixed(2)
  })

  return features
}

export {
  detectSmile,
  detectEyeOpenness,
  detectFacialTension,
  analyzeBrightness,
  analyzeFacialFeatures
}
