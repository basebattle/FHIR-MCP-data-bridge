import json
import os
from typing import Dict, List, Optional, Any
from fhir_mcp.utils.logging import logger
from tenacity import retry, stop_after_attempt, wait_exponential
import httpx
from aiocache import cached
from fhir_mcp.models.intelligence_models import SemanticSuggestion, HCCWeight, ClinicalIntelligenceData

class ClinicalIntelligenceService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        # DeepSense endpoint from blueprint
        self.endpoint = "https://mcp.deepsense.ai/icd10_codes/v1"
        self.hcc_weights = self._load_mappings("hcc_weights.json")
        self.snomed_map = self._load_mappings("snomed_icd10.json")

    def _load_mappings(self, filename: str) -> Dict[str, Any]:
        """Loads local JSON mapping files."""
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        filepath = os.path.join(base_path, "data", "mappings", filename)
        try:
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    return json.load(f)
            else:
                logger.warning(f"Mapping file not found: {filepath}")
                return {}
        except Exception as e:
            logger.error(f"Error loading {filename}: {str(e)}")
            return {}

    @cached(ttl=3600)
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def get_semantic_suggestions(self, text_query: str) -> List[SemanticSuggestion]:
        """
        Semantic Search: Pivots natural language (e.g., 'Shortness of breath') 
        to top 3 ICD-10 suggestions via DeepSense API. Shared across protocols.
        """
        if not self.api_key:
            logger.warning("DeepSense API key not configured. Skipping semantic search.")
            return []

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.endpoint,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={"query": text_query, "limit": 3}
                )
                response.raise_for_status()
                data = response.json()
                
                results = data.get("results", [])
                return [
                    SemanticSuggestion(
                        code=r.get("icd10", r.get("code")), 
                        description=r.get("description", "No description provided")
                    ) 
                    for r in results[:3]
                ]
        except Exception as e:
            logger.error(f"DeepSense Semantic Search Error: {str(e)}")
            return []

    def map_snomed_to_icd10(self, snomed_code: str) -> Optional[str]:
        """Translation: Maps SNOMED-CT to ICD-10 using local lookup."""
        return self.snomed_map.get(snomed_code)

    def calculate_hcc_weight(self, icd10_code: str) -> HCCWeight:
        """
        Financial Logic: Calculates HCC Risk Weight for high-value diagnoses.
        """
        data = self.hcc_weights.get(icd10_code)
        if data:
            return HCCWeight(**data)
            
        if icd10_code.startswith("E11"):
             return HCCWeight(hcc_impact=True, category="Diabetes", weight=0.104, description="Derived from Diabetes category")
        if icd10_code.startswith("I21"):
             return HCCWeight(hcc_impact=True, category="Acute Myocardial Infarction", weight=0.25, description="Derived from AMI category")
             
        return HCCWeight(hcc_impact=False, category="None", weight=0.0, description="No HCC impact found")
        
    async def process_clinical_code(self, code_obj: dict) -> ClinicalIntelligenceData:
        """Master function to orchestrate translation and financial scoring"""
        system = code_obj.get('system', '')
        code = code_obj.get('code', '')
        
        icd10_code = code
        mapped_icd10 = None
        status = None
        
        if system and 'snomed' in system.lower():
            mapped = self.map_snomed_to_icd10(code)
            if mapped:
                icd10_code = mapped
                mapped_icd10 = mapped
            else:
                status = "Awaiting Billing Translation"
                
        is_icd10 = system and ('icd-10' in system.lower() or 'icd10' in system.lower())
        
        hcc_data = self.calculate_hcc_weight(icd10_code)
        
        return ClinicalIntelligenceData(
            original=code,
            system=system,
            mapped_icd10=mapped_icd10,
            status=status,
            hcc_data=hcc_data
        )
