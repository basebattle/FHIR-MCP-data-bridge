import time
from typing import Optional, Dict, Any
import httpx
from fhir_mcp.config.settings import Settings
from fhir_mcp.utils.logging import logger
from fhir_mcp.utils.errors import FHIRAuthError

class AuthManager:
    """Handles OAuth 2.0 authentication for the FHIR server."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.token_cache: Dict[str, Any] = {}

    async def get_auth_header(self) -> Dict[str, str]:
        """Returns the Authorization header if auth is enabled."""
        if self.settings.fhir_server_disable_authorization:
            return {}

        token = await self.get_token()
        return {"Authorization": f"Bearer {token}"}

    async def get_token(self) -> str:
        """Retrieves a valid OAuth token from cache or via client credentials grant."""
        # Simple cache check based on scope/endpoint as key
        cache_key = self.settings.fhir_server_token_url or "default"
        
        cached = self.token_cache.get(cache_key)
        if cached and cached["expires_at"] > time.time() + 60:
            return cached["access_token"]

        if self.settings.fhir_server_auth_mode == "client_credentials":
            return await self._refresh_client_credentials(cache_key)
        
        # authorization_code flow would be handled here in Phase 4
        raise FHIRAuthError(f"Auth mode {self.settings.fhir_server_auth_mode} not yet fully implemented or token missing.")

    async def _refresh_client_credentials(self, cache_key: str) -> str:
        """Performs client_credentials grant to get a new token."""
        if not self.settings.fhir_server_token_url:
            raise FHIRAuthError("FHIR_SERVER_TOKEN_URL is required for client_credentials auth.")
        
        if not self.settings.fhir_server_client_id or not self.settings.fhir_server_client_secret:
            raise FHIRAuthError("client_id and client_secret are required for client_credentials auth.")

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.settings.fhir_server_token_url,
                    data={
                        "grant_type": "client_credentials",
                        "client_id": self.settings.fhir_server_client_id,
                        "client_secret": self.settings.fhir_server_client_secret,
                        "scope": self.settings.fhir_server_scopes,
                    },
                    timeout=10,
                )
                response.raise_for_status()
                data = response.json()
                
                expires_in = data.get("expires_in", 3600)
                self.token_cache[cache_key] = {
                    "access_token": data["access_token"],
                    "expires_at": time.time() + expires_in
                }
                
                logger.info("Successfully refreshed FHIR OAuth token via client_credentials.")
                return data["access_token"]
                
            except httpx.HTTPError as e:
                logger.error(f"Failed to refresh FHIR OAuth token: {str(e)}")
                raise FHIRAuthError(f"OAuth token refresh failed: {str(e)}")
