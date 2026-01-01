import app.load_env
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import reminders
from app.scheduler import scheduler, start_scheduler
from contextlib import asynccontextmanager

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code
    start_scheduler()
    print("Scheduler started at app startup")

    yield  # FastAPI runs here

    # Shutdown code
    scheduler.shutdown()
    print("Scheduler shut down at app shutdown")

# Initialize FastAPI app
app = FastAPI(
    title="Call Me Reminder API",
    description="Backend API for scheduling phone call reminders",
    version="1.0.0",
    lifespan=lifespan
)


# CORS middleware (allow frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # In case Next.js uses 3001
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(reminders.router, prefix="/api/reminders", tags=["reminders"])

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Call Me Reminder API",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}