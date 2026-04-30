from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.goals import router as goals_router
from app.routers.users import router as users_router

app = FastAPI(
    title="Commitment Score API",
    description="API for tracking and scoring commitment metrics",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(goals_router, prefix="/api")
app.include_router(users_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to Commitment Score API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
