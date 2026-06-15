from pydantic import BaseModel
from typing import List, Optional

class AuctionPlayer(BaseModel):
    name: str
    role: str
    base_price_lakhs: int
    skills: List[str]

class AuctionStrategyRequest(BaseModel):
    remaining_purse_lakhs: int
    squad_gaps: List[str]
    available_pool: List[AuctionPlayer]

class BiddingTarget(BaseModel):
    name: str
    role: str
    recommended_max_bid_lakhs: int
    strategic_fit_rationale: str

class AuctionStrategyResponse(BaseModel):
    primary_targets: List[BiddingTarget]
    budget_allocation_advice: str
    risk_assessment: str