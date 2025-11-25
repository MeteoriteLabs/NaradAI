from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

# Agent schemas
class AgentBase(BaseModel):
    name: str
    persona: Optional[str] = None
    voice_style: Optional[str] = "alloy"

class AgentCreate(AgentBase):
    pass

class AgentResponse(AgentBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Knowledge Item schemas
class KnowledgeItemBase(BaseModel):
    question: str
    answer: str

class KnowledgeItemCreate(KnowledgeItemBase):
    agent_id: str

class KnowledgeItemResponse(KnowledgeItemBase):
    id: str
    agent_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Event Tag schemas
class EventTagBase(BaseModel):
    label: str
    selector: str
    event_type: str  # view, click, scroll, custom
    page_pattern: Optional[str] = None

class EventTagCreate(EventTagBase):
    agent_id: str

class EventTagResponse(EventTagBase):
    id: str
    agent_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Flow schemas
class FlowBase(BaseModel):
    name: str
    page_url: Optional[str] = None

class FlowCreate(FlowBase):
    agent_id: str

class FlowResponse(FlowBase):
    id: str
    agent_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Step schemas
class StepBase(BaseModel):
    selector: str
    title: str
    tooltip_text: Optional[str] = None
    voice_script: Optional[str] = None
    order: int

class StepCreate(StepBase):
    flow_id: str

class StepResponse(StepBase):
    id: str
    flow_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Lead schemas
class LeadBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    context: Optional[dict] = None

class LeadCreate(LeadBase):
    agent_id: str

class LeadResponse(LeadBase):
    id: str
    agent_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Conversation schemas
class ConversationBase(BaseModel):
    transcript: List[dict]  # [{role, text, timestamp}]
    context: Optional[dict] = None
    flows_triggered: Optional[List[str]] = None
    lead_captured: Optional[bool] = False

class ConversationCreate(ConversationBase):
    agent_id: str

class ConversationResponse(ConversationBase):
    id: str
    agent_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics schemas
class AnalyticsResponse(BaseModel):
    total_conversations: int
    total_leads: int
    total_flows_triggered: int
    top_event_tags: List[dict]
    recent_conversations: List[ConversationResponse]
