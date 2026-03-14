# 🧠 Social Subtext Decoder

> **Understand what people really mean.**  
> An AI-powered tool that helps autistic individuals decode the hidden social meaning behind everyday phrases.

---

## 🚀 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS    |
| Animations | Framer Motion                     |
| Backend    | Node.js + Express                 |
| AI Engine  | Claude API (Anthropic)            |
| Database   | Supabase (PostgreSQL)             |
| Deploy FE  | Vercel                            |
| Deploy BE  | Railway / Render                  |

---

## 📁 Project Structure

```
social-subtext-decoder/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/           # Express API server
│   ├── routes/        # API route definitions
│   ├── controllers/   # Business logic
│   ├── middleware/    # Auth, rate limiting, etc.
│   ├── server.js
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/social-subtext-decoder.git
cd social-subtext-decoder
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your ANTHROPIC_API_KEY in .env
npm run dev
# Runs on http://localhost:3001
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable            | Description                        |
|---------------------|------------------------------------|
| `ANTHROPIC_API_KEY` | Your Claude API key from Anthropic |
| `PORT`              | Backend port (default: 3001)       |
| `ALLOWED_ORIGINS`   | Frontend URLs allowed by CORS      |
| `SUPABASE_URL`      | Supabase project URL (optional)    |
| `SUPABASE_ANON_KEY` | Supabase anon key (optional)       |

---

## 🧩 Core Features

- 🔍 **Literal Meaning** — What was actually said
- 💬 **Social Meaning** — What they really meant
- 📊 **Emotional Tone** — The feeling behind the words
- ✅ **Suggested Response** — How to reply appropriately
- 🗂️ **History** — Save and revisit past decodings

---

## 📦 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → connect to Vercel → auto-deploys
```

### Backend → Railway
```bash
# Push backend/ to GitHub
# Connect repo to Railway
# Set environment variables in Railway dashboard
```

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss changes.

---

## 📄 License

MIT © 2024
