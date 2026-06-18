import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq

from app.core.config import settings
from app.core.database import get_db
from app.models.core import Player
from app.schemas.core import MatchupSelectionRequest, MatchupSelectionResponse

router = APIRouter()
client = Groq(api_key=settings.GROQ_API_KEY)

@router.post("/matchup-analysis", response_model=MatchupSelectionResponse)
def analyze_matchup_selection(request: MatchupSelectionRequest, db: Session = Depends(get_db)):
    """
    Takes 11 opposition players and a squad pool, fetches their clean styles from Neon DB,
    and runs a token-optimized matchup analysis using Groq AI.
    """
    
    # 1. Fetch the actual database rows for the requested players
    opposition_db = db.query(Player).filter(Player.name.in_(request.opposition_players)).all()
    squad_db = db.query(Player).filter(Player.name.in_(request.squad_players)).all()
    
    # Safety Validation Checks
    if len(opposition_db) != 11:
        raise HTTPException(status_code=400, detail="Could not find all 11 opposition players in the database.")
    if len(squad_db) < 11:
        raise HTTPException(status_code=400, detail="Squad pool must contain at least 11 valid players.")

    # 2. TOKEN-OPTIMIZED CONTEXT GENERATOR
    # We strip out the massive full biographies and pass precise, clean key metrics.
    # We only take the first 120 characters of the bio as a light flavor text fallback.
    def format_player_data(players):
        formatted_list = []
        for p in players:
            bio_snippet = p.cricbuzz_profile[:120].strip() + "..." if p.cricbuzz_profile else "No summary available"
            formatted_list.append(
                f"- {p.name} | Role: {p.role} | Batting: {p.batting_style} | Bowling: {p.bowling_style}\n  Context: {bio_snippet}"
            )
        return "\n".join(formatted_list)
        
    opposition_context = format_player_data(opposition_db)
    squad_context = format_player_data(squad_db)

    # 3. The Streamlined Prompt
    system_prompt = f"""
    You are an elite cricket tactician and data analyst. 
    Select the absolute best starting Playing XI (exactly 11 players) out of the user's squad pool to defeat the opposition lineup.
    
    MATCH CONDITIONS:
    - Format: {request.format}
    - Venue/Pitch: {request.venue}
    
    OPPOSITION PLAYING XI:
    {opposition_context}
    
    YOUR AVAILABLE SQUAD POOL:
    {squad_context}
    
    INSTRUCTIONS:
    1. Select exactly 11 players from 'YOUR AVAILABLE SQUAD POOL'. Do NOT select anyone from the opposition.
    2. Ensure an optimal balance (batsmen, all-rounders, a wicketkeeper, and a tactical mix of pace/spin matching the venue).
    3. Exploit clear bowling/batting mismatches based strictly on the provided playing styles.
    4. Provide a crisp tactical rationale for EACH selected player.
    
    You MUST return ONLY a valid JSON object matching this exact structure, with no extra text:
    {{
        "venue": "{request.venue}",
        "format": "{request.format}",
        "match_strategy_summary": "A 2-3 sentence overall tactical plan to win the match...",
        "playing_xi": [
            {{
                "name": "Player Name",
                "role": "Player Role",
                "tactical_reason": "Crisp reason for selection..."
            }}
        ]
    }}
    """

    try:
        # 4. Call Groq with a structured, tight footprint
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a database response compiler. Output strictly clean JSON data matching the requested template format. Do not use conversational filler text."},
                {"role": "user", "content": system_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2 
        )
        
        result_data = json.loads(response.choices[0].message.content)
        return result_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")
    
@router.get("/players")
def get_all_players(db: Session = Depends(get_db)):
    players = db.query(Player).all()
    return [{"id": str(p.id), "name": p.name, "role": p.role} for p in players]