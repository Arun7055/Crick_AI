from pydantic import BaseModel
from typing import List

class SelectionRequest(BaseModel):
    venue: str
    format: str
    opposition: str
    available_players: List[str]

class PlayerRecommendation(BaseModel):
    name: str
    role: str
    matchup_rationale: str

class TeamSelectionResponse(BaseModel):
    venue: str
    format: str
    opposition: str
    playing_xi: List[PlayerRecommendation]
    tactical_summary: str

class DurabilityResponse(BaseModel):
    player_id: str
    durability_score: float
    acwr_ratio: float
    injury_risk_status: str

    class Config:
        from_attributes = True