"use client";

export type VitalStatus = 'critical' | 'warning' | 'normal';

export interface VitalSign {
  label: string;
  value: string;
  unit: string;
  status: VitalStatus;
  history: number[];
}

export interface Condition {
  code: string;
  desc: string;
  status: string;
  hcc: boolean;
}

export interface TimelineEvent {
  id: string;
  delayMs: number;
  time: string;
  type: 'alert' | 'order' | 'result' | 'assessment' | 'fhir';
  title: string;
  body: string;
  severity: 'critical' | 'warning' | 'info';
  fhirResource?: string;
  mcpTool?: string;
  narration?: string;
}

export interface ReasoningStep {
  id: number;
  label: string;
  detail: string;
  status: 'complete' | 'pending';
  narration?: string;
}

export interface ClinicalScenario {
  id: string;
  name: string;
  tagline: string;
  color: string;
  patient: {
    name: string;
    firstName: string;
    dob: string;
    sex: string;
    mrn: string;
  };
  vitals: VitalSign[];
  conditions: Condition[];
  timelineEvents: TimelineEvent[];
  reasoningSteps: ReasoningStep[];
  demoSearchQuery: string;
}

/* ── Scenario 1: Heart Failure ──────────────────────────────── */
const HEART_FAILURE: ClinicalScenario = {
  id: 'hf',
  name: 'Heart Failure',
  tagline: 'I50.9 — Acute Decompensated HF',
  color: 'text-red-600',
  patient: { name: 'DOE', firstName: 'JANE', dob: '12/05/1982', sex: 'Female', mrn: '9988776655' },
  vitals: [
    { label: 'Blood Pressure', value: '182/118', unit: 'mmHg', status: 'critical', history: [140, 145, 152, 160, 168, 175, 182] },
    { label: 'Heart Rate', value: '108', unit: 'bpm', status: 'warning', history: [80, 84, 88, 92, 96, 102, 108] },
    { label: 'Oxygen Sat.', value: '91', unit: '%', status: 'critical', history: [98, 97, 96, 95, 93, 92, 91] },
    { label: 'Glucose', value: '128', unit: 'mg/dL', status: 'warning', history: [110, 112, 116, 120, 124, 126, 128] },
  ],
  conditions: [
    { code: 'I50.9', desc: 'Heart failure, unspecified', status: 'Active', hcc: true },
    { code: 'I10', desc: 'Essential (primary) hypertension', status: 'Active', hcc: true },
  ],
  timelineEvents: [
    { id: 'hf-01', delayMs: 0, time: '08:00', type: 'assessment', severity: 'critical', title: 'Patient Admitted — Heart Failure Intake', body: 'Jane Doe, 43F. Acute shortness of breath, bilateral lower extremity edema, 48h onset.', fhirResource: 'Encounter/HF-ADMIT-001', mcpTool: 'fhir_create_encounter' },
    { id: 'hf-02', delayMs: 2000, time: '08:14', type: 'alert', severity: 'critical', title: 'Critical BP Alert: 182/118 mmHg', body: 'Exceeds critical threshold (>180/120). Beta-blocker consideration flagged by MCP engine.', fhirResource: 'Observation/BP-001', mcpTool: 'fhir_read_observation' },
    { id: 'hf-03', delayMs: 4000, time: '08:16', type: 'order', severity: 'warning', title: 'Intelligence: Metoprolol Succinate 25mg', body: 'HCC weight: 0.331 (I50.9). HITL validation required before order is placed.', fhirResource: 'MedicationRequest/METRO-001', mcpTool: 'fhir_create_medicationrequest' },
    { id: 'hf-04', delayMs: 6500, time: '08:22', type: 'result', severity: 'critical', title: 'BNP Lab: 1,840 pg/mL (Ref: <100)', body: 'Consistent with severe HF decompensation. Loop diuretic protocol initiated.', fhirResource: 'Observation/BNP-001', mcpTool: 'fhir_read_observation' },
    { id: 'hf-05', delayMs: 9000, time: '08:35', type: 'assessment', severity: 'info', title: 'ICD-10 Confirmed: I50.9 — HCC Captured', body: 'HCC Category: Heart Failure. RAF weight: 0.331. Awaiting HITL approval.', fhirResource: 'Condition/HF-001', mcpTool: 'fhir_create_condition' },
    { id: 'hf-06', delayMs: 12000, time: '09:01', type: 'fhir', severity: 'info', title: 'FHIR Bundle Pushed — 5 Resources Synced', body: 'Encounter, 2x Observation, Condition, MedicationRequest pushed to FHIR R4 endpoint.', fhirResource: 'Bundle/HF-BUNDLE-001', mcpTool: 'fhir_create_bundle' },
  ],
  reasoningSteps: [
    { id: 1, label: 'FHIR Read', detail: 'Fetched Encounter + Observation bundle via fhir_read_observation', status: 'complete' },
    { id: 2, label: 'Semantic Parse', detail: 'Extracted: "shortness of breath", "edema", "bilateral"', status: 'complete' },
    { id: 3, label: 'ICD-10 Match', detail: 'I50.9 (Heart Failure, unspecified) — confidence: 94%', status: 'complete' },
    { id: 4, label: 'HCC Calc', detail: 'HCC Category confirmed. CMS RAF weight: 0.331', status: 'complete' },
    { id: 5, label: 'Drug Suggestion', detail: 'Metoprolol Succinate 25mg via clinical protocol engine', status: 'complete' },
    { id: 6, label: 'HITL Capture', detail: 'Awaiting clinician validation. Status: pending', status: 'pending' },
  ],
  demoSearchQuery: 'heart failure edema',
};

/* ── Scenario 2: COPD Exacerbation ─────────────────────────── */
const COPD_EXACERBATION: ClinicalScenario = {
  id: 'copd',
  name: 'COPD Exacerbation',
  tagline: 'J44.1 — COPD with Acute Exacerbation',
  color: 'text-amber-600',
  patient: { name: 'CHEN', firstName: 'ROBERT', dob: '04/17/1958', sex: 'Male', mrn: '7761234890' },
  vitals: [
    { label: 'Blood Pressure', value: '148/94', unit: 'mmHg', status: 'warning', history: [135, 138, 140, 144, 146, 147, 148] },
    { label: 'Heart Rate', value: '112', unit: 'bpm', status: 'warning', history: [78, 82, 88, 96, 104, 108, 112] },
    { label: 'Oxygen Sat.', value: '84', unit: '%', status: 'critical', history: [95, 93, 91, 89, 87, 86, 84] },
    { label: 'Resp. Rate', value: '28', unit: '/min', status: 'critical', history: [16, 18, 20, 22, 24, 26, 28] },
  ],
  conditions: [
    { code: 'J44.1', desc: 'Chronic obstructive pulmonary disease with (acute) exacerbation', status: 'Active', hcc: true },
    { code: 'J96.01', desc: 'Acute respiratory failure with hypoxia', status: 'Active', hcc: true },
  ],
  timelineEvents: [
    { id: 'copd-01', delayMs: 0, time: '10:15', type: 'assessment', severity: 'critical', title: 'COPD Exacerbation — ED Intake', body: 'Robert Chen, 67M. Progressive dyspnea 3 days, increased sputum production, worsening cough.', fhirResource: 'Encounter/COPD-001', mcpTool: 'fhir_create_encounter' },
    { id: 'copd-02', delayMs: 2000, time: '10:22', type: 'alert', severity: 'critical', title: 'Critical SpO₂: 84% on Room Air', body: 'Target: SpO₂ ≥ 90%. High-flow O₂ at 4L/min initiated via nasal cannula.', fhirResource: 'Observation/SPO2-001', mcpTool: 'fhir_read_observation' },
    { id: 'copd-03', delayMs: 4000, time: '10:28', type: 'order', severity: 'warning', title: 'Intelligence: Salbutamol + Ipratropium', body: 'Dual bronchodilator nebulization ordered. MCP confidence: 91%. HCC weight: 0.335.', fhirResource: 'MedicationRequest/SALB-001', mcpTool: 'fhir_create_medicationrequest' },
    { id: 'copd-04', delayMs: 6500, time: '10:40', type: 'result', severity: 'critical', title: 'ABG Result: pH 7.31, PaCO₂ 58 mmHg', body: 'Hypercapnic respiratory failure confirmed. BiPAP consideration initiated.', fhirResource: 'Observation/ABG-001', mcpTool: 'fhir_read_observation' },
    { id: 'copd-05', delayMs: 9000, time: '10:55', type: 'assessment', severity: 'info', title: 'ICD-10 Confirmed: J44.1 + J96.01', body: 'Dual HCC capture. Total RAF impact: 0.670. HITL validation pending.', fhirResource: 'Condition/COPD-001', mcpTool: 'fhir_create_condition' },
    { id: 'copd-06', delayMs: 12000, time: '11:20', type: 'fhir', severity: 'info', title: 'FHIR Bundle Synced — 6 Resources', body: 'Encounter, 3x Observation, 2x Condition pushed to endpoint.', fhirResource: 'Bundle/COPD-BUNDLE-001', mcpTool: 'fhir_create_bundle' },
  ],
  reasoningSteps: [
    { id: 1, label: 'FHIR Read', detail: 'Fetched Encounter + Observation via fhir_read_observation', status: 'complete' },
    { id: 2, label: 'Semantic Parse', detail: 'Extracted: "dyspnea", "sputum", "SpO₂ 84%"', status: 'complete' },
    { id: 3, label: 'ICD-10 Match', detail: 'J44.1 + J96.01 — dual-code strategy, confidence: 91%', status: 'complete' },
    { id: 4, label: 'HCC Calc', detail: 'Combined RAF weight: 0.670 (two HCC captures)', status: 'complete' },
    { id: 5, label: 'Drug Suggestion', detail: 'Salbutamol + Ipratropium via GOLD guidelines engine', status: 'complete' },
    { id: 6, label: 'HITL Capture', detail: 'Awaiting dual-code clinician sign-off', status: 'pending' },
  ],
  demoSearchQuery: 'COPD exacerbation dyspnea',
};

/* ── Scenario 3: Diabetic Ketoacidosis ──────────────────────── */
const DKA: ClinicalScenario = {
  id: 'dka',
  name: 'Diabetic Ketoacidosis',
  tagline: 'E13.10 — DKA without Coma',
  color: 'text-orange-600',
  patient: { name: 'SANTOS', firstName: 'MARIA', dob: '09/23/1994', sex: 'Female', mrn: '5541987320' },
  vitals: [
    { label: 'Blood Pressure', value: '100/62', unit: 'mmHg', status: 'critical', history: [118, 114, 110, 106, 104, 102, 100] },
    { label: 'Heart Rate', value: '122', unit: 'bpm', status: 'critical', history: [88, 94, 100, 108, 114, 118, 122] },
    { label: 'Oxygen Sat.', value: '97', unit: '%', status: 'normal', history: [99, 98, 98, 97, 97, 97, 97] },
    { label: 'Glucose', value: '487', unit: 'mg/dL', status: 'critical', history: [210, 280, 340, 400, 440, 465, 487] },
  ],
  conditions: [
    { code: 'E13.10', desc: 'Other specified diabetes mellitus with ketoacidosis without coma', status: 'Active', hcc: true },
    { code: 'E86.0', desc: 'Dehydration', status: 'Active', hcc: false },
  ],
  timelineEvents: [
    { id: 'dka-01', delayMs: 0, time: '14:30', type: 'assessment', severity: 'critical', title: 'DKA Intake — Metabolic Emergency', body: 'Maria Santos, 31F. Nausea, vomiting, abdominal pain, polyuria/polydipsia × 2 days. T1DM hx.', fhirResource: 'Encounter/DKA-001', mcpTool: 'fhir_create_encounter' },
    { id: 'dka-02', delayMs: 2000, time: '14:38', type: 'alert', severity: 'critical', title: 'Glucose 487 mg/dL — Ketosis Confirmed', body: 'Serum ketones: 6.2 mmol/L (positive). Anion gap: 22. Metabolic acidosis.', fhirResource: 'Observation/GLU-001', mcpTool: 'fhir_read_observation' },
    { id: 'dka-03', delayMs: 4000, time: '14:42', type: 'order', severity: 'critical', title: 'Intelligence: IV Insulin + NS Fluid Protocol', body: 'Regular insulin 0.1 units/kg/hr drip + 1L NS bolus. MCP confidence: 97%.', fhirResource: 'MedicationRequest/INS-001', mcpTool: 'fhir_create_medicationrequest' },
    { id: 'dka-04', delayMs: 6500, time: '15:00', type: 'result', severity: 'critical', title: 'ABG: pH 7.28 — Metabolic Acidosis Confirmed', body: 'Bicarbonate: 12 mEq/L. DKA protocol Stage 2. K+ monitoring q1h initiated.', fhirResource: 'Observation/ABG-002', mcpTool: 'fhir_read_observation' },
    { id: 'dka-05', delayMs: 9000, time: '15:15', type: 'assessment', severity: 'info', title: 'ICD-10 Confirmed: E13.10 — HCC Impact', body: 'HCC captured. CMS RAF weight: 0.302. HITL validation pending.', fhirResource: 'Condition/DKA-001', mcpTool: 'fhir_create_condition' },
    { id: 'dka-06', delayMs: 12000, time: '16:00', type: 'fhir', severity: 'info', title: 'FHIR Bundle Pushed — 5 Resources', body: 'Full metabolic panel, insulin drip order, and conditions synced.', fhirResource: 'Bundle/DKA-BUNDLE-001', mcpTool: 'fhir_create_bundle' },
  ],
  reasoningSteps: [
    { id: 1, label: 'FHIR Read', detail: 'Fetched labs: glucose, ketones, ABG, anion gap', status: 'complete' },
    { id: 2, label: 'Semantic Parse', detail: 'Extracted: "DKA", "hyperglycemia", "ketosis", "acidosis"', status: 'complete' },
    { id: 3, label: 'ICD-10 Match', detail: 'E13.10 — DKA without coma, confidence: 97%', status: 'complete' },
    { id: 4, label: 'HCC Calc', detail: 'HCC Category: Diabetes with Complications. RAF: 0.302', status: 'complete' },
    { id: 5, label: 'Drug Suggestion', detail: 'IV Insulin drip + NS bolus per ADA DKA protocol', status: 'complete' },
    { id: 6, label: 'HITL Capture', detail: 'Awaiting metabolic emergency co-sign', status: 'pending' },
  ],
  demoSearchQuery: 'diabetic ketoacidosis hyperglycemia',
};

/* ── Scenario 4: Sepsis ─────────────────────────────────────── */
const SEPSIS: ClinicalScenario = {
  id: 'sepsis',
  name: 'Sepsis — Bacteremia',
  tagline: 'A41.9 — Sepsis, Unspecified Organism',
  color: 'text-purple-600',
  patient: { name: 'WILSON', firstName: 'JAMES', dob: '06/14/1967', sex: 'Male', mrn: '3329871045' },
  vitals: [
    { label: 'Blood Pressure', value: '88/56', unit: 'mmHg', status: 'critical', history: [120, 112, 104, 98, 94, 90, 88] },
    { label: 'Heart Rate', value: '124', unit: 'bpm', status: 'critical', history: [90, 96, 104, 112, 116, 120, 124] },
    { label: 'Temp', value: '39.6', unit: '°C', status: 'critical', history: [37.2, 37.8, 38.4, 38.8, 39.1, 39.4, 39.6] },
    { label: 'Lactate', value: '4.2', unit: 'mmol/L', status: 'critical', history: [1.2, 1.8, 2.4, 3.0, 3.5, 3.9, 4.2] },
  ],
  conditions: [
    { code: 'A41.9', desc: 'Sepsis, unspecified organism', status: 'Active', hcc: true },
    { code: 'R65.20', desc: 'Severe sepsis without septic shock', status: 'Active', hcc: true },
  ],
  timelineEvents: [
    { id: 'sep-01', delayMs: 0, time: '02:15', type: 'assessment', severity: 'critical', title: 'Sepsis Alert — SOFA Score 6', body: 'James Wilson, 58M. Fever 39.6°C, hypotension, tachycardia. Suspected pneumonia source.', fhirResource: 'Encounter/SEP-001', mcpTool: 'fhir_create_encounter' },
    { id: 'sep-02', delayMs: 2000, time: '02:22', type: 'alert', severity: 'critical', title: 'qSOFA Positive — 3/3 Criteria Met', body: 'BP 88/56, RR 28, GCS change. Sepsis protocol activated. ICU transfer ordered.', fhirResource: 'Observation/SOFA-001', mcpTool: 'fhir_read_observation' },
    { id: 'sep-03', delayMs: 4000, time: '02:30', type: 'order', severity: 'critical', title: 'Intelligence: Piperacillin-Tazobactam IV', body: 'Broad-spectrum empiric ABX within 1h of sepsis identification. MCP confidence: 89%.', fhirResource: 'MedicationRequest/PIPT-001', mcpTool: 'fhir_create_medicationrequest' },
    { id: 'sep-04', delayMs: 6500, time: '02:45', type: 'result', severity: 'critical', title: 'Lactate 4.2 mmol/L — Tissue Hypoperfusion', body: '30mL/kg crystalloid resuscitation initiated. Vasopressor threshold met.', fhirResource: 'Observation/LAC-001', mcpTool: 'fhir_read_observation' },
    { id: 'sep-05', delayMs: 9000, time: '03:00', type: 'assessment', severity: 'info', title: 'ICD-10 Confirmed: A41.9 + R65.20', body: 'Dual HCC capture — Sepsis + Severe Sepsis. Total RAF: 0.788. HITL pending.', fhirResource: 'Condition/SEP-001', mcpTool: 'fhir_create_condition' },
    { id: 'sep-06', delayMs: 12000, time: '03:30', type: 'fhir', severity: 'info', title: 'FHIR Bundle Synced — ICU Handoff Package', body: 'Full encounter package: vitals stream, labs, orders, conditions — 8 resources.', fhirResource: 'Bundle/SEP-BUNDLE-001', mcpTool: 'fhir_create_bundle' },
  ],
  reasoningSteps: [
    { id: 1, label: 'FHIR Read', detail: 'Fetched SOFA score components + vital stream', status: 'complete' },
    { id: 2, label: 'Semantic Parse', detail: 'Extracted: "sepsis", "hypotension", "lactate", "fever"', status: 'complete' },
    { id: 3, label: 'ICD-10 Match', detail: 'A41.9 + R65.20 — sepsis severity dual-code, confidence: 89%', status: 'complete' },
    { id: 4, label: 'HCC Calc', detail: 'Combined RAF weight: 0.788 — highest severity tier', status: 'complete' },
    { id: 5, label: 'Drug Suggestion', detail: 'Pip-Tazo per Surviving Sepsis Campaign 2024 guidelines', status: 'complete' },
    { id: 6, label: 'HITL Capture', detail: 'Critical care physician sign-off required — ICU level', status: 'pending' },
  ],
  demoSearchQuery: 'sepsis bacteremia fever hypotension',
};

export const ALL_SCENARIOS: ClinicalScenario[] = [
  HEART_FAILURE, COPD_EXACERBATION, DKA, SEPSIS,
];

export function getRandomScenario(): ClinicalScenario {
  return ALL_SCENARIOS[Math.floor(Math.random() * ALL_SCENARIOS.length)];
}
