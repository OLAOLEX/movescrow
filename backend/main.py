"""
Movescrow Backend - FastAPI Application
Peer-to-Peer Logistics Marketplace API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.waitlist import router as waitlist_router

app = FastAPI(
    title="Movescrow API",
    description="Peer-to-Peer Logistics Marketplace Backend",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production - restrict to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(waitlist_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return JSONResponse({
        "message": "Welcome to Movescrow API",
        "version": "1.0.0",
        "status": "running"
    })


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse({
        "status": "healthy",
        "service": "movescrow-api"
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


