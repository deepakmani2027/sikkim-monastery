# Frontend-Backend Connection Guide

## 🎯 Objective
Connect the Sikkim Monastery Chatbot frontend with the Railway backend at `web-production-d23ea.up.railway.app`

## ✅ Configuration Done

### 1. **Backend URL Configuration Files Created**

- **`.env`** - Main environment file (production)
  ```
  REACT_APP_BACKEND_URL=https://web-production-d23ea.up.railway.app
  ```

- **`.env.development`** - Local development
  ```
  REACT_APP_BACKEND_URL=http://localhost:8000
  ```

- **`.env.production`** - Production deployment
  ```
  REACT_APP_BACKEND_URL=https://web-production-d23ea.up.railway.app
  ```

- **`.env.example`** - Template for documentation

### 2. **Frontend Already Configured**

The frontend code already uses the environment variable:
```javascript
const API_URL = process.env.REACT_APP_BACKEND_URL;
```

### 3. **API Endpoints Connected**

**App.js** fetches:
- `GET /api/monasteries` - Monastery data
- `GET /api/travel-tips` - Travel information

**ChatbotWidget.js** uses:
- `POST /api/chat` - Chat messages with Tenzin

## 🚀 How to Use

### Option 1: Local Development

```bash
cd chatbot/frontend
npm install
npm start
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000` (from `.env.development`)

### Option 2: Production (Railway)

```bash
cd chatbot/frontend
npm install
npm run build
```

- Frontend connects to: `https://web-production-d23ea.up.railway.app`
- The `.env` file already points to the production backend

## ✅ Backend Connectivity Status

All endpoints tested and working:

| Endpoint | Status | Response |
|----------|--------|----------|
| `GET /` | ✅ 200 | `{"status": "healthy"}` |
| `GET /api/health` | ✅ 200 | `{"status": "ok"}` |
| `GET /api/monasteries` | ✅ 200 | 1 monastery object |
| `GET /api/travel-tips` | ✅ 200 | 6 travel tips |
| `POST /api/chat` | ✅ 200 | Tenzin responses |

## 🔗 CORS Configuration

**Backend CORS Settings** (Already Configured):
```python
CORSMiddleware(
    allow_origins=["*"],    # Accept all origins
    allow_methods=["*"],    # Accept all methods
    allow_headers=["*"],    # Accept all headers
)
```

✅ No CORS issues expected

## 📝 Backend API Endpoints

### List Monasteries
```bash
curl https://web-production-d23ea.up.railway.app/api/monasteries
```

### Get Travel Tips
```bash
curl https://web-production-d23ea.up.railway.app/api/travel-tips
```

### Chat with Tenzin
```bash
curl -X POST https://web-production-d23ea.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "speak_mode": false
  }'
```

## ⚙️ Current Setup

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend                             │
│  (/chatbot/frontend) → React @ localhost:3000           │
└─────────────────────────────────────────────────────────┘
                            ↓
                  REACT_APP_BACKEND_URL
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Railway Backend                         │
│  web-production-d23ea.up.railway.app (FastAPI)          │
│  - Tenzin Chatbot                                        │
│  - Monastery Database                                    │
│  - Travel Information                                    │
└─────────────────────────────────────────────────────────┘
```

## 🧪 Testing the Connection

### Test 1: Check Backend Health
```bash
curl https://web-production-d23ea.up.railway.app/
```

Expected: `{"status": "healthy", "service": "Sikkim Monastery Chatbot"}`

### Test 2: Frontend Build
```bash
cd chatbot/frontend
npm install
npm run build
```

Expected: Build succeeds, no errors

### Test 3: Start Frontend
```bash
npm start
```

Expected: 
- Frontend opens at http://localhost:3000
- Data loads from backend
- Chat widget works

## 🐛 Troubleshooting

### "Connection had momentarily faltered"
- ❌ Backend API keys not configured
- ✅ Solutions:
  1. Set `OPENROUTER_API_KEY` on Railway
  2. Set `ELEVENLABS_API_KEY` on Railway
  3. Verify in Railway dashboard under Variables

### Frontend shows "can't fetch data"
- ❌ Wrong backend URL
- ✅ Check `.env` file has correct URL
- ✅ Verify backend is running (test with curl)

### CORS errors in browser console
- ❌ Backend CORS not configured
- ✅ Already fixed in our backend

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📦 Deployment

### Deploy Frontend on Netlify/Vercel

1. Push code to GitHub
2. Connect repository to Netlify/Vercel
3. Set environment variable:
   ```
   REACT_APP_BACKEND_URL=https://web-production-d23ea.up.railway.app
   ```
4. Deploy

### Deploy Backend on Railway
✅ Already deployed at `web-production-d23ea.up.railway.app`

## 📚 Resources

- Frontend README: [./README.md](./README.md)
- Backend: https://github.com/deepakmani2027/backend-sikkim
- Backend Docs: `http://localhost:8000/docs` (Swagger UI)

## ✨ Summary

✅ Frontend configured to connect to Railway backend
✅ All API endpoints tested and working
✅ CORS properly configured
✅ Environment files ready for dev/prod
✅ Ready to deploy!
