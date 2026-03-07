import React from 'react';

interface ClinicalIntelligenceData {
    original: string;
    system: string;
    mapped_icd10?: string;
    status?: string;
    hcc_data: {
        hcc_impact: bool;
        category: str;
        weight: float;
        description: str;
    };
}

interface SuggestionCardProps {
    data?: ClinicalIntelligenceData;
    isLoading?: boolean;
    onApprove?: (data: ClinicalIntelligenceData) => void;
}

/**
 * High-fidelity SuggestionCard with Loading/Success/No Results states.
 * Adheres to UI-UX Pro Max medical safety constraints.
 */
const SuggestionCard: React.FC<SuggestionCardProps> = ({ data, isLoading, onApprove }) => {
    if (isLoading) {
        return (
            <div className="p-4 bg-gray-100 rounded-lg animate-pulse border-l-4 border-blue-500 mb-4 h-32 flex items-center justify-center">
                <span className="text-gray-400 font-medium">Analyzing clinical context...</span>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 bg-blue-50/30 rounded-lg border border-blue-200 border-dashed mb-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-blue-900 font-semibold mb-1">No clinical matches found</h3>
                <p className="text-blue-700 text-sm">Try a different term or input a manual entry for verification.</p>
            </div>
        );
    }

    const { hcc_data } = data;

    return (
        <div className="group relative p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-400 transition-all duration-200 mb-4 overflow-hidden">
            {/* High-Contrast Impact Indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full ${hcc_data.hcc_impact ? 'bg-red-500' : 'bg-green-500'}`} />

            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Extracted Source</span>
                    <p className="text-gray-900 font-bold text-lg leading-tight">{data.original}</p>
                </div>
                {hcc_data.hcc_impact && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                        HCC Risk
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 block uppercase">Mapped ICD-10</span>
                    <span className="text-blue-600 font-black text-xl leading-none">{data.mapped_icd10 || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 block uppercase">Weight Impact</span>
                    <span className="text-gray-900 font-black text-xl leading-none">{hcc_data.weight.toFixed(3)}</span>
                </div>
            </div>

            <div className="mb-4">
                <span className="text-[10px] font-bold text-gray-500 block uppercase mb-1">Category Detail</span>
                <p className="text-gray-700 text-sm leading-snug">{hcc_data.description}</p>
            </div>

            {/* EHR Pro-Max Action Button (>44px touch target) */}
            <button
                onClick={() => onApprove?.(data)}
                className="w-full h-12 bg-gray-900 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:scale-[1.01] transform active:scale-[0.98]"
            >
                <span>Approve & Add to Chart</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </button>
        </div>
    );
};

export default SuggestionCard;
