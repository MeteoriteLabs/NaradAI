from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import KnowledgeItem, get_db
from utils.schemas import KnowledgeItemCreate, KnowledgeItemResponse

router = APIRouter(prefix="/api", tags=["knowledge"])

@router.post("/agents/{agent_id}/knowledge", response_model=KnowledgeItemResponse)
def create_knowledge_item(agent_id: str, item: KnowledgeItemCreate, db: Session = Depends(get_db)):
    db_item = KnowledgeItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/agents/{agent_id}/knowledge", response_model=List[KnowledgeItemResponse])
def list_knowledge_items(agent_id: str, db: Session = Depends(get_db)):
    return db.query(KnowledgeItem).filter(KnowledgeItem.agent_id == agent_id).all()

@router.delete("/knowledge/{item_id}")
def delete_knowledge_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(KnowledgeItem).filter(KnowledgeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Knowledge item deleted successfully"}
