import React from 'react';
import { IdData, DocumentType } from '../types';
import { formatAlphaNumeric, calculateCheckDigit, formatDate } from '../services/mrzUtils';

interface CalculationDetailsProps {
    data: IdData;
}

const CheckDigitRow: React.FC<{ label: string; data: string; result: string }> = ({ label, data, result }) => (
    <div className="py-2 border-b border-gray-800 last:border-b-0">
        <dt className="text-sm text-gray-400">{label}</dt>
        <dd className="mt-1 flex items-center justify-between gap-2">
            <span className="font-roboto-mono text-sm text-cyan-300 break-all">{data}</span>
            <span className="flex-shrink-0 font-roboto-mono text-lg font-bold text-green-400 bg-gray-900 px-2 py-0.5 rounded">{result}</span>
        </dd>
    </div>
);


const CalculationDetails: React.FC<CalculationDetailsProps> = ({ data }) => {
    // Recreate the exact data strings and check digits used in the generator for full transparency.
    const docNum = formatAlphaNumeric(data.documentNumber, 9);
    const dob = formatDate(data.dateOfBirth);
    const expiry = formatDate(data.expiryDate);

    const docNumCheck = calculateCheckDigit(docNum);
    const dobCheck = calculateCheckDigit(dob);
    const expiryCheck = calculateCheckDigit(expiry);

    let compositeData: string;
    let personalNumCheck: string | null = null;
    
    const personalNum = data.includePersonalNumberInMrz && data.personalNumber
            ? formatAlphaNumeric(data.personalNumber, 14)
            : '<'.repeat(14);

    if (data.documentType === DocumentType.ID_CARD) { // TD1
        const optionalData1 = data.includePersonalNumberInMrz && data.personalNumber
            ? formatAlphaNumeric(data.personalNumber, 15)
            : '<'.repeat(15);
        
        const optionalData2 = '<'.repeat(11);
        compositeData = 
            docNum + docNumCheck + optionalData1 +
            dob + dobCheck +
            expiry + expiryCheck +
            optionalData2;
    } else { // TD3
        personalNumCheck = calculateCheckDigit(personalNum);
        compositeData = docNum + docNumCheck + dob + dobCheck + expiry + expiryCheck + personalNum + personalNumCheck;
    }

    const overallCheck = calculateCheckDigit(compositeData);
    
    return (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <details>
                <summary className="cursor-pointer text-lg font-bold text-teal-400 list-none flex justify-between items-center transition-colors hover:text-teal-300">
                    Calculation Details
                    <svg className="w-5 h-5 text-gray-400 transition-transform transform details-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                
                <div className="mt-6">
                    <h4 className="text-base font-semibold text-gray-300 mb-2">Individual Field Check Digits</h4>
                     <div className="bg-gray-900/50 p-4 rounded-lg">
                        <dl>
                            <CheckDigitRow label="Document Number" data={docNum} result={docNumCheck} />
                            <CheckDigitRow label="Date of Birth" data={dob} result={dobCheck} />
                            <CheckDigitRow label="Expiry Date" data={expiry} result={expiryCheck} />
                            {data.documentType === DocumentType.PASSPORT && personalNumCheck !== null && (
                                <CheckDigitRow 
                                    label="Personal Number / Optional" 
                                    data={personalNum}
                                    result={personalNumCheck} 
                                />
                            )}
                        </dl>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-base font-semibold text-gray-300 mb-2">Final (Composite) Check Digit</h4>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">
                           As per ICAO Doc 9303, the final check digit is calculated over a concatenation of several data fields AND their individual check digits (excluding fields like Nationality and Gender).
                        </p>
                        <dl>
                            <div>
                                <dt className="text-sm font-medium text-gray-300">Composite String Used for Calculation</dt>
                                <dd className="mt-1 font-roboto-mono text-sm break-all bg-gray-900 p-2 rounded leading-relaxed text-cyan-400">
                                    {compositeData.split('').map((char, i) => {
                                        const isCheckDigit = 
                                            (data.documentType === DocumentType.PASSPORT && (i === 9 || i === 16 || i === 23 || i === 38)) ||
                                            (data.documentType === DocumentType.ID_CARD && (i === 9 || i === 25 || i === 32));
                                        return <span key={i} className={isCheckDigit ? 'text-green-400 font-bold' : ''}>{char}</span>;
                                    })}
                                </dd>
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <dt className="text-sm font-medium text-gray-300">Calculated Final Check Digit</dt>
                                <dd className="font-roboto-mono text-2xl font-bold text-green-400 bg-gray-900 px-3 py-1 rounded">{overallCheck}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

            </details>
            <style>{`
                summary::-webkit-details-marker {
                    display: none;
                }
                details[open] > summary .details-arrow {
                    transform: rotate(180deg);
                }
            `}</style>
        </div>
    );
};

export default CalculationDetails;
