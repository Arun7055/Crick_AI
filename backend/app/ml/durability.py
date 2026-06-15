import xgboost as xgb
from app.core.config import settings

# Load model on startup
model = xgb.XGBRegressor()
model.load_model("app/ml/artifacts/durability_v1.json")

def predict_risk(features):
    return model.predict(features)