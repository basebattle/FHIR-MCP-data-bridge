import asyncio
import argparse
import sys
from fhir_mcp.server import create_server
from fhir_mcp.config.settings import Settings
from fhir_mcp.utils.logging import setup_logging

def main():
    parser = argparse.ArgumentParser(description="FHIR R4 MCP Server")
    parser.add_argument("--transport", choices=["stdio", "sse"], default=None, help="Transport type")
    parser.add_argument("--port", type=int, default=None, help="Port for SSE transport")
    args = parser.parse_args()

    settings = Settings()
    setup_logging(settings.log_level)
    
    transport = args.transport or settings.mcp_transport
    port = args.port or settings.mcp_server_port

    server = create_server()

    if transport == "stdio":
        server.run_stdio()
    else:
        # For SSE, we use uvicorn to run the internal app
        server.run_sse()

if __name__ == "__main__":
    main()
