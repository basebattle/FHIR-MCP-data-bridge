from fastmcp import FastMCP
from fhir_mcp.config.settings import Settings
from fhir_mcp.services.fhir_client import FHIRClient
from fhir_mcp.services.auth_manager import AuthManager
from fhir_mcp.tools.fhir_resources import register_fhir_tools
from fhir_mcp.tools.terminology import register_terminology_tools
from fhir_mcp.tools.composite import register_composite_tools
from fhir_mcp.services.terminology_service import TerminologyService
from fhir_mcp.services.icd10_service import ICD10Service

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
    icd10 = ICD10Service(api_key=settings.deepsense_api_key or "")

    # Register all tools
    register_fhir_tools(server, fhir, icd10)
    register_terminology_tools(server, terminology)
    register_composite_tools(server, fhir, terminology)

    return server
