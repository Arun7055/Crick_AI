from fastapi import APIRouter, HTTPException
import os
from pathlib import Path
from app.schemas.core import TeamNeedsRequest, AuctionResponse
from app.ml.auction import AuctionStrategyEngine

router = APIRouter()

# Initialize the engine once when the server starts
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
CSV_PATH = BASE_DIR / "cleaned_auction_profiles.csv"
print(f"👀 LOOKING FOR CSV AT: {CSV_PATH}")
try:
    engine = AuctionStrategyEngine(CSV_PATH)
except Exception as e:
    print(f"⚠️ Warning: Could not load ML engine. {str(e)}")
    engine = None

@router.post("/target-players", response_model=AuctionResponse)
def get_auction_targets(request: TeamNeedsRequest):
    if not engine:
        raise HTTPException(status_code=500, detail="ML Engine not initialized.")
        
    targets = engine.calculate_targets(
        needs=request,
        purse=request.purse_remaining,
        slots=request.slots_left,
        top_n=15
    )
    
    return {"recommendations": targets}