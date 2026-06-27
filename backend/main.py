from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.webhook import router as webhook_router
from backend.flows import router as flows_router
from backend.leads import router as leads_router
from backend.analytics import router as analytics_router
from backend.ai_faq import router as faqs_router
from backend.instagram import router as instagram_router

app = FastAPI(title="AutoDMX", description="Self-hosted Instagram DM automation tool", redirect_slashes=False)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(webhook_router, tags=["webhook"])
app.include_router(flows_router, prefix="/flows", tags=["flows"])
app.include_router(leads_router, prefix="/leads", tags=["leads"])
app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
app.include_router(faqs_router, prefix="/faqs", tags=["faqs"])
app.include_router(instagram_router, prefix="/instagram", tags=["instagram"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)