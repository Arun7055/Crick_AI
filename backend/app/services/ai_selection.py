from groq import AsyncGroq
import json
from app.core.config import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def generate_tactical_xi(venue: str, format: str, opposition: str, player_list: list):
    """
    Executes a two-step AI reasoning chain: Statistical Analysis -> Squad Formulation.
    """
    # Agent 1: The Statistician
    stats_prompt = f"Analyze these players: {player_list}. Evaluate their suitability for a {format} match at {venue} against {opposition}. Highlight key strengths."
    
    stats_response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an elite cricket data analyst. Be concise and mathematical."},
            {"role": "user", "content": stats_prompt}
        ],
        temperature=0.2
    )
    analysis = stats_response.choices[0].message.content

    # Agent 2: The Squad Builder
    squad_prompt = f"Based on this analysis: {analysis}, select the final balanced playing XI. Return ONLY a JSON object with 'playing_xi' (list of dicts with 'name', 'role', 'matchup_rationale') and a 'tactical_summary' (string)."
    
    final_response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a Head Coach. Output raw JSON only."},
            {"role": "user", "content": squad_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.1
    )
    
    return json.loads(final_response.choices[0].message.content)