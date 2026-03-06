# FHIR-MCP Healthcare Data Bridge
### MCP Server Connecting AI Agents to EHR Systems via FHIR R4

**FHIR-MCP Bridge** is a production-grade MCP (Model Context Protocol) server that enables AI agents (like Claude Desktop) to interact directly with healthcare data using the FHIR R4 standard. It provides tools for searching clinical resources and looking up medical terminology, enabling natural-language clinical queries that were previously complex to implement.

## 🚀 Key Features

- **19 MCP Tools**: Comprehensive access to Patients, Conditions, Observations, Medications, Encounters, and more plus universal CRUD support.
- **Natural Language Interoperability**: Ask Claude "Find patients with diabetes who are on metformin" and the server handles the FHIR API calls.
- **Universal FHIR CRUD**: Perform full Create, Read, Update, and Delete operations on ANY FHIR resource type.
- **Dynamic Pagination**: Smart traversal of multi-page FHIR bundles for large clinical datasets.
- **Terminology Intelligence**: Integrated lookup for ICD-10-CM, SNOMED CT, LOINC, and RxNorm.
- **Composite Summaries**: Fast, parallel assembly of complete patient clinical overviews.
- **Enterprise Ready**: Supports SMART-on-FHIR OAuth 2.0 (Client Credentials & Auth Code) for Epic, Cerner, and HAPI.
- **Privacy First**: Stateless design with zero local PHI retention.

## 🛠️ MCP Tools Reference

| Tool | Description |
|------|-------------|
| `search_patients` | Demographics search (Name, DOB, MRN, Gender). |
| `search_conditions`| List active diagnoses for a specific patient. |
| `search_observations`| Vital signs and laboratory results with date filtering. |
| `read` | Retrieve any FHIR resource by ID (e.g., Patient/123). |
| `create` | Persist a new FHIR resource from a JSON payload. |
| `update` | Modify an existing FHIR resource by ID. |
| `delete` | Securely remove a FHIR resource by ID. |
| `get_patient_summary` | One-shot assembly of demographics + conditions + meds + vitals. |
| `lookup_icd10` | Intelligent ICD-10-CM diagnosis code lookup. |
| `get_capabilities`| Discovery of FHIR server supported resources and version. |
| `get_user` | Retrieve the authenticated user's FHIR profile (SMART-on-FHIR). |

## 📦 Quick Start

### 1. Installation
Clone the repository and install dependencies using `uv` or `pip`:

```bash
git clone https://github.com/piyush-health/fhir-mcp-server.git
cd fhir-mcp-server
pip install -e .
```

### 2. Configuration
Create a `.env` file (copied from `.env.example`):

```bash
FHIR_SERVER_BASE_URL=https://hapi.fhir.org/baseR4
FHIR_SERVER_DISABLE_AUTHORIZATION=true
```

### 3. Run the Server
The server supports both `stdio` (default for Claude Desktop) and `sse`:

```bash
# stdio mode
fhir-mcp-server --transport stdio

# sse mode (Web UI testing)
fhir-mcp-server --transport sse --port 8000
```

### 4. Connect to Claude Desktop
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fhir": {
      "command": "uv",
      "args": [
        "--directory",
        "/path/to/fhir-mcp-server",
        "run",
        "fhir-mcp-server"
      ]
    }
  }
}
```

## 🧪 Example Queries

- "What patients in the system are named John?"
- "Give me a clinical summary for Patient/12345."
- "What's the ICD-10 code for major depressive disorder?"
- "Find all systolic blood pressure readings in the last 6 months for patient John Smith."

## 🏗️ Architecture

The server acts as a stateless gateway, mapping MCP tool calls to FHIR REST queries, and formatting complex FHIR JSON responses into clean, LLM-optimized text summaries.

---
**Author:** Dr. Piyush Sharma (PT), MHA | **Build:** February 2026
