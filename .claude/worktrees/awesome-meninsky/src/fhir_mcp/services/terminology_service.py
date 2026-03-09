import json
import os
from typing import List, Dict, Any, Optional
from fhir_mcp.utils.logging import logger

class TerminologyService:
    """Service for clinical terminology lookups (ICD-10, SNOMED, LOINC, RxNorm)."""

    def __init__(self, settings: Any):
        self.settings = settings
        self.data: Dict[str, List[Dict[str, Any]]] = {
            "icd10": [],
            "loinc": [],
            "rxnorm": [],
            "snomed": []
        }
        self.load_embedded_data()

    def load_embedded_data(self):
        """Loads embedded terminology JSON files from the data directory."""
        data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data")
        
        files = {
            "icd10": "icd10_codes.json",
            "loinc": "loinc_common.json",
            "rxnorm": "rxnorm_common.json",
            "snomed": "snomed_common.json"
        }

        for key, filename in files.items():
            path = os.path.join(data_dir, filename)
            if os.path.exists(path):
                try:
                    with open(path, "r") as f:
                        self.data[key] = json.load(f)
                    logger.info(f"Loaded {len(self.data[key])} embedded {key} codes.")
                except Exception as e:
                    logger.error(f"Failed to load {filename}: {str(e)}")
            else:
                logger.warning(f"Embedded data file {path} not found.")

    def lookup(self, system: str, query: str, count: int = 10) -> List[Dict[str, Any]]:
        """
        Searches for codes in the specified system by keyword or code.
        System must be one of: icd10, loinc, rxnorm, snomed.
        """
        if system not in self.data:
            return []

        query = query.lower()
        results = []
        
        # Exact code match first
        for item in self.data[system]:
            if item["code"].lower() == query:
                results.append(item)
                if len(results) >= count:
                    return results

        # Keyword match
        for item in self.data[system]:
            if item in results:
                continue
            
            if query in item["display"].lower() or any(query in kw.lower() for kw in item.get("keywords", [])):
                results.append(item)
                if len(results) >= count:
                    break

        return results

    def format_results(self, system: str, query: str, matches: List[Dict[str, Any]]) -> str:
        """Formats terminology lookup results as readable text."""
        if not matches:
            return f"No matches found for '{query}' in {system.upper()}."

        output = [f"{system.upper()} Lookup: \"{query}\"\n"]
        for i, match in enumerate(matches, 1):
            output.append(f"{i}. {match['code']} - {match['display']}")
            if match.get("keywords"):
                output.append(f"   Keywords: {', '.join(match['keywords'][:3])}")
        
        return "\n".join(output)
