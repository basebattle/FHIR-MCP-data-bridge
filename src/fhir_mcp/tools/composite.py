import asyncio
import json
from fastmcp import FastMCP
from fhir_mcp.services.fhir_client import FHIRClient
from fhir_mcp.services.terminology_service import TerminologyService
from fhir_mcp.services.response_mapper import ResponseMapper
from fhir_mcp.config.constants import TOOL_DESCRIPTIONS
from fhir_mcp.utils.logging import logger

def register_composite_tools(server: FastMCP, fhir: FHIRClient, terminology: TerminologyService):
    """Registers composite tools like patient summary and capabilities."""

    @server.tool(name="get_patient_summary", description=TOOL_DESCRIPTIONS["get_patient_summary"])
    async def get_patient_summary(patient_id: str) -> str:
        """Assembles a full clinical summary by fetching multiple resource types in parallel."""
        try:
            # Task definitions for parallel execution
            tasks = [
                fhir.read("Patient", patient_id),
                fhir.search("Condition", {"patient": patient_id, "clinical-status": "active"}),
                fhir.search("MedicationRequest", {"patient": patient_id, "status": "active"}),
                fhir.search("Encounter", {"patient": patient_id, "_count": "5", "_sort": "-date"}),
                fhir.search("AllergyIntolerance", {"patient": patient_id, "clinical-status": "active"}),
                fhir.search("Observation", {"patient": patient_id, "category": "vital-signs", "_sort": "-date", "_count": "5"})
            ]
            
            # Execute all tasks in parallel
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            output = ["═══════════════════════════════════════", "PATIENT CLINICAL SUMMARY", "═══════════════════════════════════════\n"]
            
            titles = ["DEMOGRAPHICS", "ACTIVE CONDITIONS", "CURRENT MEDICATIONS", "RECENT ENCOUNTERS", "ACTIVE ALLERGIES", "LATEST VITALS"]
            
            for title, resp in zip(titles, responses):
                output.append(f"[{title}]")
                if isinstance(resp, Exception):
                    output.append(f"   Error fetching {title.lower()}: {str(resp)}")
                else:
                    if resp.data.get("resourceType") == "Bundle":
                        output.append(ResponseMapper.map_bundle(resp.data, title.split()[-1].capitalize()))
                    else:
                        output.append(ResponseMapper.map_resource(resp.data))
                output.append("")

            output.append("═══════════════════════════════════════")
            return "\n".join(output)
            
        except Exception as e:
            logger.error(f"Error in get_patient_summary: {str(e)}")
            return f"Error assembling patient summary: {str(e)}"

    @server.tool(name="get_server_capabilities", description=TOOL_DESCRIPTIONS["get_server_capabilities"])
    async def get_server_capabilities() -> str:
        """Returns the FHIR server CapabilityStatement summary."""
        try:
            caps = await fhir.capabilities()
            
            name = caps.get("name", "Unknown Server")
            fhir_version = caps.get("fhirVersion", "Unknown")
            software = caps.get("software", {}).get("name", "Unknown Software")
            
            resources = []
            for rest in caps.get("rest", []):
                for res in rest.get("resource", []):
                    rt = res.get("type")
                    ops = [x.get("code") for x in res.get("interaction", [])]
                    resources.append(f"- {rt}: {', '.join(ops)}")
            
            output = [
                f"FHIR Server: {name}",
                f"Software: {software}",
                f"FHIR Version: {fhir_version}",
                f"Base URL: {fhir.base_url}",
                "\nSupported Resources & Interactions:",
                "\n".join(resources[:20]) # Limit to top 20 to avoid context blowup
            ]
            
            if len(resources) > 20:
                output.append(f"\n... and {len(resources)-20} more resources.")
                
            return "\n".join(output)
            
        except Exception as e:
            logger.error(f"Error in get_server_capabilities: {str(e)}")
            return f"Error fetching server capabilities: {str(e)}"
