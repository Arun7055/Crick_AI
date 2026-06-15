import uuid
import pandas as pd
import numpy as np
import xgboost as xgb
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.core import PlayerMatchStat

def calculate_player_risk(player_id: str, db: Session):
    # 1. Fetch the last 28 days of match data
    twenty_eight_days_ago = datetime.now().date() - timedelta(days=28)
    
    stats = db.query(PlayerMatchStat).filter(
        PlayerMatchStat.player_id == player_id,
        PlayerMatchStat.match_date >= twenty_eight_days_ago
    ).all()

    if not stats:
        return {"acwr_ratio": 0.0, "injury_risk_score": 0.0, "status": "Insufficient Data"}

    # 2. Convert to Pandas DataFrame
    df = pd.DataFrame([{
        "date": s.match_date,
        "workload": (s.overs_bowled * 6) + s.balls_faced # Simple workload metric combining bowling and batting
    } for s in stats])
    
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    # 3. Calculate ACWR
    seven_days_ago = pd.Timestamp(datetime.now() - timedelta(days=7))
    
    acute_workload = df[df['date'] >= seven_days_ago]['workload'].sum()
    chronic_workload = df['workload'].sum() / 4.0 # Average weekly workload over 4 weeks
    
    # Avoid division by zero
    acwr = round(acute_workload / chronic_workload, 2) if chronic_workload > 0 else 0.0

    # 4. XGBoost Inference (Using a fast heuristic model for the MVP)
    # We train a fast micro-model on synthetic constraints to return a probability.
    X_train = np.array([[0.5], [1.0], [1.5], [2.0], [2.5]]) # Sample ACWRs
    y_train = np.array([0, 0, 1, 1, 1]) # 1 = High Injury Risk
    
    model = xgb.XGBClassifier(n_estimators=10, max_depth=2, random_state=42)
    model.fit(X_train, y_train)
    
    risk_prob = model.predict_proba(np.array([[acwr]]))[0][1]
    risk_percentage = round(risk_prob * 100, 1)

    # 5. Determine Status
    if acwr > 1.5:
        status = "Danger Zone (High Risk)"
    elif acwr < 0.8:
        status = "Under-trained (Risk of sudden strain)"
    else:
        status = "Optimal Workload (Sweet Spot)"

    return {
        "acwr_ratio": acwr,
        "injury_risk_score": risk_percentage,
        "status": status
    }