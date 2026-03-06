import pytest
from unittest.mock import AsyncMock, patch
from fastmcp import FastMCP
from fhir_mcp.services.fhir_client import FHIRClient, FHIRResponse
from fhir_mcp.tools.fhir_resources import register_fhir_tools

@pytest.fixture
async def server(fhir_client):
    srv = FastMCP("test-server")
    register_fhir_tools(srv, fhir_client)
    return srv

@pytest.mark.asyncio
async def test_read_tool_success(server, fhir_client):
    mock_data = {"resourceType": "Patient", "id": "123", "name": [{"family": "Doe"}]}
    
    with patch.object(fhir_client, "read", new_callable=AsyncMock) as mock_read:
        # mock_read should return a FHIRResponse object
        mock_read.return_value = FHIRResponse(status_code=200, data=mock_data, resource_type="Patient")
        
        # FastMCP tools are registered via @server.tool but we can access them through the server object
        # If FastMCP doesn't expose them easily, we can manually test the tool function
        # For now, we'll try to find the tool by name
        read_tool = server._tools["read"]
        result = await read_tool.run({"resource_type": "Patient", "resource_id": "123"})
        
        assert "Patient/123" in result
        assert "Doe" in result

@pytest.mark.asyncio
async def test_search_patients_tool(server, fhir_client):
    mock_bundle = {
        "resourceType": "Bundle",
        "total": 1,
        "entry": [{"resource": {"resourceType": "Patient", "id": "1", "name": [{"family": "Doe"}]}}]
    }
    
    with patch.object(fhir_client, "search", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = FHIRResponse(status_code=200, data=mock_bundle, resource_type="Patient")
        
        search_tool = server._tools["search_patients"]
        result = await search_tool.run({"name": "Doe"})
        
        assert "Doe" in result
        assert "Found 1 Patient" in result
