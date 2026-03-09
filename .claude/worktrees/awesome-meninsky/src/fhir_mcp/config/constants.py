# FHIR Resource Types we support
FHIR_RESOURCES = [
    "Patient",
    "Condition", 
    "Observation",
    "MedicationRequest",
    "Encounter",
    "AllergyIntolerance",
    "Procedure",
    "CarePlan"
]

# Common Search Parameter Mappings
SEARCH_PARAMS = {
    "Patient": ["name", "family", "given", "birthdate", "gender", "identifier"],
    "Condition": ["patient", "code", "clinical-status", "category", "onset-date"],
    "Observation": ["patient", "code", "category", "date", "value-quantity"],
    "MedicationRequest": ["patient", "code", "status", "authoredon"],
    "Encounter": ["patient", "date", "type", "class", "status"],
    "AllergyIntolerance": ["patient", "clinical-status", "type", "criticality"],
    "Procedure": ["patient", "code", "date", "status"],
    "CarePlan": ["patient", "status", "category"]
}

# Terminology Endpoints (NLM)
NLM_VALUE_SET_URL = "https://cts.nlm.nih.gov/fhir/ValueSet"
NLM_CODE_SYSTEM_URL = "https://cts.nlm.nih.gov/fhir/CodeSystem"

# Tool Descriptions (moved to constants for cleanliness)
TOOL_DESCRIPTIONS = {
    "search_patients": "Search for patient records in the FHIR server. Supports name, birthdate, gender, and identifier.",
    "search_conditions": "Search for clinical conditions (diagnoses) for a patient. Supports ICD-10/SNOMED codes.",
    "search_observations": "Search for clinical observations (vitals, labs). Supports LOINC codes and date ranges.",
    "search_medications": "Search for medication requests/prescriptions. Supports RxNorm codes.",
    "search_encounters": "Search for patient clinical encounters (visits).",
    "search_allergies": "Search for patient allergies and intolerances.",
    "search_procedures": "Search for clinical procedures performed on a patient.",
    "search_careplans": "Search for patient care plans.",
    "get_patient_summary": "Assembles a comprehensive clinical summary for a patient (demographics, conditions, meds, etc.).",
    "get_server_capabilities": "Returns the FHIR server CapabilityStatement including supported resources.",
    "lookup_icd10": "Search for ICD-10-CM diagnosis codes by keyword or specific code.",
    "lookup_snomed": "Search for SNOMED CT clinical terms by keyword or concept ID.",
    "lookup_loinc": "Search for LOINC lab/clinical codes by keyword or code.",
    "lookup_rxnorm": "Search for RxNorm medication codes by drug name or RxCUI."
}
