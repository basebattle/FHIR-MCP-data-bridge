# FHIR-MCP Bridge: User Manual
### Professional Guide to AI-EHR Interoperability

This manual provides instructions for deploying, configuring, and using the FHIR-MCP Bridge to connect AI agents with clinical data.

---

## 1. Prerequisites

- **Python 3.12+**
- **uv** (recommended) or **pip**
- **FHIR Server URL**: Any R4-compliant endpoint (e.g., HAPI, Epic, Cerner)
- **Claude Desktop** (for use as an individual agent)

## 2. Setup and Installation

### Local Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/basebattle/FHIR-MCP-data-bridge.git
   cd FHIR-MCP-data-bridge
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```bash
   FHIR_SERVER_BASE_URL=https://hapi.fhir.org/baseR4
   FHIR_SERVER_DISABLE_AUTHORIZATION=true
   ```

3. **Install dependencies**:
   Using `uv`:
   ```bash
   uv pip install -e .
   ```
   Or using `pip`:
   ```bash
   pip install -e .
   ```

## 3. Usage with Claude Desktop

To use the FHIR-MCP Bridge as a tool for Claude, add it to your configuration file:

- **macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this entry:

```json
{
  "mcpServers": {
    "fhir": {
      "command": "uv",
      "args": [
        "--directory",
        "/ABSOLUTE/PATH/TO/FHIR-MCP-data-bridge",
        "run",
        "fhir-mcp-server"
      ]
    }
  }
}
```

## 4. Tool Reference

### Clinical Queries
- `search_patients(name=...)`: Search patient demographics.
- `search_conditions(patient=...)`: List active diagnoses for a patient.
- `search_observations(patient=..., code=...)`: Search vitals and labs (e.g., LOINC `4548-4` for A1c).
- `get_patient_summary(patient_id=...)`: Unified clinical overview.

### Terminology Lookup
- `lookup_icd10(query=...)`: Identify diagnosis codes for reporting.
- `lookup_rxnorm(query=...)`: Identify medication codes and dosages.

## 5. Hosting Strategy

### Option A: Local Execution (Stdio)
Best for developers and individual clinical informaticists. The server runs as a child process of the MCP client (like Claude).

### Option B: Cloud Hosting (SSE)
Best for multi-user tools or web apps. 
1. **Deploy to Render/Fly.io**:
   - Use the provided `Dockerfile`.
   - Set `MCP_TRANSPORT=sse` and `MCP_SERVER_PORT=8080`.
   - Public URL will act as the SSE endpoint.
2. **Connect Remote Client**:
   ```json
   "fhir-remote": {
     "url": "https://your-fhir-mcp.render.com/sse"
   }
   ```

---
**Dr. Piyush Sharma (PT), MHA** | Healthcare AI Integration | 2026
