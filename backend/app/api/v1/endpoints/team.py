import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from groq import Groq

from app.core.config import settings
from app.core.database import get_db
from app.models.core import Player
from app.schemas.core import MatchupSelectionRequest, PlayingXIResponse

router = APIRouter()
client = Groq(api_key=settings.GROQ_API_KEY)

@router.post("/matchup-analysis", response_model=PlayingXIResponse)
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
You are an elite cricket tactician and an automated roster-compliance checker. 
Your sole objective is to select the absolute best starting Playing XI (exactly 11 players) out of the available squad pool to defeat the opposition.

MATCH CONDITIONS:
- Format: {request.format}
- Venue/Pitch: {request.venue}

OPPOSITION PLAYING XI:
{opposition_context}

YOUR AVAILABLE SQUAD POOL:
{squad_context}

ROSTER COMPILATION LAW (Self-Auditing Schema):
You must generate an array of exactly 11 player objects under the key "playing_xi". 
To prevent positional drift, EVERY single object must explicitly declare its batting position and pass a strict 'Role Audit' BEFORE naming the player.

You must map the 11 objects to these rigid positional rules based strictly on the player's Database 'Role':

- [Position 1]  -> required_role: "Batsman" OR "Wicketkeeper"
- [Position 2]  -> required_role: "Batsman" OR "Wicketkeeper"
- [Position 3]  -> required_role: "Batsman"
- [Position 4]  -> required_role: "Batsman"
- [Position 5]  -> required_role: "Batsman" OR "Wicketkeeper"
- [Position 6]  -> required_role: "All-rounder" OR "Wicketkeeper"
- [Position 7]  -> required_role: "All-rounder"
- [Position 8]  -> required_role: "All-rounder" OR "Bowler"
- [Position 9]  -> required_role: "Bowler"
- [Position 10] -> required_role: "Bowler"
- [Position 11] -> required_role: "Bowler"

STRICT AUDIT RULES:
1. The value you put in "actual_db_role" MUST match the required_role. If Position 1 asks for a Batsman, putting an 'All-rounder' or 'Bowler' there is an instant failure.
2. WICKETKEEPER LOCK: Exactly ONE player across all 11 objects can have actual_db_role: "Wicketkeeper".
3. ZERO CROSS-CONTAMINATION: You cannot pick an opposition player. Check your pool.

You MUST return ONLY a valid JSON object matching this exact structure, with zero markdown text:
{{
    "venue": "{request.venue}",
    "format": "{request.format}",
    "match_strategy_summary": "A crisp 2-sentence tactical masterclass on how this specific XI exploits the opposition's weaknesses.",
    "playing_xi": [
        {{
            "batting_order": 1,
            "position_name": "Opener 1",
            "required_role": "Batsman or Wicketkeeper",
            "actual_db_role": "Put the player's exact DB role here to prove compliance",
            "name": "Player Name",
            "tactical_reason": "Crisp 1-sentence rationale..."
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