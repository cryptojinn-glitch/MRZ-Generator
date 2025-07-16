
import React, { useState, useCallback } from 'react';

interface MrzDisplayProps {
    mrzLines: string[];
}

const MrzDisplay: React.FC<MrzDisplayProps> = ({ mrzLines }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = useCallback(() => {
        const mrzText = mrzLines.join('\n');
        navigator.clipboard.writeText(mrzText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [mrzLines]);

    return (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-teal-400">Machine-Readable Zone (MRZ)</h3>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center px-4 py-2 bg-gray-700 hover:bg-teal-600 rounded-md transition-colors duration-200 text-sm font-semibold"
                >
                    {copied ? (
                         <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Copied!
                         </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Copy
                        </>
                    )}
                </button>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg font-roboto-mono text-lg text-green-300 whitespace-pre tracking-widest leading-relaxed overflow-x-auto">
                {mrzLines.map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
        </div>
    );
};

export default MrzDisplay;
