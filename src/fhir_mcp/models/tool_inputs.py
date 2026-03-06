from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any

class PatientSearchInput(BaseModel):
    name: Optional[str] = Field(None, description="Patient name (partial match)")
    family: Optional[str] = Field(None, description="Last name")
    given: Optional[str] = Field(None, description="First name")
    birthdate: Optional[str] = Field(None, description="DOB with optional prefix: eq, ge, le, gt, lt (e.g., ge2000-01-01)")
    gender: Optional[str] = Field(None, description="male, female, other, unknown")
    identifier: Optional[str] = Field(None, description="MRN or system|value identifier")
    count: int = Field(20, ge=1, le=100, alias="_count")

    @field_validator("birthdate")
    @classmethod
    def validate_birthdate(cls, v):
        if not v:
            return v
        # Basic FHIR date prefix check
        valid_prefixes = ["eq", "ne", "gt", "lt", "ge", "le", "sa", "eb", "ap"]
        if any(v.startswith(p) for p in valid_prefixes):
            return v
        # Also allow raw dates
        if v.replace("-", "").isdigit():
            return v
        return v # More strict regex could be added but FHIR is flexible

class ConditionSearchInput(BaseModel):
    patient: Optional[str] = Field(None, description="FHIR Patient resource ID")
    code: Optional[str] = Field(None, description="ICD-10 or SNOMED code")
    clinical_status: Optional[str] = Field(None, description="active, recurrence, inactive, resolved")
    category: Optional[str] = Field(None, description="encounter-diagnosis, problem-list-item")
    onset_date: Optional[str] = Field(None, description="Date with prefix (ge2024-01-01)")
    count: int = Field(50, ge=1, le=200, alias="_count")

class ObservationSearchInput(BaseModel):
    patient: Optional[str] = Field(None, description="FHIR Patient resource ID")
    code: Optional[str] = Field(None, description="LOINC code")
    category: Optional[str] = Field(None, description="vital-signs, laboratory, social-history")
    date: Optional[str] = Field(None, description="Date prefix (ge2024-01-01)")
    value_quantity: Optional[str] = Field(None, description="Numeric comparison (gt7.0)")
    count: int = Field(50, ge=1, le=200, alias="_count")

class MedicationSearchInput(BaseModel):
    patient: Optional[str] = Field(None, description="FHIR Patient resource ID")
    code: Optional[str] = Field(None, description="RxNorm code")
    status: Optional[str] = Field(None, description="active, completed, stopped, on-hold")
    authoredon: Optional[str] = Field(None, description="Date prefix")
    count: int = Field(50, ge=1, le=200, alias="_count")

class EncounterSearchInput(BaseModel):
    patient: Optional[str] = Field(None, description="FHIR Patient resource ID")
    date: Optional[str] = Field(None, description="Date prefix")
    type: Optional[str] = Field(None, description="encounter type code")
    class_: Optional[str] = Field(None, description="AMB, IMP, EMER", alias="class")
    status: Optional[str] = Field(None, description="planned, in-progress, finished")
    count: int = Field(50, ge=1, le=200, alias="_count")

class AllergySearchInput(BaseModel):
    patient: Optional[str] = Field(None, description="FHIR Patient resource ID")
    clinical_status: Optional[str] = Field(None, description="active, inactive, resolved")
    type: Optional[str] = Field(None, description="allergy, intolerance")
    criticality: Optional[str] = Field(None, description="low, high, unable-to-assess")
    count: int = Field(50, ge=1, le=100, alias="_count")

class ProcedureSearchInput(BaseModel):
    patient: Optional[str] = Field(None, description="FHIR Patient resource ID")
    code: Optional[str] = Field(None, description="CPT or SNOMED code")
    date: Optional[str] = Field(None, description="Date prefix")
    status: Optional[str] = Field(None, description="completed, in-progress, preparation")
    count: int = Field(50, ge=1, le=100, alias="_count")

class CarePlanSearchInput(BaseModel):
    patient: Optional[str] = Field(None, description="FHIR Patient resource ID")
    status: Optional[str] = Field(None, description="active, completed, revoked")
    category: Optional[str] = Field(None, description="Care plan category")
    count: int = Field(20, ge=1, le=50, alias="_count")

# --- Generic Tools ---

class GenericReadInput(BaseModel):
    resource_type: str = Field(..., description="FHIR resource type (e.g., Patient, Observation)")
    id: str = Field(..., description="Logical ID of the resource")

class GenericCreateInput(BaseModel):
    resource_type: str = Field(..., description="FHIR resource type")
    payload: Dict[str, Any] = Field(..., description="Full FHIR resource JSON")

class GenericUpdateInput(BaseModel):
    resource_type: str = Field(..., description="FHIR resource type")
    id: str = Field(..., description="Logical ID of the resource")
    payload: Dict[str, Any] = Field(..., description="Update resource JSON body")

class GenericDeleteInput(BaseModel):
    resource_type: str = Field(..., description="FHIR resource type")
    id: str = Field(..., description="Logical ID of the resource")

class GetCapabilitiesInput(BaseModel):
    resource_type: Optional[str] = Field(None, description="Optional resource type to check specifically")
