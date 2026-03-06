# FHIR-MCP-bridge V2: Clinical & Financial Intelligence Engine

Empowering AI agents to understand clinical semantics and the financial impact of healthcare data.

## 🧬 V2 Evolution: The Intelligence Layer
This phase transforms the data bridge into an intelligent clinical gateway. By integrating clinical terminology search with financial risk scoring, we enable real-time analysis of the EHR by AI agents.

### 🚀 Key Features
- **Deep Semantic Search**: Uses the DeepSense ICD-10 API to map imprecise natural language queries (e.g., "Shortness of breath") into valid billing and clinical codes.
- **Automated SNOMED Translation**: Real-time cross-walking from SNOMED-CT concepts found in clinical notes to ICD-10-CM classification for billing readiness.
- **HCC (Hierarchical Condition Category) Risk Scoring**: Dynamic identification of high-value clinical encounters through automated financial risk adjustment calculations.
- **Enhanced `Condition` Enrichment**: Automatically identifies and highlights comorbid conditions with high risk-adjustments during tool execution.

## 🛠️ Usage
```bash
# Configuration
export DEEPSENSE_API_KEY="your_clinical_key"

# Run the Intelligence Server
fhir-mcp-server --transport stdio
```

## 🧪 Intelligence Demo
Query: *"Find patients with high-risk diabetic conditions"*
The V2 engine will automatically resolve appropriate ICD-10 codes, cross-walk to SNOMED for clinical accuracy, and tag those conditions for financial impact analysis.

---
*Developed to bridge the gap between healthcare data access and automated clinical reasoning.*
