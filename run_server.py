import sys
import os

# Add the src directory to the Python path so local modules resolve correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

from fhir_mcp.server import create_app
import uvicorn

if __name__ == "__main__":
    app = create_app()
    print("\n🚀 Starting FHIR-MCP-data-bridge V3.1 Dual-Protocol Hub...")
    print("REST Endpoints available at: http://localhost:8000/api/v3")
    print("MCP SSE available at: http://localhost:8000/mcp/sse\n")
    # Run the unified server
    uvicorn.run(app, host="0.0.0.0", port=8000)
