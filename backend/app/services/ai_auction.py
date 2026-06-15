from groq import AsyncGroq
import json
from app.core.config import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def generate_auction_strategy(remaining_purse: int, gaps: list, pool: list):
    """
    Evaluates available players against squad gaps and budget to formulate a bidding strategy.
    """
    prompt = f"""
    Analyze this IPL/WPL style auction scenario:
    - Remaining Budget: {remaining_purse} Lakhs
    - Critical Squad Gaps to Fill: {gaps}
    - Available Player Pool: {pool}

    Provide a highly strategic bidding plan. Allocate budget sensibly ensuring we do not run out of money before filling gaps.
    Return ONLY a JSON object matching this structure:
    {{
        "primary_targets": [
            {{"name": "Player Name", "role": "Role", "recommended_max_bid_lakhs": 150, "strategic_fit_rationale": "Why they fit"}}
        ],
        "budget_allocation_advice": "Detailed breakdown of how to split the remaining purse.",
        "risk_assessment": "Warning about bidding wars or running out of capital."
    }}
    """

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a world-class sports franchise director and data strategist. Output raw JSON only."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.3
    )
    
    return json.loads(response.choices[0].message.content)