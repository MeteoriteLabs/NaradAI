from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import Step, get_db
from utils.schemas import StepCreate, StepResponse

router = APIRouter(prefix="/api", tags=["steps"])

@router.post("/flows/{flow_id}/steps", response_model=StepResponse)
def create_step(flow_id: str, step: StepCreate, db: Session = Depends(get_db)):
    db_step = Step(**step.dict())
    db.add(db_step)
    db.commit()
    db.refresh(db_step)
    return db_step

@router.get("/flows/{flow_id}/steps", response_model=List[StepResponse])
def list_steps(flow_id: str, db: Session = Depends(get_db)):
    return db.query(Step).filter(Step.flow_id == flow_id).order_by(Step.order).all()

@router.delete("/steps/{step_id}")
def delete_step(step_id: str, db: Session = Depends(get_db)):
    step = db.query(Step).filter(Step.id == step_id).first()
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    
    db.delete(step)
    db.commit()
    return {"message": "Step deleted successfully"}
