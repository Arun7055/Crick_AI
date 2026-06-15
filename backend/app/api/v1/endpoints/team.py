from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.core import SelectionRequest, TeamSelectionResponse
from app.services.ai_selection import generate_tactical_xi
from app.models.core import Player

router = APIRouter()

@router.post("/recommend", response_model=TeamSelectionResponse)
async def recommend_team(request: SelectionRequest, db: Session = Depends(get_db)):
    try:
        # In a full production app, you would query db for request.available_players here.
        # We pass the raw list directly to the AI service for this initial engine.
        
        ai_result = await generate_tactical_xi(
            venue=request.venue,
            format=request.format,
            opposition=request.opposition,
            player_list=request.available_players
        )
        
        return TeamSelectionResponse(
            venue=request.venue,
            format=request.format,
            opposition=request.opposition,
            playing_xi=ai_result.get("playing_xi", []),
            tactical_summary=ai_result.get("tactical_summary", "Summary generation failed.")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Processing Error: {str(e)}")
    
@router.get("/players")
def get_all_players(db: Session = Depends(get_db)):
    players = db.query(Player).all()
    return [{"id": str(p.id), "name": p.name, "role": p.role} for p in players]