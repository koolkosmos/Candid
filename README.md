# 📸 Candid — AI-Powered Event Photo Sharing

Candid is an AI-powered event photo sharing application. Join any event with a 6-digit code, upload your photos, and when you're ready, drop a selfie — Candid's face recognition engine scans every photo in the event and pulls out the ones you're in. No more digging through group chats or asking around. Just your photos, instantly.

---

## ✨ Features

- **Event-Based Photo Sharing** — Create events with unique 6-digit codes
- **Face Recognition** — Upload a selfie to find all photos you're in
- **Google OAuth** — Secure authentication via Google
- **Cloud Storage** — Photos are uploaded and hosted on Cloudinary
- **Real-Time Search** — FAISS-powered vector similarity search for faces

---

## 🏗️ Architecture

```
Candid/
├── candid-backend/          # FastAPI backend
│   ├── app.py               # Main API server
│   ├── face_pipeline.py     # Face embedding extraction
│   ├── faiss_index.py       # FAISS vector index management
│   ├── uploads/             # Uploaded images
│   ├── faiss_data/          # FAISS index storage
│   └── selfies/             # User selfie uploads
│
└── candid-frontend/         # React + Vite frontend
    ├── src/
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # Entry point
    │   ├── context/         # React Context (Auth)
    │   └── pages/           # Page components
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Backend**: Python 3.9+, FastAPI, FAISS, OpenCV
- **Frontend**: Node.js 18+, npm

### Backend Setup

```bash
cd candid-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials:
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - JWT_SECRET
# - CLOUDINARY_CLOUD_NAME
# - CLOUDINARY_API_KEY
# - CLOUDINARY_API_SECRET

# Run the server
uvicorn app:app --reload --port 8000
```

### Frontend Setup

```bash
cd candid-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Redirect to frontend |
| `GET` | `/auth/google` | Google OAuth login |
| `GET` | `/auth/google/callback` | OAuth callback |
| `POST` | `/events` | Create new event |
| `GET` | `/events/{code}` | Get event by code |
| `POST` | `/events/{id}/upload` | Upload photos to event |
| `POST` | `/events/{id}/search` | Search photos by selfie |
| `GET` | `/events/{id}/photos` | Get all event photos |
| `GET` | `/images/{filename}` | Serve uploaded images |

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# JWT
JWT_SECRET=your_secure_random_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

---

## 🧠 Face Recognition

Candid uses:
- **OpenCV** for face detection
- **face_recognition** library for embedding extraction
- **FAISS** for fast vector similarity search

When a user uploads a selfie, the system:
1. Detects faces in the selfie
2. Generates 128-dimensional embeddings
3. Searches the event's FAISS index
4. Returns matching photos ranked by similarity

---

## 📝 License

MIT License

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.