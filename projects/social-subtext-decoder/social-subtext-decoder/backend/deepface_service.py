"""
DeepFace Emotion Detection Service
Runs as a separate Python service that the Node.js backend calls
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import base64
import io
from PIL import Image
import numpy as np
import logging

app = Flask(__name__)

# Enable CORS for frontend requests
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3001",
            "http://localhost:5173",
            "http://localhost:5174", 
            "http://localhost:5175",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:5175"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

logging.basicConfig(level=logging.INFO)

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Max-Age', '3600')
    return response

# Handle preflight OPTIONS requests
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return response, 200

# Initialize DeepFace models on startup
try:
    logging.info("🚀 Initializing DeepFace models...")
    # Warm up the models
    import cv2
    dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
    DeepFace.analyze(dummy_img, actions=['emotion'], enforce_detection=False, silent=True)
    logging.info("✅ DeepFace models loaded successfully")
except Exception as e:
    logging.error(f"❌ Failed to initialize DeepFace: {e}")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'deepface-emotion-detection'})

@app.route('/analyze-emotion', methods=['POST'])
def analyze_emotion():
    """
    Analyze emotion from base64 encoded frame
    
    Expected JSON:
    {
        "frame": "base64_encoded_image_string"
    }
    
    Returns:
    {
        "emotion": "happy",
        "confidence": 0.95,
        "all_emotions": {
            "angry": 0.01,
            "disgust": 0.01,
            "fear": 0.01,
            "happy": 0.95,
            "neutral": 0.01,
            "sad": 0.01,
            "surprise": 0.01
        },
        "success": true
    }
    """
    try:
        data = request.json
        if not data or 'frame' not in data:
            return jsonify({'error': 'Missing frame data', 'success': False}), 400
        
        # Decode base64 image
        frame_data = data['frame']
        if frame_data.startswith('data:image'):
            # Remove data URL prefix if present
            frame_data = frame_data.split(',')[1]
        
        img_bytes = base64.b64decode(frame_data)
        img = Image.open(io.BytesIO(img_bytes))
        img_array = np.array(img)
        
        # Convert RGB to BGR for OpenCV compatibility
        if len(img_array.shape) == 3 and img_array.shape[2] == 3:
            img_array = img_array[:, :, ::-1]
        
        # Analyze emotion using DeepFace
        result = DeepFace.analyze(
            img_array,
            actions=['emotion'],
            enforce_detection=False,  # Don't fail if no face detected
            silent=True
        )
        
        # Extract emotion data
        if result and len(result) > 0:
            emotion_data = result[0]['emotion']
            dominant_emotion = result[0]['dominant_emotion']
            confidence = emotion_data.get(dominant_emotion, 0.0) / 100.0
            
            return jsonify({
                'emotion': dominant_emotion,
                'confidence': round(confidence, 3),
                'all_emotions': {
                    emotion: round(score / 100.0, 3) 
                    for emotion, score in emotion_data.items()
                },
                'success': True
            })
        else:
            return jsonify({
                'emotion': 'neutral',
                'confidence': 0.5,
                'all_emotions': {
                    'angry': 0.14,
                    'disgust': 0.14,
                    'fear': 0.14,
                    'happy': 0.14,
                    'neutral': 0.14,
                    'sad': 0.14,
                    'surprise': 0.14
                },
                'success': False,
                'note': 'No clear emotion detected'
            })
    
    except Exception as e:
        logging.error(f"❌ Error analyzing emotion: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
