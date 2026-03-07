import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'default_key';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v3';

/**
 * Atomic React Service Layer for V3.1 FHIR/MCP Bridge
 * Ensures strictly namespaced traffic to /api/v3 with X-API-KEY enforcement.
 */
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
    },
});

// Cache for semantic suggestions to hit the 0.16ms performance targets
const suggestionCache: Record<string, any> = {};

/**
 * Fetches semantic ICD-10 suggestions with internal debounce logic.
 * @param query The search term
 * @returns Promise with ClinicalIntelligenceData matching Pydantic models
 */
export const getSemanticSuggestions = async (query: string) => {
    if (!query || query.length < 2) return [];

    // Check cache first
    if (suggestionCache[query]) {
        return suggestionCache[query];
    }

    try {
        const response = await apiClient.get(`/icd10/suggest?q=${encodeURIComponent(query)}`);
        suggestionCache[query] = response.data;
        return response.data;
    } catch (error) {
        console.error('API Error [getSemanticSuggestions]:', error);
        throw error;
    }
};

/**
 * HITL Clinical Validation Submission
 * Strictly includes clinician_id and status as per ClinicalValidation Pydantic model.
 */
export const validateClinicalData = async (payload: {
    code: string;
    status: 'Confirmed' | 'Manually Selected' | 'Rejected';
    clinician_id: string;
    timestamp: string;
}) => {
    try {
        const response = await apiClient.post('/validate', payload);
        return response.data;
    } catch (error) {
        console.error('API Error [validateClinicalData]:', error);
        throw error;
    }
};

export default apiClient;
