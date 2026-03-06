# FHIR-MCP-data-bridge V1: Universal CRUD & SMART Auth

A clean interface connecting AI Agents to Healthcare Infrastructure via the Model Context Protocol (MCP).

## 🏢 V1 Overview: The Foundation
This version establishes the core connectivity layer between LLMs and Electronic Health Record (EHR) systems. It focuses on the strict enforcement of FHIR R4 resources and secure authorization patterns.

### 🚀 Key Features
- **Universal CRUD**: Full support for `read`, `create`, `update`, and `delete` operations across 20+ Patient-centric resources.
- **SMART-on-FHIR Auth**: Production-ready implementation of OAuth 2.0 Client Credentials and Auth Code flows.
- **Dynamic Pagination**: Transparent handling of FHIR `Bundle` paging for high-volume clinical data.
- **Strict Schema Enforcement**: Pydantic-validated tool inputs to ensure clean metadata ingestion.
- **Human-Readable Clinical Summaries**: Transforms complex nested FHIR JSON into clear clinical narratives for AI agents.

## 🛠️ Quick Start
```bash
# 1. Pipeline Installation
pip install fastmcp httpx pydantic-settings

# 2. Configure Your EHR Sandbox
export FHIR_SERVER_BASE_URL="https://hapi.fhir.org/baseR4"

# 3. Launch the Server
fhir-mcp-server --transport stdio
```

---
*Developed as the baseline integration for FHIR-powered AI agents.*
