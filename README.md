# FHIR-MCP Clinical Intelligence OS

**Autonomous bridge between clinical HL7 FHIR R4 resources and Agentic AI workflows.**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)

## Overview

The FHIR-MCP Data Bridge is a next-generation system integrating LLM agents securely with HL7 FHIR EHRs. It includes a robust Python backend built on Model Context Protocol (MCP) and a premium, high-fidelity React frontend (`v3-ehr-simulator`) designed for real-time clinical workflow simulation.

## Features

- **Cross-FHIR Resource Mapping**: Full support for `Patient`, `Observation`, `Condition`, `Encounter`, and `MedicationRequest`.
- **Autonomous Demo Orchestrator**: Simulates distinct medical scenarios (Heart Failure, COPD, DKA, Sepsis) with phase-based intelligence routing.
- **Premium Glassmorphism UI**: Uses `shadcn/ui`, `framer-motion`, and `21st.dev` Magic UI components to map live LLM execution timelines (`AnimatedList`), reasoning graphs (`AnimatedBeam`), and clinical vitals (`NumberTicker`, `BorderBeam`).
- **Confirmation Gates**: Secures side-effect heavy operations (PUT/DELETE) behind Human-in-the-Loop (HITL) checkpoints.

## Setup & Execution

### 1. Python MCP Backend

The core MCP server exposes the LLM tool schemas and HL7 APIs.

```bash
# Install dependencies
uv sync

# Run backend services
uv run run_server.py
```

### 2. EHR Frontend Simulator

The `v3-ehr-simulator` is a Next.js 16/React 19 application managing the simulated environment.

```bash
cd v3-ehr-simulator

# Install modules
npm install

# Start the frontend dev server
npm run dev
```

### 3. Running Automated Tests

```bash
uv run test_runner.py
```

## Portfolio Affiliation

*A project in the portfolio of Dr. Piyush Sharma (PT, MHA).*
