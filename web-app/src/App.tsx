import React from 'react';
import IntelligentSidebar from './components/Sidebar/IntelligentSidebar';

/**
 * EHR Simulator Main Entry Point
 * Implements high-fidelity "EHR Digital Twin" Layout (70/30 split).
 */
const App: React.FC = () => {
    return (
        <div className="flex w-full min-h-screen bg-white text-gray-900 font-sans">
            {/* Main Patient Dashboard (70% Width) */}
            <main className="flex-1 p-8 bg-gray-50/30 overflow-y-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <div className="text-[10px] bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-full inline-block mb-2 uppercase tracking-widest">
                            Clinical Patient Dashboard
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                            DOE, <span className="text-gray-400">JANE (Patient-1234)</span>
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-wider">DOB: 12/05/1982 | Sex: Female | MRN: 9988776655</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="h-10 px-6 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-black text-xs uppercase tracking-widest rounded-lg transition-transform active:scale-95 shadow-sm">
                            View History
                        </button>
                        <button className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-lg active:scale-95 ring-4 ring-red-100">
                            Stat Request
                        </button>
                    </div>
                </header>

                {/* Vitals Overview Hero Card */}
                <section className="grid grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Blood Pressure', value: '142/90', unit: 'mmHg', status: 'critical', trend: 'up' },
                        { label: 'Heart Rate', value: '88', unit: 'bpm', status: 'normal', trend: 'stable' },
                        { label: 'Oxygen Sat', value: '98', unit: '%', status: 'normal', trend: 'stable' },
                        { label: 'Glucose', value: '112', unit: 'mg/dL', status: 'warning', trend: 'down' }
                    ].map((vital, i) => (
                        <div key={i} className={`p-6 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${vital.status === 'critical' ? 'border-red-200' : 'border-gray-100'}`}>
                            <div className={`absolute top-0 right-0 w-24 h-24  opacity-[0.03]  ${vital.status === 'critical' ? 'text-red-600' : 'text-blue-600'}`}>
                                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{vital.label}</p>
                            <p className={`text-4xl font-black tracking-tighter ${vital.status === 'critical' ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{vital.value}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded">{vital.unit}</span>
                                <span className={`text-[10px] font-black uppercase ${vital.status === 'critical' ? 'text-red-500' : 'text-green-500'}`}>{vital.status}</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Diagnosis Table (Touch Optimized) */}
                <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter">Current Diagnosis & Conditions</h3>
                        <span className="text-[10px] font-black text-gray-400 uppercase">Last Updated: 10:11 AM</span>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 flex-none sticky top-0">
                            <tr className="border-b border-gray-100">
                                <th className="p-4 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">ICD-10-CM Code</th>
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="p-4 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications', status: 'Active' },
                                { code: 'I10', desc: 'Essential (primary) hypertension', status: 'Active' },
                                { code: 'Z00.00', desc: 'Encounter for general adult medical examination', status: 'Historical' }
                            ].map((row, i) => (
                                <tr key={i} className="group border-b border-gray-100 hover:bg-blue-50/10 transition-colors">
                                    <td className="p-4 px-8"><span className="font-black text-gray-900 font-mono tracking-tight text-lg">{row.code}</span></td>
                                    <td className="p-4 text-gray-700 font-bold text-sm">{row.desc}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{row.status}</span></td>
                                    <td className="p-4 px-8">
                                        <button className="h-10 px-4 bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all active:scale-95">Edit Record</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>

            {/* Intelligence Hub Sidecar (30% Width) */}
            <IntelligentSidebar />
        </div>
    );
};

export default App;
