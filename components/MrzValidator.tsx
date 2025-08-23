
import React, { useState, useCallback } from 'react';
import { analyzeMrz } from '../services/mrzValidator';
import { MrzAnalysisResult, MrzFieldAnalysis } from '../types';

const MrzValidator: React.FC = () => {
    const [mrzInput, setMrzInput] = useState('');
    const [analysisResult, setAnalysisResult] = useState<MrzAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = useCallback(() => {
        setIsLoading(true);
        setAnalysisResult(null);
        // Simulate a short delay to show loading state, as analysis is very fast
        setTimeout(() => {
            const result = analyzeMrz(mrzInput);
            setAnalysisResult(result);
            setIsLoading(false);
        }, 300);
    }, [mrzInput]);

    const StatusIcon: React.FC<{ isValid: boolean }> = ({ isValid }) => {
        return isValid ? (
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ) : (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        );
    };

    const renderAnalysisTable = (fields: MrzFieldAnalysis[]) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800/50">
                    <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-300 sm:pl-6">Status</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Field</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Value</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300 hidden sm:table-cell">Position</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Actual CD</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Expected CD</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 bg-gray-900">
                    {fields.map((field, index) => (
                        <tr key={index} className={!field.isValid ? 'bg-red-900/20' : ''}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6"><StatusIcon isValid={field.isValid} /></td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{field.fieldName}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm font-roboto-mono text-cyan-300">{field.rawValue}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">{field.position}</td>
                            <td className={`whitespace-nowrap px-3 py-4 text-sm font-roboto-mono ${!field.isValid && field.hasCheckDigit ? 'text-red-400' : 'text-gray-300'}`}>{field.actualCheckDigit ?? 'N/A'}</td>
                            <td className={`whitespace-nowrap px-3 py-4 text-sm font-roboto-mono ${!field.isValid && field.hasCheckDigit ? 'text-green-400' : 'text-gray-300'}`}>{field.expectedCheckDigit ?? 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-teal-400">Paste MRZ Below</h2>
                <textarea
                    value={mrzInput}
                    onChange={(e) => setMrzInput(e.target.value)}
                    placeholder={`P<DEUMUSTERMANN<<ERIKA<<<<<<<<<<<<<<<<<<<<<<
C5J0F12341DEU7508103F3401310<<<<<<<<<<<<<<08`}
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-4 font-roboto-mono text-lg text-green-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition duration-200"
                />
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !mrzInput.trim()}
                        className="px-6 py-2 bg-teal-600 hover:bg-teal-500 rounded-md font-semibold text-white transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : "Analyze & Correct"}
                    </button>
                </div>
            </div>

            {analysisResult && (
                 <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 animate-fade-in space-y-8">
                    <div>
                         <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-teal-400">Analysis Result</h2>
                            {analysisResult.isFullyValid ? (
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-500/20 text-green-300">Valid</span>
                            ) : (
                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-500/20 text-red-300">Errors Found</span>
                            )}
                        </div>
                        {analysisResult.error && <p className="text-red-400">{analysisResult.error}</p>}
                        {!analysisResult.error && (
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Original MRZ</h3>
                                    <div className="bg-gray-900 p-4 rounded-lg font-roboto-mono text-base text-red-300 whitespace-pre tracking-widest leading-relaxed overflow-x-auto">
                                        {analysisResult.originalMrz.join('\n')}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Corrected MRZ</h3>
                                    <div className="bg-gray-900 p-4 rounded-lg font-roboto-mono text-base text-green-300 whitespace-pre tracking-widest leading-relaxed overflow-x-auto">
                                        {analysisResult.correctedMrz.join('\n')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {!analysisResult.error && renderAnalysisTable(analysisResult.fields)}
                </div>
            )}
        </div>
    );
};

export default MrzValidator;
