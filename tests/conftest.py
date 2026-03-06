import pytest
import httpx
from fhir_mcp.config.settings import Settings
from fhir_mcp.services.auth_manager import AuthManager
from fhir_mcp.services.fhir_client import FHIRClient

@pytest.fixture
def settings():
    return Settings(
        fhir_server_base_url="https://hapi.fhir.org/baseR4",
        fhir_server_disable_authorization=True
    )

@pytest.fixture
def auth_manager(settings):
    return AuthManager(settings)

@pytest.fixture
async def fhir_client(settings, auth_manager):
    client = FHIRClient(settings, auth_manager)
    yield client
    await client.close()
