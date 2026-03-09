export type EventType = 'alert' | 'order' | 'result' | 'assessment' | 'fhir';
export type Severity = 'critical' | 'warning' | 'normal' | 'info';
export type VitalTrend = 'up' | 'down' | 'stable';
export type DemoPhase = 'idle' | 'loading' | 'narrative' | 'intelligence' | 'hitl' | 'complete';

export interface TimelineEvent {
  id: string;
  time: string;
  type: EventType;
  title: string;
  body: string;
  fhirResource: string;
  severity: Severity;
}

export interface ClinicalScenario {
  id: string;
  name: string;
  patient: {
    name: string;
    dob: string;
    sex: string;
    mrn: string;
    condition: string;
  };
  vitals: {
    bp: { value: string; status: Severity; trend: number[] };
    hr: { value: string; status: Severity; trend: number[] };
    spo2: { value: string; status: Severity; trend: number[] };
    glucose: { value: string; status: Severity; trend: number[] };
  };
  events: TimelineEvent[];
  searchQuery: string;
  reasoningSteps: string[];
}

export const clinicalScenarios: ClinicalScenario[] = [
  {
    id: 'dka',
    name: 'Diabetic Ketoacidosis',
    patient: {
      name: 'Martinez, Elena',
      dob: '03/14/1968',
      sex: 'Female',
      mrn: '4412-88-9031',
      condition: 'Type 2 DM with DKA',
    },
    vitals: {
      bp:      { value: '158/96', status: 'critical', trend: [120, 128, 135, 142, 151, 158] },
      hr:      { value: '112',    status: 'warning',  trend: [76, 82, 89, 96, 104, 112] },
      spo2:    { value: '95',     status: 'warning',  trend: [99, 98, 97, 96, 95, 95] },
      glucose: { value: '487',    status: 'critical', trend: [140, 220, 310, 390, 450, 487] },
    },
    events: [
      {
        id: 'dka-1',
        time: '06:14',
        type: 'alert',
        title: 'Critical: Glucose 487 mg/dL',
        body: 'Point-of-care glucose critically elevated. Urinalysis positive for ketones 3+. Serum ketones pending.',
        fhirResource: 'Observation/glucose-poc-487',
        severity: 'critical',
      },
      {
        id: 'dka-2',
        time: '06:22',
        type: 'result',
        title: 'ABG Result: pH 7.21, HCO3 9',
        body: 'Arterial blood gas confirms metabolic acidosis with anion gap 24. pCO2 28 (compensatory).',
        fhirResource: 'DiagnosticReport/abg-20240614',
        severity: 'critical',
      },
      {
        id: 'dka-3',
        time: '06:35',
        type: 'order',
        title: 'IV Insulin Protocol Initiated',
        body: 'Regular insulin infusion started at 0.1 units/kg/hr. Normal saline 1L bolus ordered. Potassium repletion protocol activated.',
        fhirResource: 'MedicationRequest/insulin-infusion-001',
        severity: 'warning',
      },
      {
        id: 'dka-4',
        time: '07:00',
        type: 'assessment',
        title: 'Physician Assessment: DKA Confirmed',
        body: 'Meets all DKA criteria: hyperglycemia >250, ketonemia, pH <7.3. Admitted to medical ICU. HCC risk: High (RAF +0.87).',
        fhirResource: 'ClinicalImpression/dka-assessment-001',
        severity: 'critical',
      },
      {
        id: 'dka-5',
        time: '07:15',
        type: 'fhir',
        title: 'FHIR Condition Resource Created',
        body: 'ICD-10 E13.10 (DKA without coma) staged for chart. Awaiting clinician approval before FHIR commit.',
        fhirResource: 'Condition/e1310-staged-001',
        severity: 'info',
      },
      {
        id: 'dka-6',
        time: '07:18',
        type: 'fhir',
        title: 'HCC Risk Score Updated',
        body: 'RAF score delta: +0.87. Annual revenue impact estimate: +$4,200. Requires attestation within 72h.',
        fhirResource: 'RiskAssessment/hcc-dka-2024',
        severity: 'info',
      },
    ],
    searchQuery: 'diabetic ketoacidosis type 2 DM hyperglycemia metabolic acidosis E13.10',
    reasoningSteps: [
      'Parsing FHIR Observation bundle — glucose 487 mg/dL, ketones 3+',
      'Matching clinical context to ICD-10 Chapter IV (Endocrine/Metabolic)',
      'Differential: E11.10 vs E13.10 — secondary DM markers detected',
      'Validating HCC assignment: Category 18 — Diabetes with Acute Complications',
      'Computing RAF delta: baseline 1.03 → proposed 1.90 (+0.87)',
      'Generating FHIR Condition resource draft for clinician review',
    ],
  },
  {
    id: 'ami',
    name: 'Acute Myocardial Infarction',
    patient: {
      name: 'Thompson, Robert',
      dob: '09/22/1955',
      sex: 'Male',
      mrn: '7723-14-5502',
      condition: 'NSTEMI — Anterior Wall',
    },
    vitals: {
      bp:      { value: '168/102', status: 'critical', trend: [130, 140, 148, 158, 164, 168] },
      hr:      { value: '96',      status: 'warning',  trend: [68, 72, 78, 84, 90, 96] },
      spo2:    { value: '92',      status: 'critical', trend: [99, 97, 95, 93, 92, 92] },
      glucose: { value: '118',     status: 'normal',   trend: [110, 112, 115, 116, 117, 118] },
    },
    events: [
      {
        id: 'ami-1',
        time: '14:03',
        type: 'alert',
        title: 'Critical: Troponin I 4.8 ng/mL',
        body: 'High-sensitivity troponin significantly elevated. Delta troponin at 3h: +3.2 ng/mL. NSTEMI pattern confirmed.',
        fhirResource: 'Observation/troponin-hs-001',
        severity: 'critical',
      },
      {
        id: 'ami-2',
        time: '14:12',
        type: 'result',
        title: '12-Lead ECG: ST Depression V3-V5',
        body: 'New ST depression 2mm leads V3 through V5. No ST elevation. Reciprocal changes in aVL. Cardiology paged STAT.',
        fhirResource: 'DiagnosticReport/ecg-12lead-20240614',
        severity: 'critical',
      },
      {
        id: 'ami-3',
        time: '14:20',
        type: 'order',
        title: 'ACS Protocol Activated',
        body: 'Aspirin 325mg PO loaded. Heparin infusion started. Ticagrelor 180mg PO. Cath lab on standby for urgent PCI.',
        fhirResource: 'CarePlan/acs-protocol-thompson',
        severity: 'warning',
      },
      {
        id: 'ami-4',
        time: '14:45',
        type: 'assessment',
        title: 'Cardiology: NSTEMI Confirmed',
        body: 'TIMI score 5/7 — high risk. Urgent invasive strategy indicated. Planned left heart catheterization within 2h.',
        fhirResource: 'ClinicalImpression/nstemi-cardiology-001',
        severity: 'critical',
      },
      {
        id: 'ami-5',
        time: '14:52',
        type: 'fhir',
        title: 'FHIR Condition Staged: I21.19',
        body: 'ICD-10 I21.19 (NSTEMI involving other coronary artery) drafted. Pending cardiologist attestation.',
        fhirResource: 'Condition/i2119-staged-001',
        severity: 'info',
      },
      {
        id: 'ami-6',
        time: '14:55',
        type: 'fhir',
        title: 'HCC Category 87 — Flagged',
        body: 'HCC 87: Unstable Angina/NSTEMI. RAF impact: +1.24. Quality measure triggered: AMI-2 (beta-blocker at discharge).',
        fhirResource: 'RiskAssessment/hcc-ami-2024',
        severity: 'info',
      },
    ],
    searchQuery: 'NSTEMI acute coronary syndrome troponin ST depression I21.19 HCC 87',
    reasoningSteps: [
      'Parsing FHIR DiagnosticReport — ECG + troponin delta analysis',
      'Identifying ACS pattern: NSTEMI vs STEMI differentiation',
      'Cross-referencing ICD-10 I21 subcategory — vessel specificity needed',
      'HCC Category 87 match confirmed — high severity weight',
      'Computing quality measure applicability: AMI-2, AMI-7, AMI-8',
      'Generating attestation bundle with supporting clinical evidence',
    ],
  },
  {
    id: 'copd',
    name: 'COPD Exacerbation',
    patient: {
      name: 'Kowalski, Bernard',
      dob: '11/08/1948',
      sex: 'Male',
      mrn: '3309-67-1144',
      condition: 'COPD — Severe Exacerbation',
    },
    vitals: {
      bp:      { value: '138/88', status: 'warning', trend: [125, 128, 132, 135, 136, 138] },
      hr:      { value: '104',    status: 'warning', trend: [78, 84, 90, 96, 100, 104] },
      spo2:    { value: '84',     status: 'critical', trend: [91, 89, 88, 86, 85, 84] },
      glucose: { value: '132',    status: 'normal',  trend: [118, 120, 124, 128, 130, 132] },
    },
    events: [
      {
        id: 'copd-1',
        time: '10:22',
        type: 'alert',
        title: 'Critical: SpO2 84% on Room Air',
        body: 'Oxygen saturation critically low. Accessory muscle use noted. Respiratory rate 28/min. BiPAP initiated.',
        fhirResource: 'Observation/spo2-84-001',
        severity: 'critical',
      },
      {
        id: 'copd-2',
        time: '10:30',
        type: 'result',
        title: 'ABG: pH 7.34, pCO2 58, pO2 52',
        body: 'Chronic hypercapnia with acute-on-chronic respiratory failure. pCO2 elevated above baseline of 48. Class II respiratory failure.',
        fhirResource: 'DiagnosticReport/abg-copd-20240614',
        severity: 'critical',
      },
      {
        id: 'copd-3',
        time: '10:45',
        type: 'order',
        title: 'Bronchodilator + Steroid Protocol',
        body: 'Albuterol + ipratropium nebulizers q20min x3. Methylprednisolone 125mg IV. Magnesium 2g IV. Chest X-ray ordered.',
        fhirResource: 'MedicationRequest/copd-protocol-kowalski',
        severity: 'warning',
      },
      {
        id: 'copd-4',
        time: '11:10',
        type: 'assessment',
        title: 'Pulmonology: Severe COPD Exacerbation',
        body: 'GOLD Stage IV COPD exacerbation. Baseline FEV1 28% predicted. ICU admission for BiPAP monitoring and possible intubation.',
        fhirResource: 'ClinicalImpression/copd-pulm-001',
        severity: 'critical',
      },
      {
        id: 'copd-5',
        time: '11:18',
        type: 'fhir',
        title: 'FHIR Condition Staged: J44.1',
        body: 'ICD-10 J44.1 (COPD with acute exacerbation) drafted. Secondary: J96.01 (acute-on-chronic respiratory failure).',
        fhirResource: 'Condition/j441-staged-001',
        severity: 'info',
      },
      {
        id: 'copd-6',
        time: '11:21',
        type: 'fhir',
        title: 'HCC Category 111 + 84 — Dual Match',
        body: 'HCC 111: COPD. HCC 84: Cardio-Respiratory Failure. Combined RAF: +1.89. DRG shift: 190→189 (+$2,800).',
        fhirResource: 'RiskAssessment/hcc-copd-2024',
        severity: 'info',
      },
    ],
    searchQuery: 'COPD exacerbation respiratory failure hypercapnia J44.1 J96.01 HCC 111',
    reasoningSteps: [
      'Parsing FHIR Observation bundle — SpO2, ABG, respiratory rate',
      'Classifying COPD severity: GOLD staging from prior PFT data',
      'Identifying acute-on-chronic pattern — J44.1 primary, J96 secondary',
      'HCC dual-match: Category 111 (COPD) + Category 84 (resp. failure)',
      'DRG impact analysis: MDC 04, expected LOS delta 1.4 days',
      'Generating multi-condition FHIR bundle with sequencing rules',
    ],
  },
  {
    id: 'sepsis',
    name: 'Sepsis Workup',
    patient: {
      name: 'Okafor, Adaeze',
      dob: '06/30/1972',
      sex: 'Female',
      mrn: '8801-23-7765',
      condition: 'Sepsis — Urinary Source',
    },
    vitals: {
      bp:      { value: '88/56',  status: 'critical', trend: [118, 108, 100, 94, 90, 88] },
      hr:      { value: '128',    status: 'critical', trend: [88, 98, 108, 116, 122, 128] },
      spo2:    { value: '94',     status: 'warning',  trend: [98, 97, 96, 95, 94, 94] },
      glucose: { value: '178',    status: 'warning',  trend: [142, 150, 158, 165, 172, 178] },
    },
    events: [
      {
        id: 'sep-1',
        time: '02:47',
        type: 'alert',
        title: 'SEPSIS ALERT: qSOFA Score 3',
        body: 'Automated sepsis alert triggered. qSOFA criteria met: altered mentation, RR >22, SBP <100. Sepsis bundle initiated.',
        fhirResource: 'Flag/sepsis-alert-001',
        severity: 'critical',
      },
      {
        id: 'sep-2',
        time: '02:55',
        type: 'result',
        title: 'Labs: Lactate 4.2, WBC 22k, Procalcitonin 18',
        body: 'Lactic acidosis confirms septic shock threshold. Procalcitonin highly elevated. Blood cultures x2 drawn. UA: 50+ WBC, bacteriuria.',
        fhirResource: 'DiagnosticReport/sepsis-labs-20240614',
        severity: 'critical',
      },
      {
        id: 'sep-3',
        time: '03:02',
        type: 'order',
        title: 'Hour-1 Sepsis Bundle Activated',
        body: '30mL/kg NS bolus initiated. Vancomycin + pip-tazo ordered. Norepinephrine started at 0.1 mcg/kg/min. CVL placement in progress.',
        fhirResource: 'CarePlan/sepsis-bundle-okafor',
        severity: 'critical',
      },
      {
        id: 'sep-4',
        time: '03:20',
        type: 'assessment',
        title: 'ID + Critical Care: Septic Shock',
        body: 'Meets Sepsis-3 criteria for septic shock (MAP <65 + vasopressors + lactate >2). Source: UTI/urosepsis. ICU admission.',
        fhirResource: 'ClinicalImpression/septicshock-001',
        severity: 'critical',
      },
      {
        id: 'sep-5',
        time: '03:28',
        type: 'fhir',
        title: 'FHIR Conditions Staged: A41.9 + R65.21',
        body: 'Primary: A41.9 (Sepsis, unspecified organism). Secondary: R65.21 (Severe sepsis with septic shock). MCC flag set.',
        fhirResource: 'Condition/a419-r6521-staged-001',
        severity: 'info',
      },
      {
        id: 'sep-6',
        time: '03:31',
        type: 'fhir',
        title: 'MCC + DRG Impact: $18,400 Uplift',
        body: 'MCC: Septic shock upgrades DRG 871→870. HCC 2: Septicemia. RAF +2.1. Expected 12-day LOS with ICU component.',
        fhirResource: 'RiskAssessment/hcc-sepsis-2024',
        severity: 'info',
      },
    ],
    searchQuery: 'septic shock urosepsis A41.9 R65.21 severe sepsis lactic acidosis HCC 2',
    reasoningSteps: [
      'Parsing FHIR Flag resource — sepsis alert with qSOFA score 3',
      'Validating Sepsis-3 definition: MAP <65, vasopressors, lactate >2',
      'ICD-10 sequencing: A41.9 primary, R65.21 as manifestation code',
      'MCC classification confirmed — DRG upgrade pathway identified',
      'HCC Category 2: Septicemia, Sepsis, Systemic Inflammatory Response',
      'Building complete FHIR encounter bundle with ICD-10-PCS procedure codes',
    ],
  },
];
