import json
from dataclasses import dataclass
from typing import Optional, Any, Dict, List
import httpx
from fhir_mcp.config.settings import Settings
from fhir_mcp.services.auth_manager import AuthManager
from fhir_mcp.utils.logging import logger
from fhir_mcp.utils.errors import (
    FHIRConnectionError, 
    FHIRAuthError, 
    FHIRNotFoundError, 
    FHIRValidationError
)

@dataclass
class FHIRResponse:
    status_code: int
    data: Dict[str, Any]
    total: Optional[int] = None
    next_link: Optional[str] = None
    resource_type: str = ""

class FHIRClient:
    """Async HTTP client for FHIR R4 server operations."""

    def __init__(self, settings: Settings, auth: AuthManager):
        self.settings = settings
        self.base_url = settings.fhir_server_base_url.rstrip("/")
        self.auth = auth
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=self.settings.fhir_request_timeout,
                limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def _request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        client = await self._get_client()
        url = path if path.startswith("http") else f"{self.base_url}/{path.lstrip('/')}"
        
        headers = kwargs.pop("headers", {})
        auth_headers = await self.auth.get_auth_header()
        headers.update(auth_headers)
        
        try:
            response = await client.request(method, url, headers=headers, **kwargs)
            
            if response.status_code == 401:
                # Potential token expiry, try one retry if auth is enabled
                if not self.settings.fhir_server_disable_authorization:
                    logger.info("Received 401, attempting token refresh and retry...")
                    # Force refresh by clearing cache key if we had one
                    # For now just clear the whole cache for simplicity
                    self.auth.token_cache.clear()
                    auth_headers = await self.auth.get_auth_header()
                    headers.update(auth_headers)
                    response = await client.request(method, url, headers=headers, **kwargs)

            if response.status_code == 404:
                raise FHIRNotFoundError(f"Resource not found at {url}")
            
            if response.status_code >= 400:
                data = response.json()
                if data.get("resourceType") == "OperationOutcome":
                    issues = data.get("issue", [])
                    details = "; ".join([i.get("diagnostics", i.get("code", "unknown error")) for i in issues])
                    raise FHIRValidationError(f"FHIR server error: {details}", details=json.dumps(data))
                response.raise_for_status()
            
            return response.json()
            
        except httpx.ConnectError as e:
            raise FHIRConnectionError(f"Failed to connect to FHIR server: {str(e)}", details=url)
        except httpx.TimeoutException:
            raise FHIRConnectionError(f"FHIR server request timed out after {self.settings.fhir_request_timeout}s", details=url)
        except httpx.HTTPStatusError as e:
            raise FHIRValidationError(f"HTTP error {e.response.status_code}", details=str(e))

    async def search(
        self,
        resource_type: str,
        params: Dict[str, str],
        max_pages: int = 10
    ) -> FHIRResponse:
        """Execute FHIR search and handle pagination."""
        path = resource_type
        data = await self._request("GET", path, params=params)
        
        # Initial response
        total = data.get("total")
        next_link = self._get_next_link(data)
        
        # If we need to follow pagination
        if next_link and max_pages > 1:
            all_entries = data.get("entry", [])
            page_count = 1
            while next_link and page_count < max_pages:
                page_data = await self._request("GET", next_link)
                all_entries.extend(page_data.get("entry", []))
                next_link = self._get_next_link(page_data)
                page_count += 1
            
            data["entry"] = all_entries
            if next_link:
                logger.warning(f"Search results truncated at {page_count} pages.")
        
        return FHIRResponse(
            status_code=200,
            data=data,
            total=total,
            next_link=next_link,
            resource_type=resource_type
        )

    async def read(self, resource_type: str, resource_id: str) -> FHIRResponse:
        """Read a single FHIR resource by ID."""
        path = f"{resource_type}/{resource_id}"
        data = await self._request("GET", path)
        return FHIRResponse(status_code=200, data=data, resource_type=resource_type)

    async def capabilities(self) -> Dict[str, Any]:
        """Fetch server CapabilityStatement."""
        return await self._request("GET", "metadata")

    def _get_next_link(self, bundle: Dict[str, Any]) -> Optional[str]:
        links = bundle.get("link", [])
        for link in links:
            if link.get("relation") == "next":
                return link.get("url")
        return None
