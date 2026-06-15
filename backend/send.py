import random
from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models.core import Player, PlayerMatchStat

# Force create tables just in case Alembic missed them
Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(Player).first():
        print("Database already has data. Skipping seed.")
        db.close()
        return

    print("Seeding database with synthetic players and workload data...")

    players_data = [
        {"name": "Jasprit Bumrah", "role": "Bowler", "style": "Right-arm fast"},
        {"name": "Hardik Pandya", "role": "All-Rounder", "style": "Right-arm fast-medium"},
        {"name": "Virat Kohli", "role": "Batter", "style": "Right-hand bat"},
        {"name": "Rashid Khan", "role": "Bowler", "style": "Leg-break googly"},
        {"name": "Trent Boult", "role": "Bowler", "style": "Left-arm fast"}
    ]

    for p_data in players_data:
        player = Player(
            name=p_data["name"],
            role=p_data["role"],
            bowling_style=p_data["style"],
            birth_date=datetime(1990, 1, 1).date(),
            current_team="Test Squad"
        )
        db.add(player)
        db.commit()
        db.refresh(player)

        # Generate 15 days of synthetic match history for workload tracking
        for i in range(15):
            match_date = datetime.now() - timedelta(days=i*2) # A match every 2 days
            
            # Simulate heavy workload for bowlers
            balls = random.randint(12, 24) if p_data["role"] in ["Bowler", "All-Rounder"] else 0
            
            stat = PlayerMatchStat(
                player_id=player.id,
                match_date=match_date.date(),
                format="T20",
                venue="Wankhede Stadium",
                opposition="Rival Team",
                overs_bowled=balls / 6.0,
                balls_faced=random.randint(5, 30) if p_data["role"] != "Bowler" else random.randint(0, 5)
            )
            db.add(stat)

    db.commit()
    db.close()
    print("Seed complete! Database is ready for XGBoost Workload tracking.")

if __name__ == "__main__":
    seed_database()