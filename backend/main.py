from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import Base, engine
from routes import (
    agents_router,
    knowledge_router,
    event_tags_router,
    flows_router,
    steps_router,
    leads_router,
    analytics_router,
)
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Narada AI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents_router)
app.include_router(knowledge_router)
app.include_router(event_tags_router)
app.include_router(flows_router)
app.include_router(steps_router)
app.include_router(leads_router)
app.include_router(analytics_router)

@app.get("/")
def read_root():
    return {"message": "Narada AI API - Voice-Guided Website Experiences"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# WebSocket endpoint for voice interaction
# This will be implemented with OpenAI Realtime API integration
@app.websocket("/ws/agents/{agent_id}/sessions/{session_id}")
async def websocket_endpoint(websocket: WebSocket, agent_id: str, session_id: str):
    await websocket.accept()
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # TODO: Implement OpenAI Realtime API integration
            # For now, echo back a placeholder response
            await websocket.send_json({
                "type": "agent_response",
                "replyText": f"Received: {data.get('text', '')}",
                "action": None
            })
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for agent {agent_id}, session {session_id}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3001))
    uvicorn.run(app, host="0.0.0.0", port=port)
