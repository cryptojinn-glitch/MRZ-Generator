import React, { useState, useEffect, useCallback } from 'react';
import { IdData, DocumentType, Gender } from './types';
import { generateTd1, generateTd3 } from './services/mrzGenerator';
import { generatePersonalNumber } from './services/personalNumberGenerator';
import { generateRandomIdData } from './services/randomDataGenerator';
import { COUNTRIES, DOCUMENT_TYPES } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import InputField from './components/InputField';
import SelectField from './components/SelectField';
import IdCardPreview from './components/IdCardPreview';
import MrzDisplay from './components/MrzDisplay';
import MrzValidator from './components/MrzValidator';
import CalculationDetails from './components/CalculationDetails';

// Helper to parse YYMMDD from MRZ to YYYY-MM-DD for form state
const parseMrzDate = (mrzDate: string): string => {
    const year = parseInt(mrzDate.substring(0, 2), 10);
    const month = mrzDate.substring(2, 4);
    const day = mrzDate.substring(4, 6);
    // Simple pivot year logic: years >= 70 are 19xx, others are 20xx
    const fullYear = year >= 70 ? 1900 + year : 2000 + year;
    return `${fullYear}-${month}-${day}`;
};

// Data from user prompt examples
const mrzExamples: (IdData & { description: string })[] = [
    {
        description: 'Example 1: Johnson (GBR)',
        documentType: DocumentType.PASSPORT,
        issuingCountry: 'GBR',
        documentNumber: '123456789',
        firstName: 'DAVID ANTHONY',
        lastName: 'JOHNSON',
        nationality: 'GBR',
        dateOfBirth: parseMrzDate('900415'),
        gender: Gender.MALE,
        dateOfIssue: '2020-01-28',
        expiryDate: parseMrzDate('300128'),
        personalNumber: '',
        includePersonalNumberInMrz: false,
    },
    {
        description: 'Example 2: Singh (IND)',
        documentType: DocumentType.PASSPORT,
        issuingCountry: 'IND',
        documentNumber: '482915367',
        firstName: 'AMRITPREET',
        lastName: 'SINGH',
        nationality: 'IND',
        dateOfBirth: parseMrzDate('850726'),
        gender: Gender.MALE,
        dateOfIssue: '2018-06-29',
        expiryDate: parseMrzDate('280629'),
        personalNumber: '',
        includePersonalNumberInMrz: false,
    },
    {
        description: 'Example 3: Baker (USA)',
        documentType: DocumentType.PASSPORT,
        issuingCountry: 'USA',
        documentNumber: 'A12345678',
        firstName: 'EMMA LEE',
        lastName: 'BAKER',
        nationality: 'USA',
        dateOfBirth: parseMrzDate('040229'),
        gender: Gender.FEMALE,
        dateOfIssue: '2018-12-31',
        expiryDate: parseMrzDate('281231'),
        personalNumber: '',
        includePersonalNumberInMrz: false,
    },
    {
        description: 'Example 4: Martin (CAN)',
        documentType: DocumentType.PASSPORT,
        issuingCountry: 'CAN',
        documentNumber: '987654321',
        firstName: 'OLIVIA',
        lastName: 'MARTIN',
        nationality: 'CAN',
        dateOfBirth: parseMrzDate('760101'),
        gender: Gender.MALE,
        dateOfIssue: '2015-06-29',
        expiryDate: parseMrzDate('250629'),
        personalNumber: '',
        includePersonalNumberInMrz: false,
    },
    {
        description: 'Example 5: Nguyen (AUS)',
        documentType: DocumentType.PASSPORT,
        issuingCountry: 'AUS',
        documentNumber: 'XZ9876543',
        firstName: 'LINH',
        lastName: 'NGUYEN',
        nationality: 'AUS',
        dateOfBirth: parseMrzDate('980715'),
        gender: Gender.FEMALE,
        dateOfIssue: '2018-08-29',
        expiryDate: parseMrzDate('280829'),
        personalNumber: '',
        includePersonalNumberInMrz: false,
    },
];

// A stable, verifiable initial state to prevent confusion from random data.
const initialIdData: IdData = {
    documentType: DocumentType.PASSPORT,
    issuingCountry: 'SGP',
    documentNumber: 'VIB2G5OQ0',
    firstName: 'JOSEPH',
    lastName: 'DAVIS',
    nationality: 'SGP',
    dateOfBirth: '1969-04-29',
    gender: Gender.MALE,
    dateOfIssue: '2004-10-04',
    expiryDate: '2014-10-04',
    personalNumber: '',
    includePersonalNumberInMrz: false,
};


const App: React.FC = () => {
    const [view, setView] = useState<'generator' | 'validator'>('generator');
    const [idData, setIdData] = useState<IdData>(initialIdData);
    const [mrzLines, setMrzLines] = useState<string[]>([]);
    const [passportValidity, setPassportValidity] = useState<number>(10);
    const [isDateLinked, setIsDateLinked] = useState<boolean>(true);

    const validityOptions = Array.from({ length: 15 }, (_, i) => ({
        value: String(i + 1),
        label: `${i + 1} Year${i > 0 ? 's' : ''}`
    }));

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        
        if (target.type === 'checkbox') {
            setIdData(prev => ({ ...prev, [name]: (target as HTMLInputElement).checked }));
            return;
        }

        let value = target.value;

        // Enforce uppercase for fields that are always uppercase in MRZ/ID
        if (['documentNumber', 'firstName', 'lastName', 'personalNumber'].includes(name)) {
            value = value.toUpperCase();
        }

        setIdData(prev => ({ ...prev, [name]: value }));

        if (name === 'documentType') {
            // Reset personal number when doc type changes
            setIdData(prev => ({ ...prev, personalNumber: '' }));
        }
    }, []);
    
    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (!isDateLinked) {
            setIdData(prev => ({...prev, [name]: value}));
            return;
        }
        
        const newDate = new Date(`${value}T00:00:00Z`);
        if (isNaN(newDate.getTime())) return;

        let newIssueDate = idData.dateOfIssue;
        let newExpiryDate = idData.expiryDate;
        
        if (name === 'dateOfIssue') {
            newIssueDate = value;
            const expiry = new Date(newDate);
            expiry.setUTCFullYear(expiry.getUTCFullYear() + passportValidity);
            newExpiryDate = expiry.toISOString().split('T')[0];
        } else if (name === 'expiryDate') {
            newExpiryDate = value;
            const issue = new Date(newDate);
            issue.setUTCFullYear(issue.getUTCFullYear() - passportValidity);
            newIssueDate = issue.toISOString().split('T')[0];
        }

        setIdData(prev => ({ ...prev, dateOfIssue: newIssueDate, expiryDate: newExpiryDate }));

    }, [isDateLinked, passportValidity, idData.dateOfIssue, idData.expiryDate]);


    // Effect to auto-update expiry date when passport validity changes
    useEffect(() => {
        if (idData.documentType === DocumentType.PASSPORT && isDateLinked && idData.dateOfIssue) {
            const issueDate = new Date(`${idData.dateOfIssue}T00:00:00Z`);
            if (!isNaN(issueDate.getTime())) {
                const newExpiryDate = new Date(issueDate);
                newExpiryDate.setUTCFullYear(newExpiryDate.getUTCFullYear() + passportValidity);
                setIdData(prev => ({ ...prev, expiryDate: newExpiryDate.toISOString().split('T')[0] }));
            }
        }
    }, [passportValidity, isDateLinked, idData.documentType]);

    // Main effect to generate MRZ when data changes
    useEffect(() => {
        const generate = () => {
            if (idData.documentType === DocumentType.ID_CARD) {
                setMrzLines(generateTd1(idData));
            } else {
                setMrzLines(generateTd3(idData));
            }
        };
        generate();
    }, [idData]);

    // Effect for auto-generating personal number
    useEffect(() => {
        if (idData.includePersonalNumberInMrz && !idData.personalNumber) {
             setIdData(prev => ({...prev, personalNumber: generatePersonalNumber(prev.issuingCountry, prev.documentType)}));
        }
    }, [idData.includePersonalNumberInMrz, idData.issuingCountry, idData.documentType, idData.personalNumber]);
    
    const handleLoadExample = useCallback((index: number) => {
        const example = mrzExamples[index];
        setIdData(example);
        if (example.documentType === DocumentType.PASSPORT) {
            const issue = new Date(`${example.dateOfIssue}T00:00:00Z`);
            const expiry = new Date(`${example.expiryDate}T00:00:00Z`);
            const years = expiry.getUTCFullYear() - issue.getUTCFullYear();
            setPassportValidity(years > 0 && years <= 15 ? years : 10);
            setIsDateLinked(true); // Always re-link on loading an example
        }
    }, []);

    const handleRandom = useCallback(() => {
        const randomData = generateRandomIdData();
        setIdData(randomData);
         if (randomData.documentType === DocumentType.PASSPORT) {
            const issue = new Date(`${randomData.dateOfIssue}T00:00:00Z`);
            const expiry = new Date(`${randomData.expiryDate}T00:00:00Z`);
            const years = expiry.getUTCFullYear() - issue.getUTCFullYear();
            setPassportValidity(years > 0 && years <= 15 ? years : 10);
            setIsDateLinked(true);
        }
    }, []);


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-grow">
                 <div className="flex justify-center mb-8">
                    <div className="bg-gray-800 p-1 rounded-lg flex space-x-1">
                        <button onClick={() => setView('generator')} className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${view === 'generator' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Generator</button>
                        <button onClick={() => setView('validator')} className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${view === 'validator' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Validator</button>
                    </div>
                </div>

                {view === 'generator' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
                        {/* Left Column: ID Details Form */}
                        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 space-y-4">
                            <h2 className="text-2xl font-bold mb-2 text-teal-400">ID Details</h2>
                             {/* Controls */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <SelectField
                                    label="Load Example"
                                    name="example"
                                    value=""
                                    onChange={(e) => handleLoadExample(parseInt(e.target.value, 10))}
                                    options={[{value: "", label: "Select an example..."}, ...mrzExamples.map((ex, i) => ({ value: String(i), label: ex.description }))]}
                                />
                                <button onClick={handleRandom} className="w-full h-10 px-6 bg-gray-700 hover:bg-teal-600 rounded-md font-semibold text-white transition-colors duration-200">Random</button>
                            </div>
                            <hr className="border-gray-700" />
                            {/* Form Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectField label="Document Type" name="documentType" value={idData.documentType} onChange={handleInputChange} options={DOCUMENT_TYPES} />
                                <InputField label="Document Number" name="documentNumber" value={idData.documentNumber} onChange={handleInputChange} maxLength={9} />

                                <SelectField label="Issuing Country" name="issuingCountry" value={idData.issuingCountry} onChange={handleInputChange} options={COUNTRIES} />
                                <SelectField label="Nationality" name="nationality" value={idData.nationality} onChange={handleInputChange} options={COUNTRIES} />
                                
                                <InputField label="Last Name(s) (Surname)" name="lastName" value={idData.lastName} onChange={handleInputChange} placeholder="e.g. DOE" />
                                <InputField label="First Name(s) (Given Names)" name="firstName" value={idData.firstName} onChange={handleInputChange} placeholder="e.g. JOHN" />
                                
                                <InputField label="Date of Birth" name="dateOfBirth" value={idData.dateOfBirth} onChange={handleInputChange} type="date" />
                                <SelectField label="Gender" name="gender" value={idData.gender} onChange={handleInputChange} options={[{ value: Gender.MALE, label: 'Male' }, { value: Gender.FEMALE, label: 'Female' }, { value: Gender.OTHER, label: 'Other/Unspecified' }]} />
                                
                                {idData.documentType === DocumentType.PASSPORT && (
                                    <>
                                        <div className="sm:col-span-2">
                                            <SelectField 
                                                label="Passport Validity" 
                                                name="passportValidity"
                                                value={String(passportValidity)} 
                                                onChange={(e) => setPassportValidity(parseInt(e.target.value, 10))} 
                                                options={validityOptions} 
                                            />
                                        </div>
                                        <InputField label="Date of Issue" name="dateOfIssue" value={idData.dateOfIssue} onChange={handleDateChange} type="date" />
                                        <InputField label="Expiry Date" name="expiryDate" value={idData.expiryDate} onChange={handleDateChange} type="date" />
                                    </>
                                )}
                                {idData.documentType === DocumentType.ID_CARD && (
                                    <>
                                        <InputField label="Date of Issue" name="dateOfIssue" value={idData.dateOfIssue} onChange={handleInputChange} type="date" />
                                        <InputField label="Expiry Date" name="expiryDate" value={idData.expiryDate} onChange={handleInputChange} type="date" />
                                    </>
                                )}
                            </div>
                             <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2">
                                {idData.documentType === DocumentType.PASSPORT && (
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="isDateLinked"
                                            name="isDateLinked"
                                            checked={isDateLinked}
                                            onChange={(e) => setIsDateLinked(e.target.checked)}
                                            className="h-6 w-6 rounded-full border-2 border-gray-600 bg-gray-700 text-teal-500 focus:outline-none focus:border-teal-400 cursor-pointer transition-colors"
                                        />
                                        <label htmlFor="isDateLinked" className="text-sm font-medium text-gray-300 cursor-pointer">Link Validity Dates</label>
                                    </div>
                                )}
                                <div className="flex items-center space-x-3">
                                    <input
                                        id="includePersonalNumberInMrz"
                                        name="includePersonalNumberInMrz"
                                        type="checkbox"
                                        checked={idData.includePersonalNumberInMrz}
                                        onChange={handleInputChange}
                                        className="h-6 w-6 rounded-full border-2 border-gray-600 bg-gray-700 text-teal-500 focus:outline-none focus:border-teal-400 cursor-pointer transition-colors"
                                    />
                                    <label htmlFor="includePersonalNumberInMrz" className="text-sm font-medium text-gray-300 cursor-pointer">Include Personal No. in MRZ</label>

                                </div>
                            </div>
                            {idData.includePersonalNumberInMrz && (
                                <InputField label="Personal No. / Optional Data" name="personalNumber" value={idData.personalNumber} onChange={handleInputChange} maxLength={idData.documentType === DocumentType.ID_CARD ? 15 : 14} />
                            )}
                        </div>

                        {/* Right Column: Previews and MRZ */}
                        <div className="space-y-8">
                            <IdCardPreview data={idData} />
                            <MrzDisplay mrzLines={mrzLines} />
                            <CalculationDetails data={idData} />
                        </div>
                    </div>
                ) : (
                    <MrzValidator />
                )}
            </main>
            <Footer />
        </div>
    );
};

export default App;