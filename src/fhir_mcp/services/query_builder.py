from typing import Dict, Any, List
from fhir_mcp.config.constants import SEARCH_PARAMS

class QueryBuilder:
    """Utility to map tool input parameters to FHIR search query parameters."""

    @staticmethod
    def build_params(resource_type: str, tool_inputs: Dict[str, Any]) -> Dict[str, str]:
        """
        Maps Pythonic tool inputs to FHIR search parameters.
        Handles hyphenated names and special formatting.
        """
        fhir_params = {}
        
        # Mapping table for specific resource types where tool param name != FHIR param name
        # Mostly handles clinicalStatus -> clinical-status etc.
        mapping = {
            "clinical_status": "clinical-status",
            "onset_date": "onset-date",
            "value_quantity": "value-quantity",
            "authoredon": "authoredon",
            "class_": "class"
        }

        for key, value in tool_inputs.items():
            if value is None or value == "":
                continue
            
            # Use mapped name if exists, otherwise replace underscore with hyphen
            fhir_key = mapping.get(key, key.replace("_", "-"))
            
            # FHIR specific value formatting for lists or strings
            if isinstance(value, list):
                fhir_params[fhir_key] = ",".join([str(v) for v in value])
            elif isinstance(value, bool):
                fhir_params[fhir_key] = str(value).lower()
            else:
                fhir_params[fhir_key] = str(value)

        return fhir_params
