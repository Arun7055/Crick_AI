from fastapi import APIRouter, HTTPException
from app.schemas.auction import AuctionStrategyRequest, AuctionStrategyResponse
from app.services.ai_auction import generate_auction_strategy

router = APIRouter()

@router.post("/strategy", response_model=AuctionStrategyResponse)
async def get_auction_strategy(request: AuctionStrategyRequest):
    try:
        strategy_result = await generate_auction_strategy(
            remaining_purse=request.remaining_purse_lakhs,
            gaps=request.squad_gaps,
            pool=[p.model_dump() for p in request.available_pool]
        )
        
        return AuctionStrategyResponse(
            primary_targets=strategy_result.get("primary_targets", []),
            budget_allocation_advice=strategy_result.get("budget_allocation_advice", ""),
            risk_assessment=strategy_result.get("risk_assessment", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auction Strategy Generation Failed: {str(e)}")