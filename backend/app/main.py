from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.database.session import Base, engine
from app.database.seed import seed_db

from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.users import router as users_router
from app.api.endpoints.ikibina import router as ikibina_router
from app.api.endpoints.savings import router as savings_router
from app.api.endpoints.loans import router as loans_router
from app.api.endpoints.notifications import router as notifications_router
from app.api.endpoints.admin import router as admin_router

# Ensure tables are created and initial seed runs
Base.metadata.create_all(bind=engine)
try:
    seed_db()
except Exception as e:
    print(f"Seed note: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="REST API y'urubuga rwo kwizigama no kuguza rwa G KORALINK",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow dev connections
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for HTTP exceptions to ensure clear Kinyarwanda messages
@app.exception_handler(Exception)
async def custom_global_exception_handler(request: Request, exc: Exception):
    # Log exception for server inspection
    print(f"[ERROR] {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Habaye ikibazo. Ongera ugerageze nyuma gato."}
    )

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(ikibina_router, prefix=settings.API_V1_STR)
app.include_router(savings_router, prefix=settings.API_V1_STR)
app.include_router(loans_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "Online",
        "message": "Murakaza neza kuri API ya G KORALINK!"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "G KORALINK Backend"}
