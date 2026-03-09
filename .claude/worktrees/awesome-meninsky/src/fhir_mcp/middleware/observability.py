from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
import time
from fhir_mcp.utils.logging import logger

class ProtocolTaggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        path = request.scope.get("path", "")
        # Tag logs based on the incoming request path
        # MCP SSE usually hits /message or /sse, stdio doesn't use HTTP middleware in the same way
        # but for SSE/HTTP modes, we can differentiate.
        protocol = "REST" if path.startswith("/api/v3") else "MCP"
        
        response = await call_next(request)
        
        process_time = (time.time() - start_time) * 1000
        logger.info(f"[{protocol}] {path} - {response.status_code} - {process_time:.2f}ms")
        
        return response
