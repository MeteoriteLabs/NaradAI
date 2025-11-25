from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import Lead, get_db
from utils.schemas import LeadCreate, LeadResponse

router = APIRouter(prefix="/api", tags=["leads"])

@router.post("/agents/{agent_id}/leads", response_model=LeadResponse)
def create_lead(agent_id: str, lead: LeadCreate, db: Session = Depends(get_db)):
    db_lead = Lead(**lead.dict())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@router.get("/agents/{agent_id}/leads", response_model=List[LeadResponse])
def list_leads(agent_id: str, db: Session = Depends(get_db)):
    return db.query(Lead).filter(Lead.agent_id == agent_id).order_by(Lead.created_at.desc()).all()
