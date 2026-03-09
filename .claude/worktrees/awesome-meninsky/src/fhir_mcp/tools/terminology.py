from fastmcp import FastMCP
from fhir_mcp.services.terminology_service import TerminologyService
from fhir_mcp.config.constants import TOOL_DESCRIPTIONS

def register_terminology_tools(server: FastMCP, terminology: TerminologyService):
    """Registers the 4 clinical terminology lookup tools."""

    @server.tool(name="lookup_icd10", description=TOOL_DESCRIPTIONS["lookup_icd10"])
    async def lookup_icd10(query: str, _count: int = 10) -> str:
        matches = terminology.lookup("icd10", query, _count)
        return terminology.format_results("icd10", query, matches)

    @server.tool(name="lookup_snomed", description=TOOL_DESCRIPTIONS["lookup_snomed"])
    async def lookup_snomed(query: str, _count: int = 10) -> str:
        matches = terminology.lookup("snomed", query, _count)
        return terminology.format_results("snomed", query, matches)

    @server.tool(name="lookup_loinc", description=TOOL_DESCRIPTIONS["lookup_loinc"])
    async def lookup_loinc(query: str, _count: int = 10) -> str:
        matches = terminology.lookup("loinc", query, _count)
        return terminology.format_results("loinc", query, matches)

    @server.tool(name="lookup_rxnorm", description=TOOL_DESCRIPTIONS["lookup_rxnorm"])
    async def lookup_rxnorm(query: str, _count: int = 10) -> str:
        matches = terminology.lookup("rxnorm", query, _count)
        return terminology.format_results("rxnorm", query, matches)
