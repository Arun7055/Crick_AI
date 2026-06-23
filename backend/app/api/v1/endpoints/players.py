from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.core import Player

router = APIRouter()

# 1. Output Schema
class DeepPlayerProfile(BaseModel):
    id: str
    name: str
    role: str
    batting_style: str
    bowling_style: str
    cricbuzz_profile: str = Field(..., description="Wikipedia tactical bio")
    injury_profile: str = Field(..., description="Wikipedia medical report")

    class Config:
        from_attributes = True

@router.get("/details/{player_name}", response_model=DeepPlayerProfile)
def get_player_deep_dossier(player_name: str, db: Session = Depends(get_db)):
    """
    Fetches the full Wikipedia tactical biography and the Groq medical summary.
    Uses .ilike() for safe, case-insensitive matching (e.g. 'virat kohli' == 'Virat Kohli').
    """
    clean_name = player_name.strip()
    
    player = db.query(Player).filter(Player.name.ilike(f"{clean_name}")).first()
    
    if not player:
        raise HTTPException(status_code=404, detail=f"Dossier for '{clean_name}' not found in database.")

    return {
        "id": str(player.id),
        "name": player.name,
        "role": player.role,
        "batting_style": player.batting_style or "Right hand Bat",
        "bowling_style": player.bowling_style or "Does not bowl",
        "cricbuzz_profile": player.cricbuzz_profile or "No tactical biography recorded on public ledger.",
        "injury_profile": player.injury_profile or "No historical medical anomalies documented."
    }