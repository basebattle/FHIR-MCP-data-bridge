from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class SemanticSuggestion(BaseModel):
    code: str = Field(..., description="ICD-10-CM code")
    description: str = Field(..., description="Clinical description")

class HCCWeight(BaseModel):
    hcc_impact: bool
    category: str
    weight: float
    description: str

class ClinicalIntelligenceData(BaseModel):
    original: str
    system: str
    mapped_icd10: Optional[str] = None
    status: Optional[str] = None
    hcc_data: HCCWeight

class ClinicalValidation(BaseModel):
    """Human-in-the-Loop Override Logic structure"""
    code: str
    status: str = Field(..., description="'Confirmed', 'Manually Selected', or 'Rejected'")
    clinician_id: str
    timestamp: str
