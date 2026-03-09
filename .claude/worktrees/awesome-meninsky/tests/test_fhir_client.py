import pytest
from unittest.mock import AsyncMock, patch
from fhir_mcp.services.fhir_client import FHIRClient, FHIRResponse

@pytest.mark.asyncio
async def test_search_patients(fhir_client):
    mock_response = {
        "resourceType": "Bundle",
        "entry": [{"resource": {"resourceType": "Patient", "id": "1", "name": [{"family": "Doe"}]}}]
    }
    
    with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value.status_code = 200
        mock_request.return_value.json.return_value = mock_response
        
        response = await fhir_client.search("Patient", {"name": "Doe"})
        
        assert response.status_code == 200
        assert response.data == mock_response
        assert response.resource_type == "Patient"

@pytest.mark.asyncio
async def test_read_resource(fhir_client):
    mock_resource = {"resourceType": "Patient", "id": "123", "name": [{"family": "Smith"}]}
    
    with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value.status_code = 200
        mock_request.return_value.json.return_value = mock_resource
        
        response = await fhir_client.read("Patient", "123")
        
        assert response.status_code == 200
        assert response.data["id"] == "123"

@pytest.mark.asyncio
async def test_create_resource(fhir_client):
    payload = {"resourceType": "Observation", "status": "final", "code": {"text": "Blood Glucose"}}
    
    with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value.status_code = 201
        mock_request.return_value.json.return_value = {**payload, "id": "new-obs-123"}
        
        response = await fhir_client.create("Observation", payload)
        
        assert response.status_code == 201
        assert response.data["id"] == "new-obs-123"

@pytest.mark.asyncio
async def test_update_resource(fhir_client):
    payload = {"resourceType": "Patient", "id": "123", "active": False}
    
    with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value.status_code = 200
        mock_request.return_value.json.return_value = payload
        
        response = await fhir_client.update("Patient", "123", payload)
        
        assert response.status_code == 200
        assert response.data["active"] is False

@pytest.mark.asyncio
async def test_delete_resource(fhir_client):
    with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value.status_code = 204
        # Since _request handles 204 by returning {}, we check that
        response = await fhir_client.delete("Patient", "123")
        
        assert response.status_code == 204
        assert response.data == {}

@pytest.mark.asyncio
async def test_capabilities(fhir_client):
    mock_cap = {"resourceType": "CapabilityStatement", "fhirVersion": "4.0.1"}
    
    with patch("httpx.AsyncClient.request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value.status_code = 200
        mock_request.return_value.json.return_value = mock_cap
        
        response = await fhir_client.capabilities()
        
        assert response["fhirVersion"] == "4.0.1"
