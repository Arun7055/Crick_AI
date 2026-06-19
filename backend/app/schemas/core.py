from pydantic import BaseModel, Field, validator
from typing import List

# ==========================================
# 1. SELECTION MODULE SCHEMAS
# ==========================================

class MatchupSelectionRequest(BaseModel):
    venue: str = Field(..., description="The stadium and pitch conditions")
    format: str = Field(..., description="T20, ODI, or Test match")
    opposition_players: List[str] = Field(..., min_items=11, max_items=11, description="Exactly 11 player names")
    squad_players: List[str] = Field(..., min_items=12, max_items=25, description="Your available pool of players to choose from")

    @validator('squad_players')
    def prevent_player_clash(cls, squad, values):
        """
        Backend safety check: Ensures no player exists in both the opposition and the squad.
        """
        if 'opposition_players' in values:
            opposition = set(values['opposition_players'])
            squad_set = set(squad)
            overlap = opposition.intersection(squad_set)
            if overlap:
                raise ValueError(f"Player clash detected! These players cannot be on both teams: {', '.join(overlap)}")
        return squad

class SelectedPlayer(BaseModel):
    name: str
    role: str
    tactical_reason: str = Field(..., description="Why Groq picked this player for this specific matchup")

class MatchupSelectionResponse(BaseModel):
    venue: str
    format: str
    playing_xi: List[SelectedPlayer]
    match_strategy_summary: str = Field(..., description="Overall strategy against the opposition at this venue")


# ==========================================
# 2. INJURY & DURABILITY MODULE SCHEMAS
# ==========================================

class DurabilityResponse(BaseModel):
    player_id: str
    durability_score: float
    acwr_ratio: float
    injury_risk_status: str

    class Config:
        from_attributes = True


# ==========================================
# 3. AUCTION MODULE SCHEMAS
# ==========================================

class TeamNeedsRequest(BaseModel):
    purse_remaining: float = Field(..., description="Total money left in Crores/Millions")
    slots_left: int = Field(..., description="Number of roster spots left to fill")
    
    # Team Need Vectors (Scale of 0.0 to 1.0 - Front-end sliders)
    need_power_hitter: float = Field(..., description="Desire for high strike rate and boundaries")
    need_anchor_batter: float = Field(..., description="Desire for high batting average and stability")
    need_wicket_taker: float = Field(..., description="Desire for low bowling strike rate")
    need_economy_bowler: float = Field(..., description="Desire for low runs conceded")

class AuctionRecommendation(BaseModel):
    player_name: str
    role: str
    impact_score: float = Field(..., description="Raw statistical power (0-100)")
    compatibility_score: float = Field(..., description="How well they fit the Team Needs (0-100%)")
    max_bid_limit: float = Field(..., description="The mathematical ceiling to bid up to")
    
class AuctionResponse(BaseModel):
    recommendations: List[AuctionRecommendation]