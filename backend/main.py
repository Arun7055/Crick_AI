from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import team, durability, auction

app = FastAPI(title="Cricket Intelligence Engine")

# Explicitly define the allowed origins (Your Next.js frontend)
origins = [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the API Routers
app.include_router(team.router, prefix="/api/v1/team", tags=["Team Selection"])
app.include_router(durability.router, prefix="/api/v1/durability", tags=["Workload Tracking"])
app.include_router(auction.router, prefix="/api/v1/auction", tags=["Auction Strategy"])

@app.get("/")
def health_check():
    return {"status": "online", "message": "Backend engine is running via Groq"}