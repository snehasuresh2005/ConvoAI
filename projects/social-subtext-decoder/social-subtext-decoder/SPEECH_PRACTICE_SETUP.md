# 🚀 Speech Practice Mode - Setup Guide

## Overview

The **Speech Practice Mode** allows users to practice real-world conversations with an AI avatar. The AI responds naturally using Hugging Face's open-source language models, and users can interact via voice or text.

### Features Implemented ✅
- **AI Avatar** with expressions (3D-style design)
- **Multiple Practice Scenarios** (restaurant, job interview, small talk, difficult conversations)
- **Custom Situations** - Users can create their own scenarios
- **Voice Input/Output** via Web Speech API
- **AI Responses** from Hugging Face models
- **Session Tracking** - Stores all conversations
- **Session Statistics** - Duration, exchange count, etc.

---

## 🔧 Prerequisites

### System Requirements
- Node.js 16+ 
- PostgreSQL 12+
- Modern web browser (Chrome/Edge preferred for Web Speech API)
- Microphone for voice input

### API Keys Needed
- **Hugging Face API Key** (Free, from https://huggingface.co/settings/tokens)

---

## 📦 Installation Steps

### Step 1: Install PostgreSQL

#### Windows
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer, choose default options
3. Remember the password you set for `postgres` user
4. PostgreSQL should start automatically

#### macOS
```bash
brew install postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib
```

### Step 2: Create Database

Open PostgreSQL command line:

```bash
# Windows: Use pgAdmin or psql
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

Then run:
```sql
CREATE DATABASE social_subtext_decoder;
```

### Step 3: Initialize Database Schema

```bash
cd backend
psql -U postgres -d social_subtext_decoder -f database/schema.sql
```

### Step 4: Get Hugging Face API Key

1. Go to https://huggingface.co/settings/tokens
2. Create a new token (can be read-only)
3. Copy the token

### Step 5: Setup Environment Variables

Create `backend/.env` file:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=social_subtext_decoder
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Hugging Face
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5176

# DeepFace (for emotion detection)
DEEPFACE_SERVICE_URL=http://localhost:5000
DEEPFACE_SERVICE_PORT=5000
```

### Step 6: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (if not already done)
cd ../frontend
npm install
```

---

## 🚀 Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
✅ Server running on port 3001
✅ PostgreSQL pool created
📊 Database connected
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.4.21 ready in 326 ms
➜  Local:   http://localhost:5176
```

### Terminal 3 (Optional): Start DeepFace Service

For emotion detection in live conversations:

```bash
cd backend
node start-deepface.js
```

---

## 📲 Using Speech Practice Mode

### 1. Open the App
Go to `http://localhost:5176/practice`

### 2. Choose a Situation
Select from:
- 🍽️ **Restaurant** - Practice ordering food
- 💼 **Job Interview** - Practice interview responses
- 💬 **Small Talk** - Casual conversation practice
- ⚠️ **Difficult Conversation** - Handle conflicts/disagreements
- ✨ **Custom** - Create your own scenario

### 3. Configure Settings
- **Output Mode**: Voice Only / Text Only / Both
- **Avatar**: Enable/Disable the AI avatar display

### 4. Start Practicing
- **Voice Mode**: Click 🎤 button to speak, avatar listens
- **Text Mode**: Type your response in the input box
- AI responds naturally based on the situation

### 5. End Session
- Click "End Session" button
- View statistics (duration, exchanges, etc.)

---

## 🎯 Situation Details

### 🍽️ Restaurant
**Description**: Practice ordering food at different types of restaurants
- Casual dining experience
- Fine dining restaurant
- Fast casual cafe

**Example Scenario**: "I'd like to order something vegetarian, but I'm not sure what's available..."

### 💼 Job Interview
**Description**: Practice common interview questions and responses
- Software Engineer position
- Customer Service role
- Sales position

**Example Scenario**: "Tell me about a time you had to work with a difficult team member..."

### 💬 Small Talk
**Description**: Practice casual conversation skills
- At a social event
- Meeting new colleague
- Coffee shop encounter

**Example Scenario**: "So what do you do for fun?"

### ⚠️ Difficult Conversation
**Description**: Practice handling tough social situations
- Disagreement with friend
- Feedback from colleague
- Setting a boundary

**Example Scenario**: "I felt hurt when you didn't invite me to the event..."

### ✨ Custom
**Description**: Create your own practice scenario

**Example Input**: "How do I ask my boss for a promotion respectfully?"

---

## 🎙️ Using Voice Mode

### Tips for Best Results
1. **Speak clearly** - Enunciate your words
2. **Use natural pace** - Don't speak too fast or slow
3. **Wait for AI response** - Don't interrupt
4. **Check microphone** - Ensure it's working before starting
5. **Use modern browser** - Chrome/Edge work best

### Troubleshooting Voice

| Issue | Solution |
|-------|----------|
| Microphone not detected | Check browser permissions, try Chrome/Edge |
| Speech not recognized | Speak louder and more clearly |
| AI doesn't respond | Check internet connection, verify API key |
| "CORS" errors in console | This is normal during development |

---

## 🗄️ Database Structure

### Tables Created
- **users** - User sessions
- **practice_sessions** - Practice session records
- **practice_messages** - All messages in practice
- **live_conversations** - Live conversation records
- **live_conv_messages** - Messages during live conversations
- **conversation_reviews** - Post-conversation analysis
- **user_activity_log** - User activity tracking

### Querying Your Data

```bash
# Connect to database
psql -U postgres -d social_subtext_decoder

# View practice sessions
SELECT * FROM practice_sessions;

# View messages from a session
SELECT * FROM practice_messages WHERE practice_session_id = 1;

# User activity history
SELECT * FROM user_activity_log ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
# Windows: Check Services or Task Manager
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Check connection string in .env
# Verify database exists: psql -U postgres -l
```

### "Hugging Face API error"
```
Solution: 
- Check API key is correct (no spaces)
- Verify it's a read token: https://huggingface.co/settings/tokens
- Check rate limits (free tier has limits)
- Try refreshing the page
```

### "Port 3001 is already in use"
```bash
# Find and kill process on port 3001
# Windows: netstat -ano | findstr :3001
# macOS/Linux: lsof -i :3001

# Or change PORT in .env to 3002
```

### Voice input not working
```
- Ensure HTTPS or localhost (required by browsers)
- Check microphone permissions in browser settings
- Try Chrome or Edge browser
- Check browser console for errors
```

---

## 📊 API Endpoints

### Practice Mode Endpoints

```
GET  /api/practice/situations       - Get available situations
POST /api/practice/session          - Create new session
POST /api/practice/message          - Send user message
POST /api/practice/end              - End session
GET  /api/practice/sessions?sessionId=xxx - Get session history
GET  /api/practice/session/:id      - Get session details
```

### Example: Creating a Practice Session
```bash
curl -X POST http://localhost:3001/api/practice/session \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "user-123",
    "situationType": "restaurant",
    "outputMode": "voice",
    "avatarEnabled": true
  }'
```

---

## 🎨 Customization

### Changing the AI Model
In `backend/.env`:
```env
# Available models
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1
HUGGINGFACE_MODEL=meta-llama/Llama-2-7b-chat-hf
HUGGINGFACE_MODEL=google/flan-t5-large
```

### Adding New Situations
Edit `backend/services/aiService.js`, add to `SITUATION_TEMPLATES`:
```javascript
custom_situation: {
  title: 'My Custom Situation',
  systemPrompt: '...',
  initialMessage: '...',
  scenarios: ['Scenario 1', 'Scenario 2']
}
```

### Styling the Avatar
Edit `frontend/src/components/AvatarComponent.jsx` to change colors, size, animations.

---

## 📚 Next Features Coming

- ✅ **Live Conversation Mode** - Practice while listening to real conversations
- ✅ **Sarcasm Detection** - Identify hidden meanings
- ✅ **Conversation Review** - Post-session AI analysis
- ✅ **Emotion Tracking** - Monitor your emotional progression
- ✅ **Progress Dashboard** - View all your practice history

---

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for errors (`F12`)
3. Check backend terminal for error messages
4. Verify all environment variables are set correctly
5. Ensure PostgreSQL is running

---

## 📝 Notes

- **Free Tier**: Hugging Face free API has rate limits (~30 requests/min)
- **Data Storage**: All conversations stored in PostgreSQL
- **Privacy**: Data stored locally, not sent to external services (except Hugging Face for AI responses)
- **Browser Support**: Web Speech API works best on Chrome/Edge/Safari

---

**Happy Practicing! 🎉**

Start with one situation, repeat it a few times, then move to others. Consistency is key for improvement!
