from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import Flow, get_db
from utils.schemas import FlowCreate, FlowResponse

router = APIRouter(prefix="/api", tags=["flows"])

@router.post("/agents/{agent_id}/flows", response_model=FlowResponse)
def create_flow(agent_id: str, flow: FlowCreate, db: Session = Depends(get_db)):
    db_flow = Flow(**flow.dict())
    db.add(db_flow)
    db.commit()
    db.refresh(db_flow)
    return db_flow

@router.get("/agents/{agent_id}/flows", response_model=List[FlowResponse])
def list_flows(agent_id: str, db: Session = Depends(get_db)):
    return db.query(Flow).filter(Flow.agent_id == agent_id).all()

@router.delete("/flows/{flow_id}")
def delete_flow(flow_id: str, db: Session = Depends(get_db)):
    flow = db.query(Flow).filter(Flow.id == flow_id).first()
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    
    db.delete(flow)
    db.commit()
    return {"message": "Flow deleted successfully"}
