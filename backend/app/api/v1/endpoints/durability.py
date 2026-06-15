from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.workload import calculate_player_risk
from app.schemas.core import DurabilityResponse

router = APIRouter()

@router.get("/player/{player_id}", response_model=DurabilityResponse)
def get_player_durability(player_id: str, db: Session = Depends(get_db)):
    try:
        risk_data = calculate_player_risk(player_id, db)
        
        return DurabilityResponse(
            player_id=player_id,
            durability_score=100.0 - risk_data["injury_risk_score"], # 100% means perfectly healthy
            acwr_ratio=risk_data["acwr_ratio"],
            injury_risk_status=risk_data["status"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Durability calculation failed: {str(e)}")