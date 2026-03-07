from typing import Any, Dict, Optional
from fastmcp import FastMCP
from fhir_mcp.services.fhir_client import FHIRClient
from fhir_mcp.services.icd10_service import ClinicalIntelligenceService
from fhir_mcp.services.query_builder import QueryBuilder
from fhir_mcp.services.response_mapper import ResponseMapper
from fhir_mcp.config.constants import TOOL_DESCRIPTIONS
from fhir_mcp.utils.logging import logger
from fhir_mcp.models.tool_inputs import (
    PatientSearchInput,
    ConditionSearchInput,
    ObservationSearchInput,
    MedicationSearchInput,
    EncounterSearchInput,
    AllergySearchInput,
    ProcedureSearchInput,
    CarePlanSearchInput
)

async def _execute_fhir_search(
    fhir: FHIRClient, 
    resource_type: str, 
    tool_inputs: Any
) -> str:
    """Helper to execute FHIR search and map results to text."""
    try:
        # Convert Pydantic model to dict for query builder
        input_dict = tool_inputs.model_dump(by_alias=True)
        # Handle 'class_' alias for 'class' back to 'class'
        if "class" not in input_dict and hasattr(tool_inputs, "class_"):
            input_dict["class"] = getattr(tool_inputs, "class_")

        params = QueryBuilder.build_params(resource_type, input_dict)
        
        # Max pages hardcoded to 5 for now to balance performance/completeness
        response = await fhir.search(resource_type, params, max_pages=5)
        return ResponseMapper.map_bundle(response.data, resource_type)
    except Exception as e:
        logger.error(f"Error in search_{resource_type.lower()}: {str(e)}")
        return f"Error executing search for {resource_type}: {str(e)}"

def register_fhir_tools(server: FastMCP, fhir: FHIRClient, icd10_service: ClinicalIntelligenceService):
    """Registers all 8 core FHIR resource search tools with V2 Intelligence."""

    @server.tool(name="search_patients", description=TOOL_DESCRIPTIONS["search_patients"])
    async def search_patients(
        name: Optional[str] = None,
        family: Optional[str] = None,
        given: Optional[str] = None,
        birthdate: Optional[str] = None,
        gender: Optional[str] = None,
        identifier: Optional[str] = None,
        _count: int = 20
    ) -> str:
        input_data = PatientSearchInput(
            name=name, family=family, given=given, birthdate=birthdate, 
            gender=gender, identifier=identifier, _count=_count
        )
        return await _execute_fhir_search(fhir, "Patient", input_data)

    @server.tool(name="search_conditions", description=TOOL_DESCRIPTIONS["search_conditions"] + " Supports V2 Semantic Search and HCC Risk Scoring.")
    async def search_conditions(
        patient: Optional[str] = None,
        code: Optional[str] = None,
        fuzzy_text: Optional[str] = None,
        clinical_status: Optional[str] = None,
        category: Optional[str] = None,
        onset_date: Optional[str] = None,
        _count: int = 50
    ) -> str:
        # 1. Semantic Search Pivot (V3.1)
        fuzzy_note = ""
        if fuzzy_text and not code:
            semantic_suggestions = await icd10_service.get_semantic_suggestions(fuzzy_text)
            if semantic_suggestions:
                # Type hints ensure we have .code and .description
                suggestion = semantic_suggestions[0]
                code = suggestion.code
                fuzzy_note = f"### [V2 Semantic Match]\nQueried FHIR for **{code}** ({suggestion.description}) based on input: *\"{fuzzy_text}\"*\n\n"
            else:
                return f"No ICD-10 semantic matches found for '{fuzzy_text}'. Please try a different query or provide a specific code."

        input_data = ConditionSearchInput(
            patient=patient, code=code, fuzzy_text=fuzzy_text,
            clinical_status=clinical_status, category=category, 
            onset_date=onset_date, _count=_count
        )
        
        # Original FHIR search execution
        raw_response = await _execute_fhir_search(fhir, "Condition", input_data)
        
        # 2. Financial & Translation Pipeline Enrichment (V3.1)
        try:
            # We add a note about the hcc data if we can find a code in the result
            # Since map_bundle returns text, we'll look for codes inside it or use the top code
            if code:
                hcc = icd10_service.calculate_hcc_weight(code)
                if hcc.hcc_impact:
                    fuzzy_note += f"> [!NOTE]\n> **Financial Intelligence**: This diagnosis ({code}) has an HCC Impact Category of **{hcc.category}** (Weight: {hcc.weight})\n\n"
            
            return fuzzy_note + raw_response
            
        except Exception as e:
            logger.error(f"Enrichment error: {str(e)}")
            return fuzzy_note + raw_response

    @server.tool(name="search_observations", description=TOOL_DESCRIPTIONS["search_observations"])
    async def search_observations(
        patient: Optional[str] = None,
        code: Optional[str] = None,
        category: Optional[str] = None,
        date: Optional[str] = None,
        value_quantity: Optional[str] = None,
        _count: int = 50
    ) -> str:
        input_data = ObservationSearchInput(
            patient=patient, code=code, category=category, 
            date=date, value_quantity=value_quantity, _count=_count
        )
        return await _execute_fhir_search(fhir, "Observation", input_data)

    @server.tool(name="search_medications", description=TOOL_DESCRIPTIONS["search_medications"])
    async def search_medications(
        patient: Optional[str] = None,
        code: Optional[str] = None,
        status: Optional[str] = None,
        authoredon: Optional[str] = None,
        _count: int = 50
    ) -> str:
        input_data = MedicationSearchInput(
            patient=patient, code=code, status=status, 
            authoredon=authoredon, _count=_count
        )
        return await _execute_fhir_search(fhir, "MedicationRequest", input_data)

    @server.tool(name="search_encounters", description=TOOL_DESCRIPTIONS["search_encounters"])
    async def search_encounters(
        patient: Optional[str] = None,
        date: Optional[str] = None,
        type: Optional[str] = None,
        class_: Optional[str] = None,
        status: Optional[str] = None,
        _count: int = 50
    ) -> str:
        input_data = EncounterSearchInput(
            patient=patient, date=date, type=type, 
            class_=class_, status=status, _count=_count
        )
        return await _execute_fhir_search(fhir, "Encounter", input_data)

    @server.tool(name="search_allergies", description=TOOL_DESCRIPTIONS["search_allergies"])
    async def search_allergies(
        patient: Optional[str] = None,
        clinical_status: Optional[str] = None,
        type: Optional[str] = None,
        criticality: Optional[str] = None,
        _count: int = 50
    ) -> str:
        input_data = AllergySearchInput(
            patient=patient, clinical_status=clinical_status, 
            type=type, criticality=criticality, _count=_count
        )
        return await _execute_fhir_search(fhir, "AllergyIntolerance", input_data)

    @server.tool(name="search_procedures", description=TOOL_DESCRIPTIONS["search_procedures"])
    async def search_procedures(
        patient: Optional[str] = None,
        code: Optional[str] = None,
        date: Optional[str] = None,
        status: Optional[str] = None,
        _count: int = 100
    ) -> str:
        input_data = ProcedureSearchInput(
            patient=patient, code=code, date=date, status=status, _count=_count
        )
        return await _execute_fhir_search(fhir, "Procedure", input_data)

    @server.tool(name="search_careplans", description=TOOL_DESCRIPTIONS["search_careplans"])
    async def search_careplans(
        patient: Optional[str] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
        _count: int = 20
    ) -> str:
        input_data = CarePlanSearchInput(
            patient=patient, status=status, category=category, _count=_count
        )
        return await _execute_fhir_search(fhir, "CarePlan", input_data)

    # --- Generic FHIR CRUD Tools ---

    @server.tool(name="read", description="Perform a FHIR 'read' interaction to retrieve a single resource by type and ID.")
    async def read(resource_type: str, resource_id: str) -> str:
        try:
            response = await fhir.read(resource_type, resource_id)
            return ResponseMapper.map_resource(response.data)
        except Exception as e:
            return f"Error reading {resource_type}/{resource_id}: {str(e)}"

    @server.tool(name="create", description="Execute a FHIR 'create' interaction to persist a new resource.")
    async def create(resource_type: str, payload: Dict[str, Any]) -> str:
        try:
            response = await fhir.create(resource_type, payload)
            return f"Successfully created {resource_type}/{response.data.get('id', 'new')}\n\n" + ResponseMapper.map_resource(response.data)
        except Exception as e:
            return f"Error creating {resource_type}: {str(e)}"

    @server.tool(name="update", description="Performs a FHIR 'update' interaction by replacing an existing resource instance.")
    async def update(resource_type: str, resource_id: str, payload: Dict[str, Any]) -> str:
        try:
            response = await fhir.update(resource_type, resource_id, payload)
            return f"Successfully updated {resource_type}/{resource_id}\n\n" + ResponseMapper.map_resource(response.data)
        except Exception as e:
            return f"Error updating {resource_type}/{resource_id}: {str(e)}"

    @server.tool(name="delete", description="Execute a FHIR 'delete' interaction on a specific resource instance.")
    async def delete(resource_type: str, resource_id: str) -> str:
        try:
            await fhir.delete(resource_type, resource_id)
            return f"Successfully deleted {resource_type}/{resource_id}"
        except Exception as e:
            return f"Error deleting {resource_type}/{resource_id}: {str(e)}"

    @server.tool(name="get_capabilities", description="Retrieves FHIR server metadata (CapabilityStatement).")
    async def get_capabilities() -> str:
        try:
            data = await fhir.capabilities()
            software = data.get("software", {}).get("name", "Unknown")
            version = data.get("fhirVersion", "Unknown")
            return f"FHIR Server: {software} (v{version})\nResources supported: {len(data.get('rest', [{}])[0].get('resource', []))}"
        except Exception as e:
            return f"Error fetching server capabilities: {str(e)}"

    @server.tool(name="get_user", description="Retrieves the currently authenticated user's FHIR profile.")
    async def get_user() -> str:
        # Placeholder for user profile retrieval via ID token or current context
        return "Authenticated user identity currently mapped to: Unknown (Requires SMART-on-FHIR Login)"
