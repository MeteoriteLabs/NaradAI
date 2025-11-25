from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Conversation, Lead, get_db
from utils.schemas import AnalyticsResponse, ConversationResponse

router = APIRouter(prefix="/api", tags=["analytics"])

@router.get("/agents/{agent_id}/analytics", response_model=AnalyticsResponse)
def get_analytics(agent_id: str, db: Session = Depends(get_db)):
    # Total conversations
    total_conversations = db.query(func.count(Conversation.id)).filter(
        Conversation.agent_id == agent_id
    ).scalar()
    
    # Total leads
    total_leads = db.query(func.count(Lead.id)).filter(
        Lead.agent_id == agent_id
    ).scalar()
    
    # Total flows triggered
    total_flows = db.query(func.count(Conversation.id)).filter(
        Conversation.agent_id == agent_id,
        Conversation.flows_triggered.isnot(None)
    ).scalar()
    
    # Recent conversations (last 10)
    recent_conversations = db.query(Conversation).filter(
        Conversation.agent_id == agent_id
    ).order_by(Conversation.created_at.desc()).limit(10).all()
    
    return AnalyticsResponse(
        total_conversations=total_conversations or 0,
        total_leads=total_leads or 0,
        total_flows_triggered=total_flows or 0,
        top_event_tags=[],  # TODO: Implement event tag analytics
        recent_conversations=recent_conversations
    )
