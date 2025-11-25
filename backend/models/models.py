from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(Text, nullable=False)
    persona = Column(Text)
    voice_style = Column(Text, default="alloy")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    knowledge_items = relationship("KnowledgeItem", back_populates="agent", cascade="all, delete-orphan")
    event_tags = relationship("EventTag", back_populates="agent", cascade="all, delete-orphan")
    flows = relationship("Flow", back_populates="agent", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="agent", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="agent", cascade="all, delete-orphan")

class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    agent = relationship("Agent", back_populates="knowledge_items")

class EventTag(Base):
    __tablename__ = "event_tags"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    label = Column(Text, nullable=False)
    selector = Column(Text, nullable=False)
    event_type = Column(Text, nullable=False)  # view, click, scroll, custom
    page_pattern = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    agent = relationship("Agent", back_populates="event_tags")

class Flow(Base):
    __tablename__ = "flows"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    page_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    agent = relationship("Agent", back_populates="flows")
    steps = relationship("Step", back_populates="flow", cascade="all, delete-orphan")

class Step(Base):
    __tablename__ = "steps"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    flow_id = Column(String, ForeignKey("flows.id", ondelete="CASCADE"), nullable=False)
    selector = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    tooltip_text = Column(Text)
    voice_script = Column(Text)
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    flow = relationship("Flow", back_populates="steps")

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    phone = Column(Text)
    email = Column(Text)
    context = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    agent = relationship("Agent", back_populates="leads")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    transcript = Column(JSONB, nullable=False)
    context = Column(JSONB)
    flows_triggered = Column(ARRAY(Text))
    lead_captured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    agent = relationship("Agent", back_populates="conversations")
