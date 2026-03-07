from fastmcp import FastMCP
from fhir_mcp.config.settings import Settings
from fhir_mcp.services.fhir_client import FHIRClient
from fhir_mcp.services.auth_manager import AuthManager
from fhir_mcp.tools.fhir_resources import register_fhir_tools
from fhir_mcp.tools.terminology import register_terminology_tools
from fhir_mcp.tools.composite import register_composite_tools
from fhir_mcp.services.terminology_service import TerminologyService
from fhir_mcp.services.service_factory import get_intelligence_service
from fhir_mcp.api.rest_routes import router as rest_router
from fhir_mcp.middleware.observability import ProtocolTaggingMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import os

def create_server() -> FastMCP:
    settings = Settings()
    
    server = FastMCP(
        name="fhir-mcp-server"
    )

    auth = AuthManager(settings)
    fhir = FHIRClient(settings, auth)
    terminology = TerminologyService(settings)
    intelligence = get_intelligence_service()

    # Register all tools
    register_fhir_tools(server, fhir, intelligence)
    register_terminology_tools(server, terminology)
    register_composite_tools(server, fhir, terminology)


    return server

def create_app() -> FastAPI:
    """Creates the resilient Dual-Protocol FastAPI host"""
    mcp_server = create_server()
    app = FastAPI(title="FHIR Clinical Intelligence Hub")
    
    # 1. Apply CORS for Ambient EHR Sidecar (Strict Security)
    allowed_origins = os.getenv("ALLOWED_EHR_ORIGINS", "http://localhost:3000").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )
    
    # 2. Add Protocol-Aware Telemetry
    app.add_middleware(ProtocolTaggingMiddleware)
    
    # 3. Mount REST endpoints
    app.include_router(rest_router)
    
    # 4. Extract and mount the FastMCP ASGI app (handles /sse and /messages)
    mcp_app = mcp_server.http_app() if callable(getattr(mcp_server, "http_app", None)) else getattr(mcp_server, "_app", None)
    if mcp_app:
        app.mount("/mcp", mcp_app)
        
    return app
