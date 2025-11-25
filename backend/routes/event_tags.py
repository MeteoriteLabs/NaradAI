from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import EventTag, get_db
from utils.schemas import EventTagCreate, EventTagResponse

router = APIRouter(prefix="/api", tags=["event_tags"])

@router.post("/agents/{agent_id}/tags", response_model=EventTagResponse)
def create_event_tag(agent_id: str, tag: EventTagCreate, db: Session = Depends(get_db)):
    db_tag = EventTag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.get("/agents/{agent_id}/tags", response_model=List[EventTagResponse])
def list_event_tags(agent_id: str, db: Session = Depends(get_db)):
    return db.query(EventTag).filter(EventTag.agent_id == agent_id).all()

@router.delete("/tags/{tag_id}")
def delete_event_tag(tag_id: str, db: Session = Depends(get_db)):
    tag = db.query(EventTag).filter(EventTag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Event tag not found")
    
    db.delete(tag)
    db.commit()
    return {"message": "Event tag deleted successfully"}
