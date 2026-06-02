# 😂 Joke Generator

A beautiful, modern full-stack web application for generating, managing, and tracking jokes, powered by a Python backend and a React frontend. The application features a premium frosted glassmorphism UI, a pre-loaded library of 60+ jokes, public access (no login required), and real-time display statistics.

---

## ✨ Features

- **😂 Random Joke Generator:** Instantly fetch a fresh laugh from the collection.
- **🛠️ Joke Management:** View the full joke list, add new custom jokes (with automatic format validation and duplicate checks), and delete jokes.
- **📊 Real-time Statistics:** Track which jokes are viewed most frequently.
- **🎨 Glassmorphic UI:** A responsive, gorgeous dark-mode dashboard with frosted glass elements and interactive hover effects.
- **🐍 Python Serves All:** The FastAPI backend is configured to serve the React frontend static build directly under a single port.

---

## 📂 Project Structure

```text
Joke-generator/
├── backend/
│   ├── app.py             # FastAPI App (API Endpoints + Frontend Static Serving)
│   ├── requirements.txt   # Python Dependencies
│   └── users.db           # SQLite database
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # Main React entrypoint
│   │   ├── pages/         # Dashboard dashboard interface
│   │   └── index.css      # Core styles & Background configuration
│   ├── public/
│   │   └── joke.png       # App background image
│   └── package.json       # React / Vite / TypeScript configurations
├── joke_class.py          # JokeManager class (file I/O & memory logic)
├── joke_utils.py          # Utility helper functions & logs counter
├── jokes.txt              # Database of 60+ jokes (plain text format)
└── joke_log.txt           # Logging history for views frequency
```

---

## 🚀 Local Development

### 1. Prerequisiets
Ensure you have **Python 3** and **Node.js (npm)** installed on your machine.

### 2. Setup & Run

#### Option A: Run All-in-One (Python Serves Frontend)
This is the simplest way. Build the React assets, then let Python host everything on port `8000`:

1. **Build the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. **Start the Python Server:**
   ```bash
   # Activate virtual env & run FastAPI
   source .venv/bin/activate
   python backend/app.py
   ```

3. **Open the browser:** Go to [http://localhost:8000](http://localhost:8000)

---

#### Option B: Standalone Frontend Dev Server (Vite)
If you are actively making changes to the React code, run a live hot-reloading dev server:

1. **Start backend (Port 8000):**
   ```bash
   source .venv/bin/activate
   python backend/app.py
   ```

2. **Start frontend dev server (Port 5173):**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🌐 Production Deployment

### 1. Backend (Python API) on Render (or Railway / Fly.io)
1. Link your GitHub repository.
2. Leave **Root Directory** as blank/empty.
3. Configure the commands:
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
4. Copy the resulting backend service URL (e.g. `https://joke-api.onrender.com`).

### 2. Frontend (React Site) on Vercel
1. Link your GitHub repository.
2. Edit **Root Directory** and select the `frontend` folder.
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. In **Environment Variables**, add:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://your-backend-url.onrender.com` (from Step 1)
6. Click **Deploy**.
