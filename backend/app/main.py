from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.core.database import engine, Base

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Zeravynex Analysis API",
    description="Backend API for the Zeravynex Explainable AI Malware Analysis Platform",
    version="1.5.0"
)

# Configure CORS for local desktop/web frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Zeravynex API is running", "status": "online"}
