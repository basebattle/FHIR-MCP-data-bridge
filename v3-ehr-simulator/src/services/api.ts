import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v3';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
    },
});

const suggestionCache: Record<string, any> = {};

export const getSemanticSuggestions = async (query: string) => {
    if (!query || query.length < 3) return [];
    if (suggestionCache[query]) return suggestionCache[query];

    try {
        if (!API_KEY || API_KEY === 'default_key') {
            throw new Error('Simulation Mode: Missing valid X-API-KEY');
        }
        const response = await apiClient.get(`/icd10/suggest?q=${encodeURIComponent(query)}`);
        suggestionCache[query] = response.data;
        return response.data;
    } catch (error) {
        console.warn('API Error [getSemanticSuggestions] Fallback to Simulation Mode:', error);

        // Mock ClinicalIntelligenceData Fallback
        return [{
            original: query,
            system: "ICD-10-CM (Simulation)",
            mapped_icd10: "Z99.89",
            status: "Simulated",
            hcc_data: {
                hcc_impact: true,
                category: "Simulation Category",
                weight: 0.250,
                description: "This is simulated data due to API unavailability."
            }
        }];
    }
};

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
