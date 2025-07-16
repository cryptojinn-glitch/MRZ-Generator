import React, { useState, useEffect, useCallback } from 'react';
import { IdData, DocumentType, Gender } from './types';
import { generateTd1, generateTd3 } from './services/mrzGenerator';
import { generatePersonalNumber } from './services/personalNumberGenerator';
import { COUNTRIES, DOCUMENT_TYPES } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import InputField from './components/InputField';
import SelectField from './components/SelectField';
import IdCardPreview from './components/IdCardPreview';
import MrzDisplay from './components/MrzDisplay';

const App: React.FC = () => {
    const [idData, setIdData] = useState<IdData>({
        documentType: DocumentType.PASSPORT,
        issuingCountry: 'USA',
        documentNumber: 'L898902C',
        firstName: 'JOHN',
        lastName: 'DOE',
        nationality: 'USA',
        dateOfBirth: '1980-01-01',
        gender: Gender.MALE,
        expiryDate: '2030-01-01',
        personalNumber: '',
    });
    const [mrzLines, setMrzLines] = useState<string[]>([]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Let dates and other fields have their original casing for now
        if (name === 'documentNumber' || name === 'firstName' || name === 'lastName') {
            setIdData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setIdData(prev => ({ ...prev, [name]: value }));
        }
    }, []);
    
    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setIdData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleDocumentTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setIdData(prev => ({ ...prev, [name]: value as DocumentType }));
    }, []);

    const handleGeneratePersonalNumber = useCallback(() => {
        const newPersonalNumber = generatePersonalNumber(idData.issuingCountry, idData.documentType);
        setIdData(prev => ({ ...prev, personalNumber: newPersonalNumber }));
    }, [idData.issuingCountry, idData.documentType]);


    useEffect(() => {
        handleGeneratePersonalNumber();
    }, [idData.issuingCountry, idData.documentType, handleGeneratePersonalNumber]);


    useEffect(() => {
        try {
            if (idData.documentType === DocumentType.ID_CARD) {
                setMrzLines(generateTd1(idData));
            } else {
                setMrzLines(generateTd3(idData));
            }
        } catch (error) {
            console.error("Error generating MRZ:", error);
            setMrzLines(['Error generating MRZ. Check console for details.']);
        }
    }, [idData]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Form Section */}
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-teal-400">ID Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                label="Document Type"
                                name="documentType"
                                value={idData.documentType}
                                onChange={handleDocumentTypeChange}
                                options={DOCUMENT_TYPES}
                            />
                            <InputField
                                label="Document Number"
                                name="documentNumber"
                                value={idData.documentNumber}
                                onChange={handleInputChange}
                                maxLength={30}
                                placeholder="e.g., L898902C / 12345-1234567-1"
                            />
                            <InputField
                                label="Last Name(s)"
                                name="lastName"
                                value={idData.lastName}
                                onChange={handleInputChange}
                                placeholder="e.g., DOE"
                            />
                            <InputField
                                label="First Name(s)"
                                name="firstName"
                                value={idData.firstName}
                                onChange={handleInputChange}
                                placeholder="e.g., JOHN W"
                            />
                            <SelectField
                                label="Issuing Country"
                                name="issuingCountry"
                                value={idData.issuingCountry}
                                onChange={handleInputChange}
                                options={COUNTRIES}
                            />
                            <SelectField
                                label="Nationality"
                                name="nationality"
                                value={idData.nationality}
                                onChange={handleInputChange}
                                options={COUNTRIES}
                            />
                            <InputField
                                label="Date of Birth"
                                name="dateOfBirth"
                                type="date"
                                value={idData.dateOfBirth}
                                onChange={handleDateChange}
                            />
                            <SelectField
                                label="Gender"
                                name="gender"
                                value={idData.gender}
                                onChange={handleInputChange}
                                options={[
                                    { value: Gender.MALE, label: 'Male' },
                                    { value: Gender.FEMALE, label: 'Female' },
                                    { value: Gender.OTHER, label: 'Other/Unspecified' },
                                ]}
                            />
                            <InputField
                                label="Expiry Date"
                                name="expiryDate"
                                type="date"
                                value={idData.expiryDate}
                                onChange={handleDateChange}
                            />
                            <div className="md:col-span-1">
                                <label htmlFor="personalNumber" className="mb-1 block text-sm font-medium text-gray-400">Personal or ID (optional)</label>
                                <div className="relative">
                                    <input
                                        id="personalNumber"
                                        name="personalNumber"
                                        type="text"
                                        value={idData.personalNumber}
                                        onChange={handleInputChange}
                                        placeholder="Generated by country"
                                        maxLength={30}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md pl-3 pr-10 py-2 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleGeneratePersonalNumber}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-teal-400 transition-colors"
                                        aria-label="Generate new personal number"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview & MRZ Section */}
                    <div className="space-y-8">
                        <IdCardPreview data={idData} />
                        <MrzDisplay mrzLines={mrzLines} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;