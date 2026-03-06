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
import os

def create_server() -> FastMCP:
    settings = Settings()
    
    server = FastMCP(
        name="fhir-mcp-server",
        version="1.0.0",
        description="FHIR R4 MCP Server for clinical data access",
    )

    auth = AuthManager(settings)
    fhir = FHIRClient(settings, auth)
    terminology = TerminologyService(settings)
    intelligence = get_intelligence_service()

    # Register all tools
    register_fhir_tools(server, fhir, intelligence)
    register_terminology_tools(server, terminology)
    register_composite_tools(server, fhir, terminology)

    # --- UNIFIED GATEWAY LOGIC (V3.1) ---
    # FastMCP creates a Starlette/FastAPI app under the hood.
    # We access it via ._app (available in recent versions of fastmcp)
    app = getattr(server, "_app", None)
    if app:
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

    return server
