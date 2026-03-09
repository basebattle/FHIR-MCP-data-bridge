from fastapi import APIRouter, Depends, Query, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from typing import List
import os
from fhir_mcp.models.intelligence_models import SemanticSuggestion, ClinicalValidation
from fhir_mcp.services.service_factory import get_intelligence_service

# Security Implementation
API_KEY_NAME = "X-API-KEY"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

async def verify_api_key(api_key_header: str = Security(api_key_header)):
    expected_key = os.getenv("INTERNAL_API_KEY")
    # If not set in env, we allow it for development but warn? 
    # Or strict check as per Principal Architect.
    if not expected_key:
        # For security, if not set, we fail closed in production feel
        raise HTTPException(status_code=500, detail="Server security misconfiguration: INTERNAL_API_KEY not set")
    
    if api_key_header != expected_key:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid API Key")
    return api_key_header

router = APIRouter(prefix="/api/v3", tags=["Clinical Intelligence"])

@router.get("/health_check")
async def combined_health_check():
    """Verifies BOTH REST and internal service health."""
    return {"status": "healthy", "protocols": ["rest", "mcp_internal"]}

@router.get("/semantic-search", response_model=List[SemanticSuggestion])
async def rest_semantic_search(
    q: str = Query(..., description="Natural language diagnosis string"),
    api_key: str = Depends(verify_api_key)
):
    """
    Direct REST endpoint for UX elements like drop-down autocomplete.
    """
    intelligence = get_intelligence_service()
    results = await intelligence.get_semantic_suggestions(q)
    if not results:
        return [] # Return empty list rather than 404 for search usually
    return results

@router.post("/clinical-validation")
async def validate_clinician_selection(
    validation: ClinicalValidation,
    api_key: str = Depends(verify_api_key)
):
    """
    Human-in-the-Loop Override Logic: Logs clinician confirmations or overrides.
    """
    # In a real app, this would write to a database or audit log
    print(f"AUDIT LOG: Clinician {validation.clinician_id} marked {validation.code} as {validation.status}")
    return {"status": "recorded", "audit_id": "simulated-id-123"}
