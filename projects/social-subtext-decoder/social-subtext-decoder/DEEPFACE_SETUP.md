# DeepFace Emotion Detection Integration

Your Social Subtext Decoder now uses **DeepFace** for accurate real-time emotion analysis!

## What Changed

✅ **Replaced** pixel-based and CNN-based emotion detection  
✅ **Added** DeepFace Python microservice for state-of-the-art accuracy  
✅ **Maintains** your existing Node.js + React architecture  
✅ **Detects** 7 emotions: Happy, Sad, Angry, Surprise, Fear, Disgust, Neutral  

## Setup (First Time Only)

### 1. Create Virtual Environment (Windows Recommended)

```bash
cd backend
python -m venv venv
```

### 2. Install Python Dependencies

**Windows:**
```bash
.\venv\Scripts\pip install -r requirements.txt
```

**macOS/Linux:**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

This installs:
- `deepface` - Advanced facial analysis library
- `opencv-python` - Image processing
- `flask` - Lightweight web server
- `tensorflow` - Deep learning framework
- Other dependencies

### 3. Start the DeepFace Service

**Option A: Using Node.js launcher**
```bash
node backend/start-deepface.js
```

**Option B: Direct Python (Windows)**
```bash
cd backend
$env:TF_USE_LEGACY_KERAS=""; .\venv\Scripts\python deepface_service.py
```

**Option B: Direct Python (macOS/Linux)**
```bash
cd backend
source venv/bin/activate
python deepface_service.py
```

The service will start on `http://localhost:5000`

### 4. Start Your Application (in a separate terminal)

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
npm run dev
```

## Architecture

```
┌─────────────────┐
│   Browser       │
│   (React)       │
└────────┬────────┘
         │ Sends frames
         ▼
┌─────────────────┐
│ Node.js Backend │
│   (Express)     │
└────────┬────────┘
         │ HTTP /analyze-emotion
         ▼
┌─────────────────────────┐
│ Python DeepFace Service │
│ (Flask on :5000)        │
│ - Face Detection        │
│ - Emotion Analysis      │
│ - 7 Emotion Classes     │
└─────────────────────────┘
```

## Features

✨ **Emotion Detection:** 7 emotions with confidence scores  
✨ **Real-time:** Processes frames at ~100ms per frame  
✨ **Accurate:** Uses deep learning models (VGG-Face, FaceNet, ArcFace)  
✨ **Fallback:** Reverts to pixel-based if service unavailable  

## Supported Emotions

| Emotion | Detect By |
|---------|-----------|
| 😊 Happy | Smile, raised cheeks |
| 😢 Sad | Downturned mouth, drooping eyes |
| 😠 Angry | Furrowed brows, tight lips |
| 😲 Surprise | Wide eyes, open mouth |
| 😨 Fear | Wide eyes, raised brows |
| 🤢 Disgust | Nose wrinkle, upper lip raised |
| 😐 Neutral | Relaxed facial muscles |

## Troubleshooting

### "Connection refused" on localhost:5000
- Make sure DeepFace service is running
- Check that port 5000 is not in use: `lsof -i :5000` (Mac/Linux) or `netstat -ano | find "5000"` (Windows)

### "ModuleNotFoundError: No module named 'deepface'"
- Run: `pip install -r backend/requirements.txt` again
- Make sure you're in the correct virtual environment (if using one)

### Slow performance on first run
- DeepFace downloads models on first use (~300MB)
- This happens once during initialization
- Subsequent frames will be faster (~50-100ms per frame)

### Want to switch back to pixel-based?
The system automatically falls back if DeepFace is unavailable. Just don't run the service.

## Performance Notes

- **First startup:** 30-60 seconds (model download + initialization)
- **Per frame:** ~50-150ms (depends on GPU availability)
- **CPU usage:** ~15-25% (higher if no GPU)
- **Memory:** ~800MB-1.2GB

For faster processing, consider using a GPU:
```bash
pip install tensorflow-gpu
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Start DeepFace service
3. ✅ Start backend & frontend
4. 🧪 Test with different expressions
5. 🎉 Enjoy accurate emotion detection!

---

**Questions?** Check the console logs for detailed emotion analysis data.
