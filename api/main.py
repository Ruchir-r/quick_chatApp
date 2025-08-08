import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from google import genai  # google-genai package

# Vertex AI API key from env
# You can generate one in Google Cloud Console under "API Keys"
GOOGLE_API_KEY = os.getenv("API_KEY")

if not GOOGLE_API_KEY:
    raise RuntimeError("Missing GOOGLE_API_KEY environment variable")

# Init Google Generative AI client
client = genai.Client(api_key=GOOGLE_API_KEY)

# Model name — can be gemini-1.5-flash, gemini-1.5-pro, etc.
MODEL_NAME = "gemini-1.5-flash"

app = FastAPI()

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://quick-chat-app-oq7b.vercel.app"],  # your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(req: ChatRequest):
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=req.message,
            config={
                "temperature": 0.2,
                "max_output_tokens": 512
            }
        )
        # google-genai returns an object with output_text
        reply = response.text
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
