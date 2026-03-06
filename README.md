# FHIR-MCP-bridge V3.1: Dual-Protocol Clinical Intelligence Hub

Transforming raw FHIR data into high-availability Medical Intelligence via a unified FastAPI & FastMCP gateway.

## 🏛️ V3 Evolution: The Enterprise Hub
This version represents the final architectural reduction, moving from a simple tool connector to a production-grade Clinical Intelligence Gateway. Designed to support both autonomous AI Agents and Ambient EHR Sidecar UIs from a single source of truth.

### 🚀 Key Capabilities
- **Dual-Protocol Access**: Unified architecture powering both **AI Agents (MCP)** and **Clinical UI Sidecars (REST)** under one service instance.
- **Namespaced Gateway**: Path isolation to ensure high-latency AI requests (`/mcp`) never collide with high-frequency UI requests (`/api/v3`).
- **Cross-Protocol Caching**: Shared memory pool via `aiocache` ensuring that intelligence discovered by an agent is instantly ready for a human clinician.
- **Protocol-Aware Telemetry**: Granular logging with protocol tagging for detailed operational observability and debugging.
- **Human-in-the-Loop (HITL)**: Advanced models and endpoints to record clinical validation and manual overrides for audit trails.
- **SMART-on-FHIR Ready**: Hardened gateway with dynamic CORS whitelisting and API Key enforcement.

## 🛠️ Deploying the Hub
To bypass local environment constraints and ensure perfect module resolution, utilize the native launcher:

```bash
# Configuration
export DEEPSENSE_API_KEY="your_api_key"
export INTERNAL_API_KEY="your_frontend_secret"

# Launch the Unified Discovery Engine
python3 run_server.py
```

## 🧪 Parity Verification
```bash
# Verifies clinical logic alignment across both REST and MCP protocols
python3 debug_client.py
```

---
*Built as a resilient, production-ready specification for the next generation of ambient medical intelligence.*
