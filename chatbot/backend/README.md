# Sikkim Monastery Chatbot Backend

FastAPI backend for the Sikkim Monastery Digital Experience chatbot application.

## Features

- **Tenzin Virtual Monk Chatbot** - AI-powered Buddhist monk guide with voice capabilities
- **Monastery Information** - Database of Sikkim's main monasteries
- **Chat History** - Persistent conversation storage
- **Text-to-Speech** - ElevenLabs voice synthesis
- **Avatar Support** - ANAM avatar integration for video responses

## Prerequisites

- Python 3.10+
- MongoDB database
- API Keys for:
  - OpenRouter (for LLM)
  - ElevenLabs (for TTS)
  - ANAM (optional, for avatar)

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file with your configuration:
   ```
   MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
   DB_NAME=sikkim_monastery
   OPENROUTER_API_KEY=your_key
   ELEVENLABS_API_KEY=your_key
   ELEVENLABS_VOICE_ID=your_voice_id
   ```

## Running Locally

```bash
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

Access the API:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/

## API Endpoints

- `GET /` - Health check
- `GET /api/health` - Health status
- `GET /api/monasteries` - List all monasteries
- `GET /api/monasteries/{id}` - Get monastery details
- `POST /api/chat` - Chat with Tenzin
- `POST /api/anam/session-token` - Get ANAM session token
- `GET /api/travel-tips` - Get travel information

## Deployment on Railway

### Setup

1. Push to GitHub: `https://github.com/deepakmani2027/backend-sikkim.git`
2. Connect repository to Railway
3. Set environment variables in Railway dashboard:
   - `MONGO_URL` - MongoDB connection string
   - `DB_NAME` - Database name
   - `OPENROUTER_API_KEY` - Your API key
   - `ELEVENLABS_API_KEY` - Your API key
   - `ELEVENLABS_VOICE_ID` - Your voice ID

### Important Notes

- The healthcheck timeout is set to 120 seconds to allow sufficient startup time
- MongoDB connection failures are handled gracefully - the app will start even if DB is unavailable
- First deployment may take longer due to dependency installation

### Troubleshooting

If healthcheck fails:
1. Check that all environment variables are set
2. Verify MongoDB connection string is correct
3. Check Railway logs for details
4. Increase healthcheck timeout if needed

## Development

- Code formatting: `black .`
- Linting: `flake8 .`
- Type checking: `mypy server.py`

## License

This project is part of the Sikkim Monastery Digital Experience initiative.
