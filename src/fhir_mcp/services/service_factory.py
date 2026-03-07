from typing import Optional
from fhir_mcp.services.icd10_service import ClinicalIntelligenceService
from fhir_mcp.config.settings import Settings

_instance: Optional[ClinicalIntelligenceService] = None

def get_intelligence_service() -> ClinicalIntelligenceService:
    global _instance
    if _instance is None:
        settings = Settings()
        _instance = ClinicalIntelligenceService(api_key=settings.deepsense_api_key or "")
    return _instance
