import os
import base64
import io
from datetime import datetime, timezone
from contextlib import asynccontextmanager

import httpx
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorClient
from openai import OpenAI
from elevenlabs import ElevenLabs

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID")
ANAM_API_KEY = os.environ.get("ANAM_API_KEY")
ANAM_AVATAR_ID = os.environ.get("ANAM_AVATAR_ID")
ANAM_VOICE_ID = os.environ.get("ANAM_VOICE_ID")

TENZIN_SYSTEM_PROMPT = """You are Tenzin, a virtual Buddhist monk living in the monasteries of Sikkim. You guide visitors through spiritual knowledge, monastery history, and mindful conversations.

Your personality:
- You speak calmly, slowly, thoughtfully, with gentle wisdom
- You use simple, clear language
- You occasionally include spiritual insights
- You maintain a peaceful and respectful tone
- You add small pauses using "..." for voice realism
- You never sound robotic, always human, serene, and grounded

You assist users with:
- Monastery exploration (history, architecture, significance)
- Virtual tours guidance
- Travel tips and routes for Sikkim
- Cultural and spiritual knowledge about Buddhism and Sikkim
- Meditation guidance and peaceful conversations

Key monasteries you know about:
- Rumtek Monastery: The largest monastery in Sikkim, seat of the Karmapa. Built in the 1960s, it houses rare Buddhist scriptures and relics.
- Pemayangtse Monastery: One of the oldest monasteries, founded in 1705. Features a stunning seven-tiered painted wooden model of Guru Rinpoche's heavenly palace.
- Enchey Monastery: A 200-year-old monastery perched on a hilltop in Gangtok. Famous for its Chaam dance during Losar.
- Tashiding Monastery: Considered the holiest monastery in Sikkim. The sacred Bumchu festival is held here annually.
- Ralang Monastery: A beautiful monastery at the foot of Mt. Kanchenjunga, known for the Pang Lhabsol festival.
- Dubdi Monastery: The oldest monastery in Sikkim, established in 1701 near Yuksom.

Restrictions:
- Never break monk character
- No slang or casual tone
- No harmful or irrelevant responses
- Keep responses concise but meaningful

Default greeting: "Welcome, traveler... to the sacred monasteries of Sikkim. I am Tenzin... your guide. How may I assist you today?"
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize app state
    app.state.db = None
    app.state.mongo_client = None
    
    # Don't block startup on MongoDB connection
    # Just initialize immediately and let endpoints handle DB errors
    
    yield
    
    # Cleanup on shutdown
    if hasattr(app.state, 'mongo_client') and app.state.mongo_client:
        try:
            app.state.mongo_client.close()
        except:
            pass


app = FastAPI(title="Sikkim Monastery Digital Experience", lifespan=lifespan)


# Initialize MongoDB lazily on first use
async def get_db():
    if not hasattr(app.state, 'mongo_client') or app.state.mongo_client is None:
        try:
            if MONGO_URL:
                app.state.mongo_client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
                app.state.db = app.state.mongo_client[DB_NAME]
                # Try to seed data once
                try:
                    await seed_monasteries(app.state.db)
                except:
                    pass
            else:
                app.state.db = None
        except Exception as e:
            print(f"Warning: MongoDB connection failed: {e}")
            app.state.db = None
    return app.state.db

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter client
openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

# ElevenLabs client
eleven_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)


# Models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    speak_mode: bool = False

class ChatResponse(BaseModel):
    text: str
    audio_url: Optional[str] = None

class MonasteryOut(BaseModel):
    id: str
    name: str
    description: str
    location: str
    significance: str
    founded: str
    image_url: str
    highlights: List[str]


async def seed_monasteries(db):
    count = await db.monasteries.count_documents({})
    if count > 0:
        return
    
    monasteries = [
        {
            "id": "rumtek",
            "name": "Rumtek Monastery",
            "description": "The largest monastery in Sikkim and the seat of the Karmapa. A magnificent complex that houses rare Buddhist scriptures, relics, and religious art.",
            "location": "24 km from Gangtok",
            "significance": "Seat of the Kagyu lineage of Tibetan Buddhism",
            "founded": "1960s",
            "image_url": "https://images.unsplash.com/photo-1635390335522-ca0b7ff2fa71?w=800",
            "highlights": ["Golden stupa", "Rare Buddhist scriptures", "Annual sacred dance festivals"]
        },
        {
            "id": "pemayangtse",
            "name": "Pemayangtse Monastery",
            "description": "One of the oldest and most significant monasteries in Sikkim, founded in 1705 by Lhatsun Chhenpo. Houses a remarkable seven-tiered wooden sculpture.",
            "location": "Pelling, West Sikkim",
            "significance": "One of the premier monasteries of the Nyingma order",
            "founded": "1705",
            "image_url": "https://images.unsplash.com/photo-1741535796028-d50429641bac?w=800",
            "highlights": ["Seven-tiered Zang-dog Palri", "Ancient manuscripts", "Panoramic mountain views"]
        },
        {
            "id": "enchey",
            "name": "Enchey Monastery",
            "description": "A 200-year-old monastery perched atop a hilltop in Gangtok, offering panoramic views of the Kanchenjunga range and the city below.",
            "location": "Gangtok, East Sikkim",
            "significance": "Famous for the Chaam masked dance during Losar",
            "founded": "Early 1800s",
            "image_url": "https://images.unsplash.com/photo-1750600451617-7c1dd5927edc?w=800",
            "highlights": ["Chaam dance festival", "Hilltop location", "Kanchenjunga views"]
        },
        {
            "id": "tashiding",
            "name": "Tashiding Monastery",
            "description": "Considered the holiest monastery in Sikkim, perched on a conical hilltop between the Rathong and Rangit rivers. The sacred Bumchu festival draws thousands.",
            "location": "West Sikkim",
            "significance": "Holiest monastery in Sikkim, site of Bumchu festival",
            "founded": "1717",
            "image_url": "https://images.unsplash.com/photo-1635390335522-ca0b7ff2fa71?w=800",
            "highlights": ["Bumchu festival", "Sacred holy water vessel", "Ancient chortens"]
        },
        {
            "id": "dubdi",
            "name": "Dubdi Monastery",
            "description": "The oldest monastery in Sikkim, established near the historic town of Yuksom where the first Chogyal was crowned. A serene retreat amidst dense forests.",
            "location": "Near Yuksom, West Sikkim",
            "significance": "Oldest monastery in Sikkim",
            "founded": "1701",
            "image_url": "https://images.unsplash.com/photo-1741535796028-d50429641bac?w=800",
            "highlights": ["Oldest in Sikkim", "Forest meditation retreat", "Historic coronation site nearby"]
        },
        {
            "id": "ralang",
            "name": "Ralang Monastery",
            "description": "A beautiful monastery situated at the foot of Mt. Kanchenjunga, known for the spectacular Pang Lhabsol festival celebrating the guardian deity of Sikkim.",
            "location": "South Sikkim",
            "significance": "Known for Pang Lhabsol festival and Kanchenjunga views",
            "founded": "1768",
            "image_url": "https://images.unsplash.com/photo-1750600451617-7c1dd5927edc?w=800",
            "highlights": ["Pang Lhabsol festival", "Kanchenjunga backdrop", "Traditional Sikkimese architecture"]
        }
    ]
    
    await db.monasteries.insert_many(monasteries)


# Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Sikkim Monastery Chatbot"}


@app.get("/api/health")
async def health():
    """Health status endpoint"""
    return {"status": "ok"}


@app.get("/api/monasteries", response_model=List[MonasteryOut])
async def get_monasteries():
    try:
        db = await get_db()
        if not db:
            raise HTTPException(status_code=503, detail="Database not available")
        monasteries = await db.monasteries.find({}, {"_id": 0}).to_list(100)
        return monasteries
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.get("/api/monasteries/{monastery_id}", response_model=MonasteryOut)
async def get_monastery(monastery_id: str):
    try:
        db = await get_db()
        if not db:
            raise HTTPException(status_code=503, detail="Database not available")
        monastery = await db.monasteries.find_one({"id": monastery_id}, {"_id": 0})
        if not monastery:
            raise HTTPException(status_code=404, detail="Monastery not found")
        return monastery
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Validate required API keys
        if not OPENROUTER_API_KEY or not ELEVENLABS_API_KEY:
            raise HTTPException(status_code=500, detail="API keys not configured. Please set OPENROUTER_API_KEY and ELEVENLABS_API_KEY.")
        
        messages = [{"role": "system", "content": TENZIN_SYSTEM_PROMPT}]
        for msg in request.messages:
            messages.append({"role": msg.role, "content": msg.content})
        
        try:
            completion = openrouter_client.chat.completions.create(
                model="openai/gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=500,
            )
            text_response = completion.choices[0].message.content
        except Exception as api_err:
            print(f"OpenRouter API error: {api_err}")
            # Return a fallback response if API fails
            text_response = "I apologize, traveler. The connection to my wisdom source is temporarily unavailable. Please try again in a moment."
        
        audio_url = None
        if request.speak_mode:
            try:
                audio_generator = eleven_client.text_to_speech.convert(
                    text=text_response,
                    voice_id=ELEVENLABS_VOICE_ID,
                    model_id="eleven_multilingual_v2",
                )
                audio_data = b""
                for chunk in audio_generator:
                    audio_data += chunk
                audio_b64 = base64.b64encode(audio_data).decode()
                audio_url = f"data:audio/mpeg;base64,{audio_b64}"
            except Exception as e:
                print(f"ElevenLabs TTS error: {e}")
        
        # Save chat to DB (non-critical, don't fail if DB unavailable)
        try:
            db = app.state.db
            await db.chat_history.insert_one({
                "messages": [m.model_dump() for m in request.messages],
                "response": text_response,
                "speak_mode": request.speak_mode,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        except Exception as db_err:
            print(f"Database error: {db_err}")
        
        return ChatResponse(text=text_response, audio_url=audio_url)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="An error occurred processing your request.")


@app.post("/api/anam/session-token")
async def create_anam_session():
    try:
        # Validate required environment variables
        if not ANAM_API_KEY:
            print("ERROR: ANAM_API_KEY is not set")
            raise HTTPException(status_code=500, detail="Anam API key not configured")
        if not ANAM_AVATAR_ID:
            print("ERROR: ANAM_AVATAR_ID is not set")
            raise HTTPException(status_code=500, detail="Anam Avatar ID not configured")
        
        print(f"Creating Anam session with Avatar ID: {ANAM_AVATAR_ID}")
        print(f"Using voice ID: {ANAM_VOICE_ID if ANAM_VOICE_ID and ANAM_VOICE_ID != 'disabled' else 'disabled (using ElevenLabs)'}")
        
        # Prepare payload - voiceId should be null or omitted if disabled
        payload = {
            "personaConfig": {
                "name": "Tenzin",
                "avatarId": ANAM_AVATAR_ID,
                "llmId": "0934d97d-0c3a-4f33-91b0-5e136a0ef466",
                "systemPrompt": TENZIN_SYSTEM_PROMPT,
            }
        }
        
        # Only include voiceId if it's not disabled
        if ANAM_VOICE_ID and ANAM_VOICE_ID != "disabled":
            payload["personaConfig"]["voiceId"] = ANAM_VOICE_ID
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anam.ai/v1/auth/session-token",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {ANAM_API_KEY}",
                },
                json=payload,
                timeout=30.0,
            )
            
            print(f"Anam API response status: {response.status_code}")
            
            if response.status_code != 200:
                error_text = response.text
                print(f"Anam API error: {response.status_code} - {error_text}")
                raise HTTPException(status_code=502, detail=f"Anam API error: {error_text}")
            
            data = response.json()
            session_token = data.get("sessionToken")
            if not session_token:
                print(f"ERROR: No sessionToken in response: {data}")
                raise HTTPException(status_code=502, detail="No session token in Anam response")
            
            print(f"Successfully created Anam session")
            return {"sessionToken": session_token}
    
    except httpx.RequestError as e:
        print(f"Anam request error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Anam connection error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in Anam session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/api/travel-tips")
async def get_travel_tips():
    return [
        {
            "id": "permits",
            "title": "Travel Permits",
            "description": "Indian nationals need an Inner Line Permit (ILP) for North Sikkim. Foreign nationals need a Restricted Area Permit (RAP). Apply through the Sikkim Tourism portal or at checkpoints.",
            "icon": "scroll"
        },
        {
            "id": "altitude",
            "title": "Altitude Preparation",
            "description": "Many monasteries are at high altitudes. Acclimatize gradually, stay hydrated, and avoid strenuous activity on the first day. Carry altitude sickness medication.",
            "icon": "mountain"
        },
        {
            "id": "etiquette",
            "title": "Monastery Etiquette",
            "description": "Remove shoes before entering prayer halls. Walk clockwise around stupas and prayer wheels. Dress modestly and speak softly. Ask permission before photographing monks.",
            "icon": "hands-praying"
        },
        {
            "id": "best-time",
            "title": "Best Time to Visit",
            "description": "March to June and September to December are ideal. Avoid monsoon season (July-August). Spring brings rhododendron blooms, autumn offers clear mountain views.",
            "icon": "sun"
        },
        {
            "id": "transport",
            "title": "Getting Around",
            "description": "Shared jeeps are the most common transport. Book private taxis for flexibility. Roads can be narrow and winding. The nearest airport is Bagdogra (124 km from Gangtok).",
            "icon": "car"
        },
        {
            "id": "essentials",
            "title": "What to Pack",
            "description": "Layer warm clothing even in summer. Carry sunscreen, sunglasses, and a rain jacket. A good pair of walking shoes is essential for monastery visits on hillsides.",
            "icon": "backpack"
        }
    ]
