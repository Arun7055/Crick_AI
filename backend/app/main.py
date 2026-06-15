from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import team

app = FastAPI(title="Cricket Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the API Routers
app.include_router(team.router, prefix="/api/v1/team", tags=["Team Selection"])

@app.get("/")
def health_check():
    return {"status": "online", "message": "Backend engine is running via Groq"}